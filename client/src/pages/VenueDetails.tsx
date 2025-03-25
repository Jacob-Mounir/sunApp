import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { 
  ArrowLeft, Sun, MapPin, Star, Navigation, Bookmark, Share2, 
  Clock, Phone, Globe, Calendar, ExternalLink, Users, ThumbsUp,
  Camera, MessageSquare, Flag, Utensils, Coffee, Beer, TreePine, Flame, Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Venue } from '@/types';
import { useVenue } from '@/hooks/useVenues';
import { useWeather, isSunnyWeather } from '@/hooks/useWeather';
import { useVenueSunshine, getSunshinePercentage } from '@/hooks/useSunCalculation';

export default function VenueDetails() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/venue/:id');
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: venue, isLoading: venueLoading } = useVenue(id);
  
  const { data: weatherData } = useWeather(
    venue?.latitude || 0, 
    venue?.longitude || 0
  );
  
  const { data: sunshineData } = useVenueSunshine(id);
  
  const isCurrentlySunny = venue?.hasSunnySpot && 
    isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);
  
  useEffect(() => {
    // Check if this venue is saved (placeholder logic)
    setIsSaved(false);
  }, [id]);
  
  // Get sun rating for this venue
  const getSunRating = (venue?: Venue): number => {
    if (!venue || !venue.hasSunnySpot) return 1;
    
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
  
  // Get the appropriate icon for venue type
  const getVenueIcon = () => {
    if (!venue) return <MapPin className="h-5 w-5" />;
    
    switch (venue.venueType) {
      case 'restaurant':
        return <Utensils className="h-5 w-5" />;
      case 'cafe':
        return <Coffee className="h-5 w-5" />;
      case 'bar':
        return <Beer className="h-5 w-5" />;
      case 'park':
        return <TreePine className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };
  
  // Format venue type label
  const getVenueTypeLabel = () => {
    if (!venue) return '';
    
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
      return `${(distance * 1000).toFixed(0)} meters away`;
    }
    
    return `${distance.toFixed(1)} kilometers away`;
  };
  
  // Get directions
  const getDirections = () => {
    if (!venue?.latitude || !venue?.longitude) return;
    
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`,
      '_blank'
    );
  };
  
  // Toggle save status
  const toggleSaved = () => {
    setIsSaved(!isSaved);
    toast({
      title: !isSaved ? "Location saved" : "Location removed",
      description: !isSaved 
        ? "This location has been added to your saved list" 
        : "This location has been removed from your saved list",
    });
  };
  
  // Share venue (placeholder function)
  const shareVenue = () => {
    if (navigator.share && venue) {
      navigator.share({
        title: venue.name,
        text: `Check out ${venue.name} on SunSpotter!`,
        url: window.location.href,
      }).catch(() => {
        toast({
          title: "Sharing failed",
          description: "This feature may not be supported in your browser.",
          variant: "destructive"
        });
      });
    } else {
      toast({
        title: "Sharing not supported",
        description: "Web Share API not supported in your browser",
        variant: "destructive"
      });
    }
  };
  
  // Check if page is loading
  if (venueLoading || !venue) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Sun className="h-8 w-8 text-amber-500 animate-pulse" />
          </div>
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-24">
      {/* Header Image */}
      <div className="relative w-full h-64 bg-amber-100">
        {venue.imageUrl ? (
          <img 
            src={venue.imageUrl} 
            alt={venue.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-amber-100 to-amber-300 flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getVenueIcon()}
              </div>
              <span className="text-amber-800 text-xl font-medium">{venue.name}</span>
            </div>
          </div>
        )}
        
        {/* Back button */}
        <button 
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-gray-700 hover:bg-opacity-100 transition-colors shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        {/* Saved button */}
        <button 
          onClick={toggleSaved}
          className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-gray-700 hover:bg-opacity-100 transition-colors shadow-md"
        >
          <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>
      
      {/* Basic Info Card */}
      <div className="mx-4 -mt-10 relative bg-white rounded-xl shadow-lg p-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
            <div className="flex items-center mt-1">
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs">
                {getVenueIcon()}
                <span className="ml-1 text-gray-700">{getVenueTypeLabel()}</span>
              </div>
              
              {venue.area && (
                <div className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
                  {venue.area}
                </div>
              )}
              
              {venue.city && !venue.area && (
                <div className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
                  {venue.city}
                </div>
              )}
            </div>
          </div>
          
          {/* Sun rating */}
          <div className="flex items-center bg-amber-200 px-3 py-1.5 rounded-full">
            <Sun className="h-5 w-5 text-amber-600 mr-1.5" fill="currentColor" />
            <span className="font-bold text-amber-800">{getSunRating(venue).toFixed(1)}</span>
          </div>
        </div>
        
        {/* Address */}
        <div className="mt-4 flex items-start">
          <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-gray-600">{venue.address}</p>
        </div>
        
        {/* Distance */}
        {venue.distance && (
          <p className="mt-1 ml-7 text-sm text-gray-500">
            {formatDistance(venue.distance)}
          </p>
        )}
        
        {/* Action buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button 
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center shadow-sm hover:from-amber-600 hover:to-amber-700 transition-colors"
            onClick={getDirections}
          >
            <Navigation className="h-4 w-4 mr-2" /> Get Directions
          </button>
          <button 
            className="bg-white border border-amber-300 text-amber-700 py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center hover:bg-amber-50 transition-colors"
            onClick={toggleSaved}
          >
            <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-amber-500' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      
      {/* Sun Exposure */}
      <div className="mx-4 mt-4 bg-white rounded-xl shadow-md p-5">
        <h2 className="text-lg font-bold text-amber-800 flex items-center">
          <Sun className="h-5 w-5 text-amber-500 mr-2" fill="currentColor" /> 
          Sun Exposure
        </h2>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            {isCurrentlySunny ? (
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center mr-3 shadow-md relative overflow-hidden">
                <Sun className="h-6 w-6 text-white" />
                <div className="absolute inset-0 rounded-full glow-animation"></div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <Sun className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-800">
                {isCurrentlySunny ? 'Sunny right now!' : 'Not currently sunny'}
              </p>
              <p className="text-sm text-gray-500">
                {isCurrentlySunny 
                  ? 'This location has direct sunlight now' 
                  : 'Check back later for sunshine'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Sun hours */}
        {venue.sunHoursStart && venue.sunHoursEnd && (
          <div className="mt-4 bg-amber-50 rounded-lg p-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-amber-600 mr-2" />
              <p className="text-sm font-medium text-amber-800">
                Sun Hours: {venue.sunHoursStart} - {venue.sunHoursEnd}
              </p>
            </div>
            
            {/* Sunshine percentage */}
            {sunshineData && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-amber-700">Sunshine coverage</p>
                  <p className="text-xs font-medium text-amber-800">
                    {getSunshinePercentage(sunshineData)}%
                  </p>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-1.5 rounded-full" 
                    style={{ width: `${getSunshinePercentage(sunshineData)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Sunny spot description */}
        {venue.sunnySpotDescription && (
          <div className="mt-4 p-3 border border-amber-200 rounded-lg">
            <p className="text-sm text-gray-700 italic">
              "{venue.sunnySpotDescription}"
            </p>
          </div>
        )}
        
        {/* Outdoor heating */}
        {venue.hasHeaters !== undefined && (
          <div className="mt-4 flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center mr-3
              ${venue.hasHeaters 
                ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' 
                : 'bg-gray-200 text-gray-400'}
            `}>
              <Flame className="h-4 w-4" />
            </div>
            <p className="text-sm text-gray-700">
              {venue.hasHeaters 
                ? 'Outdoor heating available' 
                : 'No outdoor heating'}
            </p>
          </div>
        )}
      </div>
      
      {/* Details & Amenities */}
      <div className="mx-4 mt-4 bg-white rounded-xl shadow-md p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Details & Amenities
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {venue.website && (
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Website</p>
                <a 
                  href={venue.website} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  Visit website
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-700">Best Season</p>
              <p className="text-xs text-gray-600">Spring & Summer</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-700">Crowds</p>
              <p className="text-xs text-gray-600">
                {venue.venueType === 'park' ? 'Usually spacious' : 'Moderate'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <ThumbsUp className="h-5 w-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-700">Recommended</p>
              <p className="text-xs text-gray-600">
                {getSunRating(venue) >= 4 ? 'Highly recommended' : 'Recommended'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Photos & Reviews Placeholder */}
      <div className="mx-4 mt-4 bg-white rounded-xl shadow-md p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Photos & Reviews
          </h2>
          <button className="text-sm text-amber-600 hover:text-amber-700">
            See all
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Camera className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">No photos yet</p>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            Add a photo
          </button>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-around">
        <button className="flex flex-col items-center">
          <Share2 className="h-6 w-6 text-gray-600 mb-1" />
          <span className="text-xs text-gray-600">Share</span>
        </button>
        
        <button className="flex flex-col items-center">
          <MessageSquare className="h-6 w-6 text-gray-600 mb-1" />
          <span className="text-xs text-gray-600">Review</span>
        </button>
        
        <button className="flex flex-col items-center">
          <Flag className="h-6 w-6 text-gray-600 mb-1" />
          <span className="text-xs text-gray-600">Report</span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => navigate("/about")}
        >
          <Info className="h-6 w-6 text-gray-600 mb-1" />
          <span className="text-xs text-gray-600">About</span>
        </button>
      </div>
    </div>
  );
}