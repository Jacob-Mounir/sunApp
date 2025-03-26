import React from 'react';

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
  // Determine gradient based on rating
  const getGradientClass = () => {
    if (!rating) return 'from-gray-400 to-gray-500';
    
    if (rating >= 4.5) return 'from-amber-400 to-amber-600'; // Excellent
    if (rating >= 3.5) return 'from-amber-400 to-amber-500'; // Great
    if (rating >= 2.5) return 'from-amber-300 to-amber-400'; // Good
    if (rating >= 1.5) return 'from-amber-200 to-amber-300'; // Fair
    return 'from-gray-300 to-gray-400'; // Poor
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="relative">
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
        
        {/* Subtle glow effect for higher ratings */}
        {rating && rating >= 4 && (
          <div 
            className="absolute inset-0 rounded-full animate-pulse" 
            style={{
              background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(251,191,36,0) 70%)',
              filter: 'blur(2px)',
              transform: 'scale(1.2)',
              zIndex: -1
            }}
          />
        )}
      </div>
      
      {showRating && rating !== undefined && (
        <span className="ml-1.5 text-xs font-semibold text-gradient">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};