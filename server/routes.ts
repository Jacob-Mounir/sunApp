import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { venueSearchSchema, insertVenueSchema, insertWeatherDataSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";

// Weather API configuration
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "demo";
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route("/api");

  // Get venues near location
  app.get("/api/venues", async (req: Request, res: Response) => {
    try {
      const { latitude, longitude, radius, venueType } = venueSearchSchema.parse({
        latitude: parseFloat(req.query.latitude as string),
        longitude: parseFloat(req.query.longitude as string),
        radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
        venueType: req.query.venueType as string || undefined
      });

      const venues = await storage.getVenues(latitude, longitude, radius, venueType);
      res.json(venues);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to get venues" });
      }
    }
  });

  // Get specific venue
  app.get("/api/venues/:id", async (req: Request, res: Response) => {
    try {
      const venueId = parseInt(req.params.id);
      if (isNaN(venueId)) {
        return res.status(400).json({ error: "Invalid venue ID" });
      }

      const venue = await storage.getVenue(venueId);
      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }

      res.json(venue);
    } catch (error) {
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
      const venueId = parseInt(req.params.id);
      if (isNaN(venueId)) {
        return res.status(400).json({ error: "Invalid venue ID" });
      }

      const venueData = insertVenueSchema.partial().parse(req.body);
      const venue = await storage.updateVenue(venueId, venueData);
      
      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }

      res.json(venue);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to update venue" });
      }
    }
  });

  // Get weather data
  app.get("/api/weather", async (req: Request, res: Response) => {
    try {
      const latitude = parseFloat(req.query.latitude as string);
      const longitude = parseFloat(req.query.longitude as string);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid latitude or longitude" });
      }

      // Try to get cached weather data first
      let weatherData = await storage.getWeatherData(latitude, longitude);
      
      // If no cached data or it's older than 30 minutes, fetch fresh data
      const now = new Date();
      const isDataStale = !weatherData || 
        (new Date(weatherData.timestamp).getTime() + 30 * 60 * 1000 < now.getTime());
      
      if (isDataStale) {
        // Fetch new weather data
        const weatherResponse = await fetch(
          `${WEATHER_API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
        );

        if (!weatherResponse.ok) {
          throw new Error(`Weather API error: ${weatherResponse.statusText}`);
        }

        const weatherJson = await weatherResponse.json() as any;
        
        // Create new weather data entry
        const newWeatherData = {
          latitude,
          longitude,
          temperature: weatherJson.main.temp,
          weatherCondition: weatherJson.weather[0].main,
          icon: weatherJson.weather[0].icon,
          timestamp: now.toISOString()
        };

        weatherData = await storage.createWeatherData(newWeatherData);
      }

      res.json(weatherData);
    } catch (error) {
      console.error("Weather error:", error);
      res.status(500).json({ error: "Failed to get weather data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
