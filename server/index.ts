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

const app = express();

// Apply CORS middleware before other middleware
app.use(corsMiddleware);

// Apply request logging
app.use(requestLogger);

// Apply rate limiting to all routes
app.use(apiLimiter);

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(dbConfig.uri);
    log.info('Connected to MongoDB');

    const server = await registerRoutes(app);

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
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use port from config
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
    });
  } catch (error) {
    log.error('Failed to start server', { error });
    process.exit(1);
  }
})();
