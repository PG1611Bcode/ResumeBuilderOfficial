const mongoose = require('mongoose');

// Global cache for serverless environments (e.g. Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || process.env.DB_CONNECT;

  if (!MONGODB_URI) {
    const errorMsg = 'Please define MONGODB_URI or DB_CONNECT environment variable inside .env';
    console.error('❌ MongoDB Configuration Error:', errorMsg);
    throw new Error(errorMsg);
  }

  // If already connected, return cached connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Prevents Mongoose buffering timeout (buffering timed out after 10000ms)
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    console.log('⏳ Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ Connected to MongoDB (Cached serverless connection active)');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('❌ MongoDB Connection Error:', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Support both connectDB and connectToDb for backwards compatibility
module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.connectToDb = connectDB;