import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

// Type definition for sun position response
interface SunPosition {
  azimuth: number;
  elevation: number;
  timestamp: string;
}

// Type definition for sun times response
interface SunTimes {
  dawn: string;
  dusk: string;
  goldenHour: string;
  goldenHourEnd: string;
  nadir: string;
  nauticalDawn: string;
  nauticalDusk: string;
  night: string;
  nightEnd: string;
  solarNoon: string;
  sunrise: string;
  sunriseEnd: string;
  sunset: string;
  sunsetStart: string;
}

// Type definition for sunny periods
interface SunnyPeriod {
  start: string;
  end: string;
}

// Type definition for venue sunshine data
interface VenueSunshineData {
  id: number;
  venueId: number;
  date: string;
  sunriseTime: string;
  sunsetTime: string;
  sunnyPeriods: string; // JSON string of sunny periods
  calculationTimestamp: string;
  createdAt: string;

  // Additional properties not stored in DB but added in API response
  currentSunPosition: SunPosition;
  isCurrentlySunny: boolean;
}

// Type definition for a single day forecast
interface ForecastDay {
  date: string;
  sunriseTime: string;
  sunsetTime: string;
  sunnyPeriods: SunnyPeriod[];
  sunshinePercentage: number;
  sunshineMinutes: number;
  dayLengthMinutes: number;
}

// Type definition for forecast response
interface SunshineForecast {
  venueId: number;
  venueName: string;
  forecast: ForecastDay[];
}

/**
 * Hook to get the current sun position for a specific location
 */
export function useSunPosition(latitude: number, longitude: number, date?: Date) {
  // Round the date to the nearest minute to reduce unnecessary requests
  const roundedDate = date ? new Date(Math.round(date.getTime() / 60000) * 60000) : new Date(Math.round(Date.now() / 60000) * 60000);
  const dateParam = roundedDate.toISOString();

  // Round coordinates to 5 decimal places (about 1.1m precision) to reduce variations
  const roundedLat = Math.round(latitude * 100000) / 100000;
  const roundedLon = Math.round(longitude * 100000) / 100000;

  const queryUrl = `/api/sun/position?latitude=${roundedLat}&longitude=${roundedLon}&date=${dateParam}`;

  return useQuery<SunPosition>({
    queryKey: ['sunPosition', roundedLat, roundedLon, dateParam],
    queryFn: () => fetch(queryUrl).then(res => {
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`Sun position API error: ${res.status}`);
      }
      return res.json();
    }),
    enabled: !isNaN(latitude) && !isNaN(longitude),
    refetchOnWindowFocus: false,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      if (error.message === 'Rate limit exceeded') {
        return failureCount < 5; // More retries for rate limit
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff with much longer delays
      const baseDelay = 2000 * Math.pow(3, attemptIndex); // 2s, 6s, 18s, 54s, etc.
      const jitter = Math.random() * 2000; // Up to 2s of jitter
      return Math.min(baseDelay + jitter, 60000); // Cap at 1 minute
    },
    // Add refetch interval with jitter to prevent synchronized requests
    refetchInterval: (data) => {
      if (!data) return false;
      const jitter = Math.random() * 300000; // Random delay up to 5 minutes
      return 15 * 60 * 1000 + jitter; // Base interval of 15 minutes plus jitter
    },
    // Use stale data while revalidating
    placeholderData: (previousData) => previousData
  });
}

/**
 * Hook to get sun times (sunrise, sunset, etc.) for a specific location and date
 */
