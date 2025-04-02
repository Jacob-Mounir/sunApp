import { useQuery } from '@tanstack/react-query';
import { WeatherData } from '@/types';
import config from '../config';

// Round to 5 decimal places for API requests (~1.1m precision)
const roundForRequest = (coord: number) => Math.round(coord * 100000) / 100000;

// Calculate grid size based on zoom level
const getGridSize = (zoom: number): number => {
  // Grid sizes in degrees:
  // zoom <= 8: 1 degree (~111km)
  // zoom 9-10: 0.5 degrees (~55km)
  // zoom 11-12: 0.25 degrees (~27km)
  // zoom 13-14: 0.1 degrees (~11km)
  // zoom >= 15: 0.05 degrees (~5.5km)
  if (zoom <= 8) return 1;
  if (zoom <= 10) return 0.5;
  if (zoom <= 12) return 0.25;
  if (zoom <= 14) return 0.1;
  return 0.05;
};

// Round coordinates to nearest grid cell based on zoom level
const roundToGrid = (coord: number, zoom: number): number => {
  const gridSize = getGridSize(zoom);
  return Math.round(coord / gridSize) * gridSize;
};

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}

interface GridCell {
  lat: number;
  lon: number;
}

// Get grid cells that cover the visible area
const getGridCells = (bounds: MapBounds): GridCell[] => {
  const gridSize = getGridSize(bounds.zoom);
  const cells: GridCell[] = [];

  // Calculate grid boundaries
  const startLat = roundToGrid(bounds.south, bounds.zoom);
  const endLat = roundToGrid(bounds.north, bounds.zoom);
  const startLon = roundToGrid(bounds.west, bounds.zoom);
  const endLon = roundToGrid(bounds.east, bounds.zoom);

  // Generate grid cells
  for (let lat = startLat; lat <= endLat; lat += gridSize) {
    for (let lon = startLon; lon <= endLon; lon += gridSize) {
      cells.push({
        lat: roundForRequest(lat),
        lon: roundForRequest(lon)
      });
    }
  }

  return cells;
};

// Process OpenWeather API response data into our WeatherData format
const processWeatherData = (data: any): WeatherData => {
  return {
    id: data.id || Math.floor(Math.random() * 1000000),
    latitude: data.coord?.lat || 0,
    longitude: data.coord?.lon || 0,
    temperature: data.main?.temp,
    weatherCondition: data.weather?.[0]?.main || '',
    icon: data.weather?.[0]?.icon || '',
    timestamp: new Date().toISOString()
  };
};

export const useWeather = (latitude: number, longitude: number) => {
  const roundedLat = Math.round(latitude * 10000) / 10000;
  const roundedLon = Math.round(longitude * 10000) / 10000;

  return useQuery({
    queryKey: ['weather', roundedLat, roundedLon],
    queryFn: async () => {
      try {
        const requestLat = latitude;
        const requestLon = longitude;
        const response = await fetch(`${config.apiBaseUrl}/weather?latitude=${requestLat}&longitude=${requestLon}`);

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Weather API rate limit exceeded, please try again later');
          }
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        return processWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
      }
    },
    enabled: !!(latitude && longitude && latitude !== 0 && longitude !== 0),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error.message.includes('rate limit')) {
        return failureCount < 2;
      }
      return failureCount < 3;
    },
  });
};

// Enhanced weather condition checking
export function isSunnyWeather(weatherCondition?: string, icon?: string): boolean {
  if (!weatherCondition) return false;

  const sunnyConditions = [
    'Clear',
    'Sunny',
    'Clear sky',
    'Fair'
  ];

  const partlySunny = [
    'Clouds',
    'Partly cloudy',
    'Scattered clouds',
    'Few clouds',
    'Broken clouds'
  ];

  // Normalize condition to lowercase for comparison
  const normalizedCondition = weatherCondition.toLowerCase();

  // Check for exact sunny conditions
  if (sunnyConditions.some(condition =>
    normalizedCondition.includes(condition.toLowerCase())
  )) {
    return true;
  }

  // For partly cloudy conditions, check if it's daytime
  if (partlySunny.some(condition =>
    normalizedCondition.includes(condition.toLowerCase())
  )) {
    // Check if it's daytime based on icon
    return icon?.includes('d') ?? false;
  }

  return false;
}
