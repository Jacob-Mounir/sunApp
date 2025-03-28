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
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await User.findOne({ username });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return await User.create(insertUser);
  }

  // Venue methods
  async getVenues(latitude: number, longitude: number, radius = 5000, venueType?: string): Promise<Venue[]> {
    console.log(`getVenues called with: lat=${latitude}, lon=${longitude}, radius=${radius}, type=${venueType || 'any'}`);

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
      }
    ];

    // Add venue type filter if specified
    if (venueType) {
      pipeline.push({ $match: { venueType } });
    }

    console.log('MongoDB pipeline:', JSON.stringify(pipeline, null, 2));

    // Execute the aggregation
    const venues = await Venue.aggregate(pipeline);
    console.log(`Retrieved ${venues.length} venues from database`);

    // Transform the results to match the expected format
    const transformedVenues = venues.map(venue => ({
      ...venue,
      id: venue._id.toString(),
      latitude: venue.location.coordinates[1],
      longitude: venue.location.coordinates[0]
    }));

    return transformedVenues;
  }

  async getVenue(id: string): Promise<Venue | null> {
    return await Venue.findById(id);
  }

  async createVenue(venueData: InsertVenue): Promise<Venue> {
    return await Venue.create(venueData);
  }

  async updateVenue(id: string, venueData: Partial<InsertVenue>): Promise<Venue | null> {
    return await Venue.findByIdAndUpdate(id, venueData, { new: true });
  }

  // Weather methods
  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData | null> {
    // Round to 2 decimal places to find nearby data
    const latRounded = Math.round(latitude * 100) / 100;
    const lonRounded = Math.round(longitude * 100) / 100;

    // Find weather data for the rounded coordinates
    return await WeatherData.findOne({
      latitude: { $gte: latRounded - 0.01, $lte: latRounded + 0.01 },
      longitude: { $gte: lonRounded - 0.01, $lte: lonRounded + 0.01 }
    }).sort({ timestamp: -1 });
  }

  async createWeatherData(data: InsertWeatherData): Promise<WeatherData> {
    return await WeatherData.create(data);
  }

  // Sun calculation methods
  async getSunCalculation(venueId: string, date: Date): Promise<SunCalculation | null> {
    // Find by venue ID and date
    const dateStr = date.toISOString().split('T')[0];
    return await SunCalculation.findOne({
      venueId: new Types.ObjectId(venueId),
      date: dateStr
    }).sort({ createdAt: -1 });
  }

  async createSunCalculation(data: InsertSunCalculation): Promise<SunCalculation> {
    return await SunCalculation.create(data);
  }
}

// Export storage instance
export const storage = new DatabaseStorage();
