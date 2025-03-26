import SunCalc from 'suncalc';
import { InsertSunCalculation, SunCalculation, sunCalculations } from '@shared/schema';
import { db } from './db';
import { eq, and } from 'drizzle-orm';

interface BuildingData {
  height: number;     // in meters
  width: number;      // in meters
  length: number;     // in meters
  azimuth: number;    // orientation in degrees (0-360)
  distance: number;   // distance from the venue in meters
  direction: number;  // direction from the venue in degrees (0-360)
}

interface SunlightPeriod {
  start: Date;
  end: Date;
}

// In-memory cache for sun position data
interface SunPositionCacheEntry {
  azimuth: number;
  elevation: number;
  timestamp: Date;
  expiresAt: Date;
}

// Helper function to round coordinates to reduce number of cache entries
function roundCoordinate(coord: number): number {
  // Round to 3 decimal places (approximately 100 meters precision)
  return Math.round(coord * 1000) / 1000;
}

// Helper function to generate a cache key
function getCacheKey(latitude: number, longitude: number, date: Date): string {
  const roundedLat = roundCoordinate(latitude);
  const roundedLng = roundCoordinate(longitude);
  const dateString = date.toISOString().split('T')[0];
  const hour = date.getUTCHours();
  return `${roundedLat}|${roundedLng}|${dateString}|${hour}`;
}

export class SunCalculationService {
  // In-memory cache
  private static sunPositionCache: Map<string, SunPositionCacheEntry> = new Map();
  
  /**
   * Calculate sun position (azimuth and elevation) for a specific location and time
   * with in-memory caching to reduce repeated calculations
   * 
   * @param latitude - Latitude in decimal degrees
   * @param longitude - Longitude in decimal degrees
   * @param date - Date to calculate for
   * @param enableLogging - Whether to enable logging (default: false to reduce noise)
   */
  public static getSunPosition(latitude: number, longitude: number, date: Date, enableLogging = false) {
    const cacheKey = getCacheKey(latitude, longitude, date);
    const now = new Date();
    
    // Check if we have a valid cached entry
    const cachedEntry = this.sunPositionCache.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > now) {
      // Only log when explicitly enabled to reduce noise
      if (enableLogging) {
        console.log(`Using cached sun position for ${latitude},${longitude} at ${date.toISOString()}`);
      }
      return {
        azimuth: cachedEntry.azimuth,
        elevation: cachedEntry.elevation,
        timestamp: date
      };
    }
    
    // Log only when we calculate a new position AND logging is enabled
    if (enableLogging) {
      console.log(`Calculating new sun position for ${latitude},${longitude} at ${date.toISOString()}`);
    }
    
    // Calculate new position
    const sunPosition = this.calculateSunPosition(latitude, longitude, date);
    
    // Cache for 24 hours
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    
    // Store in cache
    this.sunPositionCache.set(cacheKey, {
      ...sunPosition,
      expiresAt: expiryDate
    });
    
    // Clean up expired entries periodically (if cache grows too large)
    if (this.sunPositionCache.size > 1000) {
      this.cleanupCache();
    }
    
