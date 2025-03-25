import { Venue } from '@/types';
import { Utensils, Coffee, Beer, TreePine, Star, MapPin, Sun, CloudSun, Clock, Thermometer, Home, ExternalLink, Flame } from 'lucide-react';

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
        return <Utensils className="h-3.5 w-3.5 mr-1" />;
      case 'cafe':
        return <Coffee className="h-3.5 w-3.5 mr-1" />;
      case 'bar':
        return <Beer className="h-3.5 w-3.5 mr-1" />;
      case 'park':
        return <TreePine className="h-3.5 w-3.5 mr-1" />;
      default:
        return <MapPin className="h-3.5 w-3.5 mr-1" />;
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

  // Get a placeholder background style based on venue type
  const getPlaceholderStyle = () => {
    switch (venue.venueType) {
      case 'restaurant':
        return 'bg-gradient-to-br from-amber-100 to-amber-200';
      case 'cafe':
        return 'bg-gradient-to-br from-amber-50 to-amber-100';
      case 'bar':
        return 'bg-gradient-to-br from-amber-200 to-amber-300';
      case 'park':
        return 'bg-gradient-to-br from-green-100 to-amber-100';
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-200';
    }
  };

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-sm mb-4 overflow-hidden cursor-pointer 
        transition-all duration-200 hover:shadow-md
        ${isSunny ? 'border-l-4 border-amber-500' : 'border-l-4 border-transparent'}
      `}
      onClick={onClick}
    >
      <div className="flex">
        <div className="w-32 h-32 flex-shrink-0 relative">
          {venue.imageUrl ? (
            <img 
              src={venue.imageUrl} 
              alt={venue.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full ${getPlaceholderStyle()} flex items-center justify-center`}>
              <div className="bg-white/80 rounded-full p-3">
                {getVenueIcon()}
              </div>
            </div>
          )}
          
          {/* Visual indicators overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {isSunny && (
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-md glow-effect pulse-animation">
                <Sun size={14} className="text-white" />
              </div>
            )}
            
            {venue.hasHeaters && (
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                <Flame size={14} className="text-white" />
              </div>
            )}
          </div>
        </div>
        
        <div className="p-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{venue.name}</h3>
              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                <p className="text-xs text-gray-600 flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
                  {getVenueIcon()}
                  {getVenueTypeLabel()}
                </p>
                
                {venue.city && (
                  <p className="text-xs text-gray-600 flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    {venue.area || venue.city}
                  </p>
                )}
                
                {venue.website && (
                  <a 
                    href={venue.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-600 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3 mr-0.5" />
                    Website
                  </a>
                )}
              </div>
            </div>
            
            {venue.rating && (
              <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium flex items-center">
                <Star className="h-3 w-3 text-amber-500 mr-1" fill="#f59e0b" />
                {venue.rating.toFixed(1)}
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-gray-700 flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" /> 
              {formatDistance(venue.distance)}
            </p>
            
            {venue.sunHoursStart && venue.sunHoursEnd && (
              <p className="text-sm text-gray-700 flex items-center mt-1">
                <Clock className="h-3.5 w-3.5 mr-1" /> 
                <span className="text-amber-800">Sun hours:</span> {venue.sunHoursStart} - {venue.sunHoursEnd}
              </p>
            )}
            
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`
                inline-flex items-center text-xs font-medium px-2 py-1 rounded-full
                ${isSunny 
                  ? 'bg-amber-400 text-amber-900 shadow-sm' 
                  : 'bg-amber-200 text-amber-800'}
              `}>
                {isSunny 
                  ? <Sun className="h-3.5 w-3.5 mr-1" /> 
                  : <CloudSun className="h-3.5 w-3.5 mr-1" />}
                {venue.sunnySpotDescription || (isSunny ? 'Sunny now' : 'Sunny spot')}
              </span>
              
              {venue.hasHeaters !== undefined && (
                <span className={`
                  inline-flex items-center text-xs font-medium px-2 py-1 rounded-full
                  ${venue.hasHeaters 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-700'}
                `}>
                  {venue.hasHeaters 
                    ? <Flame className="h-3.5 w-3.5 mr-1" />
                    : <Thermometer className="h-3.5 w-3.5 mr-1" />}
                  {venue.hasHeaters ? 'Outdoor heaters' : 'No heaters'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
