const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    category: String
})

module.exports = mongoose.model('category',schema)