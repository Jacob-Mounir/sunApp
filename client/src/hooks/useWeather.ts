import { useQuery } from '@tanstack/react-query';
import { WeatherData } from '@/types';

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

export function useWeather(
  latitude: number,
  longitude: number,
  mapBounds?: MapBounds
) {
  // If we have map bounds, find the nearest grid cell center
  const cacheKey = mapBounds
    ? {
      cell: {
        lat: roundToGrid((mapBounds.north + mapBounds.south) / 2, mapBounds.zoom),
        lon: roundToGrid((mapBounds.east + mapBounds.west) / 2, mapBounds.zoom)
      },
      zoom: mapBounds.zoom,
      gridSize: getGridSize(mapBounds.zoom)
    }
    : {
      lat: roundForRequest(latitude),
      lon: roundForRequest(longitude)
    };

  // Use precise coordinates for the actual API request
  const requestLat = roundForRequest(latitude);
  const requestLon = roundForRequest(longitude);

  return useQuery<WeatherData>({
    queryKey: ['/api/weather', cacheKey],
    queryFn: async () => {
      const response = await fetch(`/api/weather?latitude=${requestLat}&longitude=${requestLon}`);
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Weather API rate limit exceeded');
        }
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    },
    enabled: !!(latitude && longitude),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 3 * 60 * 60 * 1000, // 3 hours
    retry: (failureCount, error) => {
      if (error.message === 'Weather API rate limit exceeded') {
        return failureCount < 5;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => {
      const baseDelay = 2000 * Math.pow(3, attemptIndex);
      const jitter = Math.random() * 2000;
      return Math.min(baseDelay + jitter, 60000);
    },
    refetchInterval: (data) => {
      if (!data) return false;
      const jitter = Math.random() * 300000; // Up to 5 minutes
      return 60 * 60 * 1000 + jitter; // Base interval of 1 hour plus jitter
    },
    placeholderData: (previousData) => previousData
  });
}

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
