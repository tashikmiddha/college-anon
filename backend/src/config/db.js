import mongoose from 'mongoose';
import { config } from './env.js';

// Connection pool configuration
const mongooseOptions = {
  // Connection settings
  maxPoolSize: 100, // Maximum number of connections in the pool
  minPoolSize: 10,  // Minimum number of connections to maintain
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  connectTimeoutMS: 10000, // Wait 10 seconds before timing out connection
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  
  // Performance settings
  bufferCommands: false, // Disable mongoose buffering for faster failure
  
  // Retry settings
  retryWrites: true,
  w: 'majority', // Write concern
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, mongooseOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Log connection pool stats periodically
    setInterval(() => {
      console.log(`MongoDB pool status - Ready: ${conn.connection.readyState === 2 ? 'Connecting' : conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    }, 60000); // Log every minute

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't exit - allow retry in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Retrying connection in 5 seconds...');
      setTimeout(() => connectDB(), 5000);
    } else {
      process.exit(1);
    }
  }
};

// Graceful shutdown
const gracefulShutdown = async (msg) => {
  console.log(`Received ${msg}. Shutting down gracefully...`);
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default connectDB;

