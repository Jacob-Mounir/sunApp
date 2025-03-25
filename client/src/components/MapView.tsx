import { useEffect, useRef, useState } from 'react';
import { Venue, WeatherData } from '@/types';
import { SelectedLocationCard } from './SelectedLocationCard';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { isSunnyWeather } from '@/hooks/useWeather';
import { useSunPosition } from '@/hooks/useSunCalculation';
import { Sun } from 'lucide-react';
import { addCustomMapStyles, createSunnyTileLayer } from './SunnyMapStyle';
import { useSavedVenues } from '@/hooks/useSavedVenues';

interface MapViewProps {
  venues: Venue[];
  userLocation: { latitude: number; longitude: number };
  weatherData?: WeatherData;
  onVenueSelect: (venue: Venue) => void;
}

export function MapView({ venues, userLocation, weatherData, onVenueSelect }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const userMarker = useRef<L.Marker | null>(null);
  
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
          attributionControl: true
        }).setView(
          [userLocation.latitude, userLocation.longitude], 
          13  // Lower zoom level to see more venues
        );
        
        // Add clean light tile layer
        createSunnyTileLayer().addTo(map);
        
        // Apply custom styling to match the clean light style
        addCustomMapStyles(map);
        
        mapRef.current = map;
        
        // Force a resize to ensure the map renders correctly
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
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
      const getSunRating = (): number => {
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
      
      const sunRating = getSunRating();
      
      // Get the appropriate icon for venue type
      const getVenueIconHtml = () => {
        let iconHtml = '';
        switch (venue.venueType) {
          case 'restaurant':
            iconHtml = `<svg class="icon" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none">
              <path d="M3 11L22 11"></path>
              <path d="M18 17L21 17"></path>
              <path d="M21 11L21 19C21 20 20 21 19 21L5 21C4 21 3 20 3 19L3 11"></path>
              <path d="M12.01 7.88888L12 4"></path>
              <path d="M8.01 7.88888L8 4"></path>
              <path d="M16.01 7.88888L16 4"></path>
            </svg>`;
            break;
          case 'cafe':
            iconHtml = `<svg class="icon" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"></path>
              <line x1="6" y1="2" x2="6" y2="4"></line>
              <line x1="10" y1="2" x2="10" y2="4"></line>
              <line x1="14" y1="2" x2="14" y2="4"></line>
            </svg>`;
            break;
          case 'bar':
            iconHtml = `<svg class="icon" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"></path>
            </svg>`;
            break;
          case 'park':
            iconHtml = `<svg class="icon" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none">
              <path d="M7 21L7 9"></path>
              <path d="M20 12L20 18"></path>
              <path d="M12 12C12 12 8 18 4 18"></path>
              <path d="M12 12C12 12 16 18 20 18"></path>
              <path d="M12 3L12 12"></path>
            </svg>`;
            break;
          default:
            iconHtml = `<svg class="icon" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>`;
        }
        return iconHtml;
      };
      
      // Function to generate the sun rating HTML (1-5 suns)
      const getSunRatingHtml = () => {
        const sunIcon = `<svg class="sun-rating-icon" viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>`;
        
        // Generate filled and empty sun icons based on rating
        let ratingHtml = '<div class="sun-rating">';
        for (let i = 1; i <= 5; i++) {
          if (i <= sunRating) {
            ratingHtml += `<span class="sun-rating-icon filled">${sunIcon}</span>`;
          } else {
            ratingHtml += `<span class="sun-rating-icon empty">${sunIcon}</span>`;
          }
        }
        ratingHtml += '</div>';
        
        return ratingHtml;
      };
      
      // Format sun rating to one decimal place
      const formattedRating = sunRating.toFixed(1);
      
      // Check if this venue is saved
      const isSaved = isVenueSaved(venue.id);
      
      // Create bookmark icon HTML for saved venues
      const bookmarkIconHtml = isSaved ? 
        `<span class="bookmark-icon"><svg viewBox="0 0 24 24" width="12" height="12" stroke="#ff8c00" fill="#ff8c00" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg></span>` : '';
      
      // Create simplified marker based on screenshot design
      const venueIcon = L.divIcon({
        html: `<div class="marker-container">
                <div class="sun-rating-marker-new">
                  <div class="sun-icon-container"></div>
                  <span class="rating-value">${formattedRating}</span>
                </div>
              </div>`,
        className: '',
        iconSize: [60, 26],
        iconAnchor: [30, 13]
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
    <div className="map-container-wrapper">
      <div id="map-container" style={{ width: '100%', height: '100%' }}>
        {/* The map will be rendered here */}
      </div>
      
      {/* Sun position indicator */}
      {isCurrentlySunny && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-amber-100 px-3 py-2 rounded-full shadow-md z-50">
          <span className="text-amber-600 font-medium text-sm">Sun is out!</span>
          <div className="w-5 h-5 rounded-full bg-amber-500 shadow-md flex items-center justify-center glow-animation">
            <Sun className="h-3 w-3 text-white" />
          </div>
        </div>
      )}
      
      {/* Selected location card */}
      {selectedVenue && (
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none location-card-overlay z-50">
          <div className="pointer-events-auto">
            <SelectedLocationCard
              venue={selectedVenue}
              weatherData={weatherData}
              onClose={handleCloseLocationDetails}
            />
          </div>
        </div>
      )}
    </div>
  );
}