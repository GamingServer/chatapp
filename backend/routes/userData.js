const router = require("express").Router();
// const UserSchema = require("../modules/schema/userData");
// const otpSave = require("../modules/schema/otpStore");
const { io, getAdminToken } = require("../socket.io/socket");
const { genToken } = require("../modules/genToken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
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
  const phoneNumber = req.body.phoneNumber.toString();
  try {
    if (!phoneNumber) {
      return res.status(400).json({ message: "Invalid phone number" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    // const user = await UserSchema.findOne({ phoneNumber: phoneNumber });
    // const phone = await otpSave.findOne({ phoneNumber: phoneNumber });

    const user = await prisma.Users.findUnique({
      where: {
        phonenumber: phoneNumber,
      },
    });
    const phone = await prisma.VerifyOtpTemps.findUnique({
      where: {
        phonenumber: phoneNumber,
      },
    });

    if (phone) {
      // await otpSave.updateOne(
      //   { phoneNumber: phoneNumber },
      //   { $set: { otp: otp } }
      // );
      await prisma.VerifyOtpTemps.update({
        where: {
          phonenumber: phoneNumber,
        },
        data: {
          otp: otp,
        },
      });
      console.log("phoneNumber =", phoneNumber);
      console.log("otp =", otp);
      return res.status(200).json({ message: "Otp send successfully" });
    }
    if (user) {
      return res.json({ message: "user already exists" });
    }
    // const otpStore = new otpSave({
    //   phoneNumber: phoneNumber,
    //   otp: otp,
    // });

    const otpStore = await prisma.VerifyOtpTemps.create({
      data: {
        phonenumber: phoneNumber,
        otp: otp,
      },
    });
    // const otpStore = await otpStore.save();
    // console.log(otpStore);
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
  const phoneNumber = req.body.phoneNumber.toString();
  const otp = req.body.otp;
  if (!username && !email && !phoneNumber && !otp) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  // const otpVerify = await otpSave.findOne({ phoneNumber: phoneNumber });
  const otpVerify = await prisma.VerifyOtpTemps.findUnique({
    where: {
      phonenumber: phoneNumber,
    },
  });
  if (otpVerify) {
    if (otpVerify.otp == otp) {
      // user = new UserSchema({
      //   username: username,
      //   email: email,
      //   phoneNumber: phoneNumber,
      // });
      // await user.save();
      const user = await prisma.Users.create({
        data: {
          username: username,
          email: email,
          phonenumber: phoneNumber,
        },
      });
      // await otpSave.deleteOne({ phoneNumber: phoneNumber });
      await prisma.VerifyOtpTemps.delete({
        where: {
          phonenumber: phoneNumber,
        },
      });
      await genToken(user, res);
      return res.status(200).json({
        username: user.username,
        email: user.email,
        phoneNumber: user.phonenumber,
        _id: user.id,
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
  const role = req.body?.role;
  
  if (!userId || !token) {
    return res.status(400).json({ message: "userId and token are required" });
  }
  try {
    if (userId === "admin") {
    //   const user = await UserSchema.findOneAndUpdate(
    //     { username: "admin" },
    //     {
    //       notificationToken: token,
    //     }
    //   );
    // } else {
    //   const user = await UserSchema.findByIdAndUpdate(userId, {
    //     notificationToken: token,
    //   });
    }
    if (role && isNaN(userId)) {
      await prisma.Users.update({
        where: {
          username: userId,
        },
        data: {
          notificationToken: token,
        },
      });
    } else if(userId !== "admin") {
      await prisma.Users.update({
        where: {
          id: userId,
        },
        data: {
          notificationToken: token,
        },
      });
    }
  } catch (error) {
    console.log("error in notification token", error);
  }
});

router.post("/add/admin/role", async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role are required" });
    }

    // const dbres = await UserSchema.findOneAndUpdate(
    //   { username: userId },
    //   { $addToSet: { access: role } },
    //   { new: true, runValidators: true }
    // );

    const dbres = await prisma.Users.findUnique({
      where: {
        id: userId,
      },
    });
    if (!dbres) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedAccess = [...dbres.access, role];

    await prisma.Users.update({
      where: {
        id: userId,
      },
      data: {
        access: updatedAccess,
      },
    });
    io.emit("rolechange", { userId: userId, role: role });
    res
      .status(200)
      .json({ message: "Role added successfully", access: dbres.access });
  } catch (error) {
    console.error("Error in add admin role:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.delete("/remove/admin/role", async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ message: "userId and role are required" });
    }

    // const dbres = await UserSchema.findOneAndUpdate(
    //   { username: userId },
    //   { $pull: { access: role } },
    //   { new: true, runValidators: true }
    // );
    const dbres = await prisma.Users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!dbres) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedAccess = dbres.access.filter((item) => item !== role);

    await prisma.Users.update({
      where: {
        id: userId,
      },
      data: {
        access: updatedAccess,
      },
    });

    io.emit("rolechange", { userId: userId, role: role, removed: true });

    res
      .status(200)
      .json({ message: "Role deleted successfully", access: dbres.access });
  } catch (error) {
    console.error("Error in delete admin role:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
