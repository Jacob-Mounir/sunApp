import {
  users, 
  type User, 
  type InsertUser,
  venues,
  type Venue,
  type InsertVenue,
  weatherData,
  type WeatherData,
  type InsertWeatherData,
  sunCalculations,
  type SunCalculation,
  type InsertSunCalculation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, lte, gte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Venue operations
  getVenues(latitude: number, longitude: number, radius?: number, venueType?: string): Promise<Venue[]>;
  getVenue(id: number): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: number, venue: Partial<InsertVenue>): Promise<Venue | undefined>;
  
  // Weather operations
  getWeatherData(latitude: number, longitude: number): Promise<WeatherData | undefined>;
  createWeatherData(data: InsertWeatherData): Promise<WeatherData>;
  
  // Sun calculation operations
  getSunCalculation(venueId: number, date: Date): Promise<SunCalculation | undefined>;
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
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Venue methods
  async getVenues(latitude: number, longitude: number, radius = 5000, venueType?: string): Promise<Venue[]> {
    // First, get all venues or filter by type
    let query = db.select().from(venues);
    
    if (venueType) {
      query = query.where(eq(venues.venueType, venueType));
    }
    
    const allVenues = await query;
    
    // Then filter venues by calculating distance (cannot be done in SQL query easily)
    return allVenues.filter(venue => {
      const distance = this.calculateDistance(
        latitude, longitude, 
        venue.latitude, venue.longitude
      );
      // Convert radius from meters to kilometers
      return distance <= (radius / 1000);
    });
  }

  async getVenue(id: number): Promise<Venue | undefined> {
    const result = await db.select().from(venues).where(eq(venues.id, id));
    return result[0];
  }

  async createVenue(venueData: InsertVenue): Promise<Venue> {
    const result = await db.insert(venues).values(venueData).returning();
    return result[0];
  }

  async updateVenue(id: number, venueData: Partial<InsertVenue>): Promise<Venue | undefined> {
    const result = await db
      .update(venues)
      .set(venueData)
      .where(eq(venues.id, id))
      .returning();
    return result[0];
  }

  // Weather methods
  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData | undefined> {
    // Round to 2 decimal places to find nearby data
    const latRounded = Math.round(latitude * 100) / 100;
    const lonRounded = Math.round(longitude * 100) / 100;
    
    // Find weather data for the rounded coordinates
    const result = await db
      .select()
      .from(weatherData)
      .where(
        and(
          gte(weatherData.latitude, latRounded - 0.01),
          lte(weatherData.latitude, latRounded + 0.01),
          gte(weatherData.longitude, lonRounded - 0.01),
          lte(weatherData.longitude, lonRounded + 0.01)
        )
      )
      .orderBy(sql`${weatherData.timestamp} DESC`)
      .limit(1);
    
    return result[0];
  }

  async createWeatherData(data: InsertWeatherData): Promise<WeatherData> {
    const result = await db.insert(weatherData).values(data).returning();
    return result[0];
  }

  // Sun calculation methods
  async getSunCalculation(venueId: number, date: Date): Promise<SunCalculation | undefined> {
    // Find by venue ID and date
    const dateStr = date.toISOString().split('T')[0];
    const result = await db
      .select()
      .from(sunCalculations)
      .where(
        and(
          eq(sunCalculations.venueId, venueId),
          sql`DATE(${sunCalculations.date}) = ${dateStr}`
        )
      )
      .orderBy(sql`${sunCalculations.createdAt} DESC`)
      .limit(1);
    
    return result[0];
  }

  async createSunCalculation(data: InsertSunCalculation): Promise<SunCalculation> {
    const result = await db.insert(sunCalculations).values(data).returning();
    return result[0];
  }
}

// Export storage instance
export const storage = new DatabaseStorage();
