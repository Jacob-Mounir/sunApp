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
      
      // Create pill-shaped price marker similar to the screenshot
      const venueIcon = L.divIcon({
        html: `<div class="price-marker">
                ${price} kr SEK
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
  }, [venues, onVenueSelect]);

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
