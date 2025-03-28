import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Sunrise, Sunset, SunDim, SunMedium, CloudSun } from 'lucide-react';

interface SunIconProps {
  className?: string;
  rating?: number; // 0-100
  showRating?: boolean;
  type?: 'sun' | 'sunrise' | 'sunset' | 'partial' | 'medium' | 'cloudy';
  size?: number;
}

export const SunIcon: React.FC<SunIconProps> = ({
  className = '',
  rating = 0,
  showRating = false,
  type = 'sun',
  size = 24
}) => {
  const { theme } = useTheme();
  const isSunMode = theme === 'light';

  // Helper function to get gradient class based on rating
  const getGradientClass = () => {
    if (rating >= 80) return 'from-yellow-400 to-orange-500';
    if (rating >= 60) return 'from-yellow-300 to-orange-400';
    if (rating >= 40) return 'from-yellow-200 to-orange-300';
    if (rating >= 20) return 'from-gray-300 to-gray-400';
    return 'from-gray-200 to-gray-300';
  };

  // Helper function to get glow color based on rating
  const getGlowColor = () => {
    if (rating >= 80) return 'rgba(251, 191, 36, 0.3)'; // yellow-400
    if (rating >= 60) return 'rgba(251, 191, 36, 0.2)';
    if (rating >= 40) return 'rgba(251, 191, 36, 0.1)';
    return 'rgba(209, 213, 219, 0.1)'; // gray-300
  };

  // Helper function to determine if glow effect should be shown
  const shouldShowGlow = () => rating >= 60;

  // Get the appropriate icon based on type
  const IconComponent = () => {
    switch (type) {
      case 'sunrise':
        return <Sunrise size={size} />;
      case 'sunset':
        return <Sunset size={size} />;
      case 'partial':
        return <SunDim size={size} />;
      case 'medium':
        return <SunMedium size={size} />;
      case 'cloudy':
        return <CloudSun size={size} />;
      default:
        return <Sun size={size} />;
    }
  };

  return (
    <div className={`inline-flex items-center group ${className}`}>
      <div className="relative">
        <div className={`bg-gradient-to-br ${getGradientClass()} text-white rounded-full p-1`}>
          <IconComponent />
        </div>

        {/* Subtle glow effect for high sun ratings */}
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

      {/* Optional rating display */}
      {showRating && (
        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
          {rating}%
        </span>
      )}
    </div>
  );
};