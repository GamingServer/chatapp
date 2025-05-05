const conversations = require('../modules/schema/conversation');
const massageModul = require('../modules/schema/massage.modul');
const userData = require('../modules/schema/userData');
const { io, getAdminTocken, isInUserOnline, getSelectedUser, getOnlineUser ,seenMsg} = require('../socket.io/socket')
const sendMassage = async (req, res) => {
    // try {
    const message = req.body;
    const senderName = req.params.username;
    const receiverName = req.params.receiverName;
    let status = req.params.status;

    let conversation = await conversations.findOne({
        participants: { $all: [senderName, receiverName] },
    })

    if (!conversation) {
        conversation = await conversations.create({
            participants: [senderName, receiverName],
        })
    }

    if (isInUserOnline({ id: receiverName })) {
        if (getSelectedUser() == senderName) {
            status = 'seen'
        } else if (getOnlineUser().includes(receiverName)) {
            status = 'seen'
        }
        else {
            status = 'delivered'
        }
    }
    const newMessage = new massageModul({
        senderName,
        receiverName,
        message: message.message,
        status: status
    })

    if (newMessage) {
        conversation.messages.push(newMessage._id);
        await Promise.all([conversation.save(), newMessage.save()])

        const token = getAdminTocken({ id: receiverName })
        await io.to(token).emit('receiveMessage', { message: newMessage })
        res.send(newMessage);

    }


}

const getMessage = async (req, res) => {
    try {
        const senderName = req.params.username;
        const receiverName = req.params.receiverName;

        const conversation = await conversations.findOne({
            participants: { $all: [senderName, receiverName] },
        }).populate("messages");  

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
        const data = await userData.find();

        const users = data.map((item) => {
            const username = item.username;
            return { name: username , email:item.email , phoneNumber:item.phoneNumber,image : item.image };
        });

        res.status(200).json(users);
    } catch (e) {
        console.log("error in getUserForAdmin controller", e);
        res.status(500).json({ error: "internal server error" });
    }
};

const getAllUserMsg = async (req, res) => {
    const conversation = await conversations.find().populate('messages')
    res.json(conversation);
}


async function getLastMessagesForAdmin(adminUsername = 'admin') {
  const lastMessages = await massageModul.aggregate([
    {
      $match: {
        $or: [
          { senderName: adminUsername },
          { receiverName: adminUsername }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          user: {
            $cond: [
              { $eq: ['$senderName', adminUsername] },
              '$receiverName',
              '$senderName'
            ]
          }
        },
        lastMessage: { $first: '$$ROOT' }
      }
    },
    {
      $replaceWith: '$lastMessage'
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  return lastMessages;
}

const getLastMsg=async (req,res)=>{
    res.send(await getLastMessagesForAdmin());
}
module.exports = {
    getUserForAdmin,
    sendMassage,
    getMessage,
    getAllUserMsg,
    getLastMsg
}