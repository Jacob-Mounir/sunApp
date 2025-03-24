import { useQuery } from '@tanstack/react-query';
import { Venue, VenueSearch } from '@/types';

// Function to calculate distances for venues
function calculateDistances(venues: Venue[], userLat: number, userLng: number): Venue[] {
  return venues.map(venue => ({
    ...venue,
    distance: calculateDistance(
      userLat, 
      userLng, 
      venue.latitude, 
      venue.longitude
    )
  }));
}

// Haversine formula to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in kilometers
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Hook to fetch venues near a location
export function useVenues(params: VenueSearch) {
  const { latitude, longitude, radius, venueType } = params;
  
  return useQuery<Venue[]>({
    queryKey: ['/api/venues', { latitude, longitude, radius, venueType }],
    queryFn: async () => {
      let url = `/api/venues?latitude=${latitude}&longitude=${longitude}`;
      
      if (radius) {
        url += `&radius=${radius}`;
      }
      
      if (venueType) {
        url += `&venueType=${venueType}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }
      
      const venues = await response.json();
      return calculateDistances(venues, latitude, longitude);
    },
    enabled: !!(latitude && longitude),
  });
}

// Hook to fetch a specific venue
export function useVenue(id: number) {
  return useQuery<Venue>({
    queryKey: ['/api/venues', id],
    queryFn: async () => {
      const response = await fetch(`/api/venues/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch venue');
      }
      return response.json();
    },
    enabled: !!id,
  });
}
