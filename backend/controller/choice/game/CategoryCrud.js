const massageModul = require("../../../modules/schema/massage.modul");
const pointCategory = require("../../../modules/schema/pointCategory");
const pointTable = require("../../../modules/schema/pointTable");


const getCategory = async (req, res) => {
    try {
        const data = await pointCategory.find();
        res.json(data);

    } catch (error) {
        console.log("error in getCategory ", error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}
const addCategory = async (req, res) => {
    try {
        console.log(req.body)
        const category = req.body?.category;
        const point = req.body?.point;
        if (typeof category !== 'string' || category.trim().length === 0 || !point) {
            return res.status(400).json({ message: "Category is required" });
        }
        const existingCategory = await pointCategory.findOne({ name: category });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const newCategory = new pointCategory({ category: category, point: point });
        await newCategory.save();
        return res.json({ message: "Category added successfully", newCategory: newCategory });

    } catch (error) {
        console.log("error in getCategory ", error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const editeCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const category = req.body.category;
        const point = req.body.point;
        if (typeof category !== 'string' || category.trim().length === 0 || !point) {
            return res.status(400).json({ message: "Category is required" });
        }
        const existingCategory = await pointCategory.findOne({ _id: id });
        if (!existingCategory) {
            return res.status(400).json({ message: "Category not found" });
        }
        const updatedCategory = await pointCategory.findByIdAndUpdate(id, { category: category, point: point }, { new: true });
        res.json({
            message: "Category Updated Successfully"
        })

    } catch (error) {
        console.log("error in getCategory ", error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await pointCategory.findByIdAndDelete(id);
        if (!category) {
            return res.status(400).json({ message: "Category not found" });
        }
        return res.json({ message: "Category deleted successfully" });

    } catch (error) {
        console.log("error in getCategory ", error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }

}

const saveImage = async (req, res) => {
    try {
        const { senderName, receiverName } = req.params;
        const messageId = req.body.messageId;
        const category = req.body.category;
        const update = await massageModul.findByIdAndUpdate(
            messageId,
            { $set: { isUsed: true } },
            { new: true }
        );
        if (!req.file) {
            return res.json({ message: "Image not suppoted" })
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        const point = new pointTable({
            playerName: senderName,
            category: category,
            image: fileUrl
        })
        const data = await point.save()
    } catch (error) {
        console.log('error in image save in category', error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const getPendingPoint = async (req, res) => {
    try {
        const pendingPoint = await pointTable.find({ accepted: false });
        if (!pendingPoint) {
            return res.json({ message: "No pending points" });
        }
        return res.json({ message: "Pending points", pendingPoint });
    }
    catch (e) {
        console.log('error in get pending point', e);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const aprovePoint = async (req, res) => {
    try {
        const id = req.body.id;
        let point = req.body.point;

        if (point) {
            const db = await pointTable.findByIdAndUpdate(id, { accepted: true, point: point }, { new: true });
        }
        const db = await pointTable.findById(id);
        point = await pointCategory.findOne({ category: db.category })

        point = point.point

        await pointTable.findByIdAndUpdate(id, { accepted: true, point: point }, { new: true })


        res.json({ message: 'SuccessFully Point Added' })
    } catch (error) {
        console.log('error in aprove point', error);
        res.status(500).json({ message: 'internal server error' })
    }

}

const categoryData = async (req, res) => {
    try {

        const category = req.params.category;
        const categoryData = await pointTable.find({ category: category });
        let finalData;

        if (categoryData.length > 0) {
            const filtered = categoryData.filter(item => item.category === category && item.accepted);
            const playerPoints = {};
            for (const item of filtered) {
                playerPoints[item.playerName] = (playerPoints[item.playerName] || 0) + item.point;
            }
            const totalPlayers = Object.keys(playerPoints).length;

            const totalPoints = Object.values(playerPoints).reduce((sum, val) => sum + val, 0)
            const avgPoints = totalPoints / Object.keys(playerPoints).length;

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
                lowest
            }
            res.status(200).json(finalData);
        } else {
            finalData = { message: 'No Data Found' }
            res.status(404).json(finalData);

        }
    } catch (error) {
        console.log('error in categoryData', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports = {
    getCategory,
    addCategory,
    editeCategory,
    deleteCategory,
    saveImage,
    getPendingPoint,
    aprovePoint,
    categoryData
}