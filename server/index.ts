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
import { serverConfig, dbConfig, authConfig } from "./config";
import mongoose from 'mongoose';
import { config } from './config';
import { Scheduler } from './utils/scheduler';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from './config/passport';
import authRouter from './routes/auth';
import MemoryStore from 'memorystore';

// Create a function that can be called to start the server
export async function createServer() {
  const app = express();

  // Set up session store
  const SessionStore = MemoryStore(session);

  // Determine if we're in production
  const isProduction = app.get('env') === 'production';

  // Configure sessions
  app.use(session({
    secret: authConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      secure: isProduction, // Only use secure cookies in production
      httpOnly: true, // Prevent client-side JS from reading the cookie
      sameSite: isProduction ? 'strict' : 'lax' // Mitigate CSRF but allow development cross-origin
    }
  }));

  // Apply middleware
  app.use(corsMiddleware);
  app.use(express.json());

  // Initialize Passport and restore authentication state from session
  const passportInstance = configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(requestLogger);
  app.use('/api', apiLimiter);

  // Serve static files from public directory
  app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

  // Register auth routes
  app.use('/api/auth', authRouter);

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

    return server;
  } catch (error) {
    log.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createServer();
}
