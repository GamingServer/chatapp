const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    role:{
        type:String,    
        required:true
    }
})  

module.exports = mongoose.model('adminroles',schema)