import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer = null;

const connectDB = async () => {
  try {
    let dbUrl = process.env.MONGODB_URI;

    // Use in-memory database if we default to local and it fails, or if no URI is provided
    if (!dbUrl || dbUrl.includes('127.0.0.1') || dbUrl.includes('localhost')) {
      console.log('Starting local MongoDB Memory Server...');
      mongoServer = await MongoMemoryServer.create();
      dbUrl = mongoServer.getUri();
      console.log(`In-Memory MongoDB started at: ${dbUrl}`);
    }

    const conn = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    
    // If we tried Atlas/external and it failed, retry with local in-memory fallback
    if (!mongoServer) {
      console.log('Retrying with MongoDB Memory Server fallback...');
      try {
        mongoServer = await MongoMemoryServer.create();
        const dbUrl = mongoServer.getUri();
        const conn = await mongoose.connect(dbUrl);
        console.log(`Connected to fallback in-memory MongoDB: ${conn.connection.host}`);
      } catch (fallbackError) {
        console.error(`Fallback database error: ${fallbackError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error(`Disconnect error: ${error.message}`);
  }
};

export default connectDB;
