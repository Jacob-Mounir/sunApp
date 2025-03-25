declare module 'suncalc' {
  export interface SunPosition {
    altitude: number;  // Angle of the sun above the horizon in radians
    azimuth: number;   // Sun azimuth in radians (direction along the horizon, measured from south to west)
    zenith: number;    // Solar zenith angle
    azimuthDegrees?: number; // Calculated azimuth in degrees (not part of original API)
  }
  
  export interface SunTimes {
    dawn: Date;                    // Morning civil twilight starts
    dusk: Date;                    // Evening civil twilight starts
    goldenHour: Date;              // Evening golden hour starts
    goldenHourEnd: Date;           // Morning golden hour (soft light) ends
    nadir: Date;                   // Darkest moment of the night, sun is in the lowest position
    nauticalDawn: Date;            // Morning nautical twilight starts
    nauticalDusk: Date;            // Evening nautical twilight starts
    night: Date;                   // Night starts, astronomical twilight ends
    nightEnd: Date;                // Night ends, astronomical twilight starts
    solarNoon: Date;               // Solar noon (sun is in the highest position)
    sunrise: Date;                 // Sunrise (top edge of the sun appears on the horizon)
    sunriseEnd: Date;              // Sunrise ends (bottom edge of the sun touches the horizon)
    sunset: Date;                  // Sunset (sun disappears below the horizon, evening civil twilight starts)
    sunsetStart: Date;             // Sunset starts (bottom edge of the sun touches the horizon)
  }

  export interface MoonPhase {
    phase: number;                // moon phase (0..1) 
    illuminated: number;          // fraction of moon illuminated
    zenithAngle: number;          // zenith angle of moon
    angle: number;                // moon angle
    azimuth: number;              // moon azimuth in radians
    parallacticAngle: number;     // parallactic angle
    altitude: number;             // altitude above the horizon
  }
  
  /**
   * Calculates the sun position for a given date and location
   * @param date - Date to calculate for
   * @param lat - Latitude in decimal degrees
   * @param lng - Longitude in decimal degrees
   * @returns Object with altitude and azimuth information
   */
  export function getPosition(date: Date, lat: number, lng: number): SunPosition;
  
  /**
   * Calculates sun phases for a given date and location
   * @param date - Date to calculate for
   * @param lat - Latitude in decimal degrees
   * @param lng - Longitude in decimal degrees
   * @returns Object with various sun position times during the day
   */
  export function getTimes(date: Date, lat: number, lng: number): SunTimes;
  
  /**
   * Calculates moon position for a given date and location
   * @param date - Date to calculate for
   * @param lat - Latitude in decimal degrees
   * @param lng - Longitude in decimal degrees
   * @returns Object with moon position data
   */
  export function getMoonPosition(date: Date, lat: number, lng: number): MoonPhase;
  
  /**
   * Gets illumination values for the moon
   * @param date - Date to calculate for
   * @returns Object with moon illumination data
   */
  export function getMoonIllumination(date: Date): Pick<MoonPhase, 'phase' | 'angle' | 'fraction'>;
  
  /**
   * Gets moon rise/set times
   * @param date - Date to calculate for 
   * @param lat - Latitude in decimal degrees
   * @param lng - Longitude in decimal degrees
   * @returns Object with moonrise and moonset times
   */
  export function getMoonTimes(date: Date, lat: number, lng: number, inUTC?: boolean): {
    rise: Date | null;
    set: Date | null;
    alwaysUp?: boolean;
    alwaysDown?: boolean;
  };
}