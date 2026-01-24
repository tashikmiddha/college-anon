import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { redisClient } from './config/redis.js';
import cluster from 'cluster';
import os from 'os';

const PORT = config.port;

// Get number of CPU cores
const numCPUs = config.maxWorkers || os.cpus().length;

// Function to start a worker
const startWorker = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Connect to Redis (optional - will work without it)
    try {
      await redisClient.connect();
    } catch (redisError) {
      console.log('Redis connection failed - continuing without Redis caching');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Worker ${process.pid} started`);
    });
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
};

// Cluster mode - only enable clustering in production
if (config.enableClustering && numCPUs > 1) {
  console.log(`Running in cluster mode with ${numCPUs} workers`);
  
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    
    // Handle worker events
    cluster.on('online', (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
    });
    
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died with code ${code}. Restarting...`);
      cluster.fork();
    });
    
    cluster.on('error', (worker, error) => {
      console.error(`Worker ${worker.process.pid} error:`, error);
    });
    
    // Graceful shutdown for master
    const gracefulShutdown = async (msg) => {
      console.log(`Received ${msg}. Shutting down master...`);
      
      // Kill all workers
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
      
      // Close Redis connection
      await redisClient.disconnect();
      
      process.exit(0);
    };
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
  } else {
    // Worker process
    startWorker();
  }
} else {
  // Single instance mode (development or single CPU)
  console.log(`Running in single instance mode`);
  startWorker();
}

