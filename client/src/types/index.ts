// Types for venue data
export interface Venue {
  id: string;
  _id?: string; // MongoDB ID
  name: string;
  venueType: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  placeId?: string;
  hasSunnySpot: boolean;
  sunnySpotDescription?: string | null;
  imageUrl?: string | null;
  city?: string | null;
  area?: string | null;
  sunHoursStart?: string | null;
  sunHoursEnd?: string | null;
  hasHeaters?: boolean;
  website?: string | null;
  distance?: number; // Calculated on client side
  location?: { type: string; coordinates: number[] }; // MongoDB GeoJSON format

  // Operating hours
  mondayHours?: string;
  tuesdayHours?: string;
  wednesdayHours?: string;
  thursdayHours?: string;
  fridayHours?: string;
  saturdayHours?: string;
  sundayHours?: string;

  // Contact information
  phoneNumber?: string;
  email?: string;
  instagramUrl?: string;
  facebookUrl?: string;
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
export interface FilterState {
  all: boolean;
  restaurant: boolean;
  cafe: boolean;
  bar: boolean;
  park: boolean;
  [key: string]: boolean; // Allow other filter types
};
