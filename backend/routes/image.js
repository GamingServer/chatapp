const path = require('path');
const router = require('express').Router();
const multer = require('multer');
const user = require('../modules/schema/userData')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './backend/uploads/');
    },
    filename: function (req, file, cb) {
        const username = req.params.username;
        const fileExtension = path.extname(file.originalname); 
        cb(null, `${username}${fileExtension}`);
    }
});

const upload = multer({ storage });

router.post('/upload/:username', upload.single('file'), async (req, res) => {
    const username = req.params.username;
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${username}${fileExtension}`;

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    const data = await user.findOneAndUpdate({username},{image:fileUrl})
    res.json({ message: 'Uploaded successfully', fileUrl });
});

module.exports = router;
