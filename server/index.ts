// Import config first to ensure environment variables are loaded
import './config';

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import importSwedishLocations from "./importLocations";
import path from "path";
import { corsMiddleware } from "./middleware/cors";
import { requestLogger } from "./middleware/logging";
import { apiLimiter } from "./middleware/rateLimit";
import { log } from "./utils/logger";
import { serverConfig, dbConfig } from "./config";
import mongoose from 'mongoose';
import { config } from './config';
import { Scheduler } from './utils/scheduler';

const app = express();

// Apply middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(requestLogger);
app.use('/api', apiLimiter);

// Serve static files from public directory
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  log.error('Error handling request', {
    error: err,
    status,
    message,
    stack: err.stack,
  });

  res.status(status).json({ message });
});

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(dbConfig.uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    log.info('Connected to MongoDB');

    // Register routes after MongoDB connection
    const server = await registerRoutes(app);

    // Setup Vite or serve static files
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server
    const port = serverConfig.port;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log.info(`Server started on port ${port}`);

      // Import Swedish locations data
      importSwedishLocations()
        .then(() => log.info('Swedish locations import complete or skipped'))
        .catch(err => log.error('Error importing Swedish locations', { error: err }));

      // Start scheduled backups
      if (config.ENABLE_SCHEDULED_BACKUPS) {
        Scheduler.startScheduledBackups(24); // Daily backups
      }
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      log.info('SIGTERM received. Shutting down gracefully...');

      // Stop scheduled backups
      Scheduler.stopScheduledBackups();

      // Close database connection
      await mongoose.connection.close();

      // Close server
      server.close(() => {
        log.info('Server closed');
        process.exit(0);
      });
    });

    // Handle MongoDB connection errors
    mongoose.connection.on('error', (err) => {
      log.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      log.warn('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(() => {
        mongoose.connect(dbConfig.uri).catch(err => {
          log.error('Failed to reconnect to MongoDB:', err);
        });
      }, 5000);
    });

  } catch (error) {
    log.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
