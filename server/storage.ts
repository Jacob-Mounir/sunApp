import {
  User,
  type InsertUser,
  Venue,
  type InsertVenue,
  WeatherData,
  type InsertWeatherData,
  SunCalculation,
  type InsertSunCalculation
} from "@shared/schema";
import { Types } from 'mongoose';
import { MongoErrorHandler } from './utils/mongoErrorHandler';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;

  // Venue operations
  getVenues(latitude: number, longitude: number, radius?: number, venueType?: string): Promise<Venue[]>;
  getVenue(id: string): Promise<Venue | null>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: string, venue: Partial<InsertVenue>): Promise<Venue | null>;

  // Weather operations
  getWeatherData(latitude: number, longitude: number): Promise<WeatherData | null>;
  createWeatherData(data: InsertWeatherData): Promise<WeatherData>;

  // Sun calculation operations
  getSunCalculation(venueId: string, date: Date): Promise<SunCalculation | null>;
  createSunCalculation(data: InsertSunCalculation): Promise<SunCalculation>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Helper method to calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // User methods
  async getUser(id: string): Promise<User | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      const { message, code } = MongoErrorHandler.handle(error);
      throw new Error(`Failed to get user: ${message} (${code})`);
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      const { message, code } = MongoErrorHandler.handle(error);
      throw new Error(`Failed to get user by username: ${message} (${code})`);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const user = new User(insertUser);
      await user.save();
      return user;
    } catch (error) {
      const { message, code } = MongoErrorHandler.handle(error);
      throw new Error(`Failed to create user: ${message} (${code})`);
    }
  }

  // Venue methods
  async getVenues(latitude: number, longitude: number, radius = 5000, venueType?: string): Promise<Venue[]> {
    try {
      // Build the aggregation pipeline
      const pipeline: any[] = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            distanceField: 'distance',
            maxDistance: radius,
            spherical: true
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            venueType: 1,
            address: 1,
            location: 1,
            rating: 1,
            hasSunnySpot: 1,
            sunnySpotDescription: 1,
            imageUrl: 1,
            city: 1,
            area: 1,
            sunHoursStart: 1,
            sunHoursEnd: 1,
            hasHeaters: 1,
            distance: 1
          }
        }
      ];

      // Add venue type filter if specified
      if (venueType) {
        pipeline.push({ $match: { venueType } });
      }

      // Add sorting by distance
      pipeline.push({ $sort: { distance: 1 } });

      // Execute the aggregation
      const venues = await Venue.aggregate(pipeline);

      // Transform the results
      return venues.map(venue => ({
        ...venue,
        id: venue._id.toString(),
        latitude: venue.location.coordinates[1],
        longitude: venue.location.coordinates[0]
      }));
    } catch (error) {
      const { message, code } = MongoErrorHandler.handle(error);
      throw new Error(`Failed to get venues: ${message} (${code})`);
    }
  }

  async getVenue(id: string): Promise<Venue | null> {
    try {
      return await Venue.findById(new Types.ObjectId(id));
    } catch (error) {
      const { message, code } = MongoErrorHandler.handle(error);
      throw new Error(`Failed to get venue: ${message} (${code})`);
    }
  }

  async createVenue(venueData: InsertVenue): Promise<Venue> {
    try {
      const venue = new Venue(venueData);
      await venue.save();
      return venue;
    } catch (error) {
      const { message, code } = MongoErrorHandler.handle(error);
      throw new Error(`Failed to create venue: ${message} (${code})`);
    }
  }

  async updateVenue(id: string, updateData: Partial<InsertVenue>): Promise<Venue> {
    try {
      console.log('Raw update data received:', JSON.stringify(updateData, null, 2));

      // Find the venue first
      const venue = await Venue.findById(id);

      if (!venue) {
        throw new Error('Venue not found');
      }

      console.log('Before update - venue imageUrl:', venue.imageUrl);
      console.log('Update data imageUrl:', updateData.imageUrl);

      // IMPORTANT: Deal with undefined vs null for imageUrl
      // If imageUrl is explicitly set to null or a string in updateData, use that value
      // If it's undefined, don't modify it
      if ('imageUrl' in updateData) {
        venue.imageUrl = updateData.imageUrl || null;
      }

      // Update all other fields using spread
      // BUT exclude imageUrl as we handled it separately
      const { imageUrl, ...otherFields } = updateData;
      Object.assign(venue, {
        ...otherFields,
        lastUpdated: new Date()
      });

      console.log('Before save - imageUrl:', venue.imageUrl);

      // Save the venue to trigger setters
      await venue.save();
      console.log('After save - venue imageUrl:', venue.imageUrl);

      // Need to get a fresh copy after save to ensure everything is reflected correctly
      const updatedVenue = await Venue.findById(id);
      if (!updatedVenue) {
        throw new Error('Venue not found after update');
      }

      // Manual transformation to ensure all fields are included
      const result = {
        ...updatedVenue.toObject({ getters: true, virtuals: true }),
        id: updatedVenue._id.toString(),
        latitude: updatedVenue.location?.coordinates[1],
        longitude: updatedVenue.location?.coordinates[0],
        // Explicitly include imageUrl from the venue document
        imageUrl: updatedVenue.imageUrl
      };

      console.log('Final result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error updating venue:', error);
      throw new MongoErrorHandler(error);
    }
  }

  // Weather methods
  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
      const latRounded = Math.round(latitude * 100) / 100;
      const lonRounded = Math.round(longitude * 100) / 100;

      return await WeatherData.findOne({
        latitude: { $gte: latRounded - 0.01, $lte: latRounded + 0.01 },
        longitude: { $gte: lonRounded - 0.01, $lte: lonRounded + 0.01 }
      }).sort({ timestamp: -1 });
    } catch (error) {
      const { message, code } = MongoErrorHandler.handle(error);
      throw new Error(`Failed to get weather data: ${message} (${code})`);
    }
  }

  async createWeatherData(data: InsertWeatherData): Promise<WeatherData> {
    try {
      return await WeatherData.create(data);
    } catch (error) {
      const { message, code } = MongoErrorHandler.handle(error);
      throw new Error(`Failed to create weather data: ${message} (${code})`);
    }
  }

  // Sun calculation methods
  async getSunCalculation(venueId: string, date: Date): Promise<SunCalculation | null> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      return await SunCalculation.findOne({
        venueId: new Types.ObjectId(venueId),
        date: dateStr
      }).sort({ createdAt: -1 });
    } catch (error) {
      const { message, code } = MongoErrorHandler.handle(error);
      throw new Error(`Failed to get sun calculation: ${message} (${code})`);
    }
  }

  async createSunCalculation(data: InsertSunCalculation): Promise<SunCalculation> {
    try {
      return await SunCalculation.create(data);
    } catch (error) {
      const { message, code } = MongoErrorHandler.handle(error);
      throw new Error(`Failed to create sun calculation: ${message} (${code})`);
    }
  }
}

// Export storage instance
export const storage = new DatabaseStorage();
