import { FilterState } from '@/types';
import { cn } from '@/lib/utils';
import { Sun, Flame, Utensils, Coffee, Beer, TreePine, MapPin } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filter: string) => void;
  sunnyOnly?: boolean;
  heatersOnly?: boolean;
  onSunnyToggle?: () => void;
  onHeatersToggle?: () => void;
}

export function FilterBar({ 
  filters, 
  onFilterChange, 
  sunnyOnly = false, 
  heatersOnly = false, 
  onSunnyToggle, 
  onHeatersToggle 
}: FilterBarProps) {
  
  // Helper function to get icon for each type
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'restaurant':
        return <Utensils size={14} className="mr-1" />;
      case 'cafe':
        return <Coffee size={14} className="mr-1" />;
      case 'bar':
        return <Beer size={14} className="mr-1" />;
      case 'park':
        return <TreePine size={14} className="mr-1" />;
      case 'all':
        return <MapPin size={14} className="mr-1" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white px-4 py-3 sticky top-[146px] z-10 shadow-sm">
      <div className="max-w-xl mx-auto">
        {/* Venue type filters */}
        <div className="flex space-x-2 overflow-x-auto py-1 no-scrollbar">
          <button 
            className={cn(
              "px-3 py-1.5 text-sm rounded-full whitespace-nowrap font-medium flex items-center transition-all",
              filters.all 
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => onFilterChange('all')}
          >
            {getTypeIcon('all')}
            All Places
          </button>
          <button 
            className={cn(
              "px-3 py-1.5 text-sm rounded-full whitespace-nowrap font-medium flex items-center transition-all",
              filters.restaurant 
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => onFilterChange('restaurant')}
          >
            {getTypeIcon('restaurant')}
            Restaurants
          </button>
          <button 
            className={cn(
              "px-3 py-1.5 text-sm rounded-full whitespace-nowrap font-medium flex items-center transition-all",
              filters.cafe 
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => onFilterChange('cafe')}
          >
            {getTypeIcon('cafe')}
            Cafés
          </button>
          <button 
            className={cn(
              "px-3 py-1.5 text-sm rounded-full whitespace-nowrap font-medium flex items-center transition-all",
              filters.bar 
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => onFilterChange('bar')}
          >
            {getTypeIcon('bar')}
            Bars
          </button>
          <button 
            className={cn(
              "px-3 py-1.5 text-sm rounded-full whitespace-nowrap font-medium flex items-center transition-all",
              filters.park 
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => onFilterChange('park')}
          >
            {getTypeIcon('park')}
            Parks
          </button>
        </div>
        
        {/* Special feature filters */}
        {(onSunnyToggle || onHeatersToggle) && (
          <div className="flex space-x-2 mt-3">
            {onSunnyToggle && (
              <button 
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full whitespace-nowrap font-medium flex items-center transition-all",
                  sunnyOnly
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md" 
                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                )}
                onClick={onSunnyToggle}
              >
                <Sun size={14} className="mr-1.5" />
                Sunny Now
              </button>
            )}
            
            {onHeatersToggle && (
              <button 
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full whitespace-nowrap font-medium flex items-center transition-all",
                  heatersOnly
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md" 
                    : "bg-red-100 text-red-800 hover:bg-red-200"
                )}
                onClick={onHeatersToggle}
              >
                <Flame size={14} className="mr-1.5" />
                With Heaters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
