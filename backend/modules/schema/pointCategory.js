const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    category: {
        type: String,
    },
    point: {
        type: Number,
        default: 0
    },
    isLimit: {
        type: Boolean,
        default: false
    },
    MaxPlayerLimit: {
        type: Number,
        default: 0
    },
    round: {
        type: Number,
        default: 1
    },
    roundPlayedByPlayers: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('category', schema)