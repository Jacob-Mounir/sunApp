import {
  users, 
  type User, 
  type InsertUser,
  venues,
  type Venue,
  type InsertVenue,
  weatherData,
  type WeatherData,
  type InsertWeatherData
} from "@shared/schema";

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
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private venues: Map<number, Venue>;
  private weatherDataMap: Map<string, WeatherData>;
  private currentUserId: number;
  private currentVenueId: number;
  private currentWeatherId: number;

  constructor() {
    this.users = new Map();
    this.venues = new Map();
    this.weatherDataMap = new Map();
    this.currentUserId = 1;
    this.currentVenueId = 1;
    this.currentWeatherId = 1;
    
    // Initialize with some sample venues
    this.createVenue({
      name: "Harbor Restaurant",
      venueType: "restaurant",
      address: "123 Harbor St, City",
      latitude: 51.505,
      longitude: -0.09,
      rating: 4.8,
      placeId: "place_id_1",
      hasSunnySpot: true,
      sunnySpotDescription: "Sunny terrace",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    });
    
    this.createVenue({
      name: "Sunny Side Café",
      venueType: "cafe",
      address: "456 Sunny Ave, City",
      latitude: 51.5051,
      longitude: -0.095,
      rating: 4.7,
      placeId: "place_id_2",
      hasSunnySpot: true,
      sunnySpotDescription: "Sunny patio",
      imageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    });
    
    this.createVenue({
      name: "Twilight Lounge",
      venueType: "bar",
      address: "789 Night Blvd, City",
      latitude: 51.5052,
      longitude: -0.091,
      rating: 4.5,
      placeId: "place_id_3",
      hasSunnySpot: true,
      sunnySpotDescription: "Partial sun",
      imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    });
    
    this.createVenue({
      name: "Riverside Park",
      venueType: "park",
      address: "1 Park Rd, City",
      latitude: 51.506,
      longitude: -0.092,
      rating: 4.9,
      placeId: "place_id_4",
      hasSunnySpot: true,
      sunnySpotDescription: "Plenty of sun",
      imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Venue methods
  async getVenues(latitude: number, longitude: number, radius = 5000, venueType?: string): Promise<Venue[]> {
    const venues = Array.from(this.venues.values());
    
    // Filter by venue type if specified
    const filteredByType = venueType 
      ? venues.filter(venue => venue.venueType === venueType)
      : venues;
    
    // Calculate distance and filter by radius
    return filteredByType.filter(venue => {
      const distance = this.calculateDistance(
        latitude, longitude, 
        venue.latitude, venue.longitude
      );
      
      // Convert radius from meters to kilometers
      return distance <= (radius / 1000);
    });
  }

  async getVenue(id: number): Promise<Venue | undefined> {
    return this.venues.get(id);
  }

  async createVenue(venueData: InsertVenue): Promise<Venue> {
    const id = this.currentVenueId++;
    const venue: Venue = { ...venueData, id };
    this.venues.set(id, venue);
    return venue;
  }

  async updateVenue(id: number, venueData: Partial<InsertVenue>): Promise<Venue | undefined> {
    const venue = this.venues.get(id);
    if (!venue) return undefined;
    
    const updatedVenue = { ...venue, ...venueData };
    this.venues.set(id, updatedVenue);
    return updatedVenue;
  }

  // Weather methods
  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData | undefined> {
    // Round to 2 decimal places to use as a key
    const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
    return this.weatherDataMap.get(key);
  }

  async createWeatherData(weatherData: InsertWeatherData): Promise<WeatherData> {
    const id = this.currentWeatherId++;
    const data: WeatherData = { ...weatherData, id };
    
    // Create a key using lat/long
    const key = `${weatherData.latitude.toFixed(2)},${weatherData.longitude.toFixed(2)}`;
    this.weatherDataMap.set(key, data);
    
    return data;
  }

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
}

// Export storage instance
export const storage = new MemStorage();
