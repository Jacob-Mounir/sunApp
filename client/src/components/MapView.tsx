import { useEffect, useRef, useState } from 'react';
import { Venue, WeatherData } from '@/types';
import { SelectedLocationCard } from './SelectedLocationCard';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { isSunnyWeather } from '@/hooks/useWeather';
import { useSunPosition } from '@/hooks/useSunCalculation';
import { Sun, Clock, MapPin } from 'lucide-react';
import { addCustomMapStyles, createSunnyTileLayer } from './SunnyMapStyle';
import { useSavedVenues } from '@/hooks/useSavedVenues';
import { WeatherEffects } from './WeatherEffects';
import { Button } from '@/components/ui/button';
import { SunIcon } from '@/components/SunIcon';
import ReactDOMServer from 'react-dom/server';

interface MapViewProps {
  venues: Venue[];
  userLocation: { latitude: number; longitude: number };
  weatherData?: WeatherData;
  onVenueSelect: (venue: Venue) => void;
}

// Helper function to convert venue rating to percentage
const ratingToPercentage = (rating: number): number => {
  return Math.round((rating / 5) * 100);
};

// Calculate sun rating (1-5) based on venue data
const getSunRating = (venue: Venue): number => {
  if (!venue.hasSunnySpot) return 1;

  let rating = 3; // Default middle rating

  // If venue has specified sun hours, use that to calculate rating
  if (venue.sunHoursStart && venue.sunHoursEnd) {
    try {
      const startHour = parseInt(venue.sunHoursStart.split(':')[0]);
      const endHour = parseInt(venue.sunHoursEnd.split(':')[0]);
      const sunHours = endHour - startHour;

      if (sunHours <= 2) rating = 1;
      else if (sunHours <= 4) rating = 2;
      else if (sunHours <= 6) rating = 3;
      else if (sunHours <= 8) rating = 4;
      else rating = 5;
    } catch (e) {
      rating = venue.hasSunnySpot ? 3 : 1;
    }
  } else {
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

// Create a React component for the marker content
const MarkerContent = ({ rating, isSunny, isSaved }: { rating: number, isSunny: boolean, isSaved: boolean }) => {
  const percentage = ratingToPercentage(rating);
  return `
    <div class="marker-container">
      <div class="sun-rating-marker ${isSunny ? 'sunny' : ''} ${isSaved ? 'saved' : ''}">
        ${ReactDOMServer.renderToString(
          <SunIcon
            rating={percentage}
            type={isSunny ? 'sun' : 'cloudy'}
            size={20}
            showRating={true}
          />
        )}
      </div>
    </div>
  `;
};

export function MapView({ venues, userLocation, weatherData, onVenueSelect }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const userMarker = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Use saved venues hook to highlight saved locations
  const { isVenueSaved } = useSavedVenues();

  // Get sun position for determining sunshine
  const { data: sunPosition } = useSunPosition(userLocation.latitude, userLocation.longitude);

  // Determine if it's currently sunny based on weather and sun position
  const isSunnyWeatherNow = isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);
  const isSunAboveHorizon = sunPosition ? sunPosition.elevation > 0 : false;
  const isCurrentlySunny = isSunnyWeatherNow && isSunAboveHorizon;

  // Initialize map
  useEffect(() => {
    // Check if the map container exists
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
      console.error("Map container not found");
      return;
    }

    if (!mapRef.current) {
      // Create map
      try {
        console.log("Initializing map with coordinates:", userLocation.latitude, userLocation.longitude);
        const map = L.map('map-container', {
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
          // @ts-ignore - tap is a valid Leaflet option but not typed correctly
          tap: true // Enables mobile touch events
        }).setView(
          [userLocation.latitude, userLocation.longitude],
          13  // Lower zoom level to see more venues
        );

        // Add clean light tile layer
        createSunnyTileLayer().addTo(map);

        // Apply custom styling to match the clean light style
        addCustomMapStyles(map);

        mapRef.current = map;

        // Handle window resize events
        const handleResize = () => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        };

        window.addEventListener('resize', handleResize);

        // Force a resize to ensure the map renders correctly
        setTimeout(() => {
          map.invalidateSize();
          setMapReady(true);
        }, 250);

        // Return cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, [userLocation.latitude, userLocation.longitude]);

  // Update map when user location changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 13);

      // Update user marker
      if (userMarker.current) {
        userMarker.current.setLatLng([userLocation.latitude, userLocation.longitude]);
      } else {
        // Create user marker with a clean blue dot
        const userIcon = L.divIcon({
          html: `<div class="w-5 h-5 rounded-full bg-blue-600 shadow-md flex items-center justify-center border-2 border-white pulse-animation"></div>`,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        userMarker.current = L.marker(
          [userLocation.latitude, userLocation.longitude],
          { icon: userIcon }
        ).addTo(mapRef.current);

        // Add marker animations
        const style = document.createElement('style');
        style.textContent = `
          .pulse-animation {
            position: relative;
          }
          .pulse-animation::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border-radius: 50%;
            background-color: rgba(59, 130, 246, 0.4); /* blue-500 with opacity */
            z-index: -1;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 0.7;
            }
            70% {
              transform: scale(1.5);
              opacity: 0;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }

          /* Better hovering effects for map elements */
          .leaflet-marker-icon:hover {
            z-index: 1000 !important;
          }

          /* Venue marker styles */
          .sun-rating-marker {
            display: flex;
            align-items: center;
            gap: 4px;
            background-color: white;
            color: #333;
            font-size: 12px;
            font-weight: 500;
            padding: 4px 10px;
            border-radius: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            white-space: nowrap;
            border: 1px solid rgba(0,0,0,0.1);
            transition: all 0.2s ease;
            height: 24px;
            position: relative;
          }

          .sun-rating-marker.sunny {
            background: linear-gradient(to right, #f59e0b, #d97706);
            color: white;
            border: none;
          }

          .sun-rating-marker:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }

          .venue-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 4px;
          }

          .price-marker .icon {
            stroke-width: 2px;
            stroke: currentColor;
          }

          .sun-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-left: 4px;
            stroke: white;
          }

          .glow-animation {
            position: relative;
          }

          .glow-animation::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border-radius: 50%;
            background-color: rgba(245, 158, 11, 0.5); /* amber-500 with opacity */
            z-index: -1;
            animation: glow 1.5s infinite alternate;
          }

          @keyframes glow {
            0% {
              transform: scale(1);
              opacity: 0.7;
            }
            100% {
              transform: scale(1.3);
              opacity: 0;
            }
          }

          /* Marker container with price and sun rating */
          .marker-container {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          /* Sun rating styles */
          .sun-rating {
            display: flex;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 12px;
            padding: 2px 4px;
            margin-top: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: 1px solid rgba(0,0,0,0.05);
          }

          .sun-rating-icon {
            width: 10px;
            height: 10px;
            margin: 0 1px;
          }

          .sun-rating-icon.filled {
            color: #f59e0b; /* amber-500 */
            stroke: #f59e0b;
            fill: #f59e0b;
          }

          .sun-rating-icon.empty {
            color: #d1d5db; /* gray-300 */
            stroke: #d1d5db;
            fill: none;
          }

          /* Saved marker styles */
          .sun-rating-marker.saved {
            border: 2px solid #f59e0b; /* amber-500 */
            box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3), 0 2px 4px rgba(0,0,0,0.15);
          }

          .bookmark-icon {
            position: absolute;
            top: -2px;
            right: -2px;
            background-color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            border: 1px solid rgba(245, 158, 11, 0.5);
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, [userLocation]);

  // Update markers when venues change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add venue markers
    venues.forEach(venue => {
      // Check if venue is sunny based on sun position and weather
      const isSunny = venue.hasSunnySpot && isCurrentlySunny;

      // Calculate the sun rating (1-5) based on venue data
      const sunRating = getSunRating(venue);

      // Check if this venue is saved
      const isSaved = isVenueSaved(venue.id);

      // Create marker with SunIcon
      const venueIcon = L.divIcon({
        html: MarkerContent({ rating: sunRating, isSunny, isSaved }),
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      const marker = L.marker(
        [venue.latitude, venue.longitude],
        { icon: venueIcon }
      ).addTo(mapRef.current!);

      // Add click handler
      marker.on('click', () => {
        setSelectedVenue(venue);
        onVenueSelect(venue);
      });

      markers.current.push(marker);
    });
  }, [venues, onVenueSelect, mapRef, weatherData, isCurrentlySunny, isVenueSaved]);

  const handleCloseLocationDetails = () => {
    setSelectedVenue(null);
  };

  return (
    <div className="map-container-wrapper relative w-full h-full overflow-hidden">
      {/* Loading indicator while map initializes */}
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md map-loading-indicator">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-amber-500 border-t-transparent animate-spin mb-3"></div>
            <span className="text-sm sm:text-base font-medium text-amber-700">Loading sunny spots...</span>
            <span className="text-xs text-gray-500 mt-1">Finding locations near you</span>
          </div>
        </div>
      )}

      <div
        id="map-container"
        className="leaflet-container-responsive"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '300px',
          visibility: mapReady ? 'visible' : 'hidden'
        }}
      >
        {/* The map will be rendered here */}
      </div>

      {/* Weather animations */}
      <WeatherEffects weatherData={weatherData} />

      {/* Sun position indicator - responsive for different screen sizes */}
      {isCurrentlySunny && (
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-1 sm:gap-2 bg-amber-100 px-2 sm:px-3 py-1 sm:py-2 rounded-full shadow-md z-50 text-xs sm:text-sm">
          <span className="text-amber-600 font-medium hidden xs:inline">Sun is out!</span>
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500 shadow-md flex items-center justify-center glow-animation">
            <Sun className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
          </div>
        </div>
      )}

      {/* Selected location card - responsive for different screens */}
      {selectedVenue && (
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 pointer-events-none location-card-overlay z-50">
          <div className="pointer-events-auto max-w-md mx-auto">
            <SelectedLocationCard
              venue={selectedVenue}
              weatherData={weatherData}
              onClose={handleCloseLocationDetails}
            />
          </div>
        </div>
      )}

      {/* Map attribution and controls are automatically responsive through Leaflet */}
    </div>
  );
}