const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/wjeer';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
        });
        
     
    } catch (error) {
        
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
}

module.exports = connectDB;