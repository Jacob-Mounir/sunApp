import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { venueSearchSchema, insertVenueSchema, insertWeatherDataSchema, insertSunCalculationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";
import { SunCalculationService } from "./sunCalculationService";

// Weather API configuration
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "2a84f4292f6faae16cc7e3987735edab";
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Debug log for environment variables
console.log("Environment variables check:", {
  haveApiKey: !!WEATHER_API_KEY,
  keyFirstChars: WEATHER_API_KEY ? WEATHER_API_KEY.substring(0, 4) + "..." : "none",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route("/api");

  // Get venues near location
  app.get("/api/venues", async (req: Request, res: Response) => {
    try {
      console.log("Received venue request with query params:", req.query);
      
      const { latitude, longitude, radius, venueType } = venueSearchSchema.parse({
        latitude: parseFloat(req.query.latitude as string),
        longitude: parseFloat(req.query.longitude as string),
        radius: req.query.radius ? parseInt(req.query.radius as string) : undefined,
        venueType: req.query.venueType as string || undefined
      });
      
      console.log("Parsed venue search params:", { latitude, longitude, radius, venueType });

      const venues = await storage.getVenues(latitude, longitude, radius, venueType);
      console.log(`Found ${venues.length} venues within radius ${radius}m of (${latitude}, ${longitude})`);
      
      res.json(venues);
    } catch (error) {
      console.error("Error in /api/venues endpoint:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Validation error:", validationError.message);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Unknown error:", error);
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
        try {
          // Log the URL (for debugging only - remove in production)
          console.log(`Weather API request to: ${WEATHER_API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY.substring(0, 4)}...`);
          
          // Fetch new weather data
          const weatherResponse = await fetch(
            `${WEATHER_API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
          );

          if (!weatherResponse.ok) {
            console.error(`Weather API responded with: ${weatherResponse.status} ${weatherResponse.statusText}`);
            // If there's an existing cached data, use it even if it's stale rather than failing
            if (weatherData) {
              return res.json(weatherData);
            }
            throw new Error(`Weather API error: ${weatherResponse.statusText}`);
          }

          const weatherJson = await weatherResponse.json() as any;
          console.log("Weather API response received successfully");
          
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
        } catch (error) {
          console.error("Error fetching weather data:", error);
          // If there's existing cached data, return it even if it's stale
          if (weatherData) {
            return res.json(weatherData);
          }
          // Otherwise re-throw to be handled by the outer catch block
          throw error;
        }
      }

      res.json(weatherData);
    } catch (error) {
      console.error("Weather error:", error);
      res.status(500).json({ error: "Failed to get weather data" });
    }
  });

  // Get sun position for a specific location and time
  app.get("/api/sun/position", async (req: Request, res: Response) => {
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
      
      const sunPosition = SunCalculationService.getSunPosition(latitude, longitude, date);
      res.json(sunPosition);
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
  app.get("/api/venues/:id/sunshine", async (req: Request, res: Response) => {
    try {
      const venueId = parseInt(req.params.id);
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      
      if (isNaN(venueId)) {
        return res.status(400).json({ error: "Invalid venue ID" });
      }
      
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
      
      if (!sunCalculation) {
        // Calculate new sun data for the venue
        const { latitude, longitude } = venue;
        
        // Example building data (simplified approximation)
        // In a real app, this would come from a buildings database or API
        const buildings = [
          {
            height: 20, // 20m tall building
            width: 15,
            length: 30,
            azimuth: 0, // facing north
            distance: 50, // 50m away
            direction: 90 // to the east of the venue
          },
          {
            height: 15, // 15m tall building
            width: 20,
            length: 20,
            azimuth: 45, // facing northeast
            distance: 40, // 40m away
            direction: 270 // to the west of the venue
          }
        ];
        
        // Calculate sunny periods
        const sunnyPeriods = SunCalculationService.calculateSunnyPeriods(
          latitude, 
          longitude, 
          date,
          buildings
        );
        
        // Format the periods for storage and response
        const formattedPeriods = sunnyPeriods.map(period => ({
          start: period.start.toISOString(),
          end: period.end.toISOString()
        }));
        
        // Get sun times for the day
        const sunTimes = SunCalculationService.getSunTimes(latitude, longitude, date);
        
        // Determine if the venue is currently in sunlight
        const isCurrentlySunny = SunCalculationService.isVenueInSunlight(
          latitude,
          longitude,
          new Date(),
          buildings
        );
        
        // Format date for database (just the date part, no time)
        const dateStr = date.toISOString().split('T')[0];
        
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
      
      // Add real-time sunshine status to the response
      const sunPosition = SunCalculationService.getSunPosition(venue.latitude, venue.longitude, new Date());
      const isCurrentlySunny = sunPosition.elevation > 0; // Simplified check - in reality would use buildings
      
      // Return combined response
      res.json({
        ...sunCalculation,
        currentSunPosition: sunPosition,
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
      const venueId = parseInt(req.params.id);
      const days = parseInt(req.query.days as string) || 7; // Default to 7-day forecast
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
      
      if (isNaN(venueId)) {
        return res.status(400).json({ error: "Invalid venue ID" });
      }
      
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
      
      const { latitude, longitude } = venue;
      
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
          const formattedPeriods = sunnyPeriods.map(period => ({
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

  const httpServer = createServer(app);
  return httpServer;
}
