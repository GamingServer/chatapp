const router = require('express').Router();
const { getCategory, addCategory, editeCategory, deleteCategory, saveImage, getPendingPoint, aprovePoint, categoryData, getAprovePoint } = require('../controller/choice/game/CategoryCrud');
const { upload } = require('../controller/massageController');

router.get('/get', getCategory);
router.post('/add', addCategory);
router.put('/edit/:id', editeCategory);
router.delete('/delete/:id', deleteCategory);
router.post('/image/:senderName/:receiverName', upload.single('file'), saveImage)
router.get('/get/pendingpoint', getPendingPoint)
router.post('/aprove/point', aprovePoint)
router.get('/get/categorydata/:category',categoryData);
router.get('/get/aprovepoint',getAprovePoint)
module.exports = router;