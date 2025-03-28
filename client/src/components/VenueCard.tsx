import { Venue } from '@/types';
import { Utensils, Coffee, Beer, TreePine, Star, MapPin, Sun, CloudSun, Clock, Thermometer, Home, Flame, Route, ThermometerSnowflake } from 'lucide-react';
import { SunIcon } from './SunIcon';
import { useState } from 'react';
import { motion } from 'framer-motion';

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
  isLoading?: boolean;
}

export function VenueCard({ venue, isSunny, onClick, isLoading = false }: VenueCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const sunRating = getSunRating(venue);

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
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer
        transition-all duration-200
        ${isLoading ? 'animate-pulse' : ''}
        ${isHovered ? 'shadow-md ring-2 ring-amber-200' : 'hover:shadow-md'}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${venue.name} - ${getVenueTypeLabel()} - ${sunRating} sun rating`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        onClick();
        }
      }}
    >
      {/* Venue Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
          {venue.imageUrl ? (
            <img
            src={venue.imageUrl}
            alt={`${venue.name} venue`}
              className="w-full h-full object-cover"
            loading="lazy"
            />
          ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Home className="h-8 w-8 text-gray-400" />
              </div>
        )}
        {isSunny && (
          <div className="absolute top-2 right-2 bg-amber-500/90 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Sun className="h-3 w-3" />
            Sunny Now
            </div>
          )}
      </div>

      {/* Venue Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{venue.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              {getVenueIcon()}
              <span>{getVenueTypeLabel()}</span>
              <span>•</span>
              <span>{formatDistance(venue.distance)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <SunIcon rating={sunRating} />
            </div>
        </div>

        {/* Features */}
        <div className="mt-3 flex flex-wrap gap-2">
          {venue.hasHeaters && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
              <Flame className="h-3 w-3" />
              Heaters
            </span>
          )}
          {venue.hasIndoorSeating && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              <Home className="h-3 w-3" />
              Indoor
              </span>
            )}
            {venue.sunHoursStart && venue.sunHoursEnd && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
              <Clock className="h-3 w-3" />
              {venue.sunHoursStart}-{venue.sunHoursEnd}
              </span>
            )}
          </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
        )}
      </div>
    </motion.div>
  );
}
