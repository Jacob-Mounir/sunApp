import L from 'leaflet';

/**
 * Implements a custom map style inspired by the provided Google Maps JSON style:
 * Main colors:
 * - Base: #ff7000 (orange) with high lightness (69%)
 * - Geometry: #cb8536 (amber/brown)
 * - Labels: #ffb471 (light orange) with high lightness (66%)
 * - Water: #ecc080 (sandy/amber color)
 */

// Custom style options for different map providers
export const SUNNY_MAP_STYLE = {
  // Custom map style with warm orange/amber theme
  // Inspired by the provided Google Maps style
  openStreetMap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  openStreetMapHot: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  cartoVoyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }
};

// Create a Leaflet control to apply our custom styles based on the provided Google Maps style
export function addCustomMapStyles(map: L.Map) {
  // Add styles that match the provided orange/amber theme from the Google Maps style array
  const mapContainer = map.getContainer();
  
  // Remove any existing filter
  mapContainer.style.filter = '';
  
  // Base filter to match the overall orange/amber tone (#ff7000 with lightness 69%)
  // These values are carefully calibrated to match the provided Google Maps style
  mapContainer.style.filter = 'sepia(40%) hue-rotate(355deg) saturate(180%) brightness(105%) contrast(95%)';
  
  // Add additional styling to match specific elements from the Google Maps style
  const style = document.createElement('style');
  style.textContent = `
    /* Base map styles */
    .leaflet-tile-pane {
      opacity: 0.92;
    }
    
    /* Custom water styling to match #ecc080 */
    .leaflet-container {
      background: #ecc080;
    }
    
    /* Enhance text contrast */
    .leaflet-container .leaflet-overlay-pane svg path {
      stroke-width: 2px;
      stroke-opacity: 0.8;
    }
    
    /* Add subtle shadows to elements */
    .leaflet-marker-icon {
      filter: drop-shadow(0 0 4px rgba(203, 133, 54, 0.6)); /* #cb8536 with opacity */
    }
    
    /* Custom zoom controls styling */
    .leaflet-control-zoom {
      border-color: #cb8536 !important;
    }
    
    .leaflet-control-zoom a {
      color: #cb8536 !important;
      background-color: rgba(255, 251, 245, 0.9) !important;
    }
    
    .leaflet-control-zoom a:hover {
      background-color: rgba(255, 240, 220, 0.95) !important;
    }
    
    /* Make map attribution amber-themed */
    .leaflet-control-attribution {
      background-color: rgba(255, 240, 218, 0.8) !important;
      color: #cb8536 !important;
    }
    
    .leaflet-control-attribution a {
      color: #b16c1f !important;
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

// Custom TileLayer with our sun-themed styling
export class SunnyTileLayer extends L.TileLayer {
  constructor(urlTemplate: string, options?: L.TileLayerOptions) {
    super(urlTemplate, options);
  }

  // Add custom styling when layer is added to map
  onAdd(map: L.Map): SunnyTileLayer {
    // Apply our base layer
    super.onAdd(map);
    
    // Add our custom styling
    const container = map.getContainer();
    container.classList.add('sunny-map');
    
    return this;
  }

  // Clean up when layer is removed
  onRemove(map: L.Map): SunnyTileLayer {
    // Remove our styling
    const container = map.getContainer();
    container.classList.remove('sunny-map');
    
    // Remove the base layer
    super.onRemove(map);
    
    return this;
  }
}

// Create and return a styled tile layer
export function createSunnyTileLayer(): L.TileLayer {
  // Use OpenStreetMap as base with our custom styling
  return new SunnyTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
}