import { useState, useEffect } from 'react';
import { UserLocation } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Default location: Göteborg, Sweden (central coordinates)
const DEFAULT_LOCATION = {
  latitude: 57.708870,
  longitude: 11.974560,
};

export function useLocation() {
  const [location, setLocation] = useState<UserLocation>({
    ...DEFAULT_LOCATION,
    loading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        ...DEFAULT_LOCATION,
        loading: false,
        error: "Geolocation is not supported by your browser"
      });
      
      toast({
        title: "Location not available",
        description: "Using default location instead",
        variant: "destructive",
      });
      
      return;
    }

    const successCallback = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        loading: false,
      });
    };

    const errorCallback = (error: GeolocationPositionError) => {
      let errorMessage = "Unknown error";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Permission to access location was denied";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "The request to get user location timed out";
          break;
      }
      
      setLocation({
        ...DEFAULT_LOCATION,
        loading: false,
        error: errorMessage,
      });
      
      toast({
        title: "Location error",
        description: errorMessage + ". Using default location instead.",
        variant: "destructive",
      });
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      options
    );
    
    // Enable watch position for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [toast]);

  // Function to manually refresh location
  const refreshLocation = () => {
    setLocation(prev => ({ ...prev, loading: true }));
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
        });
      },
      (error) => {
        setLocation(prev => ({ 
          ...prev, 
          loading: false,
          error: "Failed to refresh location"
        }));
        
        toast({
          title: "Failed to refresh",
          description: "Could not update your location",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return {
    ...location,
    refreshLocation,
  };
}
