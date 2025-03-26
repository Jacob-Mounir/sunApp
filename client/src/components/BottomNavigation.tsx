import { Sun, Bookmark, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'wouter';

type NavItem = 'explore' | 'saved' | 'settings';

interface BottomNavigationProps {
  activeItem: NavItem;
  onItemClick: (item: NavItem) => void;
}

export function BottomNavigation({ activeItem, onItemClick }: BottomNavigationProps) {
  const [location] = useLocation();
  return (
    <div className="bg-white fixed bottom-0 left-0 right-0 border-t border-gray-100 shadow-lg z-50 bottom-nav-safe-area backdrop-blur-sm bg-white/95">
      <div className="max-w-xl mx-auto bottom-nav-container py-1.5">
        <div className="flex justify-around items-center h-14">
          <button 
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center relative",
              activeItem === 'explore' ? 'text-amber-500' : 'text-gray-500 hover:text-gray-800'
            )}
            onClick={() => onItemClick('explore')}
          >
            <div className="relative">
              <Sun className={cn(
                "h-6 w-6 transition-all duration-200", 
                activeItem === 'explore' 
                  ? 'text-amber-500 scale-110 drop-shadow-sm' 
                  : 'text-gray-500'
              )} />
              {activeItem === 'explore' && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-500 rounded-full shadow-sm"></span>
              )}
            </div>
            <span className={cn(
              "text-xs mt-1 transition-all duration-200",
              activeItem === 'explore' ? 'font-semibold text-amber-500' : 'font-normal'
            )}>
              Explore
            </span>
            
            {activeItem === 'explore' && (
              <div className="absolute bottom-0 inset-x-4 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"></div>
            )}
          </button>
          
          <button 
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center relative",
              activeItem === 'saved' ? 'text-amber-500' : 'text-gray-500 hover:text-gray-800'
            )}
            onClick={() => onItemClick('saved')}
          >
            <div className="relative">
              <Bookmark className={cn(
                "h-6 w-6 transition-all duration-200", 
                activeItem === 'saved' 
                  ? 'text-amber-500 scale-110 drop-shadow-sm' 
                  : 'text-gray-500'
              )} 
              fill={activeItem === 'saved' ? 'currentColor' : 'none'}
              />
              {activeItem === 'saved' && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-500 rounded-full shadow-sm"></span>
              )}
            </div>
            <span className={cn(
              "text-xs mt-1 transition-all duration-200",
              activeItem === 'saved' ? 'font-semibold text-amber-500' : 'font-normal'
            )}>
              Saved
            </span>
            
            {activeItem === 'saved' && (
              <div className="absolute bottom-0 inset-x-4 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"></div>
            )}
          </button>
          
          <button 
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center relative",
              activeItem === 'settings' ? 'text-amber-500' : 'text-gray-500 hover:text-gray-800'
            )}
            onClick={() => onItemClick('settings')}
          >
            <div className="relative">
              <Settings className={cn(
                "h-6 w-6 transition-all duration-200", 
                activeItem === 'settings' 
                  ? 'text-amber-500 scale-110 drop-shadow-sm' 
                  : 'text-gray-500'
              )} />
              {activeItem === 'settings' && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-500 rounded-full shadow-sm"></span>
              )}
            </div>
            <span className={cn(
              "text-xs mt-1 transition-all duration-200",
              activeItem === 'settings' ? 'font-semibold text-amber-500' : 'font-normal'
            )}>
              Settings
            </span>
            
            {activeItem === 'settings' && (
              <div className="absolute bottom-0 inset-x-4 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
