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
        13  // Lower zoom level to see more venues
      );
      
      // Add clean light tile layer
      createSunnyTileLayer().addTo(map);
      
      // Apply custom styling to match the clean light style
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
          
          /* Price marker styles */
          .price-marker {
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
          }
          
          .price-marker.sunny {
            background: linear-gradient(to right, #f59e0b, #d97706);
            color: white;
            border: none;
          }
          
          .price-marker:hover {
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
      // Generate a price value for display (similar to the screenshot)
      // This would be replaced with actual price data from your API
      const price = Math.floor(Math.random() * 800 + 200);
      
      // Check if venue is sunny (this would typically use your sunshine calculation)
      const isSunny = venue.hasSunnySpot && 
        isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);
      
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
      
      // Create pill-shaped price marker with venue type icon and sunshine indicator
      const venueIcon = L.divIcon({
        html: `<div class="price-marker ${isSunny ? 'sunny' : ''}">
                <span class="venue-icon">${getVenueIconHtml()}</span>
                ${price} kr SEK
                ${isSunny ? '<span class="sun-icon"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg></span>' : ''}
              </div>`,
        className: '',
        iconSize: [80, 24],
        iconAnchor: [40, 12]
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
  }, [venues, onVenueSelect, mapRef, weatherData]);

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
