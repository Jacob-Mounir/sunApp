import { useEffect, useRef, useState } from 'react';
import { Venue, WeatherData } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { isSunnyWeather } from '@/hooks/useWeather';
import { useSunPosition } from '@/hooks/useSunCalculation';
import { Sun, MapPin } from 'lucide-react';
import { createSunnyTileLayer } from './SunnyMapStyle';
import { useSavedVenues } from '@/hooks/useSavedVenues';
import { WeatherEffects } from './WeatherEffects';
import { Button } from '@/components/ui/button';
import { SunIcon } from '@/components/SunIcon';
import ReactDOMServer from 'react-dom/server';

interface AirbnbMapViewProps {
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
  return `
    <div class="airbnb-map-pin">
      <div class="pin-container ${isSunny ? 'sunny' : ''} ${isSaved ? 'saved' : ''}">
        <div class="pin-content">
          ${rating}
          <svg class="sun-icon" viewBox="0 0 24 24" width="14" height="14">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 3V1M12 23v-2M3 12H1m22 0h-2M6 6L4.5 4.5m13.5 15l-1.5-1.5M6 18l-1.5 1.5m15-13.5L18 7.5"/>
          </svg>
        </div>
      </div>
    </div>
  `;
};

// Add styles for the new marker content
const addMarkerStyles = () => {
  if (!document.getElementById('airbnb-marker-styles')) {
    const style = document.createElement('style');
    style.id = 'airbnb-marker-styles';
    style.textContent = `
      .airbnb-map-pin {
        position: absolute;
        pointer-events: none;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pin-container {
        background-color: white;
        border-radius: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        padding: 4px 10px;
        font-size: 13px;
        font-weight: 600;
        color: #333;
        transition: all 0.2s ease;
        border: 1px solid rgba(0,0,0,0.05);
        pointer-events: all;
        cursor: pointer;
        display: flex;
        align-items: center;
        min-width: fit-content;
        height: 28px;
      }

      .pin-container:hover {
        transform: scale(1.05);
        box-shadow: 0 3px 6px rgba(0,0,0,0.15);
      }

      .pin-container.sunny {
        background: #f59e0b;
        color: white;
        border: none;
      }

      .pin-content {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .sun-icon {
        stroke: currentColor;
        stroke-width: 1.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: currentColor;
      }

      .pin-container.saved::after {
        content: '';
        position: absolute;
        top: -2px;
        right: -2px;
        width: 6px;
        height: 6px;
        background-color: #f59e0b;
        border-radius: 50%;
        border: 1px solid white;
      }
    `;
    document.head.appendChild(style);
  }
};

