const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use MONGO_URI from env, or default to localhost with wjeer database
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/wjeer';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Connected to MongoDB');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🔗 Connection URI: ${mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials if any
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('💡 Make sure MongoDB is running and the connection string is correct');
        // Don't exit in production - let server start and retry
        if (process.env.NODE_ENV === 'production') {
            console.error('⚠️ Server will continue but database operations will fail');
        } else {
            process.exit(1);
        }
    }
}

module.exports = connectDB;