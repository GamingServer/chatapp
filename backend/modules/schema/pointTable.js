const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    playerName: {
        type: String,
        ref: 'Users',
    },
    category: {
        type: String,
        ref: 'category',
    },
    point: {
        type: Number,
        default: 0
    },
    pendingPoint: {
        type: Number,
    },
    accepted: {
        type: Boolean,
        default: false
    },
    image: {
        type: String
    }
})

module.exports = mongoose.model('pointtable', schema)