const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URL - supports local, Docker, or Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-grind';

// Connect to MongoDB with improved error handling
const connectToMongoDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB at:', MONGODB_URI);
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout for Docker startup
    };
    
    await mongoose.connect(MONGODB_URI, options);
    console.log('MongoDB connected successfully');
    
    // Handle errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    
    // Provide helpful error message for Docker-specific connection issues
    if (error.name === 'MongoNetworkError' || error.message.includes('connect ECONNREFUSED')) {
      console.error('\n--- MongoDB Connection Troubleshooting ---');
      console.error('1. If using Docker:');
      console.error('   - Check if MongoDB service is running: docker ps');
      console.error('   - Ensure the service name in MONGODB_URI matches your docker-compose.yml');
      console.error('   - Wait a few seconds for MongoDB to initialize');
      console.error('2. If running locally:');
      console.error('   - Check if MongoDB is installed and running');
      console.error('3. Check if the connection URL is correct in your environment');
      console.error('4. If using MongoDB Atlas, ensure your IP is whitelisted');
      console.error('-------------------------------------------\n');
    }
    
    if (process.env.NODE_ENV === 'development') {
      // In development, wait and retry connection
      console.log('Retrying MongoDB connection in 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await connectToMongoDB();
    } else {
      throw error;
    }
  }
};

module.exports = connectToMongoDB;