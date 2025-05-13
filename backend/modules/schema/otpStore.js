const mongoose = require('mongoose');

const schema = mongoose.Schema({
    phoneNumber:{
        type : 'string',
        required : true,
        unique : true
    },
    otp:{
        type : 'number',
        required : true,
    }
},{timestamp:true})

module.exports = mongoose.model('verifyOtpTemps', schema);