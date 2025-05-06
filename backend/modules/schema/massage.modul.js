const mongoose = require('mongoose');

const schema = mongoose.Schema({
    senderName:{
        type:String,
        required:true
    },
    receiverName:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required : true
    },
    status: {
        type:String,
        default:'sent'
    },
    type:{
        type:String,
    }

},{timestamps:true});

module.exports = mongoose.model('massages', schema);