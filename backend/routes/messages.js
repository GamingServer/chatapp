const { sendMassage, getMessage, getUserForAdmin, getAllUserMsg, getLastMsg } = require('../controller/massageController');

const router = require('express').Router();

router.post('/sendmsg/:username/:receiverName',sendMassage);
router.get('/getmsg/:username/:receiverName',getMessage);
router.get('/getall/admin',getUserForAdmin);
router.get('/all/getall',getAllUserMsg)
router.get('/last/msg',getLastMsg)
module.exports = router;