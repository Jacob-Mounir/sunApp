import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Venue, VenueSearch } from '@/types';
import { apiRequest } from '@/lib/queryClient';

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
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Hook to fetch venues near a location
export function useVenues(params: VenueSearch) {
  const { latitude, longitude, radius, venueType } = params;

  // Round coordinates to 5 decimal places (about 1.1m precision) to reduce variations
  const roundedLat = Math.round(latitude * 100000) / 100000;
  const roundedLon = Math.round(longitude * 100000) / 100000;

  return useQuery<Venue[]>({
    queryKey: ['/api/venues', { latitude: roundedLat, longitude: roundedLon, radius, venueType }],
    queryFn: async () => {
      let url = `/api/venues?latitude=${roundedLat}&longitude=${roundedLon}`;

      if (radius) {
        url += `&radius=${radius}`;
      }

      if (venueType) {
        url += `&venueType=${venueType}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error('Failed to fetch venues');
      }

      const venues = await response.json();
      return calculateDistances(venues, latitude, longitude);
    },
    enabled: !!(latitude && longitude),
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
    // Use stale data while revalidating
    placeholderData: (previousData) => previousData,
    // Add refetch interval with jitter to prevent synchronized requests
    refetchInterval: (data) => {
      if (!data) return false;
      const jitter = Math.random() * 300000; // Random delay up to 5 minutes
      return 15 * 60 * 1000 + jitter; // Base interval of 15 minutes plus jitter
    }
  });
}

// Hook to fetch a specific venue
export function useVenue(id: string) {
  return useQuery<Venue>({
    queryKey: ['/api/venues', id],
    queryFn: async () => {
      const response = await fetch(`/api/venues/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Venue not found');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error('Failed to fetch venue');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error.message === 'Rate limit exceeded') {
        return failureCount < 3;
      }
      if (error.message === 'Venue not found') {
        return false; // Don't retry if venue doesn't exist
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => {
      const baseDelay = 1000 * Math.pow(2, attemptIndex);
      const jitter = Math.random() * 1000;
      return Math.min(baseDelay + jitter, 30000);
    },
    // Use stale data while revalidating
    placeholderData: (previousData) => previousData
  });
}

// Hook to update a venue
export function useUpdateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (venue: Partial<Venue>) =>
      apiRequest(`/api/venues/${venue._id}`, {
        method: 'PATCH',
        body: JSON.stringify(venue),
      }),
    onSuccess: (_, variables) => {
      // Invalidate both the venues list and the specific venue
      queryClient.invalidateQueries({ queryKey: ['/api/venues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/venues', variables._id] });
    },
  });
}
