import { Venue } from '@/types';
import { Utensils, Coffee, Beer, TreePine, Star, MapPin, Sun, CloudSun, Clock, Thermometer, Home, ExternalLink, Flame, Route } from 'lucide-react';

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
          
          {/* Sun prediction indicator */}
          {venue.hasSunnySpot && (
            <div className="mt-2 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-2">
              <div className="text-xs font-medium text-amber-800 flex items-center justify-between">
                <div className="flex items-center">
                  <Sun className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                  {isSunny ? 'Currently sunny!' : 'Sunny during parts of the day'}
                </div>
                
                {/* Sun rating display (1-5 suns) */}
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Sun 
                      key={i} 
                      className={`h-3 w-3 ${i < getSunRating(venue) ? 'text-amber-500' : 'text-gray-300'}`} 
                      fill={i < getSunRating(venue) ? 'currentColor' : 'none'} 
                    />
                  ))}
                </div>
              </div>
              
              {venue.sunHoursStart && venue.sunHoursEnd && (
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(getSunRating(venue) * 20, 100)}%`, // Width based on sun rating (20% per sun)
                      // Animation to suggest sun movement
                      animation: 'sunMovement 3s infinite alternate ease-in-out'
                    }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
