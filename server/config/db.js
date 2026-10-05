const mongoose = require('mongoose');

let mongoServerInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      console.log(`[DB] Attempting connection to MongoDB URI: ${mongoUri.replace(/:[^:]*@/, ':***@')}`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[DB] Connected to external MongoDB successfully.');
      return;
    }

    console.log('[DB] No MONGODB_URI provided. Initializing in-memory MongoDB server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServerInstance = await MongoMemoryServer.create();
    const uri = mongoServerInstance.getUri();
    
    await mongoose.connect(uri);
    console.log(`[DB] In-memory MongoDB initialized and connected at: ${uri}`);
  } catch (error) {
    console.warn(`[DB] Connection to target MongoDB failed: ${error.message}`);
    console.log('[DB] Falling back to in-memory MongoDB server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create();
      const uri = mongoServerInstance.getUri();
      await mongoose.connect(uri);
      console.log(`[DB] Fallback in-memory MongoDB connected successfully at: ${uri}`);
    } catch (fallbackErr) {
      console.error('[DB] Critical Error: Unable to initialize in-memory fallback:', fallbackErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
