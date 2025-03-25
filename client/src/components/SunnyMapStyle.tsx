import L from 'leaflet';

/**
 * Implements a clean, light map style similar to the provided screenshot
 * with pill-shaped price markers
 */

// Custom style options for different map providers
export const SUNNY_MAP_STYLE = {
  // Clean, light map style
  cartoDB: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  // Alternative light styles
  stamenToner: {
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>',
    subdomains: 'abcd',
    maxZoom: 20
  },
  googleStreets: {
    url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20
  }
};

// Create a Leaflet control to apply our custom styles
export function addCustomMapStyles(map: L.Map) {
  // Add styles that match the clean, light style in the screenshot
  const mapContainer = map.getContainer();
  
  // Remove any existing filter
  mapContainer.style.filter = '';
  
  // Subtle adjustments to match the clean, light style
  mapContainer.style.filter = 'saturate(90%) brightness(105%) contrast(95%)';
  
  // Add additional styling
  const style = document.createElement('style');
  style.textContent = `
    /* Base map styles */
    .leaflet-tile-pane {
      opacity: 1;
    }
    
    /* Custom background */
    .leaflet-container {
      background: #f8f9fa;
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
    
    /* Custom pill markers */
    .price-marker {
      background-color: white;
      border-radius: 16px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 500;
      color: #333;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      transition: transform 0.2s ease;
    }
    
    .price-marker:hover {
      transform: scale(1.05);
      z-index: 1000;
    }
    
    /* Custom zoom controls styling */
    .leaflet-control-zoom {
      border: none !important;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1) !important;
    }
    
    .leaflet-control-zoom a {
      color: #333 !important;
      background-color: white !important;
      border-radius: 4px !important;
    }
    
    .leaflet-control-zoom a:hover {
      background-color: #f5f5f5 !important;
    }
    
    /* Make map attribution clean */
    .leaflet-control-attribution {
      background-color: rgba(255, 255, 255, 0.7) !important;
      color: #666 !important;
      font-size: 10px !important;
    }
    
    .leaflet-control-attribution a {
      color: #333 !important;
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
  // Use CartoDB light base map for a clean, minimal look
  const tileLayer = L.tileLayer(SUNNY_MAP_STYLE.cartoDB.url, {
    maxZoom: SUNNY_MAP_STYLE.cartoDB.maxZoom,
    attribution: SUNNY_MAP_STYLE.cartoDB.attribution,
    subdomains: SUNNY_MAP_STYLE.cartoDB.subdomains as string
  });
  
  return tileLayer;
}