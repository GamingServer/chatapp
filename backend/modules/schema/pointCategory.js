const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    category: String,
    point : Number,
})

module.exports = mongoose.model('category',schema)