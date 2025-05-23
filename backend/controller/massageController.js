// const conversations = require("../modules/schema/conversation");
// const massageModul = require("../modules/schema/massage.modul");
// const userData = require("../modules/schema/userData");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { firstChoice } = require("./choice/firstchoice");
const conversation = require("../modules/schema/conversation");
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
  try {
    const { message: msgContent } = req.body;
    const senderName = req.params.username;
    const receiverName = req.params.receiverName;

    const sender = await prisma.Users.findUnique({
      where: { username: senderName },
    });
    const receiver = await prisma.Users.findUnique({
      where: { username: receiverName },
    });

    if (!sender || !receiver)
      return res.status(404).json({ error: "User not found" });

    // Find existing conversation
    let conversation = await prisma.Conversations.findFirst({
      where: {
        AND: [
          { participants: { some: { id: sender.id } } },
          { participants: { some: { id: receiver.id } } },
        ],
      },
    });

    // Create if not exists
    if (!conversation) {
      conversation = await prisma.Conversations.create({
        data: {
          participants: {
            connect: [{ id: sender.id }, { id: receiver.id }],
          },
        },
      });
    }

    // Determine message status
    let status = "sent";
    if (isUserOnline?.({ id: receiverName })) {
      if (
        getSelectedUser?.() === senderName ||
        getOnlineUsers?.().includes(receiverName)
      ) {
        status = "seen";
      } else {
        status = "delivered";
      }
    }

    // Create the message
    const newMessage = await prisma.Message.create({
      data: {
        senderId: sender.id,
        reciverId: receiver.id,
        message: msgContent,
        status,
      },
      include: {
        sender: { select: { username: true } },
        reciver: { select: { username: true } },
      },
    });

    await prisma.Conversations.update({
      where: { id: conversation.id },
      data: {
        messages: {
          connect: { id: newMessage.id },
        },
      },
    });

    // Emit message
    const token = getAdminToken?.({ id: receiverName });
    if (token) {
      io.to(token).emit("receiveMessage", { message: newMessage });
      io.to(token).emit("lastMessage", { message: newMessage });
    }

    // Push notification
    const notifiactiontoken = await prisma.Users.findUnique({
      where: { username: receiverName },
      select: { notificationToken: true },
    });

    if (notifiactiontoken?.notificationToken) {
      await sendNotification(
        notifiactiontoken.notificationToken,
        senderName,
        msgContent
      );
    }

    res.json(newMessage);
  } catch (e) {
    console.error("Error in sendMassage controller:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getMessage = async (req, res) => {
  try {
    const senderName = req.params.username;
    const receiverName = req.params.receiverName;

    const sender = await prisma.users.findUnique({
      where: { username: senderName },
    });

    const receiver = await prisma.users.findUnique({
      where: { username: receiverName },
    });

    if (!sender || !receiver) {
      return res.status(404).json({ error: "User(s) not found" });
    }

    const conversation = await prisma.conversations.findFirst({
      where: {
        AND: [
          { participants: { some: { id: sender.id } } },
          { participants: { some: { id: receiver.id } } },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { username: true } },
            reciver: { select: { username: true } },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(200).json({ noCon: "start conversation" });
    }

    // const updatedMessages = await Promise.all(
    //   conversation.messages.map(async (message) => {
    //     if (
    //       message.reciverId === sender.id &&
    //       message.status !== "seen"
    //     ) {
    //       const updated = await prisma.message.update({
    //         where: { id: message.id },
    //         data: { status: "seen" },
    //         include: {
    //           sender: { select: { username: true } },
    //           reciver: { select: { username: true } },
    //         },
    //       });
    //       return updated;
    //     }
    //     return message;
    //   })
    // );

    // Format to show senderName and receiverName
    // const formattedMessages = updatedMessages.map((msg) => ({
    //   ...msg,
    //   senderName: msg.sender.username,
    //   receiverName: msg.reciver.username,
    // }));

    res.status(200).json(conversation.messages);
  } catch (e) {
    console.error("Error in getMessage controller:", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserForAdmin = async (req, res) => {
  try {
    const role = req.body.role;

    // const data = await userData.find({ access: { $in: [role] } });
    const data = await prisma.Users.findMany({
      where: {
        access: {
          has: role,
        },
      },
    });
    const users = data
      .filter((item) => item.isAdmin !== true)
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
  // const conversation = await conversations.find().populate("messages");
  const conversation = await prisma.Conversations.findMany({
    include: {
      messages: {
        include: {
          sender: { select: { username: true } },
          reciver: { select: { username: true } },
        },
      },
    },
  });
  res.json(conversation);
};

/**
 *
 * @param {*} adminUsername
 * @returns
 */
async function getLastMessagesForAdmin(adminUsername = "admin") {
  // 1. Fetch messages involving admin, sorted by createdAt DESC
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { sender: { username: adminUsername } },
        { reciver: { username: adminUsername } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sender: { select: { username: true } },
      reciver: { select: { username: true } },
    },
  });

  // 2. Group by other participant
  const seenUsers = new Set();
  const lastMessages = [];

  for (const msg of messages) {
    const otherUser =
      msg.sender.username === adminUsername
        ? msg.reciver.username
        : msg.sender.username;

    if (!seenUsers.has(otherUser)) {
      seenUsers.add(otherUser);
      lastMessages.push(msg); // first message per user (because sorted desc)
    }
  }

  return lastMessages;
}

const getLastMsg = async (req, res) => {
  res.send(await getLastMessagesForAdmin());
};

const multer = require("multer");

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

    // const newMessage = new massageModul({
    //   senderName,
    //   receiverName,
    //   message: fileUrl,
    //   status: "sent",
    //   type: "image",
    // });

    const senderId = await prisma.Users.findOne({
      where: { username: senderName },
    })
    const receiverId = await prisma.Users.findOne({
      where: { username: receiverName },
    })
    
    const newMessage = await prisma.Message.create({
      data:{
        senderId: senderId.id,
        reciverId: receiverId.id,
        message: fileUrl,
        status: "sent",
        type: "image",
      }
    })
    // const data = await newMessage.save();

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
