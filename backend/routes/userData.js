const router = require('express').Router();
const UserSchema = require('../modules/schema/userData')
const { io, getAdminTocken } = require('../socket.io/socket')
router.post('/userForm', async (req, res) => {
    const username = req.body?.username;
    const email = req.body?.email;
    const phoneNumber = req.body?.phoneNumber;
    if (username && email) {
        user = null;
        if (!phoneNumber) {
            user = new UserSchema({
                username: username,
                email: email
            })
        }
        else {
            user = new UserSchema({
                username: username,
                email: email,
                phoneNumber: phoneNumber
            })
        }
        try {
            await user.save();
            const token = await getAdminTocken('admin')
            io.to(token).emit('new-user', { name: user.username });
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "User already exists" });
        }
        return res.status(200).json({ username: user.username, email: user.email, phoneNumber: user.phoneNumber, message: "User data received successfully" });
    }
    else {
        return res.status(400).json({ message: "Invalid data" });
    }
})

module.exports = router;