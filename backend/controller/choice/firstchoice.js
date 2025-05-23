// const conversations = require('../../modules/schema/conversation')
// const messageModule = require('../../modules/schema/massage.modul');
// const pointCategory = require('../../modules/schema/pointCategory');
// const categoryModule = require('../../modules/schema/pointCategory');
// const pointTable = require('../../modules/schema/pointTable');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// const { io, getAdminToken } = require("../../socket.io/socket");
const firstChoice = async ({ reciverId, token, io, message, choice_id }) => {

  if (choice_id) {
    // await messageModule.findOneAndUpdate(
    //     { _id: choice_id },
    //     { $set: { selectedChoice: message } },
    //     { new: true }
    // )
    await prisma.Message.update({
      where: {
        id: choice_id,
      },
      data: {
        selectedChoice: message,
      },
    });
  }

  //   let conversation = await conversations.findOne({
  //     participants: { $all: ["admin", reciverName] },
  //   });
  const adminId = await prisma.Users.findUnique({
    where: {
      username: "admin",
    },
  });
  let conversation = await prisma.Conversations.findFirst({
    where: {
      AND: [
        { participants: { some: { id: adminId.id } } },
        { participants: { some: { id: reciverId } } },
      ],
    },
  });
  if (!conversation) {
    // conversation = await conversations.create({
    //   participants: ["admin", reciverName],
    // });
    conversation = await prisma.Conversations.create({
      data: {
        participants: {
          connect: [{ id: adminId.id }, { id: reciverId }],
        },
      },
    });
  }

  let choice = ["Know Score", "Redeem Points", "give Scorecard"];
  //   console.log(message);
  let newMessage;
  if (choice.includes(message)) {
    if (message.toLowerCase() === "know score") {
      //   const score = await pointTable.find({
      //     playerName: reciverName,
      //   });

      const score = await prisma.PointTable.findMany({
        where: {
          userId: reciverId,
        },
      });
      const totalPoints = score.reduce((sum, item) => sum + item.point, 0);
      //   newMessage = new messageModule({
      //     senderName: "admin",
      //     receiverName: reciverName,
      //     message: `Point : ${totalPoints}`,
      //   });
      newMessage = await prisma.Message.create({
        data: {
          senderId: adminId.id,
          reciverId: reciverId,
          message: `Point : ${totalPoints}`,
        },
        include: {
          sender: {
            select: { username: true },
          },
          reciver: {
            select: { username: true },
          },
        },
      });
    } else if (message.toLowerCase() === "redeem points") {
      //   const data = await categoryModule.find();
      const data = await prisma.Category.findMany();
      const category = data.map((item) => item.category);
      //   newMessage = new messageModule({
      //     senderName: "admin",
      //     receiverName: reciverName,
      //     message: "Select Point Category",
      //     choice: category,
      //     isChoice: true,
      //   });
      newMessage = await prisma.Message.create({
        data: {
          senderId: adminId.id,
          reciverId: reciverId,
          message: "Select Point Category",
          choice: category,
          isChoice: true,
        },
        include: {
          sender: {
            select: {
              username: true,
            },
          },
          reciver: {
            select: {
              username: true,
            },
          },
        },
      });
    }
  } else if (choice_id) {
    // const data = await categoryModule.find();
    const data = await prisma.Category.findMany();
    const category = data.map((item) => item.category);
    if (category.includes(message)) {
      //   newMessage = new messageModule({
      //     senderName: "admin",
      //     receiverName: reciverName,
      //     message: "Send Image",
      //     isChoice: false,
      //     type: "category",
      //     category: message,
      //   });
      newMessage = await prisma.Message.create({
        data: {
          senderId: adminId.id,
          reciverId: reciverId,
          message: "Send Image",
          isChoice: false,
          type: "category",
          category: message,
        },
        include: {
          sender: {
            select: {
              username: true,
            },
          },
          reciver: {
            select: {
              username: true,
            },
          },
        },
      });
    }
  } else {
    // newMessage = new messageModule({
    //   senderName: "admin",
    //   receiverName: reciverName,
    //   message: "select one of the options",
    //   choice: choice,
    //   isChoice: true,
    // });
    newMessage = await prisma.Message.create({
      data: {
        senderId: adminId.id,
        reciverId: reciverId,
        message: "select one of the options",
        choice: choice,
        isChoice: true,
      },
      include: {
        sender: {
          select: {
            username: true,
          },
        },
        reciver: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  if (newMessage) {
    // conversation.messages.push(newMessage._id);
    await prisma.Conversations.update({
      where: {
        id: conversation.id,
      },
      data: {
        messages: {
          connect: { id: newMessage.id },
        },
      },
    });
    // await Promise.all([conversation.save(), newMessage.save()]);
    io.to(token).emit("receiveMessage", { message: newMessage });
  }
};

module.exports = {
  firstChoice,
};
