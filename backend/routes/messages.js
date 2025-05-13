const { upload,sendMassage, getMessage, getUserForAdmin, getAllUserMsg, getLastMsg , saveImage , saveVideo } = require('../controller/massageController');
const { protectRoute } = require('../middleware/protectRoute');

const router = require('express').Router();

router.post('/sendmsg/:username/:receiverName',sendMassage);
router.get('/getmsg/:username/:receiverName',getMessage);
router.get('/getall/admin',getUserForAdmin);
router.get('/all/getall',getAllUserMsg)
router.get('/last/msg',getLastMsg)
router.post('/upload/image/:senderName/:receiverName',upload.single('file'),saveImage)
router.post('/upload/video/:senderName/:receiverName',upload.single('file'),saveVideo)
module.exports = router;