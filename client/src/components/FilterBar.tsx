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
        return <Utensils size={16} />;
      case 'cafe':
        return <Coffee size={16} />;
      case 'bar':
        return <Beer size={16} />;
      case 'park':
        return <TreePine size={16} />;
      case 'all':
        return <MapPin size={16} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-2 sticky top-[192px] z-10 border-b border-gray-100 dark:border-gray-700">
      <div className="max-w-xl mx-auto">
        <div className="flex overflow-x-auto pb-2 no-scrollbar gap-2">
          {/* Venue type filter chips */}
          <button 
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[72px]",
              filters.all 
                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" 
                : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
            )}
            onClick={() => onFilterChange('all')}
          >
            <div className={cn(
              "p-2 rounded-full mb-1",
              filters.all ? "bg-amber-100 dark:bg-amber-800/50" : "bg-gray-100 dark:bg-gray-600"
            )}>
              {getTypeIcon('all')}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">All</span>
          </button>
          
          <button 
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[72px]",
              filters.restaurant 
                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" 
                : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
            )}
            onClick={() => onFilterChange('restaurant')}
          >
            <div className={cn(
              "p-2 rounded-full mb-1",
              filters.restaurant ? "bg-amber-100 dark:bg-amber-800/50" : "bg-gray-100 dark:bg-gray-600"
            )}>
              {getTypeIcon('restaurant')}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">Restaurants</span>
          </button>
          
          <button 
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[72px]",
              filters.cafe 
                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" 
                : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
            )}
            onClick={() => onFilterChange('cafe')}
          >
            <div className={cn(
              "p-2 rounded-full mb-1",
              filters.cafe ? "bg-amber-100 dark:bg-amber-800/50" : "bg-gray-100 dark:bg-gray-600"
            )}>
              {getTypeIcon('cafe')}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">Cafés</span>
          </button>
          
          <button 
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[72px]",
              filters.bar 
                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" 
                : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
            )}
            onClick={() => onFilterChange('bar')}
          >
            <div className={cn(
              "p-2 rounded-full mb-1",
              filters.bar ? "bg-amber-100 dark:bg-amber-800/50" : "bg-gray-100 dark:bg-gray-600"
            )}>
              {getTypeIcon('bar')}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">Bars</span>
          </button>
          
          <button 
            className={cn(
              "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[72px]",
              filters.park 
                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" 
                : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
            )}
            onClick={() => onFilterChange('park')}
          >
            <div className={cn(
              "p-2 rounded-full mb-1",
              filters.park ? "bg-amber-100 dark:bg-amber-800/50" : "bg-gray-100 dark:bg-gray-600"
            )}>
              {getTypeIcon('park')}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">Parks</span>
          </button>
        </div>
        
        {/* Special feature filters */}
        {(onSunnyToggle || onHeatersToggle) && (
          <div className="flex space-x-2 py-2">
            {onSunnyToggle && (
              <button 
                className={cn(
                  "px-3 py-1.5 text-xs rounded-full whitespace-nowrap font-medium flex items-center transition-colors flex-1 justify-center",
                  sunnyOnly
                    ? "bg-amber-500 text-white" 
                    : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800/40"
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
                  "px-3 py-1.5 text-xs rounded-full whitespace-nowrap font-medium flex items-center transition-colors flex-1 justify-center",
                  heatersOnly
                    ? "bg-red-500 text-white" 
                    : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/40"
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
