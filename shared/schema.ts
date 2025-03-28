import mongoose from 'mongoose';
import { z } from "zod";

// Define the basic venue types
export const VenueType = z.enum(['restaurant', 'cafe', 'bar', 'park', 'beach', 'other']);
export type VenueType = z.infer<typeof VenueType>;

// Mongoose schemas
const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  venueType: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  rating: { type: Number },
  placeId: { type: String },
  hasSunnySpot: { type: Boolean, default: true },
  sunnySpotDescription: { type: String },
  imageUrl: { type: String },
  city: { type: String },
  area: { type: String },
  sunHoursStart: { type: String },
  sunHoursEnd: { type: String },
  hasHeaters: { type: Boolean, default: false },
  website: { type: String },
  // Operating hours fields
  mondayHours: { type: String },
  tuesdayHours: { type: String },
  wednesdayHours: { type: String },
  thursdayHours: { type: String },
  fridayHours: { type: String },
  saturdayHours: { type: String },
  sundayHours: { type: String },
  // Contact information fields
  phoneNumber: { type: String },
  email: { type: String },
  instagramUrl: { type: String },
  facebookUrl: { type: String },
  // Additional fields
  isVerified: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Create geospatial index for location-based queries
venueSchema.index({ location: '2dsphere' });

const reviewSchema = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  sunRating: { type: Number },
  shadeRating: { type: Number },
  bestTimeToVisit: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const savedLocationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const weatherDataSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  temperature: { type: Number },
  weatherCondition: { type: String },
  icon: { type: String },
  timestamp: { type: String, required: true },
  forecast: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

const sunCalculationSchema = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  date: { type: String, required: true },
  sunriseTime: { type: String },
  sunsetTime: { type: String },
  sunnyPeriods: { type: mongoose.Schema.Types.Mixed },
  calculationTimestamp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Mongoose models
export const Venue = mongoose.model('Venue', venueSchema);
export const Review = mongoose.model('Review', reviewSchema);
export const SavedLocation = mongoose.model('SavedLocation', savedLocationSchema);
export const WeatherData = mongoose.model('WeatherData', weatherDataSchema);
export const SunCalculation = mongoose.model('SunCalculation', sunCalculationSchema);
export const User = mongoose.model('User', userSchema);

// Zod schemas for validation
export const insertVenueSchema = z.object({
  name: z.string(),
  venueType: VenueType,
  address: z.string(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]) // [longitude, latitude]
  }),
  // ... add other fields as needed
});

export const insertReviewSchema = z.object({
  venueId: z.string(),
  userId: z.string(),
  rating: z.number(),
  comment: z.string().optional(),
  sunRating: z.number().optional(),
  shadeRating: z.number().optional(),
  bestTimeToVisit: z.string().optional()
});

export const insertSavedLocationSchema = z.object({
  userId: z.string(),
  venueId: z.string(),
  notes: z.string().optional()
});

export const insertWeatherDataSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  temperature: z.number().optional(),
  weatherCondition: z.string().optional(),
  icon: z.string().optional(),
  timestamp: z.string(),
  forecast: z.any().optional()
});

export const insertSunCalculationSchema = z.object({
  venueId: z.string(),
  date: z.string(),
  sunriseTime: z.string().optional(),
  sunsetTime: z.string().optional(),
  sunnyPeriods: z.any().optional(),
  calculationTimestamp: z.string()
});

export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string()
});

// Types
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Venue = mongoose.Document & z.infer<typeof insertVenueSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = mongoose.Document & z.infer<typeof insertReviewSchema>;
export type InsertSavedLocation = z.infer<typeof insertSavedLocationSchema>;
export type SavedLocation = mongoose.Document & z.infer<typeof insertSavedLocationSchema>;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WeatherData = mongoose.Document & z.infer<typeof insertWeatherDataSchema>;
export type InsertSunCalculation = z.infer<typeof insertSunCalculationSchema>;
export type SunCalculation = mongoose.Document & z.infer<typeof insertSunCalculationSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = mongoose.Document & z.infer<typeof insertUserSchema>;

// Search schema
export const venueSearchSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number().optional(),
  venueType: VenueType.optional()
});

export type VenueSearch = z.infer<typeof venueSearchSchema>;
