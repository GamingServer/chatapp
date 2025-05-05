const mongoose = require('mongoose');

const userData = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phoneNumber:{
        type:Number,
    },
    image:{
        type:String,
        defalut:'https://avatar.iran.liara.run/public/boy'
    }
})

module.exports = mongoose.model('Users',userData);