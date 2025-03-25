import { useEffect, useState } from 'react';
import { WeatherData } from '@/types';

interface WeatherEffectsProps {
  weatherData?: WeatherData;
  className?: string;
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({ 
  weatherData,
  className = "",
}) => {
  const [weatherCondition, setWeatherCondition] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    if (weatherData?.weatherCondition) {
      // When weather condition changes, transition between effects
      if (weatherCondition !== weatherData.weatherCondition) {
        setIsTransitioning(true);
        
        // After transition out completes, update the weather condition
        const timer = setTimeout(() => {
          setWeatherCondition(weatherData.weatherCondition || '');
          setIsTransitioning(false);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [weatherData, weatherCondition]);
  
  // No weather data or clear conditions, don't render effects
  if (!weatherData || !weatherCondition || weatherCondition === 'Clear') {
    return null;
  }
  
  // Generate rain drops
  const renderRainDrops = () => {
    const drops = [];
    // Reduce drop count on smaller screens for better performance
    const isMobile = window.innerWidth < 640;
    const dropCount = isMobile ? 60 : 100;
    
    for (let i = 0; i < dropCount; i++) {
      const left = `${Math.random() * 100}%`;
      const animationDuration = `${0.5 + Math.random() * 0.5}s`;
      const animationDelay = `${Math.random() * 0.5}s`;
      
      drops.push(
        <div 
          key={`rain-drop-${i}`}
          className="rain-drop"
          style={{
            left,
            animationDuration,
            animationDelay,
          }}
        />
      );
    }
    
    return drops;
  };
  
  // Generate snow flakes
  const renderSnowFlakes = () => {
    const flakes = [];
    // Reduce flake count on mobile for better performance
    const isMobile = window.innerWidth < 640;
    const flakeCount = isMobile ? 40 : 60;
    
    for (let i = 0; i < flakeCount; i++) {
      const left = `${Math.random() * 100}%`;
      const size = `${3 + Math.random() * 3}px`;
      const animationDuration = `${4 + Math.random() * 6}s`;
      const animationDelay = `${Math.random() * 3}s`;
      
      flakes.push(
        <div 
          key={`snow-flake-${i}`}
          className="snow-flake"
          style={{
            left,
            width: size,
            height: size,
            animationDuration,
            animationDelay,
          }}
        />
      );
    }
    
    return flakes;
  };
  
  // Generate clouds
  const renderClouds = () => {
    const clouds = [];
    // Mobile optimization - reduce number of clouds on small screens
    const isMobile = window.innerWidth < 640;
    const cloudCount = isMobile ? 3 : 5;
    
    for (let i = 0; i < cloudCount; i++) {
      const top = `${10 + Math.random() * 30}%`;
      const left = `${Math.random() * 100}%`;
      const width = `${80 + Math.random() * 100}px`;
      const height = `${30 + Math.random() * 30}px`;
      // Slightly speed up animation on mobile for better performance
      const animationDuration = `${isMobile ? 12 : 15 + Math.random() * 10}s`;
      const animationDelay = `${Math.random() * 5}s`;
      const opacity = 0.4 + Math.random() * 0.3;
      
      clouds.push(
        <div 
          key={`cloud-${i}`}
          className="cloud"
          style={{
            top,
            left,
            width,
            height,
            animationDuration,
            animationDelay,
            opacity,
          }}
        />
      );
    }
    
    return clouds;
  };
  
  // Generate fog patches
  const renderFog = () => {
    const patches = [];
    const patchCount = 3;
    
    for (let i = 0; i < patchCount; i++) {
      const top = `${30 * i}%`;
      const animationDuration = `${20 + Math.random() * 10}s`;
      const animationDelay = `${Math.random() * 10}s`;
      const opacity = 0.3 - (i * 0.05);
      
      patches.push(
        <div 
          key={`fog-patch-${i}`}
          className="fog-patch"
          style={{
            top,
            animationDuration,
            animationDelay,
            opacity,
          }}
        />
      );
    }
    
    return patches;
  };
  
  // Generate lightning
  const renderLightning = () => {
    const bolts = [];
    const boltCount = 3;
    
    for (let i = 0; i < boltCount; i++) {
      const left = `${20 + Math.random() * 60}%`;
      const animationDelay = `${i * 2 + Math.random() * 2}s`;
      const width = `${1 + Math.random() * 2}px`;
      
      bolts.push(
        <div 
          key={`lightning-${i}`}
          className="lightning"
          style={{
            left,
            width,
            animationDelay,
          }}
        />
      );
    }
    
    return bolts;
  };

  // Render appropriate weather effect based on condition
  const renderWeatherEffect = () => {
    switch (weatherCondition.toLowerCase()) {
      case 'rain':
      case 'drizzle':
      case 'shower rain':
        return (
          <div className="rain-drops">
            {renderRainDrops()}
          </div>
        );
        
      case 'snow':
        return (
          <div className="snow-flakes">
            {renderSnowFlakes()}
          </div>
        );
        
      case 'clouds':
      case 'scattered clouds':
      case 'broken clouds':
      case 'few clouds':
        return (
          <div className="cloud-layer">
            <div className="cloud-group">
              {renderClouds()}
            </div>
          </div>
        );
        
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'fog':
        return (
          <div className="fog-layer">
            {renderFog()}
          </div>
        );
        
      case 'thunderstorm':
        return (
          <div className="thunder-effect">
            <div className="cloud-layer dark">
              <div className="cloud-group">
                {renderClouds()}
              </div>
            </div>
            <div className="rain-drops">
              {renderRainDrops()}
            </div>
            {renderLightning()}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`weather-effect-container ${isTransitioning ? 'transitioning' : ''} ${className}`}
    >
      {renderWeatherEffect()}
    </div>
  );
};