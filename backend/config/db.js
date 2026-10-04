const mongoose = require('mongoose');

let mongodInstance = null;
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if already open (crucial for Vercel serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/store_rating_db';

  try {
    cachedConnection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB at: ${uri.split('@').pop()}`);
    return cachedConnection;
  } catch (err) {
    // Only attempt in-memory server in local environments (not on Vercel)
    if (!process.env.VERCEL) {
      console.warn(`[Database] Primary MongoDB unavailable (${err.message}). Starting local in-memory fallback...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const inMemoryUri = mongodInstance.getUri();
        cachedConnection = await mongoose.connect(inMemoryUri);
        console.log(`[Database] Connected to In-Memory MongoDB at: ${inMemoryUri}`);
        return cachedConnection;
      } catch (memErr) {
        console.error('[Database] Failed to initialize in-memory database:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('[Database] MongoDB connection failed on Vercel:', err.message);
      throw err;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
