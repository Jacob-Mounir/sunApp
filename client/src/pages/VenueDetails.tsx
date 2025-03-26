import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { 
  ArrowLeft, Sun, MapPin, Star, Navigation, Bookmark, Share2, 
  Clock, Phone, Globe, Calendar, ExternalLink, Users, ThumbsUp,
  Camera, MessageSquare, Flag, Utensils, Coffee, Beer, TreePine, Flame, Info,
  FileText, CalendarCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BottomNavigation } from '@/components/BottomNavigation';
import { SunshineForecast } from '@/components/SunshineForecast';
import { Venue } from '@/types';
import { useVenue } from '@/hooks/useVenues';
import { useWeather, isSunnyWeather } from '@/hooks/useWeather';
import { useVenueSunshine, getSunshinePercentage } from '@/hooks/useSunCalculation';
import { useSavedVenues } from '@/hooks/useSavedVenues';

export default function VenueDetails() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/venue/:id');
  const { toast } = useToast();
  
  // State to track active tab
  const [activeTab, setActiveTab] = useState('overview');
  
  const id = params?.id ? parseInt(params.id) : 0;
  const { data: venue, isLoading: venueLoading } = useVenue(id);
  
  const { data: weatherData } = useWeather(
    venue?.latitude || 0, 
    venue?.longitude || 0
  );
  
  const { data: sunshineData } = useVenueSunshine(id);
  
  // Use the saved venues hook
  const { isVenueSaved, toggleSavedVenue } = useSavedVenues();
  
  const isCurrentlySunny = venue?.hasSunnySpot && 
    isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);
  
  // Check if this venue is saved
  const isSaved = venue ? isVenueSaved(venue.id) : false;
  
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
    if (venue) {
      // Store the current saved state before toggling
      const wasAlreadySaved = isSaved; 
      
      toggleSavedVenue(venue);
      
      // Show appropriate toast message
      if (!wasAlreadySaved) {
        toast({
          title: "Location saved",
          description: `${venue.name} has been added to your favorites`,
          variant: "default",
        });
      }
      
      // Add animation class to bookmark icon
      const bookmarkIcon = document.querySelector('.bookmark-icon');
      if (bookmarkIcon) {
        bookmarkIcon.classList.add('bookmark-animation');
        setTimeout(() => {
          bookmarkIcon.classList.remove('bookmark-animation');
        }, 300);
      }
    }
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
  
  // Navigation handler for bottom navigation
  const handleNavItemClick = (item: 'explore' | 'saved' | 'settings') => {
    if (item === 'explore') {
      navigate('/');
    } else if (item === 'saved') {
      navigate('/saved');
    } else if (item === 'settings') {
      navigate('/settings');
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
    <div className="pb-24 venue-details-page">
      {/* Header with Back Button and Venue Name */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between py-3 px-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate("/")}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-3"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="font-semibold text-lg dark:text-white">{venue.name}</h1>
          </div>
          
          {/* Saved button */}
          <button 
            onClick={toggleSaved}
            className="w-8 h-8 rounded-full flex items-center justify-center"
          >
            <Bookmark className={`bookmark-icon h-5 w-5 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-gray-500'}`} />
          </button>
        </div>
        
        {/* Category Tabs - Sticky */}
        <div className="flex items-center justify-between px-4 py-2 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
              activeTab === 'overview' ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <FileText className="h-4 w-4 mr-1.5" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('sun')} 
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
              activeTab === 'sun' ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Sun className="h-4 w-4 mr-1.5" /> Sun Hours
          </button>
          <button 
            onClick={() => setActiveTab('schedule')} 
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
              activeTab === 'schedule' ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <CalendarCheck className="h-4 w-4 mr-1.5" /> Schedule
          </button>
          <button 
            onClick={() => setActiveTab('reviews')} 
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center ${
              activeTab === 'reviews' ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <MessageSquare className="h-4 w-4 mr-1.5" /> Reviews
          </button>
        </div>
      </div>
      
      {/* Header Image (Smaller) */}
      <div className="relative w-full h-48 bg-amber-100">
        {venue.imageUrl ? (
          <img 
            src={`${window.location.origin}${venue.imageUrl}`}
            alt={venue.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Image failed to load:", venue.imageUrl);
              const target = e.target as HTMLImageElement;
              // Replace with gradient background if image fails to load
              target.style.display = 'none';
              // Show fallback content
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add('bg-gradient-to-r', 'from-amber-100', 'to-amber-300', 'flex', 'items-center', 'justify-center');
                const fallback = document.createElement('div');
                fallback.className = 'text-center';
                fallback.innerHTML = `
                  <div class="flex justify-center mb-2">
                    <span class="h-8 w-8 text-amber-600">${venue.venueType === 'restaurant' ? '🍽️' : 
                      venue.venueType === 'cafe' ? '☕' : 
                      venue.venueType === 'bar' ? '🍸' : '🌳'}</span>
                  </div>
                  <span class="text-amber-800 text-xl font-medium">${venue.name}</span>
                `;
                parent.appendChild(fallback);
              }
            }}
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
      </div>
      
      {/* Basic Info Card */}
      <div className="mx-4 -mt-6 relative bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mt-1">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                {getVenueIcon()}
                <span className="ml-1 text-gray-700 dark:text-gray-300">{getVenueTypeLabel()}</span>
              </div>
              
              {venue.area && (
                <div className="ml-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs text-gray-700 dark:text-gray-300">
                  {venue.area}
                </div>
              )}
              
              {venue.city && !venue.area && (
                <div className="ml-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs text-gray-700 dark:text-gray-300">
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
        <div className="mt-3 flex items-start">
          <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-gray-600 dark:text-gray-300">{venue.address}</p>
        </div>
        
        {/* Distance */}
        {venue.distance && (
          <p className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">
            {formatDistance(venue.distance)}
          </p>
        )}
        
        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button 
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center shadow-sm hover:from-amber-600 hover:to-amber-700 transition-colors"
            onClick={getDirections}
          >
            <Navigation className="h-4 w-4 mr-1" /> Get Directions
          </button>
          <button 
            className={`save-button-transition py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center ${
              isSaved 
                ? 'save-button-saved' 
                : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
            }`}
            onClick={toggleSaved}
          >
            <Bookmark className={`bookmark-icon h-4 w-4 mr-1 ${isSaved ? 'fill-white' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      
      {/* Tabbed Content */}
      <div className="mt-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Sun Exposure */}
            <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300 flex items-center">
                <Sun className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" fill="currentColor" /> 
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
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {isCurrentlySunny ? 'Sunny right now!' : 'Not currently sunny'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <div className="mt-4 p-3 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
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
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {venue.hasHeaters 
                      ? 'Outdoor heating available' 
                      : 'No outdoor heating'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Details & Amenities */}
            <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                Details & Amenities
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {venue.website && (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</p>
                      <a 
                        href={venue.website} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
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
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Best Season</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Spring & Summer</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Crowds</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {venue.venueType === 'park' ? 'Usually spacious' : 'Moderate'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ThumbsUp className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Recommended</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {getSunRating(venue) >= 4 ? 'Highly recommended' : 'Recommended'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center mb-4">
                <Phone className="h-5 w-5 text-gray-600 mr-2" /> 
                Contact Information
              </h2>
              
              <div className="space-y-4">
                {venue.phoneNumber && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</p>
                      <a 
                        href={`tel:${venue.phoneNumber}`} 
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {venue.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}
                
                {venue.email && (
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                      <a 
                        href={`mailto:${venue.email}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {venue.email}
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 mt-4">
                  {venue.website && (
                    <a 
                      href={venue.website} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-full text-sm flex items-center"
                    >
                      <Globe className="h-4 w-4 mr-1.5" />
                      Website
                    </a>
                  )}
                  
                  {venue.instagramUrl && (
                    <a 
                      href={venue.instagramUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                      Instagram
                    </a>
                  )}
                  
                  {venue.facebookUrl && (
                    <a 
                      href={venue.facebookUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-sm flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Sun Hours Tab */}
        {activeTab === 'sun' && (
          <div className="tab-content">
            {/* Sun Hours Content */}
            <div className="mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300 flex items-center mb-4">
                <Sun className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" fill="currentColor" /> 
                Sun Hours Detail
              </h2>
              
              {venue.sunHoursStart && venue.sunHoursEnd ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <Sun className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-800">
                          Daily Sun Hours
                        </p>
                        <p className="text-sm text-amber-600">
                          {venue.sunHoursStart} - {venue.sunHoursEnd}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sunshine percentage */}
                  {sunshineData && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-700 font-medium">Sunshine coverage</p>
                        <p className="text-sm font-medium text-amber-800">
                          {getSunshinePercentage(sunshineData)}%
                        </p>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full" 
                          style={{ width: `${getSunshinePercentage(sunshineData)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sun className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No detailed sun hours available for this venue.</p>
                </div>
              )}
            </div>
            
            {/* Sunshine Forecast */}
            <div className="mx-4 mt-4">
              <SunshineForecast venueId={venue.id} />
            </div>
          </div>
        )}
        
        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="tab-content">
            {/* Operating Hours */}
            <div className="mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center mb-4">
                <Clock className="h-5 w-5 text-gray-600 mr-2" /> 
                Operating Hours
              </h2>
              
              {(venue.mondayHours || venue.tuesdayHours || venue.wednesdayHours || 
                venue.thursdayHours || venue.fridayHours || venue.saturdayHours || 
                venue.sundayHours) ? (
                <div className="space-y-2">
                  {venue.mondayHours && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monday</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{venue.mondayHours}</span>
                    </div>
                  )}
                  {venue.tuesdayHours && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tuesday</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{venue.tuesdayHours}</span>
                    </div>
                  )}
                  {venue.wednesdayHours && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wednesday</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{venue.wednesdayHours}</span>
                    </div>
                  )}
                  {venue.thursdayHours && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thursday</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{venue.thursdayHours}</span>
                    </div>
                  )}
                  {venue.fridayHours && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Friday</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{venue.fridayHours}</span>
                    </div>
                  )}
                  {venue.saturdayHours && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Saturday</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{venue.saturdayHours}</span>
                    </div>
                  )}
                  {venue.sundayHours && (
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sunday</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{venue.sundayHours}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No operating hours available for this venue.</p>
                </div>
              )}
            </div>
            
            {/* Best Seasons */}
            <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center mb-4">
                <Calendar className="h-5 w-5 text-gray-600 mr-2" /> 
                Best Times to Visit
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-green-50">
                  <p className="text-sm font-medium text-green-700">Spring</p>
                  <p className="text-xs text-green-600 mt-1">Early sunshine in pleasant temperatures</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-green-500 text-xs mr-1">Mar-May</span>
                    <div className="flex-1 h-1.5 bg-green-200 rounded-full">
                      <div className="h-1.5 bg-green-400 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-amber-50">
                  <p className="text-sm font-medium text-amber-700">Summer</p>
                  <p className="text-xs text-amber-600 mt-1">Maximum sunshine hours</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-amber-500 text-xs mr-1">Jun-Aug</span>
                    <div className="flex-1 h-1.5 bg-amber-200 rounded-full">
                      <div className="h-1.5 bg-amber-400 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-orange-50">
                  <p className="text-sm font-medium text-orange-700">Autumn</p>
                  <p className="text-xs text-orange-600 mt-1">Soft afternoon light</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-orange-500 text-xs mr-1">Sep-Nov</span>
                    <div className="flex-1 h-1.5 bg-orange-200 rounded-full">
                      <div className="h-1.5 bg-orange-400 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-blue-50">
                  <p className="text-sm font-medium text-blue-700">Winter</p>
                  <p className="text-xs text-blue-600 mt-1">Limited sunshine</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-blue-500 text-xs mr-1">Dec-Feb</span>
                    <div className="flex-1 h-1.5 bg-blue-200 rounded-full">
                      <div className="h-1.5 bg-blue-400 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="tab-content">
            <div className="mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center mb-4">
                <MessageSquare className="h-5 w-5 text-gray-600 mr-2" /> 
                Reviews
              </h2>
              
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No reviews yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to share your experience!</p>
                
                <button className="mt-4 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Write a review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeItem="explore" 
        onItemClick={handleNavItemClick} 
      />
    </div>
  );
}