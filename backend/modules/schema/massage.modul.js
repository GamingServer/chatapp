const mongoose = require('mongoose');

const schema = mongoose.Schema({
    senderName: {
        type: String,
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    choice: {
        type: [{ type: String }]
    },
    status: {
        type: String,
        default: 'sent'
    },
    type: {
        type: String,
    },
    isChoice: {
        type: Boolean,
        default: false
    },
    selectedChoice:{
        type: String,
        defalut:null
    },
    isUsed:{
        type:Boolean,
        default:false
    },
    category:{
        type:String,
        default:null
    }

}, { timestamps: true });

module.exports = mongoose.model('massages', schema);