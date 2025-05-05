const router = require("express").Router();


router.post("/login",async(req,res)=>{
    const username = req.body?.username;
    const password = req.body?.password;
    if(username == process.env.ADMIN_USERNAME && password == process.env.ADMIN_PASSWORD){
        return res.cookie("admin",true).status(200).json({message:"Login successful"});
    }
    else{
        return res.status(401).json({message:"Invalid credentials"});
    }
})


module.exports = router;