import { Venue, WeatherData } from '@/types';
import { 
  X, Sun, MapPin, Route, Clock, Navigation, Bookmark, Star, Globe, Home, 
  Thermometer, CloudSun, Utensils, Coffee, Beer, TreePine, Share2, CalendarClock, 
  ExternalLink, Phone, Hash, Info
} from 'lucide-react';
import { isSunnyWeather } from '@/hooks/useWeather';
import { useLocation } from 'wouter';
import { useSavedVenues } from '@/hooks/useSavedVenues';
import { useToast } from '@/hooks/use-toast';

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

interface SelectedLocationCardProps {
  venue: Venue;
  weatherData?: WeatherData;
  onClose: () => void;
}

export function SelectedLocationCard({ venue, weatherData, onClose }: SelectedLocationCardProps) {
  // For navigation
  const [, navigate] = useLocation();
  
  // Use saved venues hook
  const { savedVenues, saveVenue, removeSavedVenue, isVenueSaved, toggleSavedVenue } = useSavedVenues();
  const { toast } = useToast();

  // Determine if it's currently sunny
  const isSunny = venue.hasSunnySpot && isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);
  
  // Format distance
  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown distance';
    
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} meters away`;
    }
    
    return `${distance.toFixed(1)} kilometers away`;
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
        return <Utensils className="h-4 w-4 mr-1 text-amber-600" />;
      case 'cafe':
        return <Coffee className="h-4 w-4 mr-1 text-amber-600" />;
      case 'bar':
        return <Beer className="h-4 w-4 mr-1 text-amber-600" />;
      case 'park':
        return <TreePine className="h-4 w-4 mr-1 text-amber-600" />;
      default:
        return <MapPin className="h-4 w-4 mr-1 text-amber-600" />;
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

  // Open website
  const openWebsite = () => {
    if (!venue.website) {
      alert('No website available');
      return;
    }
    
    window.open(venue.website, '_blank');
  };

  // Share venue (placeholder function)
  const shareVenue = () => {
    if (navigator.share) {
      navigator.share({
        title: venue.name,
        text: `Check out ${venue.name} on SunSpotter!`,
        url: window.location.href,
      }).catch(() => {
        alert('Sharing failed. This feature may not be supported in your browser.');
      });
    } else {
      alert('Web Share API not supported in your browser');
    }
  };

  // Save or remove location
  const saveLocation = () => {
    toggleSavedVenue(venue);
    // Toast notifications are handled in the hook
  };

  // Get sun hours
  const getSunHours = () => {
    if (venue.sunHoursStart && venue.sunHoursEnd) {
      return `${venue.sunHoursStart} - ${venue.sunHoursEnd}`;
    }
    
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

  // Get current weather
  const getCurrentWeather = () => {
    if (!weatherData) return null;
    
    return (
      <div className="px-3 py-2 bg-blue-50 rounded-lg mt-3">
        <h4 className="text-sm font-semibold text-blue-700 mb-1">Current Weather</h4>
        <div className="flex items-center">
          {weatherData.icon && (
            <img 
              src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`} 
              alt={weatherData.weatherCondition || 'Weather icon'} 
              className="w-10 h-10 mr-2"
            />
          )}
          <div>
            <p className="text-blue-700 font-medium">{weatherData.weatherCondition}</p>
            {weatherData.temperature !== undefined && (
              <p className="text-sm text-blue-600">{weatherData.temperature.toFixed(1)}°C</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-md mx-auto pointer-events-auto z-30">
      <div className="relative">
        {venue.imageUrl ? (
          <img 
            src={venue.imageUrl} 
            alt={venue.name} 
            className="w-full h-32 sm:h-40 md:h-48 object-cover"
          />
        ) : (
          <div className="w-full h-32 sm:h-40 md:h-48 bg-gradient-to-r from-amber-100 to-amber-300 flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-1 sm:mb-2">
                {getVenueTypeIcon()}
              </div>
              <span className="text-amber-800 text-lg sm:text-xl font-medium truncate max-w-[90%]">{venue.name}</span>
            </div>
          </div>
        )}
        <button 
          className="absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-gray-600 hover:bg-opacity-100 transition-colors z-20"
          onClick={onClose}
          aria-label="Close venue details"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
        
        {/* Sun status indicator */}
        <div className={`
          absolute top-2 left-2 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center z-10
          ${isSunny 
            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md' 
            : 'bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900'}
        `}>
          {isSunny 
            ? <Sun className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" /> 
            : <CloudSun className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />}
          {isSunny ? 'Sunny now' : 'Partial sun'}
        </div>
        
        {/* Venue type badge */}
        <div className="absolute bottom-2 left-2 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center bg-white bg-opacity-90 text-amber-700 shadow-sm z-10">
          {getVenueTypeIcon()}
          <span className="truncate max-w-[80px] sm:max-w-none">{getVenueTypeLabel()}</span>
        </div>
        
        {/* Heaters indicator if available */}
        {venue.hasHeaters !== undefined && (
          <div className={`
            absolute bottom-2 right-2 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center z-10
            ${venue.hasHeaters 
              ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-sm' 
              : 'bg-gray-200 text-gray-700'}
          `}>
            <Thermometer className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
            <span className="hidden xs:inline">{venue.hasHeaters ? 'Outdoor heating' : 'No heating'}</span>
            <span className="xs:hidden">{venue.hasHeaters ? 'Heaters' : 'No heat'}</span>
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <h3 className="font-bold text-lg sm:text-xl text-amber-900 dark:text-amber-300 truncate max-w-[75%]">{venue.name}</h3>
          {venue.rating && (
            <div className="flex items-center bg-amber-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              <span className="text-xs sm:text-sm font-medium text-amber-800 flex items-center">
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 mr-0.5 sm:mr-1" fill="currentColor" />
                {venue.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          <div className="inline-flex items-center bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs">
            <span className="truncate max-w-[150px]">
              {venue.city || ''}
              {venue.area && ` · ${venue.area}`}
            </span>
          </div>
          
          <div className="inline-flex items-center bg-blue-50 text-blue-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs">
            <Route className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1 flex-shrink-0" />
            <span className="truncate">{formatDistance(venue.distance)}</span>
          </div>
        </div>
        
        {/* Weather information - more compact on mobile */}
        {weatherData && (
          <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 rounded-lg mt-2 sm:mt-3">
            <h4 className="text-xs sm:text-sm font-semibold text-blue-700 mb-0.5 sm:mb-1">Current Weather</h4>
            <div className="flex items-center">
              {weatherData.icon && (
                <img 
                  src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`} 
                  alt={weatherData.weatherCondition || 'Weather icon'} 
                  className="w-8 h-8 sm:w-10 sm:h-10 mr-1 sm:mr-2"
                />
              )}
              <div>
                <p className="text-blue-700 font-medium text-xs sm:text-sm truncate max-w-[180px]">{weatherData.weatherCondition}</p>
                {weatherData.temperature !== undefined && (
                  <p className="text-xs sm:text-sm text-blue-600">{weatherData.temperature.toFixed(1)}°C</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Sun hours information - more compact on mobile */}
        <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-50 rounded-lg mt-2 sm:mt-3">
          <h4 className="text-xs sm:text-sm font-semibold text-amber-700 mb-0.5 sm:mb-1 flex items-center">
            <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-amber-500 flex-shrink-0" fill="currentColor" /> 
            Sun Exposure
          </h4>
          
          {/* Sun rating display with numeric value */}
          <div className="flex items-center mb-1 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-medium text-amber-700 mr-1 sm:mr-2">Rating:</span>
            <div className="flex items-center bg-amber-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
              <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 mr-1 sm:mr-1.5 flex-shrink-0" fill="currentColor" />
              <span className="text-xs sm:text-sm font-bold text-amber-800">{getSunRating(venue).toFixed(1)}</span>
            </div>
          </div>
          
          <p className="text-[10px] sm:text-xs text-amber-800 flex items-center mb-0.5 sm:mb-1">
            <CalendarClock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-amber-600 flex-shrink-0" />
            <span className="truncate">{getSunHours()}</span>
          </p>
          {venue.sunnySpotDescription && (
            <p className="text-[10px] sm:text-xs text-amber-700 mt-0.5 sm:mt-1 italic line-clamp-2 sm:line-clamp-3">
              "{venue.sunnySpotDescription}"
            </p>
          )}
        </div>
        
        {/* Location details - more compact */}
        <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
          <p className="text-[10px] sm:text-xs text-gray-700 flex items-center">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
            <span className="truncate">{venue.address}</span>
          </p>
          
          {venue.website && (
            <p className="text-[10px] sm:text-xs text-gray-700 flex items-center">
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
              <a 
                href={venue.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline flex items-center truncate"
              >
                <span className="truncate max-w-[150px]">{venue.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1 flex-shrink-0" />
              </a>
            </p>
          )}
        </div>
        
        {/* Action buttons - reduced text size and padding on small screens */}
        <div className="mt-3 sm:mt-5 grid grid-cols-2 gap-2 sm:gap-3">
          <button 
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg font-medium text-[10px] sm:text-sm flex items-center justify-center shadow-sm hover:from-amber-600 hover:to-amber-700 transition-colors"
            onClick={getDirections}
          >
            <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" /> 
            <span className="truncate">Get Directions</span>
          </button>
          <button 
            className={`
              py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg font-medium text-[10px] sm:text-sm flex items-center justify-center transition-colors
              ${isVenueSaved(venue.id) 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'}
            `}
            onClick={saveLocation}
          >
            <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0 ${isVenueSaved(venue.id) ? 'fill-amber-500' : ''}`} /> 
            <span className="hidden xs:inline">{isVenueSaved(venue.id) ? 'Saved' : 'Save Location'}</span>
            <span className="xs:hidden">{isVenueSaved(venue.id) ? 'Saved' : 'Save'}</span>
          </button>
        </div>
        
        <div className="mt-2 sm:mt-3 flex space-x-2 sm:space-x-3">
          <button 
            className="flex-1 bg-gray-100 text-gray-800 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-center font-medium text-[10px] sm:text-sm flex items-center justify-center hover:bg-gray-200 transition-colors"
            onClick={shareVenue}
          >
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" /> 
            <span className="truncate">Share</span>
          </button>
          
          {venue.website ? (
            <button 
              className="flex-1 bg-gray-100 text-gray-800 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-center font-medium text-[10px] sm:text-sm flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={openWebsite}
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" /> 
              <span className="truncate">Website</span>
            </button>
          ) : (
            <button 
              className="flex-1 bg-amber-100 text-amber-800 py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-center font-medium text-[10px] sm:text-sm flex items-center justify-center hover:bg-amber-200 transition-colors"
              onClick={() => navigate(`/venue/${venue.id}`)}
            >
              <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" /> 
              <span className="truncate">Details</span>
            </button>
          )}
        </div>
        
        {/* View full details button - more compact on mobile */}
        <button 
          className="mt-2 sm:mt-3 w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg font-medium text-[10px] sm:text-sm flex items-center justify-center shadow-sm hover:from-amber-500 hover:to-amber-600 transition-colors"
          onClick={() => navigate(`/venue/${venue.id}`)}
        >
          <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" /> 
          <span className="truncate">View Full Details</span>
        </button>
      </div>
    </div>
  );
}