export function useSunTimes(latitude: number, longitude: number, date?: Date) {
  const dateParam = date ? date.toISOString() : new Date().toISOString();
  const queryUrl = `/api/sun/times?latitude=${latitude}&longitude=${longitude}&date=${dateParam}`;

  return useQuery<SunTimes>({
    queryKey: ['sunTimes', latitude, longitude, dateParam],
    queryFn: () => fetch(queryUrl).then(res => {
      if (!res.ok) {
        throw new Error(`Sun times API error: ${res.status}`);
      }
      return res.json();
    }),
    enabled: !isNaN(latitude) && !isNaN(longitude),
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to get sunshine data for a specific venue
 */
export function useVenueSunshine(venueId: number, date?: Date) {
  const dateParam = date ? date.toISOString() : new Date().toISOString();
  const queryUrl = `/api/venues/${venueId}/sunshine?date=${dateParam}`;

  return useQuery<VenueSunshineData>({
    queryKey: ['venueSunshine', venueId, dateParam],
    queryFn: () => fetch(queryUrl).then(res => {
      if (!res.ok) {
        throw new Error(`Venue sunshine API error: ${res.status}`);
      }
      return res.json();
    }),
    enabled: !isNaN(venueId),
    refetchOnWindowFocus: false,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Helper function to parse sunny periods from JSON string
 */
export function parseSunnyPeriods(sunnyPeriodsJson: string): SunnyPeriod[] {
  try {
    return JSON.parse(sunnyPeriodsJson);
  } catch (error) {
    console.error('Error parsing sunny periods:', error);
    return [];
  }
}

/**
 * Helper function to check if a venue is currently in sunshine
 */
export function isVenueCurrentlySunny(sunshineData?: VenueSunshineData): boolean {
  if (!sunshineData) return false;
  return sunshineData.isCurrentlySunny;
}

/**
 * Helper function to get the next sunny period for a venue
 */
export function getNextSunnyPeriod(sunshineData?: VenueSunshineData): SunnyPeriod | null {
  if (!sunshineData?.sunnyPeriods) return null;

  const now = new Date();
  const periods = parseSunnyPeriods(sunshineData.sunnyPeriods);

  // Find the next sunny period that starts after now
  for (const period of periods) {
    const startTime = new Date(period.start);
    if (startTime > now) {
      return period;
    }
  }

  return null;
}

/**
 * Helper function to format a sunny period as a readable string
 */
export function formatSunnyPeriod(period?: SunnyPeriod): string {
  if (!period) return 'No sunshine data available';

  const startTime = new Date(period.start);
  const endTime = new Date(period.end);

  // Format as "HH:MM - HH:MM"
  return `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} -
          ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Helper function to get the percentage of daylight hours with sunshine for a venue
 */
export function getSunshinePercentage(sunshineData?: VenueSunshineData): number {
  if (!sunshineData?.sunnyPeriods || !sunshineData.sunriseTime || !sunshineData.sunsetTime) {
    return 0;
  }

  const sunrise = new Date(sunshineData.sunriseTime);
  const sunset = new Date(sunshineData.sunsetTime);
  const totalDaylight = sunset.getTime() - sunrise.getTime();

  if (totalDaylight <= 0) return 0;

  const periods = parseSunnyPeriods(sunshineData.sunnyPeriods);
  let totalSunshine = 0;

  for (const period of periods) {
    const start = new Date(period.start);
    const end = new Date(period.end);
    totalSunshine += end.getTime() - start.getTime();
  }

  return Math.min(100, Math.max(0, (totalSunshine / totalDaylight) * 100));
}

/**
 * Hook to get sunshine forecast for a venue for multiple days
 */
export function useVenueSunshineForecast(venueId: number, days: number = 7, startDate?: Date) {
  const dateParam = startDate ? startDate.toISOString() : new Date().toISOString();
  const queryUrl = `/api/venues/${venueId}/sunshine/forecast?days=${days}&startDate=${dateParam}`;

  return useQuery<SunshineForecast>({
    queryKey: ['venueSunshineForecast', venueId, days, dateParam],
    queryFn: () => fetch(queryUrl).then(res => {
      if (!res.ok) {
        throw new Error(`Venue sunshine forecast API error: ${res.status}`);
      }
      return res.json();
    }),
    enabled: !isNaN(venueId) && days > 0,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 60 * 1000, // 3 hours
  });
}