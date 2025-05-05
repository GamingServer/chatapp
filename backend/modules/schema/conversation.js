const mongoose = require('mongoose');

const schema = new mongoose.Schema({
        participants:[
            {
                type:String
            },
        ],
        messages:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'massages',
                default:[],
            },
        ],
    },
    {timestamps:true}
);

module.exports = mongoose.model('conversations', schema); 