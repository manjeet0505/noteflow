import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectWithRetry(uri, opts, retries = 3, backoffMs = 1500) {
  let lastError
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await mongoose.connect(uri, opts)
    } catch (err) {
      lastError = err
      // If it's the last attempt, rethrow
      if (attempt === retries) break
      // Wait with exponential backoff before retrying
      const waitMs = backoffMs * attempt
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }
  }
  throw lastError
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Improve resilience against SRV/DNS hiccups and slow networks
      serverSelectionTimeoutMS: 30000, // 30s to find a suitable server
      socketTimeoutMS: 45000,          // 45s I/O socket timeout
      maxPoolSize: 10,                 // reasonable pool size for dev
      heartbeatFrequencyMS: 10000,     // faster detection of topology changes
      family: 4,                       // prefer IPv4 to avoid IPv6 DNS issues on some networks
    }

    cached.promise = connectWithRetry(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect 