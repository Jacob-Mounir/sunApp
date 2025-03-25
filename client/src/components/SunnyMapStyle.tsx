import L from 'leaflet';

/**
 * Implements a clean, light map style similar to the provided screenshot
 * with pill-shaped price markers
 */

// Custom style options for different map providers
export const SUNNY_MAP_STYLE = {
  // Airbnb-style map with soft green and light colors
  airbnbStyle: {
    // MapBox style that most closely resembles Airbnb map style
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  // Backup/alternative map styles
  cartoDB: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  openStreetMap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19
  }
};

// Create a Leaflet control to apply our custom styles
export function addCustomMapStyles(map: L.Map) {
  // Add styles to match the Airbnb-style map
  const mapContainer = map.getContainer();
  
  // Remove any existing filter
  mapContainer.style.filter = '';
  
  // Subtle adjustments to match the Airbnb map style
  // - Slightly increase saturation for greener parks
  // - Maintain brightness for clean look
  mapContainer.style.filter = 'saturate(102%) brightness(102%) contrast(95%)';
  
  // Add additional styling
  const style = document.createElement('style');
  style.textContent = `
    /* Base map styles */
    .leaflet-tile-pane {
      opacity: 1;
    }
    
    /* Custom background */
    .leaflet-container {
      background: #e8f4f8; /* Light blue-ish background matching Airbnb */
    }
    
    /* Enhance text visibility */
    .leaflet-container .leaflet-overlay-pane svg path {
      stroke-width: 1px;
      stroke-opacity: 0.7;
    }
    
    /* Add subtle shadows to markers */
    .leaflet-marker-icon {
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
    }
    
    /* Clear marker styles for Airbnb-like look */
    .sun-rating-marker-new {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      background-color: white;
      color: #333;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
      white-space: nowrap;
      transition: all 0.2s ease;
      height: 26px;
    }
    
    .sun-icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ff9900;
    }
    
    .rating-value {
      margin-left: 2px;
    }
    
    /* Hover effect */
    .sun-rating-marker-new:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
    }
    
    /* Custom zoom controls styling */
    .leaflet-control-zoom {
      border: none !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05) !important;
    }
    
    .leaflet-control-zoom a {
      color: #333 !important;
      background-color: white !important;
      border-radius: 8px !important;
    }
    
    .leaflet-control-zoom a:hover {
      background-color: #f5f5f5 !important;
    }
    
    /* Make map attribution clean and minimal */
    .leaflet-control-attribution {
      background-color: rgba(255, 255, 255, 0.7) !important;
      color: #888 !important;
      font-size: 9px !important;
      padding: 2px 5px !important;
      border-radius: 4px !important;
    }
    
    .leaflet-control-attribution a {
      color: #555 !important;
    }
  `;
  document.head.appendChild(style);
  
  return {
    // Function to clean up styles if needed
    removeCustomStyles: () => {
      mapContainer.style.filter = '';
      document.head.removeChild(style);
    }
  };
}

// Create and return a styled tile layer
export function createSunnyTileLayer(): L.TileLayer {
  // Use Airbnb-style map with soft green parks and light urban areas
  const tileLayer = L.tileLayer(SUNNY_MAP_STYLE.airbnbStyle.url, {
    maxZoom: SUNNY_MAP_STYLE.airbnbStyle.maxZoom,
    attribution: SUNNY_MAP_STYLE.airbnbStyle.attribution,
    subdomains: SUNNY_MAP_STYLE.airbnbStyle.subdomains as string
  });
  
  return tileLayer;
}