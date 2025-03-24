// Types for venue data
export interface Venue {
  id: number;
  name: string;
  venueType: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  placeId?: string;
  hasSunnySpot: boolean;
  sunnySpotDescription?: string;
  imageUrl?: string;
  distance?: number; // Calculated on client side
}

// Types for weather data
export interface WeatherData {
  id: number;
  latitude: number;
  longitude: number;
  temperature?: number;
  weatherCondition?: string;
  icon?: string;
  timestamp: string;
}

// Types for venue search
export interface VenueSearch {
  latitude: number;
  longitude: number;
  radius?: number;
  venueType?: string;
}

// Types for user location
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  loading: boolean;
  error?: string;
}

// Map view pin
export interface MapPin {
  venue: Venue;
  isSunny: boolean;
}

// Type for filter state
export type FilterState = {
  [key: string]: boolean;
};