export function AirbnbMapView({ venues, userLocation, weatherData, onVenueSelect }: AirbnbMapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const userMarker = useRef<L.Marker | null>(null);
  const popovers = useRef<HTMLElement[]>([]);

  // Use saved venues hook to highlight saved locations
  const { isVenueSaved } = useSavedVenues();

  // Get sun position for determining sunshine
  const { data: sunPosition } = useSunPosition(userLocation.latitude, userLocation.longitude);

  // Determine if it's currently sunny based on weather and sun position
  const isSunnyWeatherNow = isSunnyWeather(weatherData?.weatherCondition, weatherData?.icon);
  const isSunAboveHorizon = sunPosition ? sunPosition.elevation > 0 : false;
  const isCurrentlySunny = isSunnyWeatherNow && isSunAboveHorizon;

  // Close the venue details
  const handleCloseDetails = () => {
    setSelectedVenue(null);

    // Reset all pin styles to non-selected
    document.querySelectorAll('.pin-container').forEach(el => {
      el.classList.remove('selected');
    });

    // Hide all popovers
    popovers.current.forEach(popover => {
      popover.classList.remove('visible');
    });
  };

  // Initialize map
  useEffect(() => {
    // Check if the map container exists
    const mapContainer = document.getElementById('airbnb-map-container');
    if (!mapContainer) {
      console.error("Map container not found");
      return;
    }

    if (!mapRef.current) {
      // Create map
      try {
        console.log("Initializing map with coordinates:", userLocation.latitude, userLocation.longitude);
        const map = L.map('airbnb-map-container', {
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
          // @ts-ignore - tap is a valid Leaflet option but not typed correctly
          tap: true // Enables mobile touch events
        }).setView(
          [userLocation.latitude, userLocation.longitude],
          14  // Medium zoom level to see venues clearly
        );

        // Add clean light tile layer
        createSunnyTileLayer().addTo(map);

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
        }, 250);

        // Add global click handler to map to close details
        map.on('click', () => {
          handleCloseDetails();
        });

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
        popovers.current = [];
      }
    };
  }, [userLocation.latitude, userLocation.longitude]);

  // Update user location marker
  useEffect(() => {
    if (mapRef.current) {
      // Update user marker
      if (userMarker.current) {
        userMarker.current.setLatLng([userLocation.latitude, userLocation.longitude]);
      } else {
        // Create user marker with a clean blue dot with pulse effect
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

        // Add marker animation styles
        if (!document.getElementById('airbnb-marker-styles')) {
          const style = document.createElement('style');
          style.id = 'airbnb-marker-styles';
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

            /* Map pin styles */
            .airbnb-map-pin {
              position: absolute;
              pointer-events: none;
              transform: translate(-50%, -50%);
              width: 80px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .pin-container {
              background-color: white;
              border-radius: 24px;
              box-shadow: 0 3px 8px rgba(0,0,0,0.15);
              padding: 6px 14px;
              font-size: 14px;
              font-weight: 600;
              color: #333;
              transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              transform: scale(1);
              border: 1.5px solid rgba(0,0,0,0.05);
              pointer-events: all;
              cursor: pointer;
              display: flex;
              align-items: center;
              min-width: 64px;
              justify-content: center;
              height: 32px;
              position: relative;
            }

            .pin-container:hover {
              transform: scale(1.05) translateY(-2px);
              box-shadow: 0 6px 12px rgba(0,0,0,0.2);
            }

            .pin-container.sunny {
              background: linear-gradient(135deg, #f59e0b, #d97706);
              color: white;
              border: none;
              box-shadow: 0 4px 10px rgba(217, 119, 6, 0.3);
            }

            .pin-container.sunny:hover {
              box-shadow: 0 6px 14px rgba(217, 119, 6, 0.4);
            }

            .pin-container.selected {
              transform: scale(1.15) translateY(-5px);
              z-index: 1000 !important;
              box-shadow: 0 8px 20px rgba(0,0,0,0.25);
            }

            .pin-content {
              display: flex;
              align-items: center;
              gap: 6px;
            }

            .pin-content.saved {
              position: relative;
            }

            .pin-content.saved:after {
              content: '';
              position: absolute;
              top: -6px;
              right: -8px;
              width: 10px;
              height: 10px;
              background-color: #f59e0b;
              border-radius: 50%;
              border: 2px solid white;
            }

            .pin-icon {
              display: flex;
              align-items: center;
            }

            .pin-rating {
              font-weight: 600;
            }

            .pin-sun-icon {
              font-size: 12px;
            }

            /* Popover styles */
            .map-popover {
              position: absolute;
              bottom: 16px;
              left: 50%;
              transform: translateX(-50%) translateY(10px);
              background: white;
              border-radius: 16px;
              box-shadow: 0 8px 30px rgba(0,0,0,0.15);
              overflow: hidden;
              width: 300px;
              z-index: 1001;
              pointer-events: all;
              opacity: 0;
              visibility: hidden;
              transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
              border: 1px solid rgba(0,0,0,0.05);
            }

            .map-popover.visible {
              opacity: 1;
              visibility: visible;
              transform: translateX(-50%) translateY(0);
            }

            .map-popover-image {
              width: 100%;
              height: 150px;
              background-color: #f5f5f5;
              background-size: cover;
              background-position: center;
              position: relative;
            }

            .map-popover-image::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 50px;
              background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
            }

            .map-popover-content {
              padding: 16px;
            }

            .map-popover-title {
              margin: 0 0 6px 0;
              font-size: 18px;
              font-weight: 600;
              color: #1a1a1a;
              position: relative;
            }

            .map-popover-title::after {
              content: '';
              position: absolute;
              bottom: -3px;
              left: 0;
              width: 40px;
              height: 2px;
              background: linear-gradient(to right, #f59e0b, transparent);
            }

            .map-popover-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              padding-top: 4px;
            }

            .map-popover-type {
              color: #666;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .map-popover-distance {
              color: #666;
              font-size: 14px;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .map-popover-sunny {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 14px;
              color: #f59e0b;
              margin-bottom: 12px;
              font-weight: 500;
              padding: 6px 10px;
              background-color: rgba(245, 158, 11, 0.1);
              border-radius: 8px;
              max-width: fit-content;
            }

            .map-popover-buttons {
              display: flex;
              gap: 10px;
              margin-top: 12px;
            }

            .map-popover-buttons button {
              transition: transform 0.2s ease, box-shadow 0.2s ease;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              font-weight: 500;
            }

            .map-popover-buttons button:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }

            /* Better z-index for hover */
            .leaflet-marker-icon:hover {
              z-index: 1000 !important;
            }
          `;
          document.head.appendChild(style);
        }
      }
    }
  }, [userLocation]);

  // Update venue markers when data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Clear existing popovers
    popovers.current.forEach(popover => {
      if (popover.parentNode) {
        popover.parentNode.removeChild(popover);
      }
    });
    popovers.current = [];

    // Add venue markers
    venues.forEach(venue => {
      // Force all venues to be sunny for now
      const isSunny = true;

      // Calculate the sun rating (1-5) based on venue data
      const sunRating = getSunRating(venue);

      // Check if this venue is saved
      const isSaved = isVenueSaved(venue.id);

      // Create marker with icon
      const venueIcon = L.divIcon({
        html: MarkerContent({ rating: sunRating, isSunny, isSaved }),
        className: '',
        iconSize: [60, 32],
        iconAnchor: [30, 16]
      });

      // Create marker and add to map
      const marker = L.marker(
        [venue.latitude, venue.longitude],
        { icon: venueIcon }
      ).addTo(mapRef.current!);

      // Create popover element for this marker
      const popoverElement = document.createElement('div');
      popoverElement.className = 'map-popover';
      popoverElement.innerHTML = `
        <div class="map-popover-image" style="background-image: url(${venue.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2YzZjRmNiIvPjxwYXRoIGQ9Ik0xNDAgNzBhMTAgMTAgMCAxIDEtMjAgMCAxMCAxMCAwIDAgMSAyMCAweiIgZmlsbD0iI2Q5ZGFkZCIvPjwvc3ZnPg=='})"></div>
        <div class="map-popover-content">
          <h3 class="map-popover-title">${venue.name}</h3>
          <div class="map-popover-info">
            <span class="map-popover-type">${venue.venueType}</span>
            <span class="map-popover-distance">${venue.distance ? `${(venue.distance / 1000).toFixed(1)} km away` : 'Distance unavailable'}</span>
          </div>
          ${venue.sunHoursStart && venue.sunHoursEnd ? `
            <div class="map-popover-sunny">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#f59e0b" stroke="#f59e0b" stroke-width="0.5">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              Sunny ${venue.sunHoursStart} - ${venue.sunHoursEnd}
            </div>
          ` : ''}
          <div class="map-popover-buttons">
            <button class="details-btn bg-amber-500 hover:bg-amber-600 text-white py-1 px-3 rounded-full text-sm font-medium">View details</button>
            <button class="directions-btn bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-full text-sm font-medium">Directions</button>
          </div>
        </div>
      `;

      // Add popover to the map's parent element
      marker.getElement()?.parentNode?.appendChild(popoverElement);
      popovers.current.push(popoverElement);

      // Add click event to marker
      marker.on('click', (e) => {
        // Find all popovers and hide them
        popovers.current.forEach(popover => {
          popover.classList.remove('visible');
        });

        // Make this popover visible
        popoverElement.classList.add('visible');

        // Highlight this pin
        document.querySelectorAll('.pin-container').forEach(el => {
          el.classList.remove('selected');
        });
        marker.getElement()?.querySelector('.pin-container')?.classList.add('selected');

        // Set selected venue in state to display more information
        setSelectedVenue(venue);

        // Stop event propagation to prevent map click from closing popover
        L.DomEvent.stopPropagation(e);
      });

      // Add click handlers to buttons in the popover
      const detailsBtn = popoverElement.querySelector('.details-btn');
      detailsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Details button clicked for venue in popover:', venue.name, venue.id);

        // Set the marker as selected
        setSelectedVenue(venue);

        // Navigate to venue details
        // Use setTimeout to ensure the event completes before navigation
        setTimeout(() => {
          onVenueSelect(venue);
        }, 10);
      });

      const directionsBtn = popoverElement.querySelector('.directions-btn');
      directionsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        // Open in Google Maps
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`, '_blank');
      });

      // Add mouse events for animation
      marker.getElement()?.addEventListener('mouseenter', () => {
        marker.getElement()?.querySelector('.pin-container')?.classList.add('selected');
      });

      marker.getElement()?.addEventListener('mouseleave', () => {
        if (selectedVenue?.id !== venue.id) {
          marker.getElement()?.querySelector('.pin-container')?.classList.remove('selected');
        }
      });

      // Add marker to tracking array
      markers.current.push(marker);
    });
  }, [venues, isCurrentlySunny, onVenueSelect, isVenueSaved, selectedVenue]);

  // Add marker styles when component mounts
  useEffect(() => {
    addMarkerStyles();
  }, []);

  return (
    <div className="relative w-full h-full bg-white">
      <div id="airbnb-map-container" className="w-full h-full" />

      {/* Weather effect overlay */}
      <WeatherEffects weatherData={weatherData} className="absolute inset-0 pointer-events-none" />

      {/* Map toolbar */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full shadow-md bg-white p-2 h-10 w-10"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.setView([userLocation.latitude, userLocation.longitude], 14);
            }
          }}
        >
          <MapPin className="h-5 w-5 text-blue-600" />
        </Button>
      </div>

      {/* Information card for smaller screens when no pin is selected */}
      {!selectedVenue && venues.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white shadow-lg rounded-xl p-3 w-64 text-center md:hidden">
          <p className="text-sm font-medium">
            {venues.length} venues found
          </p>
          <p className="text-xs text-gray-500">
            Tap a pin to see details
          </p>
        </div>
      )}

      {/* Selected location info - shown on mobile only when we have a venue selected */}
      {selectedVenue && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white shadow-lg rounded-xl overflow-hidden w-[90%] max-w-md md:hidden">
          <div
            className="h-28 bg-cover bg-center"
            style={{backgroundImage: `url(${selectedVenue.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2YzZjRmNiIvPjxwYXRoIGQ9Ik0xNDAgNzBhMTAgMTAgMCAxIDEtMjAgMCAxMCAxMCAwIDAgMSAyMCAweiIgZmlsbD0iI2Q5ZGFkZCIvPjwvc3ZnPg=='})`}}
          />
          <div className="p-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{selectedVenue.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedVenue.venueType} · {selectedVenue.distance ? `${(selectedVenue.distance / 1000).toFixed(1)} km away` : 'Distance unavailable'}
                </p>
                {selectedVenue.sunHoursStart && selectedVenue.sunHoursEnd && (
                  <p className="text-sm text-amber-600 font-medium mt-1 flex items-center">
                    <Sun className="h-4 w-4 mr-1" />
                    Sunny {selectedVenue.sunHoursStart} - {selectedVenue.sunHoursEnd}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-full"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  console.log('Mobile details button clicked for venue:', selectedVenue.name);
                  // Use setTimeout to ensure the event completes before navigation
                  setTimeout(() => {
                    onVenueSelect(selectedVenue);
                  }, 10);
                }}
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}