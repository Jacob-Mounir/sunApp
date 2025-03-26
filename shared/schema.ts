import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the basic venue types
export const VenueType = z.enum(['restaurant', 'cafe', 'bar', 'park']);
export type VenueType = z.infer<typeof VenueType>;

// Schema for venues
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  venueType: text("venue_type").notNull(),
  address: text("address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  rating: real("rating"),
  placeId: text("place_id"),
  hasSunnySpot: boolean("has_sunny_spot").default(true),
  sunnySpotDescription: text("sunny_spot_description"),
  imageUrl: text("image_url"),
  city: text("city"),
  area: text("area"),
  sunHoursStart: text("sun_hours_start"),
  sunHoursEnd: text("sun_hours_end"),
  hasHeaters: boolean("has_heaters").default(false),
  website: text("website"),
  // Operating hours fields
  mondayHours: text("monday_hours"),
  tuesdayHours: text("tuesday_hours"),
  wednesdayHours: text("wednesday_hours"),
  thursdayHours: text("thursday_hours"),
  fridayHours: text("friday_hours"),
  saturdayHours: text("saturday_hours"),
  sundayHours: text("sunday_hours"),
  // Contact information fields
  phoneNumber: text("phone_number"),
  email: text("email"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
});

// Create insert schema for venues
export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
});

// Weather data schema
export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  temperature: real("temperature"),
  weatherCondition: text("weather_condition"),
  icon: text("icon"),
  timestamp: text("timestamp").notNull(),
});

// For storing sun calculation data
export const sunCalculations = pgTable("sun_calculations", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").notNull(),
  date: text("date").notNull(), // Store as text in format YYYY-MM-DD
  sunriseTime: text("sunrise_time"),
  sunsetTime: text("sunset_time"),
  sunnyPeriods: text("sunny_periods"), // JSON string of time periods
  calculationTimestamp: text("calculation_timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// For caching sun position data
export const sunPositionCache = pgTable("sun_position_cache", {
  id: serial("id").primaryKey(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  date: text("date").notNull(), // Store as text in format YYYY-MM-DD
  hour: integer("hour").notNull(), // Hour of day (0-23)
  azimuth: real("azimuth").notNull(),
  elevation: real("elevation").notNull(),
  calculationTimestamp: text("calculation_timestamp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
});

export const insertSunCalculationSchema = createInsertSchema(sunCalculations).omit({
  id: true,
  createdAt: true,
});

export const insertSunPositionCacheSchema = createInsertSchema(sunPositionCache).omit({
  id: true,
  createdAt: true,
});

// Export types for venues and weather data
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertSunCalculation = z.infer<typeof insertSunCalculationSchema>;
export type SunCalculation = typeof sunCalculations.$inferSelect;
export type InsertSunPositionCache = z.infer<typeof insertSunPositionCacheSchema>;
export type SunPositionCache = typeof sunPositionCache.$inferSelect;

// User interface
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Export input schema for fetching venues (for API requests)
export const venueSearchSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number().optional().default(1000), // in meters
  venueType: VenueType.optional(),
});

export type VenueSearch = z.infer<typeof venueSearchSchema>;
