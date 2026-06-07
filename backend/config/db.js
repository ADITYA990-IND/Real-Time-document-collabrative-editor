const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connects to your local MongoDB instance or MongoDB Atlas cloud URI
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/collaborative_docs');
        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;