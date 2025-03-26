import { Venue } from '@/types';
import { Utensils, Coffee, Beer, TreePine, Star, MapPin, Sun, CloudSun, Clock, Thermometer, Home, Flame, Route, ThermometerSnowflake } from 'lucide-react';
import { SunIcon } from './SunIcon';

// Calculate sun rating (1-5) based on venue data
const getSunRating = (venue: Venue): number => {
  // This is a simplified algorithm - in a real app, this would be based on actual sun data
  if (!venue.hasSunnySpot) return 1;
  
  // Use various venue properties to determine rating
  let rating = 3; // Default middle rating
  
  // If venue has specified sun hours, use that to calculate rating
  if (venue.sunHoursStart && venue.sunHoursEnd) {
    try {
      const startHour = parseInt(venue.sunHoursStart.split(':')[0]);
      const endHour = parseInt(venue.sunHoursEnd.split(':')[0]);
      const sunHours = endHour - startHour;
      
      // 1-2 hours: 1 sun
      // 3-4 hours: 2 suns  
      // 5-6 hours: 3 suns
      // 7-8 hours: 4 suns
      // 9+ hours: 5 suns
      if (sunHours <= 2) rating = 1;
      else if (sunHours <= 4) rating = 2;
      else if (sunHours <= 6) rating = 3;
      else if (sunHours <= 8) rating = 4;
      else rating = 5;
    } catch (e) {
      // If calculation fails, use a default rating based on hasSunnySpot
      rating = venue.hasSunnySpot ? 3 : 1;
    }
  } else {
    // If no sun hours data, use a rating based on venue type
    // Parks tend to be more sunny, cafes more mixed
    switch (venue.venueType) {
      case 'park':
        rating = 4;
        break;
      case 'restaurant':
        rating = venue.hasHeaters ? 4 : 3;
        break;
      case 'cafe':
        rating = 3;
        break;
      case 'bar':
        rating = venue.hasHeaters ? 4 : 2;
        break;
      default:
        rating = 3;
    }
  }
  
  return rating;
};

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
        return <Utensils className="h-3.5 w-3.5" />;
      case 'cafe':
        return <Coffee className="h-3.5 w-3.5" />;
      case 'bar':
        return <Beer className="h-3.5 w-3.5" />;
      case 'park':
        return <TreePine className="h-3.5 w-3.5" />;
      default:
        return <MapPin className="h-3.5 w-3.5" />;
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
        return 'bg-gray-100';
      case 'cafe':
        return 'bg-gray-100';
      case 'bar':
        return 'bg-gray-100';
      case 'park':
        return 'bg-green-50';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-md mb-4 overflow-hidden cursor-pointer 
        transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        ${isSunny ? 'ring-2 ring-amber-200' : ''}
      `}
      onClick={() => {
        console.log('VenueCard clicked for venue:', venue.name);
        onClick();
      }}
    >
      <div className="flex">
        <div className="w-28 h-28 flex-shrink-0 relative">
          {venue.imageUrl ? (
            <img 
              src={venue.imageUrl} 
              alt={venue.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full ${getPlaceholderStyle()} flex items-center justify-center`}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                {getVenueIcon()}
              </div>
            </div>
          )}
          
          {/* Venue type indicator */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-xs py-1 px-2">
            <div className="flex items-center justify-center">
              <span className="text-[10px] text-white font-medium">
                {getVenueTypeLabel()}
              </span>
            </div>
          </div>
          
          {/* Sun indicator for sunny venues */}
          {isSunny && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
              <Sun className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        
        <div className="p-3 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 text-sm text-shadow-sm">{venue.name}</h3>
            
            <SunIcon 
              rating={getSunRating(venue)} 
              showRating={true} 
              className="ml-1" 
            />
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">
              {venue.area || venue.city || 'Unknown location'}
            </span>
            
            <span className="mx-1.5">•</span>
            
            <span>{formatDistance(venue.distance)}</span>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <span className={`
              inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full
              ${isSunny 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600'}
            `}>
              {isSunny 
                ? <Sun className="h-3 w-3 mr-0.5" /> 
                : <CloudSun className="h-3 w-3 mr-0.5" />}
              {isSunny ? 'Sunny now' : 'Sun later'}
            </span>
            
            {venue.hasHeaters !== undefined && (
              <span className={`
                inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full
                ${venue.hasHeaters 
                  ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-sm' 
                  : 'bg-blue-50 text-blue-600'}
              `}>
                {venue.hasHeaters 
                  ? <Flame className="h-3 w-3 mr-0.5" />
                  : <ThermometerSnowflake className="h-3 w-3 mr-0.5" />}
                {venue.hasHeaters ? 'Heated' : 'No heaters'}
              </span>
            )}
            
            {venue.sunHoursStart && venue.sunHoursEnd && (
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 shadow-sm">
                <Clock className="h-3 w-3 mr-0.5" /> 
                {venue.sunHoursStart} - {venue.sunHoursEnd}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
