import { Venue, WeatherData } from '@/types';
import { X, Sun, MapPin, Route, Clock, Navigation, Bookmark, Star } from 'lucide-react';
import { isSunnyWeather } from '@/hooks/useWeather';

interface SelectedLocationCardProps {
  venue: Venue;
  weatherData?: WeatherData;
  onClose: () => void;
}

export function SelectedLocationCard({ venue, weatherData, onClose }: SelectedLocationCardProps) {
  // Determine if it's currently sunny
  const isSunny = venue.hasSunnySpot && isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);
  
  // Format distance
  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown distance';
    
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} meters away`;
    }
    
    return `${distance.toFixed(1)} miles away`;
  };

  // Format venue type label
  const getVenueTypeLabel = () => {
    switch (venue.venueType) {
      case 'restaurant':
        return 'Restaurant';
      case 'cafe':
        return 'Café';
      case 'bar':
        return 'Bar';
      case 'park':
        return 'Park';
      default:
        return venue.venueType;
    }
  };

  // Get venue type icon
  const getVenueTypeIcon = () => {
    switch (venue.venueType) {
      case 'restaurant':
        return <span className="mr-1">🍽️</span>;
      case 'cafe':
        return <span className="mr-1">☕</span>;
      case 'bar':
        return <span className="mr-1">🍸</span>;
      case 'park':
        return <span className="mr-1">🌳</span>;
      default:
        return null;
    }
  };

  // Get directions
  const getDirections = () => {
    if (!venue.latitude || !venue.longitude) return;
    
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`,
      '_blank'
    );
  };

  // Save location (placeholder function)
  const saveLocation = () => {
    alert('This feature is not implemented yet.');
  };

  // Estimate sun hours (placeholder)
  const getSunHours = () => {
    const now = new Date();
    const hours = now.getHours();
    
    // If it's after 4 PM, show "Sunny until sunset"
    if (hours >= 16) {
      return 'Sunny until sunset';
    }
    
    // Otherwise show a time 2 hours from now
    const end = new Date(now);
    end.setHours(hours + 2);
    return `Sunny until: ${end.getHours()}:00 ${end.getHours() >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-xl mx-auto pointer-events-auto">
      <div className="relative">
        {venue.imageUrl ? (
          <img 
            src={venue.imageUrl} 
            alt={venue.name} 
            className="w-full h-36 object-cover"
          />
        ) : (
          <div className="w-full h-36 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-lg">No image available</span>
          </div>
        )}
        <button 
          className="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-gray-600"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
        
        {/* Sun status indicator */}
        <div className={`
          absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full flex items-center
          ${isSunny ? 'bg-yellow-400 text-dark' : 'bg-yellow-300 text-dark'}
        `}>
          <Sun className="h-3 w-3 mr-1" />
          {isSunny ? 'Sunny now' : 'Partial sun'}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{venue.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {getVenueTypeIcon()} {getVenueTypeLabel()}
            </p>
          </div>
          {venue.rating && (
            <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
              <span className="text-sm font-medium text-dark flex items-center">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                {venue.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-gray-600 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {venue.address}
          </p>
          <p className="text-sm text-gray-600 mt-1 flex items-center">
            <Route className="h-3 w-3 mr-1" />
            {formatDistance(venue.distance)}
          </p>
          <p className="text-sm text-gray-600 mt-1 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {getSunHours()}
          </p>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button 
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-center font-medium text-sm flex items-center justify-center"
            onClick={getDirections}
          >
            <Navigation className="h-4 w-4 mr-1" /> Directions
          </button>
          <button 
            className="flex-1 bg-gray-100 text-dark py-2 px-4 rounded-lg text-center font-medium text-sm flex items-center justify-center"
            onClick={saveLocation}
          >
            <Bookmark className="h-4 w-4 mr-1" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
