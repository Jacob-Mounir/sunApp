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
    <div className="bg-white fixed bottom-0 left-0 right-0 border-t border-gray-100 shadow-sm z-50 bottom-nav-safe-area">
      <div className="max-w-xl mx-auto bottom-nav-container">
        <div className="flex justify-around items-center h-16">
          <button 
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center",
              activeItem === 'explore' ? 'text-amber-500' : 'text-gray-500 hover:text-gray-800'
            )}
            onClick={() => onItemClick('explore')}
          >
            <div className="relative">
              <Sun className={cn(
                "h-6 w-6", 
                activeItem === 'explore' ? 'text-amber-500' : 'text-gray-500'
              )} />
              {activeItem === 'explore' && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              )}
            </div>
            <span className={cn(
              "text-xs mt-1",
              activeItem === 'explore' ? 'font-medium' : 'font-normal'
            )}>
              Explore
            </span>
          </button>
          
          <button 
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center",
              activeItem === 'saved' ? 'text-amber-500' : 'text-gray-500 hover:text-gray-800'
            )}
            onClick={() => onItemClick('saved')}
          >
            <div className="relative">
              <Bookmark className={cn(
                "h-6 w-6", 
                activeItem === 'saved' ? 'text-amber-500' : 'text-gray-500'
              )} />
              {activeItem === 'saved' && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              )}
            </div>
            <span className={cn(
              "text-xs mt-1",
              activeItem === 'saved' ? 'font-medium' : 'font-normal'
            )}>
              Saved
            </span>
          </button>
          
          <button 
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center",
              activeItem === 'settings' ? 'text-amber-500' : 'text-gray-500 hover:text-gray-800'
            )}
            onClick={() => onItemClick('settings')}
          >
            <div className="relative">
              <Settings className={cn(
                "h-6 w-6", 
                activeItem === 'settings' ? 'text-amber-500' : 'text-gray-500'
              )} />
              {activeItem === 'settings' && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              )}
            </div>
            <span className={cn(
              "text-xs mt-1",
              activeItem === 'settings' ? 'font-medium' : 'font-normal'
            )}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
