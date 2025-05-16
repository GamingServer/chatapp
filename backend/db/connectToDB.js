const mongoose = require('mongoose');

const connectToMongodb = async () => {
    try {
        await mongoose.connect((process.env.MONGO_URI+'chatapp'));
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
}

module.exports = connectToMongodb;