const massageModul = require("../../../modules/schema/massage.modul");
const pointCategory = require("../../../modules/schema/pointCategory");
const pointTable = require("../../../modules/schema/pointTable");
const { io, getAdminToken } = require("../../../socket.io/socket");

const getCategory = async (req, res) => {
  try {
    const data = await pointCategory.find();
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
    const existingCategory = await pointCategory.findOne({ name: category });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }
    const newCategory = new pointCategory({
      category: category.trim(),
      point: point,
      isLimit: isLimit,
      MaxPlayerLimit: MaxPlayerLimit,
    });
    await newCategory.save();
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
    const existingCategory = await pointCategory.findOne({ _id: id });
    if (!existingCategory) {
      return res.status(400).json({ message: "Category not found" });
    }
    const updatedCategory = await pointCategory.findByIdAndUpdate(
      id,
      { category: category, point: point },
      { new: true }
    );
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
    const category = await pointCategory.findByIdAndDelete(id);
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
    const messageId = req.body.messageId;
    const category = req.body.category;
    if (!req.file) {
      return res.json({ message: "Image not suppoted" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    let categoryData = await pointCategory.findOne({ category: category });
    let point;
    const messageData = await massageModul.findByIdAndUpdate(
      messageId,
      { $set: { isUsed: true, image: fileUrl } },
      { new: true }
    );

    if (categoryData.isLimit) {
      if (categoryData.roundPlayedByPlayers < categoryData.MaxPlayerLimit) {
        point = new pointTable({
          playerName: senderName,
          category: category,
          image: fileUrl,
          pendingPoint: categoryData.point,
        });
      }
      await pointCategory.findOneAndUpdate(
        { category: categoryData.category },
        {
          $inc: { roundPlayedByPlayers: 1 },
        }
      );
      point = new pointTable({
        playerName: senderName,
        category: category,
        image: fileUrl,
        pendingPoint: 0,
        accepted: true,
        point: 0,
      });
    } else if (!categoryData.isLimit) {
      point = new pointTable({
        playerName: senderName,
        category: category,
        image: fileUrl,
        pendingPoint: categoryData.point,
      });
    }
    const data = await point.save();
    res.status(200).json(messageData);
    const token = getAdminToken({ id: "admin" });
    io.to(token).emit("aproveCategory", data);
  } catch (error) {
    console.log("error in image save in category", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getPendingPoint = async (req, res) => {
  try {
    const pendingPoint = await pointTable.find({ accepted: false });
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

    if (point <= 0) {
      const db = await pointTable.findByIdAndUpdate(
        id,
        { accepted: true, point: point },
        { new: true }
      );
    }
    const db = await pointTable.findById(id);
    const categoryData = await pointCategory.findOne({ category: db.category });

    if (categoryData.isLimit) {
      if (categoryData.roundPlayedByPlayers < categoryData.MaxPlayerLimit) {
        await pointTable.findByIdAndUpdate(
          id,
          { accepted: true, point: categoryData.point, pendingPoint: 0 },
          { new: true }
        );
      }
      await pointTable.findByIdAndUpdate(
        id,
        { accepted: true, point: 0, pendingPoint: 0 },
        { new: true }
      );
      await pointCategory.findOneAndUpdate(
        { category: db.category },
        {
          $inc: { roundPlayedByPlayers: 1 },
        }
      );
    } else {
      await pointTable.findByIdAndUpdate(
        id,
        { accepted: true, point: categoryData.point, pendingPoint: 0 },
        { new: true }
      );
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
    const categoryData = await pointTable.find({ category: category });
    let finalData;

    if (categoryData.length > 0) {
      const filtered = categoryData.filter(
        (item) => item.category === category && item.accepted
      );
      const playerPoints = {};
      for (const item of filtered) {
        playerPoints[item.playerName] =
          (playerPoints[item.playerName] || 0) + item.point;
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
        if (point > highest.point) highest = { player, point };
        if (point < lowest.point) lowest = { player, point };
      }

      finalData = {
        totalPlayers,
        totalPoints,
        avgPoints,
        highest,
        lowest,
      };
      res.status(200).json(finalData);
    } else {
      finalData = { message: "No Data Found" };
      res.status(404).json(finalData);
    }
  } catch (error) {
    console.log("error in categoryData", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
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

  // Group player data by category and playerName
  const groupedData = {};
  playerData.forEach(({ category, point, playerName }) => {
    if (!groupedData[category]) groupedData[category] = {};

    if (!groupedData[category][playerName]) {
      groupedData[category][playerName] = 0;
    }

    groupedData[category][playerName] += point;
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
    const playerData = await pointTable.find();
    const category = await pointCategory.find({}, { category: 1 });
    const transformedData = transformData(category, playerData);
    res.json(transformedData);
  } catch (e) {
    console.log("error in getAllcategoryData", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAprovePoint = async (req, res) => {
  try {
    const data = await pointTable.find({ accepted: true });
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
