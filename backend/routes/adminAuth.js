const router = require("express").Router();
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
// const adminRole = require("../modules/schema/adminroles");
// const admins = require("../modules/schema/admins");
router.post("/login", async (req, res) => {
  const username = req.body?.username;
  const password = req.body?.password;
  const admindata = await prisma.users.findUnique({
    where:{
      username:username
    },
    include:{
      adminrole:{
        select:{
          role:true
        }
      }
    }
  })
  if (
    admindata &&
    username === admindata.username &&
    password === admindata.password &&
    admindata.isAdmin
  ) {
    console.log(admindata)
    return res
      .cookie("role", admindata.adminrole.role)
      .status(200)
      .json({ message: "Login successful" });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

router.get("/get/adminroles", async (req, res) => {
  try {
    // let role = await adminRole.find();
    let role = await prisma.AdminRoles.findMany();
    role = role.filter((item) => item.role !== "admin");
    return res.status(200).json(role);
  } catch (error) {
    console.log("error in get admin roles", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/add/adminrole", async (req, res) => {
  try {
    const role = req.body.role;
    const isAlreadyHas = await adminRole.findOne({ role: role });
    if (isAlreadyHas) {
      return res.json({ message: "role already in database" });
    }
    const newRole = new adminRole({
      role: role,
    });
    await newRole.save();
    return res.status(201).json({ message: "Role add successfully" });
  } catch (error) {
    console.log("error in add admin role", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/delete/adminrole", async (req, res) => {
  try {
    const role = req.body.role;
    const dbres = await adminRole.findOneAndDelete({ role: role });
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.log("error in delete admin role");
    res.status(500).json({ messgae: "Internal server error" });
  }
});

router.put("/update/adminrole", async (req, res) => {
  try {
    const role = req.body.role;
    const newRole = req.body.newRole;
    const dbres = await adminRole.findOneAndUpdate(
      { role: role },
      { role: newRole },
      { new: true }
    );
    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    console.log("error in update admin role");
    res.status(500).json({ messgae: "Internal server error" });
  }
});


module.exports = router;
