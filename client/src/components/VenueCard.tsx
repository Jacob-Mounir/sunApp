import { Venue } from '@/types';
import { Utensils, Coffee, Beer, TreePine, Star, MapPin, Sun, CloudSun, Clock, Thermometer, Home, ExternalLink, Flame, Route } from 'lucide-react';

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
    if (!distance) return 'Unknown';
    
    if (distance < 1) {
      // Convert to meters
      const meters = Math.round(distance * 1000);
      return `${meters}m`;
    }
    
    return `${distance.toFixed(1)}km`;
  };

  // Get a placeholder background style based on venue type
  const getPlaceholderStyle = () => {
    switch (venue.venueType) {
      case 'restaurant':
        return 'bg-gradient-to-r from-amber-100 to-amber-200';
      case 'cafe':
        return 'bg-gradient-to-r from-amber-50 to-amber-100';
      case 'bar':
        return 'bg-gradient-to-r from-amber-200 to-amber-300';
      case 'park':
        return 'bg-gradient-to-r from-green-100 to-amber-100';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200';
    }
  };

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-md mb-4 overflow-hidden cursor-pointer 
        transition-all duration-200 hover:shadow-lg hover:scale-[1.01]
        ${isSunny ? 'ring-2 ring-amber-400' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-32 h-32 flex-shrink-0 relative">
          {venue.imageUrl ? (
            <img 
              src={venue.imageUrl} 
              alt={venue.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full ${getPlaceholderStyle()} flex items-center justify-center`}>
              <div className="w-16 h-16 bg-white/90 rounded-full p-4 flex items-center justify-center shadow-sm">
                {getVenueIcon()}
              </div>
            </div>
          )}
          
          {/* Visual indicators overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            {isSunny && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
                <Sun size={15} className="text-white" />
              </div>
            )}
            
            {venue.hasHeaters && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-md">
                <Flame size={15} className="text-white" />
              </div>
            )}
          </div>
          
          {/* Venue type badge */}
          <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-800 shadow-sm flex items-center">
            {getVenueIcon()}
            {getVenueTypeLabel()}
          </div>
        </div>
        
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900">{venue.name}</h3>
            
            {venue.rating && (
              <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Star className="h-3 w-3 text-amber-500 mr-1" fill="currentColor" />
                {venue.rating.toFixed(1)}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {(venue.city || venue.area) && (
              <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full flex items-center">
                <Home className="h-3 w-3 mr-1 text-gray-500" />
                {venue.area || venue.city}
              </span>
            )}
            
            <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full flex items-center">
              <Route className="h-3 w-3 mr-1 text-gray-500" /> 
              {formatDistance(venue.distance)}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`
              inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full
              ${isSunny 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm' 
                : 'bg-amber-100 text-amber-800'}
            `}>
              {isSunny 
                ? <Sun className="h-3.5 w-3.5 mr-1.5" /> 
                : <CloudSun className="h-3.5 w-3.5 mr-1.5" />}
              {isSunny ? 'Sunny now' : 'Sunny spot'}
            </span>
            
            {venue.hasHeaters !== undefined && (
              <span className={`
                inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full
                ${venue.hasHeaters 
                  ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-700'}
              `}>
                {venue.hasHeaters 
                  ? <Flame className="h-3.5 w-3.5 mr-1.5" />
                  : <Thermometer className="h-3.5 w-3.5 mr-1.5" />}
                {venue.hasHeaters ? 'Heated' : 'No heating'}
              </span>
            )}
          </div>
          
          {venue.sunHoursStart && venue.sunHoursEnd && (
            <p className="text-xs text-amber-700 flex items-center mt-2">
              <Clock className="h-3.5 w-3.5 mr-1.5" /> 
              Sun hours: {venue.sunHoursStart} - {venue.sunHoursEnd}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
