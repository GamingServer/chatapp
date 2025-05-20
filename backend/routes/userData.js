const router = require("express").Router();
const UserSchema = require("../modules/schema/userData");
const otpSave = require("../modules/schema/otpStore");
const { io, getAdminToken } = require("../socket.io/socket");
const { genToken } = require("../modules/genToken");
// router.post('/userForm', async (req, res) => {
//     const username = req.body?.username;
//     const email = req.body?.email;
//     const phoneNumber = req.body?.phoneNumber;
//     if (username && email && phoneNumber) {
//         if (!/^\d{10}$/.test(phoneNumber)) {
//             return res.status(400).json({ message: "Invalid phone number" });
//         }
//         user = new UserSchema({
//             username: username,
//             email: email,
//             phoneNumber: phoneNumber
//         })
//         try {
//             await user.save();
//             const token = await getAdminToken('admin')
//             io.to(token).emit('new-user', { name: user.username });
//         } catch (e) {
//             console.log(e)
//             return res.status(400).json({ message: "User already exists" });
//         }
//         return res.status(200).json({ username: user.username, email: user.email, phoneNumber: user.phoneNumber, message: "User data received successfully" });
//     }
//     else {
//         return res.status(400).json({ message: "Invalid data" });
//     }
// })

router.post("/genOtp", async (req, res) => {
  console.log("hii");
  const phoneNumber = req.body.phoneNumber;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const user = await UserSchema.findOne({ phoneNumber: phoneNumber });
  const phone = await otpSave.findOne({ phoneNumber: phoneNumber });
  if (phone) {
    await otpSave.updateOne(
      { phoneNumber: phoneNumber },
      { $set: { otp: otp } }
    );
    console.log("phoneNumber =", phoneNumber);
    console.log("otp =", otp);
    return res.status(200).json({ message: "Otp send successfully" });
  }
  if (user) {
    return res.json({ message: "user already exists" });
  }
  const otpStore = new otpSave({
    phoneNumber: phoneNumber,
    otp: otp,
  });

  try {
    const result = await otpStore.save();
    console.log(result);
    console.log("phoneNumber = ", phoneNumber);
    console.log("otp =", otp);
    return res.json({ message: "OTP sent successfully" });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Error in sending OTP" });
  }
});

router.post("/verifyOtp", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const otp = req.body.otp;
  if (!username && !email && !phoneNumber && !otp) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  const otpVerify = await otpSave.findOne({ phoneNumber: phoneNumber });
  if (otpVerify) {
    if (otpVerify.otp == otp) {
      user = new UserSchema({
        username: username,
        email: email,
        phoneNumber: phoneNumber,
      });
      await user.save();
      await otpSave.deleteOne({ phoneNumber: phoneNumber });
      await genToken(user, res);
      return res.status(200).json({
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        _id: user._id,
        message: "otp verify successfully",
      });
    } else {
      return res.status(406).json({ message: "Invalid OTP" });
    }
  } else {
    return res.status(406).json({ message: "Invalid phone number" });
  }
});

router.post("/getMessageToken", async (req, res) => {
  const userId = req.body.userId;
  const token = req.body.token;
  try {
    if(userId === 'admin'){
      const user = await UserSchema.findOneAndUpdate({username:'admin'}, {
      notificationToken: token,
    });
    }
    else{

      const user = await UserSchema.findByIdAndUpdate(userId, {
        notificationToken: token,
      });
    }
  } catch (error) {
    console.log("error in notification token", error);
  }
});

module.exports = router;
