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
  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        className="text-amber-500"
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
      
      {showRating && rating !== undefined && (
        <span className="ml-1 text-xs font-medium text-amber-600">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};