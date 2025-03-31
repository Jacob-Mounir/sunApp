import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { venueSearchSchema, insertVenueSchema, insertWeatherDataSchema, insertSunCalculationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";
import { SunCalculationService } from "./sunCalculationService";
import { weatherConfig } from "./config";
import { weatherLimiter, searchLimiter, venueDetailsLimiter } from "./middleware/rateLimit";
import { Types } from 'mongoose';
import uploadRouter from './routes/upload';
import { Image } from './models/Image';

// Cache for sun position calculations (in-memory for development)
const sunPositionCache = new Map<string, { position: any, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Batch request handler to reduce duplicate calculations
const batchedSunPositions = new Map<string, Promise<any>>();
const BATCH_WINDOW = 100; // 100ms window to batch requests

// Weather API configuration
const WEATHER_API_KEY = weatherConfig.apiKey;
const WEATHER_API_BASE_URL = weatherConfig.baseUrl;

// Debug log for environment variables
console.log("Environment variables check:", {
  haveApiKey: !!WEATHER_API_KEY,
  keyFirstChars: WEATHER_API_KEY ? WEATHER_API_KEY.substring(0, 4) + "..." : "none",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Register the upload router first
  app.use('/api', uploadRouter);

  // API routes
  const apiRouter = app.route("/api");

  // Get venues near location with search rate limiting
  app.get("/api/venues", searchLimiter, async (req: Request, res: Response) => {
    try {
      console.log("Received venue request with query params:", req.query);

      // Parse and validate query parameters
      const parsedParams = venueSearchSchema.parse({
        latitude: Number(req.query.latitude),
        longitude: Number(req.query.longitude),
        radius: req.query.radius ? Number(req.query.radius) : 5000,
        venueType: req.query.venueType || undefined
      });

      console.log("Parsed venue search params:", parsedParams);

      const venues = await storage.getVenues(
        parsedParams.latitude,
        parsedParams.longitude,
        parsedParams.radius,
        parsedParams.venueType
      );

      console.log(`Found ${venues.length} venues within radius ${parsedParams.radius}m of (${parsedParams.latitude}, ${parsedParams.longitude})`);
      res.json(venues);
    } catch (error) {
      console.error("Error in /api/venues endpoint:", error);

      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Validation error:", validationError.message);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Get specific venue
  app.get("/api/venues/:id", venueDetailsLimiter, async (req: Request, res: Response) => {
    try {
      const venueId = req.params.id;
      if (!venueId || !Types.ObjectId.isValid(venueId)) {
        return res.status(400).json({ error: "Invalid venue ID" });
      }

      const venue = await storage.getVenue(venueId);
      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }

      // Transform the venue data to match the frontend expected format
      const transformedVenue = {
        ...venue.toObject(),
        id: venue._id.toString(),
        latitude: venue.location.coordinates[1],
        longitude: venue.location.coordinates[0]
      };

      res.json(transformedVenue);
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ error: "Failed to get venue" });
    }
  });

  // Create venue (for development/testing)
  app.post("/api/venues", async (req: Request, res: Response) => {
    try {
      const venueData = insertVenueSchema.parse(req.body);
      const venue = await storage.createVenue(venueData);
      res.status(201).json(venue);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create venue" });
      }
    }
  });

  // Update venue
  app.patch("/api/venues/:id", async (req: Request, res: Response) => {
    try {
      const venueId = req.params.id;
      if (!venueId || !Types.ObjectId.isValid(venueId)) {
        return res.status(400).json({ error: "Invalid venue ID" });
      }

      console.log('Request headers:', req.headers);
      console.log('Raw request body as string:', JSON.stringify(req.body));
      console.log('Does req.body include imageUrl?', 'imageUrl' in req.body);
      console.log('Updating venue with data:', req.body);

      // Parse and validate the update data
      const venueData = insertVenueSchema.partial().parse(req.body);

      console.log('After zod parsing, data:', venueData);
      console.log('After zod parsing, imageUrl included?', 'imageUrl' in venueData);

      // Update the venue
      const venue = await storage.updateVenue(venueId, venueData);

      if (!venue) {
        console.log('Venue not found:', venueId);
        return res.status(404).json({ error: "Venue not found" });
      }

      console.log('Venue updated successfully:', venue);

      // The venue is already transformed in the storage layer
      res.json(venue);
    } catch (error) {
      console.error("Error updating venue:", error);

      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Validation error:", validationError.message);
        res.status(400).json({ error: validationError.message });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to update venue";
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  // Get weather data with weather rate limiting
  app.get("/api/weather", weatherLimiter, async (req: Request, res: Response) => {
    try {
      const { latitude, longitude } = req.query;
      const url = `${WEATHER_API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // Get sun position for a specific location and time
  app.get("/api/sun/position", weatherLimiter, async (req: Request, res: Response) => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const date = req.query.date ? new Date(req.query.date as string) : new Date();

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid latitude or longitude" });
      }

      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      // Create a cache key based on coordinates and rounded time (to nearest minute)
      const roundedDate = new Date(Math.round(date.getTime() / 60000) * 60000);
      const cacheKey = `${latitude},${longitude},${roundedDate.toISOString()}`;

      // Check cache first
      const cached = sunPositionCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return res.json(cached.position);
      }

      // Check if there's already a calculation in progress for this key
      let batchPromise = batchedSunPositions.get(cacheKey);
      if (!batchPromise) {
        // Create a new promise for this calculation
        batchPromise = new Promise(async (resolve) => {
          // Wait a short time to allow batching of similar requests
          await new Promise(r => setTimeout(r, BATCH_WINDOW));

          // Calculate new position
          const sunPosition = SunCalculationService.getSunPosition(latitude, longitude, date, false);

          // Store in cache
          sunPositionCache.set(cacheKey, {
            position: sunPosition,
            timestamp: Date.now()
          });

          // Clean up old cache entries
          const now = Date.now();
          for (const [key, value] of sunPositionCache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
              sunPositionCache.delete(key);
            }
          }

          // Remove from batched requests
          setTimeout(() => {
            batchedSunPositions.delete(cacheKey);
          }, BATCH_WINDOW);

          resolve(sunPosition);
        });

        // Store the promise
        batchedSunPositions.set(cacheKey, batchPromise);
      }

      // Wait for the calculation to complete
      const result = await batchPromise;
      res.json(result);
    } catch (error) {
      console.error("Error calculating sun position:", error);
      res.status(500).json({ error: "Failed to calculate sun position" });
    }
  });

  // Get sun times (sunrise, sunset, etc.) for a specific location and date
  app.get("/api/sun/times", async (req: Request, res: Response) => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);
      const date = req.query.date ? new Date(req.query.date as string) : new Date();

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid latitude or longitude" });
      }

      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const sunTimes = SunCalculationService.getSunTimes(latitude, longitude, date);
      res.json(sunTimes);
    } catch (error) {
      console.error("Error calculating sun times:", error);
      res.status(500).json({ error: "Failed to calculate sun times" });
    }
  });

  // Get sunshine data for a specific venue
  app.get("/api/venues/:id/sunshine", weatherLimiter, async (req: Request, res: Response) => {
    try {
      const venueId = req.params.id;
      if (!venueId || !Types.ObjectId.isValid(venueId)) {
        return res.status(400).json({ error: "Invalid venue ID" });
      }

      const date = req.query.date ? new Date(req.query.date as string) : new Date();

      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      // Get venue information
      const venue = await storage.getVenue(venueId);

      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }

      // Check if we already have cached sun calculation data
      let sunCalculation = await storage.getSunCalculation(venueId, date);

      // Create a cache key for current real-time data
      const roundedDate = new Date(Math.round(date.getTime() / 60000) * 60000);
      const cacheKey = `${venue.location.coordinates[1]},${venue.location.coordinates[0]},${roundedDate.toISOString()}`;

      // Get current sun position from cache or calculate
      let currentSunPosition;
      const cached = sunPositionCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        currentSunPosition = cached.position;
      } else {
        currentSunPosition = SunCalculationService.getSunPosition(
          venue.location.coordinates[1], // latitude
          venue.location.coordinates[0], // longitude
          new Date(),
          false
        );
        sunPositionCache.set(cacheKey, {
          position: currentSunPosition,
          timestamp: Date.now()
        });
      }

      // If we don't have sun calculation data for this date, calculate and store it
      if (!sunCalculation) {
        // Get sun times for the day
        const sunTimes = SunCalculationService.getSunTimes(
          venue.location.coordinates[1], // latitude
          venue.location.coordinates[0], // longitude
          date
        );

        // Format date for database (just the date part, no time)
        const dateStr = date.toISOString().split('T')[0];

        // Create and store calculation with minimal data
        sunCalculation = await storage.createSunCalculation({
          venueId,
          date: dateStr,
          sunriseTime: sunTimes.sunrise.toISOString(),
          sunsetTime: sunTimes.sunset.toISOString(),
          sunnyPeriods: JSON.stringify([]), // We'll calculate this on demand if needed
          calculationTimestamp: new Date().toISOString()
        });
      }

      // Determine if the venue is currently in sunlight based on sun position
      const isCurrentlySunny = currentSunPosition.elevation > 0 && venue.hasSunnySpot;

      // Return combined response
      res.json({
        ...sunCalculation,
        currentSunPosition,
        isCurrentlySunny
      });
    } catch (error) {
      console.error("Error calculating venue sunshine:", error);
      res.status(500).json({ error: "Failed to calculate venue sunshine" });
    }
  });

  // Get multi-day sunshine forecast for a venue
  app.get("/api/venues/:id/sunshine/forecast", async (req: Request, res: Response) => {
    try {
      const venueId = req.params.id;
      if (!venueId || !Types.ObjectId.isValid(venueId)) {
        return res.status(400).json({ error: "Invalid venue ID" });
      }

      const days = parseInt(req.query.days as string) || 7; // Default to 7-day forecast
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();

      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ error: "Invalid start date format" });
      }

      // Limit forecast days to a reasonable number
      const maxDays = Math.min(days, 14);

      // Get venue information
      const venue = await storage.getVenue(venueId);

      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }

      const latitude = venue.location.coordinates[1];
      const longitude = venue.location.coordinates[0];

      // Example building data (simplified approximation)
      // In a real app, this would come from a buildings database or API
      const buildings = [
        {
          height: 20,
          width: 15,
          length: 30,
          azimuth: 0,
          distance: 50,
          direction: 90
        },
        {
          height: 15,
          width: 20,
          length: 20,
          azimuth: 45,
          distance: 40,
          direction: 270
        }
      ];

      // Generate forecast for each day
      const forecast = [];

      for (let i = 0; i < maxDays; i++) {
        // Create date for this forecast day
        const forecastDate = new Date(startDate);
        forecastDate.setDate(startDate.getDate() + i);

        // Check if we already have cached calculation data
        let sunCalculation = await storage.getSunCalculation(venueId, forecastDate);

        if (!sunCalculation) {
          // Calculate sunny periods for this day
          const sunnyPeriods = SunCalculationService.calculateSunnyPeriods(
            latitude,
            longitude,
            forecastDate,
            buildings
          );

          // Format the periods for storage and response
          const formattedPeriods = (await sunnyPeriods).map(period => ({
            start: period.start.toISOString(),
            end: period.end.toISOString()
          }));

          // Get sun times for the day
          const sunTimes = SunCalculationService.getSunTimes(latitude, longitude, forecastDate);

          // Format date for database (just the date part, no time)
          const dateStr = forecastDate.toISOString().split('T')[0];

          // Create and store calculation
          sunCalculation = await storage.createSunCalculation({
            venueId,
            date: dateStr,
            sunriseTime: sunTimes.sunrise.toISOString(),
            sunsetTime: sunTimes.sunset.toISOString(),
            sunnyPeriods: JSON.stringify(formattedPeriods),
            calculationTimestamp: new Date().toISOString()
          });
        }

        // Calculate sunshine percentage for the day
        const sunnyPeriods = JSON.parse(sunCalculation.sunnyPeriods || '[]');
        let totalSunshineMinutes = 0;

        for (const period of sunnyPeriods) {
          const start = new Date(period.start);
          const end = new Date(period.end);
          totalSunshineMinutes += (end.getTime() - start.getTime()) / (60 * 1000);
        }

        const sunrise = new Date(sunCalculation.sunriseTime || new Date());
        const sunset = new Date(sunCalculation.sunsetTime || new Date());
        const dayLengthMinutes = (sunset.getTime() - sunrise.getTime()) / (60 * 1000);

        const sunshinePercentage = dayLengthMinutes > 0
          ? Math.round((totalSunshineMinutes / dayLengthMinutes) * 100)
          : 0;

        forecast.push({
          date: forecastDate.toISOString().split('T')[0],
          sunriseTime: sunCalculation.sunriseTime,
          sunsetTime: sunCalculation.sunsetTime,
          sunnyPeriods: sunnyPeriods,
          sunshinePercentage: sunshinePercentage,
          sunshineMinutes: totalSunshineMinutes,
          dayLengthMinutes: dayLengthMinutes
        });
      }

      res.json({
        venueId,
        venueName: venue.name,
        forecast
      });
    } catch (error) {
      console.error("Error calculating venue sunshine forecast:", error);
      res.status(500).json({ error: "Failed to calculate venue sunshine forecast" });
    }
  });

  // Health check route for monitoring (used by Render)
  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
