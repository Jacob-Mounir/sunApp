import { Venue } from '@/types';
import { Utensils, Coffee, Beer, TreePine, Star, MapPin, Sun, CloudSun } from 'lucide-react';

interface VenueCardProps {
  venue: Venue;
  isSunny: boolean;
  onClick: () => void;
}

export function VenueCard({ venue, isSunny, onClick }: VenueCardProps) {
  // Get the appropriate icon for venue type
  const getVenueIcon = () => {
    switch (venue.venueType) {
      case 'restaurant':
        return <Utensils className="h-3 w-3 mr-1" />;
      case 'cafe':
        return <Coffee className="h-3 w-3 mr-1" />;
      case 'bar':
        return <Beer className="h-3 w-3 mr-1" />;
      case 'park':
        return <TreePine className="h-3 w-3 mr-1" />;
      default:
        return <MapPin className="h-3 w-3 mr-1" />;
    }
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

  // Format distance
  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown distance';
    
    if (distance < 1) {
      // Convert to meters
      const meters = Math.round(distance * 1000);
      return `${meters} m`;
    }
    
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow mb-4 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex">
        <div className="w-32 h-32 flex-shrink-0">
          {venue.imageUrl ? (
            <img 
              src={venue.imageUrl} 
              alt={venue.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              {getVenueIcon()}
            </div>
          )}
        </div>
        <div className="p-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{venue.name}</h3>
              <p className="text-sm text-gray-500 flex items-center">
                {getVenueIcon()}
                {getVenueTypeLabel()}
              </p>
            </div>
            {venue.rating && (
              <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium flex items-center">
                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                {venue.rating.toFixed(1)}
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="h-3 w-3 mr-1" /> 
              {formatDistance(venue.distance)}
            </p>
            <div className="mt-2 flex items-center">
              <span className={`
                inline-flex items-center text-xs font-medium px-2 py-1 rounded-full
                ${isSunny 
                  ? 'bg-yellow-400 text-dark' 
                  : 'bg-yellow-300 text-dark'}
              `}>
                {isSunny 
                  ? <Sun className="h-3 w-3 mr-1" /> 
                  : <CloudSun className="h-3 w-3 mr-1" />}
                {venue.sunnySpotDescription || (isSunny ? 'Sunny now' : 'Partial sun')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
