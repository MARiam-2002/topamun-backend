import mongoose from "mongoose";
import { APP_CONFIG } from "../src/config/constants.js";

// MongoDB connection options
const connectionOptions = {
  // Connection settings
  serverSelectionTimeoutMS: APP_CONFIG.DATABASE.SERVER_SELECTION_TIMEOUT,
  socketTimeoutMS: APP_CONFIG.DATABASE.SOCKET_TIMEOUT,
  connectTimeoutMS: APP_CONFIG.DATABASE.CONNECTION_TIMEOUT,
  
  // Connection pool settings
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 2,  // Minimum number of connections in the pool
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Performance settings
  bufferCommands: false, // Disable mongoose buffering
  
  // Additional settings
  autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in development only
  autoCreate: true, // Automatically create collections
};

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const maxRetryAttempts = APP_CONFIG.DATABASE.MAX_RETRY_ATTEMPTS;
const retryDelay = APP_CONFIG.DATABASE.BASE_RETRY_DELAY;

/**
 * Connect to MongoDB with retry logic
 */
export const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    console.log('📦 Database already connected');
    return;
  }

  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(APP_CONFIG.DATABASE.CONNECTION_URL, connectionOptions);
    
    isConnected = true;
    connectionAttempts = 0;
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
  } catch (error) {
    connectionAttempts++;
    isConnected = false;
    
    console.error(`❌ MongoDB connection failed (attempt ${connectionAttempts}/${maxRetryAttempts}):`, error.message);
    
    // Retry connection if attempts are remaining
    if (connectionAttempts < maxRetryAttempts) {
      const delay = retryDelay * Math.pow(2, connectionAttempts - 1); // Exponential backoff
      console.log(`🔄 Retrying connection in ${delay}ms...`);
      
      setTimeout(() => {
        connectDB();
      }, delay);
    } else {
      console.error('💥 Max connection attempts reached. Exiting...');
      process.exit(1);
    }
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async () => {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      console.log('✅ MongoDB disconnected successfully');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
  }
};

/**
 * Check database connection status
 */
export const checkConnection = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};

/**
 * Setup connection event listeners
 */
const setupConnectionListeners = () => {
  // Connection successful
  mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
    isConnected = true;
  });

  // Connection error
  mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
    isConnected = false;
  });

  // Connection disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
    isConnected = false;
    
    // Attempt to reconnect in production
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Attempting to reconnect...');
      setTimeout(() => {
        connectDB();
      }, 5000);
    }
  });

  // Connection reconnected
  mongoose.connection.on('reconnected', () => {
    console.log('🔄 Mongoose reconnected to MongoDB');
    isConnected = true;
  });

  // Application termination
  process.on('SIGINT', async () => {
    console.log('⚠️  Received SIGINT. Closing MongoDB connection...');
    await disconnectDB();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('⚠️  Received SIGTERM. Closing MongoDB connection...');
    await disconnectDB();
    process.exit(0);
  });
};

/**
 * Initialize database connection and setup listeners
 */
export const initializeDatabase = async () => {
  setupConnectionListeners();
  await connectDB();
};

/**
 * Health check for database
 */
export const healthCheck = async () => {
  try {
    if (!isConnected) {
      throw new Error('Database not connected');
    }
    
    // Ping the database
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connection: checkConnection()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      connection: checkConnection()
    };
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
  try {
    if (!isConnected) {
      throw new Error('Database not connected');
    }
    
    const stats = await mongoose.connection.db.stats();
    
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize
    };
  } catch (error) {
    throw new Error(`Failed to get database stats: ${error.message}`);
  }
};

// Setup listeners on import
setupConnectionListeners();

export default {
  connectDB,
  disconnectDB,
  checkConnection,
  initializeDatabase,
  healthCheck,
  getDatabaseStats
};
