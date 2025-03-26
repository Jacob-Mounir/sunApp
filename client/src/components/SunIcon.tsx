import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Umbrella, Cloud } from 'lucide-react';

interface SunIconProps {
  className?: string;
  rating?: number;
  showRating?: boolean;
}

export const SunIcon: React.FC<SunIconProps> = ({ 
  className = "", 
  rating,
  showRating = false
}) => {
  const { isSunMode, ratingDescription } = useTheme();
  
  // Determine gradient based on rating and current theme
  const getGradientClass = () => {
    if (!rating) return 'from-gray-400 to-gray-500';
    
    if (isSunMode) {
      // Sun rating in light mode - higher is better
      if (rating >= 4.5) return 'from-amber-400 to-amber-600'; // Excellent
      if (rating >= 3.5) return 'from-amber-400 to-amber-500'; // Great
      if (rating >= 2.5) return 'from-amber-300 to-amber-400'; // Good
      if (rating >= 1.5) return 'from-amber-200 to-amber-300'; // Fair
      return 'from-gray-300 to-gray-400'; // Poor
    } else {
      // Shade rating in dark mode - lower is better for shade
      if (rating <= 1.5) return 'from-indigo-500 to-indigo-700'; // Excellent shade
      if (rating <= 2.5) return 'from-indigo-400 to-indigo-600'; // Great shade
      if (rating <= 3.5) return 'from-indigo-300 to-indigo-500'; // Good shade
      if (rating <= 4.5) return 'from-indigo-200 to-indigo-400'; // Fair shade
      return 'from-gray-300 to-gray-400'; // Poor shade
    }
  };

  // Get glow color based on theme
  const getGlowColor = () => {
    return isSunMode 
      ? 'rgba(251,191,36,0.3)' // Amber glow for sun mode
      : 'rgba(99,102,241,0.3)'; // Indigo glow for shade mode
  };

  // Determine whether to show glow effect
  const shouldShowGlow = () => {
    if (!rating) return false;
    
    if (isSunMode) {
      return rating >= 4; // High sun rating
    } else {
      return rating <= 2; // Low rating = good shade
    }
  };

  return (
    <div className={`inline-flex items-center group ${className}`}>
      <div className="relative">
        {isSunMode ? (
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            className={`bg-gradient-to-br ${getGradientClass()} text-white rounded-full p-0.5`}
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="5" />
            <path 
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
            />
          </svg>
        ) : (
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            className={`bg-gradient-to-br ${getGradientClass()} text-white rounded-full p-0.5`}
            fill="currentColor"
          >
            <path d="M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" /> {/* Cloud/shade icon */}
            <path 
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
            />
          </svg>
        )}
        
        {/* Subtle glow effect for high sun ratings or good shade ratings */}
        {shouldShowGlow() && (
          <div 
            className="absolute inset-0 rounded-full animate-pulse" 
            style={{
              background: `radial-gradient(circle, ${getGlowColor()} 0%, ${getGlowColor().replace('0.3', '0')} 70%)`,
              filter: 'blur(2px)',
              transform: 'scale(1.2)',
              zIndex: -1
            }}
          />
        )}
      </div>
      
      {showRating && rating !== undefined && (
        <span className={`ml-1.5 text-xs font-semibold ${isSunMode ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
          {rating.toFixed(1)}
        </span>
      )}
      
      {/* Tooltip with rating description on hover */}
      <div className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity bg-black text-white text-xs rounded p-1 mt-8 whitespace-nowrap">
        {ratingDescription}
      </div>
    </div>
  );
};