    return sunPosition;
  }
  
  /**
   * Clean up expired cache entries
   */
  private static cleanupCache() {
    const now = new Date();
    const keysToDelete: string[] = [];
    
    // Create an array of keys for iteration
    const cacheKeys = Array.from(this.sunPositionCache.keys());
    
    // First identify expired keys
    for (const key of cacheKeys) {
      const entry = this.sunPositionCache.get(key);
      if (entry && entry.expiresAt < now) {
        keysToDelete.push(key);
      }
    }
    
    // Then delete them
    for (const key of keysToDelete) {
      this.sunPositionCache.delete(key);
    }
  }
  
  /**
   * Direct calculation of sun position
   */
  private static calculateSunPosition(latitude: number, longitude: number, date: Date) {
    const sunPosition = SunCalc.getPosition(date, latitude, longitude);
    
    // Convert altitude to elevation angle in degrees (0-90)
    const elevation = sunPosition.altitude * (180 / Math.PI);
    
    // Convert azimuth from radians to degrees (0-360)
    let azimuth = sunPosition.azimuth * (180 / Math.PI);
    
    // Adjust azimuth to be 0-360 degrees (0 = North, 90 = East, 180 = South, 270 = West)
    azimuth = (azimuth + 180) % 360;
    
    return { 
      azimuth, 
      elevation,
      timestamp: date 
    };
  }
  
  /**
   * Calculate sun times for a specific location and date
   * Returns various sun position times including sunrise, sunset, dawn, dusk, etc.
   */
  public static getSunTimes(latitude: number, longitude: number, date: Date) {
    return SunCalc.getTimes(date, latitude, longitude);
  }
  
  /**
   * Determine if a venue is currently in sunlight based on the sun position and nearby buildings
   */
  public static async isVenueInSunlight(
    latitude: number, 
    longitude: number, 
    date: Date, 
    buildings: BuildingData[] = []
  ): Promise<boolean> {
    // Get sun position for the current time
    const { azimuth, elevation } = await this.getSunPosition(latitude, longitude, date);
    
    // If sun is below horizon (elevation <= 0), there's no sunlight
    if (elevation <= 0) {
      return false;
    }
    
    // If no buildings provided, assume there's direct sunlight
    if (!buildings.length) {
      return true;
    }
    
    // Check if any building blocks the sun
    for (const building of buildings) {
      if (this.isBuildingBlockingSun(building, azimuth, elevation)) {
        return false;
      }
    }
    
    // No buildings blocking the sun
    return true;
  }
  
  /**
   * Calculate the period when a venue receives direct sunlight throughout the day
   */
  public static async calculateSunnyPeriods(
    latitude: number, 
    longitude: number, 
    date: Date,
    buildings: BuildingData[] = []
  ): Promise<SunlightPeriod[]> {
    // Get sunrise and sunset times
    const sunTimes = this.getSunTimes(latitude, longitude, date);
    const sunrise = sunTimes.sunrise;
    const sunset = sunTimes.sunset;
    
    const sunnyPeriods: SunlightPeriod[] = [];
    
    // If no buildings, return the full day's sunlight period
    if (!buildings.length) {
      sunnyPeriods.push({
        start: sunrise,
        end: sunset
      });
      return sunnyPeriods;
    }
    
    // Check sunlight every 15 minutes
    const timeStep = 15 * 60 * 1000; // 15 minutes in milliseconds
    let currentPeriod: SunlightPeriod | null = null;
    
    for (let time = sunrise.getTime(); time <= sunset.getTime(); time += timeStep) {
      const currentTime = new Date(time);
      const inSunlight = await this.isVenueInSunlight(latitude, longitude, currentTime, buildings);
      
      if (inSunlight && !currentPeriod) {
        // Start a new sunny period
        currentPeriod = {
          start: currentTime,
          end: currentTime
        };
      } else if (inSunlight && currentPeriod) {
        // Extend the current sunny period
        currentPeriod.end = currentTime;
      } else if (!inSunlight && currentPeriod) {
        // End of a sunny period
        sunnyPeriods.push({...currentPeriod});
        currentPeriod = null;
      }
    }
    
    // Add the last period if it exists
    if (currentPeriod) {
      sunnyPeriods.push(currentPeriod);
    }
    
    return sunnyPeriods;
  }
  
  /**
   * Calculate if a building blocks the sun based on its position relative to the venue
   * and the current sun position
   */
  private static isBuildingBlockingSun(
    building: BuildingData,
    sunAzimuth: number,
    sunElevation: number
  ): boolean {
    // Calculate the angular difference between the sun azimuth and building direction
    const azimuthDiff = Math.abs((sunAzimuth - building.direction + 180) % 360 - 180);
    
    // If the sun is coming from a different direction than the building, it doesn't block
    if (azimuthDiff > 90) {
      return false;
    }
    
    // Calculate the elevation angle required to clear the building
    const requiredElevation = Math.atan2(building.height, building.distance) * (180 / Math.PI);
    
    // If the sun's elevation is lower than required, the building blocks the sun
    return sunElevation < requiredElevation;
  }
  
  /**
   * Store sun calculation results in the database
   */
  public static async storeSunCalculation(calculation: InsertSunCalculation): Promise<SunCalculation> {
    const [result] = await db
      .insert(sunCalculations)
      .values(calculation)
      .returning();
    return result;
  }
  
  /**
   * Get stored sun calculation for a venue and date
   */
  public static async getSunCalculation(venueId: number, date: Date): Promise<SunCalculation | undefined> {
    // Format the date to compare just the day (ignoring time)
    const dateString = date.toISOString().split('T')[0];
    
    const [result] = await db
      .select()
      .from(sunCalculations)
      .where(
        and(
          eq(sunCalculations.venueId, venueId),
          eq(sunCalculations.date, dateString as any) // Type assertion to fix compatibility issue
        )
      );
    
    return result;
  }
  
  /**
   * Calculate shadow lengths cast by a building at a given time
   */
  public static calculateShadowLength(buildingHeight: number, sunElevation: number): number {
    // If sun is below horizon, shadow is infinitely long
    if (sunElevation <= 0) {
      return Infinity;
    }
    
    // Convert elevation to radians
    const elevationRad = sunElevation * (Math.PI / 180);
    
    // Calculate shadow length using trigonometry
    return buildingHeight / Math.tan(elevationRad);
  }
  
  /**
   * Estimate whether a venue has sunshine at a given time based on surrounding buildings
   * This is a simplified version of the full 3D shadow calculation described in the provided file
   */
  public static estimateSunshineProbability(
    latitude: number,
    longitude: number,
    date: Date,
    buildings: BuildingData[] = []
  ): number {
    // Using direct calculation to avoid Promise issues
    const sunPosition = this.calculateSunPosition(latitude, longitude, date);
    
    if (!buildings.length) {
      // No buildings, full sunshine (if sun is up)
      return sunPosition.elevation > 0 ? 1.0 : 0.0;
    }
    
    if (sunPosition.elevation <= 0) {
      // Sun is below horizon
      return 0.0;
    }
    
    // Count how many buildings are potentially blocking the sun
    let blockingBuildings = 0;
    
    for (const building of buildings) {
      if (this.isBuildingBlockingSun(building, sunPosition.azimuth, sunPosition.elevation)) {
        blockingBuildings++;
      }
    }
    
    // Simple probability based on number of blocking buildings
    // This is a very simplified model - a real model would use actual 3D geometry
    if (blockingBuildings > 0) {
      return Math.max(0, 1 - (blockingBuildings * 0.2));
    }
    
    return 1.0; // Full sunshine
  }
}