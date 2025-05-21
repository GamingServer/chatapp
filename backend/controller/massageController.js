const conversations = require("../modules/schema/conversation");
const massageModul = require("../modules/schema/massage.modul");
const userData = require("../modules/schema/userData");
const { sendNotification } = require("../firebase/initFireBase");
const {
  io,
  getAdminToken,
  isUserOnline,
  getSelectedUser,
  getOnlineUsers,
} = require("../socket.io/socket");
const path = require("path");

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const sendMassage = async (req, res) => {
  // try {
  const message = req.body;
  const senderName = req.params.username;
  const receiverName = req.params.receiverName;
  let status = req.params.status;

  let conversation = await conversations.findOne({
    participants: { $all: [senderName, receiverName] },
  });

  if (!conversation) {
    conversation = await conversations.create({
      participants: [senderName, receiverName],
    });
  }

  if (isUserOnline({ id: receiverName })) {
    if (getSelectedUser() == senderName) {
      status = "seen";
    } else if (getOnlineUsers().includes(receiverName)) {
      status = "seen";
    } else {
      status = "delivered";
    }
  }
  const newMessage = new massageModul({
    senderName,
    receiverName,
    message: message.message,
    status: status,
  });

  if (newMessage) {
    const lastMessage = await massageModul.aggregate([
      {
        $match: {
          senderName: "admin",
          receiverName: receiverName !== "admin" ? receiverName : senderName,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);
    const token = getAdminToken({ id: receiverName });
    await io.to(token).emit("receiveMessage", { message: newMessage });
    await io.to(token).emit("lastMessage", { message: newMessage });
    const notifiactiontoken = await userData.findOne({
      username: receiverName,
    });
    if (!notifiactiontoken?.notificationToken) {
      console.warn(`No valid token for user: ${receiverName}`);
      return;
    }
    await sendNotification(
      notifiactiontoken.notificationToken,
      senderName,
      newMessage.message
    );

    res.send(newMessage);
    if (!lastMessage.isChoice || (!lastMessage && message.choice_id)) {
      const token = getAdminToken({ id: senderName });
      if (senderName !== "admin") {
        firstChoice({
          token: token,
          reciverName: senderName,
          io: io,
          message: message.message,
          choice_id: message.choice_id,
        });
      }
    }
  }
};
/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getMessage = async (req, res) => {
  try {
    const senderName = req.params.username;
    const receiverName = req.params.receiverName;
    const conversation = await conversations
      .findOne({
        participants: { $all: [senderName, receiverName] },
      })
      .populate("messages");
    if (!conversation) {
      return res.status(200).json({ noCon: "start conversation" });
    }

    const messages = conversation.messages;
    // for (let message of messages) {
    //     if (message.receiverName == senderName) {
    //         if (message.status != 'seen') {
    //             message.status = 'seen';
    //         }
    //     }
    //     await message.save();
    // }
    res.status(200).json(messages);
  } catch (e) {
    console.log("Error in getMessage controller:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserForAdmin = async (req, res) => {
  try {
    const role = req.body.role;

    const data = await userData.find({ access: { $in: [role] } });
    const users = data
      .filter((item) => item.username !== "admin")
      .map((item) => ({
        name: item.username,
        email: item.email,
        phoneNumber: item.phoneNumber,
        image: item.image,
        role: item.access,
      }));

    res.status(200).json(users);
  } catch (e) {
    console.log("error in getUserForAdmin controller", e);
    res.status(500).json({ error: "internal server error" });
  }
};

const getAllUserMsg = async (req, res) => {
  const conversation = await conversations.find().populate("messages");
  res.json(conversation);
};

/**
 *
 * @param {*} adminUsername
 * @returns
 */
async function getLastMessagesForAdmin(adminUsername = "admin") {
  const lastMessages = await massageModul.aggregate([
    {
      $match: {
        $or: [{ senderName: adminUsername }, { receiverName: adminUsername }],
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          user: {
            $cond: [
              { $eq: ["$senderName", adminUsername] },
              "$receiverName",
              "$senderName",
            ],
          },
        },
        lastMessage: { $first: "$$ROOT" },
      },
    },
    {
      $replaceWith: "$lastMessage",
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return lastMessages;
}

const getLastMsg = async (req, res) => {
  res.send(await getLastMessagesForAdmin());
};

const multer = require("multer");
const { firstChoice } = require("./choice/firstchoice");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./backend/uploads/");
  },
  filename: function (req, file, cb) {
    const senderName = req.params.senderName;
    const reciverName = req.params.receiverName;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${senderName}_${reciverName}_${timestamp}${ext}`);
  },
});
const upload = multer({ storage });

const saveImage = async (req, res) => {
  try {
    const { senderName, receiverName } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newMessage = new massageModul({
      senderName,
      receiverName,
      message: fileUrl,
      status: "sent",
      type: "image",
    });

    const data = await newMessage.save();

    let conversation = await conversations.findOne({
      participants: { $all: [senderName, receiverName] },
    });

    if (!conversation) {
      conversation = await conversations.create({
        participants: [senderName, receiverName],
      });
    }

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const token = getAdminToken({ id: receiverName });
    await io.to(token).emit("receiveMessage", { message: newMessage });

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const saveVideo = async (req, res) => {
  try {
    const { senderName, receiverName } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newMessage = new massageModul({
      senderName,
      receiverName,
      message: fileUrl,
      status: "sent",
      type: "video",
    });

    const data = await newMessage.save();

    let conversation = await conversations.findOne({
      participants: { $all: [senderName, receiverName] },
    });

    if (!conversation) {
      conversation = await conversations.create({
        participants: [senderName, receiverName],
      });
    }

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const token = getAdminToken({ id: receiverName });
    await io.to(token).emit("receiveMessage", { message: newMessage });

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUserForAdmin,
  sendMassage,
  getMessage,
  getAllUserMsg,
  getLastMsg,
  saveImage,
  saveVideo,
  upload,
};
