import SunCalc from 'suncalc';
import { InsertSunCalculation, SunCalculation } from '@shared/schema';

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

    // If no buildings, return the entire day period
    if (!buildings.length) {
      return [{
        start: sunrise,
        end: sunset
      }];
    }

    const sunnyPeriods: SunlightPeriod[] = [];
    let currentPeriod: SunlightPeriod | null = null;

    // Check sun position every 15 minutes
    for (let time = sunrise; time <= sunset; time = new Date(time.getTime() + 15 * 60000)) {
      const isInSun = await this.isVenueInSunlight(latitude, longitude, time, buildings);

      if (isInSun && !currentPeriod) {
        // Start of a new sunny period
        currentPeriod = {
          start: time,
          end: time
        };
      } else if (!isInSun && currentPeriod) {
        // End of current sunny period
        currentPeriod.end = new Date(time.getTime() - 15 * 60000);
        sunnyPeriods.push(currentPeriod);
        currentPeriod = null;
      } else if (isInSun && currentPeriod) {
        // Update end time of current period
        currentPeriod.end = time;
      }
    }

    // Add the last period if it's still sunny at sunset
    if (currentPeriod) {
      currentPeriod.end = sunset;
      sunnyPeriods.push(currentPeriod);
    }

    return sunnyPeriods;
  }

  /**
   * Check if a building blocks the sun at a given sun position
   */
  private static isBuildingBlockingSun(
    building: BuildingData,
    sunAzimuth: number,
    sunElevation: number
  ): boolean {
    // Calculate the relative angle between the sun and the building
    const relativeAngle = Math.abs(building.direction - sunAzimuth);

    // If the sun is not in the direction of the building, it can't be blocked
    if (relativeAngle > 90) {
      return false;
    }

    // Calculate the shadow length
    const shadowLength = this.calculateShadowLength(building.height, sunElevation);

    // If the shadow is shorter than the distance to the building, sun is not blocked
    return shadowLength >= building.distance;
  }

  /**
   * Store sun calculation data in the database
   */
  public static async storeSunCalculation(calculation: InsertSunCalculation): Promise<SunCalculation> {
    return await SunCalculation.create(calculation);
  }

  /**
   * Retrieve sun calculation data from the database
   */
  public static async getSunCalculation(venueId: string, date: Date): Promise<SunCalculation | null> {
    const dateStr = date.toISOString().split('T')[0];
    return await SunCalculation.findOne({
      venueId,
      date: dateStr
    }).sort({ createdAt: -1 });
  }

  /**
   * Calculate shadow length based on building height and sun elevation
   */
  public static calculateShadowLength(buildingHeight: number, sunElevation: number): number {
    // Convert sun elevation to radians
    const elevationRad = sunElevation * (Math.PI / 180);

    // Calculate shadow length using trigonometry
    // Shadow length = building height / tan(elevation)
    return buildingHeight / Math.tan(elevationRad);
  }

  /**
   * Estimate the probability of sunshine at a given location and time
   */
  public static estimateSunshineProbability(
    latitude: number,
    longitude: number,
    date: Date,
    buildings: BuildingData[] = []
  ): number {
    // Get sun position
    const { elevation } = this.getSunPosition(latitude, longitude, date);

    // Base probability on sun elevation
    let probability = elevation / 90; // 0 to 1 based on elevation

    // Reduce probability based on buildings
    if (buildings.length > 0) {
      // Simple reduction based on number of nearby buildings
      probability *= Math.max(0, 1 - (buildings.length * 0.1));
    }

    // Ensure probability is between 0 and 1
    return Math.max(0, Math.min(1, probability));
  }
}