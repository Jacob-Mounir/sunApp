import { useEffect, useRef, useState } from 'react';
import { MapPin, Venue, WeatherData } from '@/types';
import { SelectedLocationCard } from './SelectedLocationCard';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { isSunnyWeather } from '@/hooks/useWeather';
import { UserIcon, Utensils, Coffee, Beer, TreePine, Sun } from 'lucide-react';
import { addCustomMapStyles, createSunnyTileLayer } from './SunnyMapStyle';

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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      // Create map
      const map = L.map('map-container').setView(
        [userLocation.latitude, userLocation.longitude], 
        15
      );
      
      // Add our custom sunny-themed tile layer
      createSunnyTileLayer().addTo(map);
      
      // Apply custom styling to match the provided style array
      addCustomMapStyles(map);
      
      mapRef.current = map;
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map when user location changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 15);
      
      // Update user marker
      if (userMarker.current) {
        userMarker.current.setLatLng([userLocation.latitude, userLocation.longitude]);
      } else {
        // Create user marker with orange/amber styling to match our theme
        const userIcon = L.divIcon({
          html: `<div class="w-6 h-6 rounded-full bg-amber-500 shadow-md flex items-center justify-center border-2 border-white pulse-animation">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        userMarker.current = L.marker(
          [userLocation.latitude, userLocation.longitude],
          { icon: userIcon }
        ).addTo(mapRef.current);
        
        // Add pulse animation style with amber/orange colors
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
            background-color: rgba(245, 158, 11, 0.4); /* amber-500 with opacity */
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
          
          /* Add glow effect for sunny markers */
          .glow-effect {
            box-shadow: 0 0 8px 2px rgba(245, 158, 11, 0.6);
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
    
    // Determine if a venue is currently sunny
    const isSunny = isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);
    
    // Add venue markers
    venues.forEach(venue => {
      // Determine icon based on venue type
      let iconHtml = '';
      
      switch (venue.venueType) {
        case 'restaurant':
          iconHtml = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 22h18"></path>
                        <path d="M6 18h12a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3Z"></path>
                        <path d="M3 10h18"></path>
                      </svg>`;
          break;
        case 'cafe':
          iconHtml = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
                        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
                        <line x1="6" y1="2" x2="6" y2="4"></line>
                        <line x1="10" y1="2" x2="10" y2="4"></line>
                        <line x1="14" y1="2" x2="14" y2="4"></line>
                      </svg>`;
          break;
        case 'bar':
          iconHtml = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 2v1h4v-1M1 4h22M10 14v-4M19 14V8l-5 2c-2 1-5 1-7 0-2-1-4-2-4-3 0 0 0 2 5 5V7l5 2c2 1 5 1 7 0M8 22l4-2 4 2"></path>
                      </svg>`;
          break;
        case 'park':
          iconHtml = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 14l3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h10z"></path>
                        <path d="M12 2v12"></path>
                        <path d="M9.17 4.55 12 2l2.83 2.55"></path>
                        <path d="M9.17 7.55 12 5l2.83 2.55"></path>
                        <path d="M9.17 10.55 12 8l2.83 2.55"></path>
                      </svg>`;
          break;
        default:
          iconHtml = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>`;
      }
      
      // Get sunshine indicator - using more vibrant orange/amber colors to match our theme
      const sunshineIndicator = venue.hasSunnySpot && isSunny 
        ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-white glow-effect"></div>'
        : '<div class="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full border border-white"></div>';
      
      // Create custom icon with orange/amber styling to match our map style
      const venueIcon = L.divIcon({
        html: `<div class="relative">
                <div class="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-amber-500 cursor-pointer text-amber-600">
                  ${iconHtml}
                </div>
                ${sunshineIndicator}
              </div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      // Create marker
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
  }, [venues, weatherData, onVenueSelect]);

  const handleCloseLocationDetails = () => {
    setSelectedVenue(null);
  };

  return (
    <div className="absolute inset-0 bg-gray-100" id="map-container">
      {/* The map will be rendered here */}
      
      {/* Selected location card */}
      {selectedVenue && (
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <SelectedLocationCard
            venue={selectedVenue}
            weatherData={weatherData}
            onClose={handleCloseLocationDetails}
          />
        </div>
      )}
    </div>
  );
}
