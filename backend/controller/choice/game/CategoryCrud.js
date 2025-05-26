// const massageModul = require("../../../modules/schema/massage.modul");
// const pointCategory = require("../../../modules/schema/pointCategory");
// const pointTable = require("../../../modules/schema/pointTable");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { io, getAdminToken } = require("../../../socket.io/socket");
const { where } = require("../../../modules/schema/conversation");

const getCategory = async (req, res) => {
  try {
    // const data = await pointCategory.find();
    const data = await prisma.Category.findMany();
    res.json(data);
  } catch (error) {
    console.log("error in getCategory ", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
const addCategory = async (req, res) => {
  try {
    console.log(req.body);
    const category = req.body?.category;
    const point = req.body?.point;
    const isLimit = req.body?.isLimit;
    const MaxPlayerLimit = req.body?.MaxPlayerLimit;
    if (
      typeof category !== "string" ||
      category.trim().length === 0 ||
      !point
    ) {
      return res.status(400).json({ message: "Category is required" });
    }
    // const existingCategory = await pointCategory.findOne({ name: category });\
    const existingCategory = await prisma.Category.findUnique({
      where: {
        category: category,
      },
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }
    // const newCategory = new pointCategory({
    //   category: category.trim(),
    //   point: point,
    //   isLimit: isLimit,
    //   MaxPlayerLimit: MaxPlayerLimit,
    // });
    const newCategory = await prisma.Category.create({
      data: {
        category: category.trim(),
        point: point,
        isLimit: isLimit,
        MaxPlayerLimit: MaxPlayerLimit,
      },
    });
    // await newCategory.save();
    return res.json({
      message: "Category added successfully",
      newCategory: newCategory,
    });
  } catch (error) {
    console.log("error in getCategory ", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const editeCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = req.body.category;
    const point = req.body.point;
    if (
      typeof category !== "string" ||
      category.trim().length === 0 ||
      !point
    ) {
      return res.status(400).json({ message: "Category is required" });
    }
    // const existingCategory = await pointCategory.findOne({ _id: id });
    const existingCategory = await prisma.Category.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    console.log(existingCategory);
    if (!existingCategory) {
      return res.status(400).json({ message: "Category not found" });
    }
    // const updatedCategory = await pointCategory.findByIdAndUpdate(
    //   id,
    //   { category: category, point: point },
    //   { new: true }
    // );
    const updatedCategory = await prisma.Category.update({
      where: {
        id: parseInt(id),
      },
      data: {
        category: category,
        point: parseInt(point),
      },
    });
    console.log(updatedCategory);
    res.json({
      message: "Category Updated Successfully",
    });
  } catch (error) {
    console.log("error in getCategory ", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    // const category = await pointCategory.findByIdAndDelete(id);
    const category = await prisma.Category.delete({
      where: {
        id: parseInt(id),
      },
    });
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }
    return res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log("error in getCategory ", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const saveImage = async (req, res) => {
  try {
    const { senderName, receiverName } = req.params;
    const senderId = await prisma.Users.findUnique({
      where: {
        username: senderName,
      },
    });
    const messageId = req.body.messageId;
    const category = req.body.category;
    if (!req.file) {
      return res.json({ message: "Image not suppoted" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    // let categoryData = await pointCategory.findOne({ category: category });
    let categoryData = await prisma.Category.findUnique({
      where: {
        category: category,
      },
    });
    let point;
    // const messageData = await massageModul.findByIdAndUpdate(
    //   messageId,
    //   { $set: { isUsed: true, image: fileUrl } },
    //   { new: true }
    // );
    const messageData = await prisma.Message.update({
      where: {
        id: parseInt(messageId),
      },
      data: {
        isUsed: true,
        image: fileUrl,
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

    if (categoryData.isLimit) {
      if (categoryData.roundPlayedByPlayers < categoryData.MaxPlayerLimit) {
        // point = new pointTable({
        //   playerName: senderName,
        //   category: category,
        //   image: fileUrl,
        //   pendingPoint: categoryData.point,
        // });
        point = await prisma.PointTable.create({
          data: {
            userId: senderId.id,
            categoryId: categoryData.id,
            image: fileUrl,
            pendingPoint: categoryData.point,
          },
          include: {
            users: {
              select: {
                username: true,
              },
            },
            category: {
              select: {
                category: true,
              },
            },
          },
        });
      } else {
        // await pointCategory.findOneAndUpdate(
        //   { category: categoryData.category },
        //   {
        //     $inc: { roundPlayedByPlayers: 1 },
        //   }
        // );
        await prisma.Category.update({
          where: {
            category: categoryData.category,
          },
          data: {
            roundPlayedByPlayers: {
              increment: 1,
            },
          },
        });
        // point = new pointTable({
        //   playerName: senderName,
        //   category: category,
        //   image: fileUrl,
        //   pendingPoint: 0,
        //   accepted: true,
        //   point: 0,
        // });
        point = await prisma.PointTable.create({
          data: {
            userId: senderId.id,
            categoryId: categoryData.id,
            image: fileUrl,
            pendingPoint: 0,
            accepted: true,
            point: 0,
          },
          include: {
            users: {
              select: {
                username: true,
              },
            },
            category: {
              select: {
                category: true,
              },
            },
          },
        });
      }
    } else if (!categoryData.isLimit) {
      // point = new pointTable({
      //   playerName: senderName,
      //   category: category,
      //   image: fileUrl,
      //   pendingPoint: categoryData.point,
      // });
      point = await prisma.PointTable.create({
        data: {
          userId: senderId.id,
          categoryId: categoryData.id,
          image: fileUrl,
          pendingPoint: categoryData.point,
        },
        include: {
          users: {
            select: {
              username: true,
            },
          },
          category: {
            select: {
              category: true,
            },
          },
        },
      });
    }
    // const data = await point.save();
    res.status(200).json(messageData);
    const token = getAdminToken({ id: "admin" });
    io.to(token).emit("aproveCategory", point);
  } catch (error) {
    console.log("error in image save in category", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getPendingPoint = async (req, res) => {
  try {
    // const pendingPoint = await pointTable.find({ accepted: false });
    const pendingPoint = await prisma.PointTable.findMany({
      where: {
        accepted: false,
      },
      include: {
        users: {
          select: {
            username: true,
          },
        },
        category: {
          select: {
            category: true,
          },
        },
      },
    });
    if (!pendingPoint) {
      return res.json({ message: "No pending points" });
    }
    return res.json({ message: "Pending points", pendingPoint });
  } catch (e) {
    console.log("error in get pending point", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const aprovePoint = async (req, res) => {
  try {
    const id = req.body.id;
    let point = req.body?.point;
    if (parseInt(point) <= 0) {
      // const db = await pointTable.findByIdAndUpdate(
      //   id,
      //   { accepted: true, point: point },
      //   { new: true }
      // );
      const db = await prisma.PointTable.update({
        where: {
          id: parseInt(id),
        },
        data: {
          accepted: true,
          point: parseInt(point),
        },
        include: {
          users: {
            select: {
              username: true,
            },
          },
          category: {
            select: {
              category: true,
            },
          },
        },
      });
    } else {
      // const db = await pointTable.findById(id);
      const db = await prisma.PointTable.findUnique({
        where: {
          id: parseInt(id),
        },
      });
      // console.log("db:", db);
      // const categoryData = await pointCategory.findOne({ category: db.category });
      const categoryData = await prisma.Category.findUnique({
        where: {
          id: db.categoryId,
        },
      });

      if (categoryData.isLimit) {
        if (categoryData.roundPlayedByPlayers < categoryData.MaxPlayerLimit) {
          // await pointTable.findByIdAndUpdate(
          //   id,
          //   { accepted: true, point: categoryData.point, pendingPoint: 0 },
          //   { new: true }
          // );
          await prisma.PointTable.update({
            where: {
              id: parseInt(id),
            },
            data: {
              accepted: true,
              point: categoryData.point,
              pendingPoint: 0,
            },
          });
          await prisma.Category.update({
            where: {
              id: db.categoryId,
            },
            data: {
              roundPlayedByPlayers: {
                increment: 1,
              },
            },
          });
        } else {
          await prisma.PointTable.update({
            where: {
              id: parseInt(id),
            },
            data: {
              accepted: true,
              point: 0,
              pendingPoint: 0,
            },
          });
          // await pointCategory.findOneAndUpdate(
          //   { category: db.category },
          //   {
          //     $inc: { roundPlayedByPlayers: 1 },
          //   }
          // );
          await prisma.Category.update({
            where: {
              id: db.categoryId,
            },
            data: {
              roundPlayedByPlayers: {
                increment: 1,
              },
            },
          });
        }
        // await pointTable.findByIdAndUpdate(
        //   id,
        //   { accepted: true, point: 0, pendingPoint: 0 },
        //   { new: true }
        // );
      } else {
        // await pointTable.findByIdAndUpdate(
        //   id,
        //   { accepted: true, point: categoryData.point, pendingPoint: 0 },
        //   { new: true }
        // );
        await prisma.PointTable.update({
          where: {
            id: parseInt(id),
          },
          data: {
            accepted: true,
            point: categoryData.point,
            pendingPoint: 0,
          },
        });
      }
    }

    res.json({ message: "SuccessFully Point Added" });
  } catch (error) {
    console.log("error in aprove point", error);
    res.status(500).json({ message: "internal server error" });
  }
};

const categoryData = async (req, res) => {
  try {
    const category = req.params.category;
    // const categoryData = await pointTable.find({ category: category });
    const categoryData = await prisma.PointTable.findMany({
      where: {
        category: {
          category: category,
        },
      },
    });
    if (categoryData.length === 0) {
      return res.status(404).json({ message: "No Data Found" });
    }

    const filtered = categoryData.filter((item) => item.accepted);

    const playerPoints = {};
    for (const item of filtered) {
      playerPoints[item.userId] = (playerPoints[item.userId] || 0) + item.point;
    }

    const totalPlayers = Object.keys(playerPoints).length;
    const totalPoints = Object.values(playerPoints).reduce(
      (sum, val) => sum + val,
      0
    );
    const avgPoints = totalPoints / totalPlayers;

    let highest = { player: null, point: -Infinity };
    let lowest = { player: null, point: Infinity };

    for (const [player, point] of Object.entries(playerPoints)) {
      if (point > highest.point) {
        playername = await prisma.Users.findUnique({
          where: { id: parseInt(player) },
        });
        highest = { player: playername.username, point };
      }
      if (point < lowest.point) {
        playername = await prisma.Users.findUnique({
          where: { id: parseInt(player) },
        });

        lowest = { player: playername.username, point };
      }
    }

    const finalData = {
      totalPlayers,
      totalPoints,
      avgPoints,
      highest,
      lowest,
    };
    console.log(finalData);

    res.status(200).json(finalData);
  } catch (error) {
    console.log("error in categoryData", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
/**
 *
 * @param {*} categories
 * @param {*} playerData
 * @returns
 */
const transformData = (categories, playerData) => {
  if (!categories || categories.length === 0) return [];

  // Prepare result template
  let result = categories.map((cat) => ({
    category: cat.category,
    status: {
      totalPlayers: 0,
      totalPoints: 0,
      avgPoints: 0,
      highest: 0,
      lowest: 0,
      highestPlayerName: "",
      lowestPlayerName: "",
    },
  }));

  // Group player data by category and username
  const groupedData = {};
  playerData.forEach(({ category, point, users }) => {
    const catName = category.category;
    const playerName = users.username;

    if (!groupedData[catName]) groupedData[catName] = {};

    if (!groupedData[catName][playerName]) {
      groupedData[catName][playerName] = 0;
    }

    groupedData[catName][playerName] += point;
  });

  // Process each category
  result = result.map((item) => {
    const playersInCategory = groupedData[item.category] || {};
    const playerNames = Object.keys(playersInCategory);

    if (playerNames.length === 0) return item;

    const playerPoints = playerNames.map((name) => ({
      playerName: name,
      totalPoints: playersInCategory[name],
    }));

    const totalPlayers = playerPoints.length;
    const totalPoints = playerPoints.reduce((sum, p) => sum + p.totalPoints, 0);
    const avgPoints = totalPoints / totalPlayers;

    const highestPlayer = playerPoints.reduce((a, b) =>
      a.totalPoints > b.totalPoints ? a : b
    );
    const lowestPlayer = playerPoints.reduce((a, b) =>
      a.totalPoints < b.totalPoints ? a : b
    );

    return {
      category: item.category,
      status: {
        totalPlayers,
        totalPoints,
        avgPoints: Number(avgPoints.toFixed(2)),
        highest: highestPlayer.totalPoints,
        lowest: lowestPlayer.totalPoints,
        highestPlayerName: highestPlayer.playerName,
        lowestPlayerName: lowestPlayer.playerName,
      },
    };
  });

  return result;
};

const getAllcategoryData = async (req, res) => {
  try {
    // const playerData = await pointTable.find();
    const playerData = await prisma.PointTable.findMany({
      include: {
        users: {
          select: {
            username: true,
          },
        },
        category: {
          select: {
            category: true,
          },
        },
      },
    });
    // const category = await pointCategory.find({}, { category: 1 });
    const category = await prisma.Category.findMany({
      select: {
        category: true,
      },
    });
    const transformedData = transformData(category, playerData);
    // console.log(transformedData);
    res.json(transformedData);
  } catch (e) {
    console.log("error in getAllcategoryData", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAprovePoint = async (req, res) => {
  try {
    // const data = await pointTable.find({ accepted: true });
    const data = await prisma.PointTable.findMany({
      where: {
        accepted: true,
      },
      include: {
        users: {
          select: {
            username: true,
          },
        },
        category: {
          select: {
            category: true,
          },
        },
      },
    });
    res.status(200).json(data);
  } catch (error) {
    console.log("error in apreve point", error);
    req.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getCategory,
  addCategory,
  editeCategory,
  deleteCategory,
  saveImage,
  getPendingPoint,
  aprovePoint,
  categoryData,
  getAprovePoint,
  getAllcategoryData,
};
