import { Sun, Bookmark, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = 'explore' | 'saved' | 'settings';

interface BottomNavigationProps {
  activeItem: NavItem;
  onItemClick: (item: NavItem) => void;
}

export function BottomNavigation({ activeItem, onItemClick }: BottomNavigationProps) {
  return (
    <div className="bg-white fixed bottom-0 left-0 right-0 border-t shadow-lg z-50 bottom-nav-safe-area">
      <div className="max-w-xl mx-auto px-4 bottom-nav-container">
        <div className="flex justify-around">
          <button 
            className={cn(
              "py-3 flex flex-col items-center relative",
              activeItem === 'explore' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => onItemClick('explore')}
          >
            {activeItem === 'explore' && (
              <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
            )}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 mb-1 rounded-full bottom-nav-icon",
              activeItem === 'explore' ? 'bg-orange-100' : 'bg-transparent'
            )}>
              <Sun className={cn(
                "h-5 w-5", 
                activeItem === 'explore' ? 'text-orange-500' : 'text-gray-500'
              )} />
            </div>
            <span className={cn(
              "text-xs bottom-nav-label",
              activeItem === 'explore' ? 'font-medium' : ''
            )}>
              Explore
            </span>
          </button>
          
          <button 
            className={cn(
              "py-3 flex flex-col items-center relative",
              activeItem === 'saved' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => onItemClick('saved')}
          >
            {activeItem === 'saved' && (
              <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
            )}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 mb-1 rounded-full bottom-nav-icon",
              activeItem === 'saved' ? 'bg-orange-100' : 'bg-transparent'
            )}>
              <Bookmark className={cn(
                "h-5 w-5", 
                activeItem === 'saved' ? 'text-orange-500' : 'text-gray-500'
              )} />
            </div>
            <span className={cn(
              "text-xs bottom-nav-label",
              activeItem === 'saved' ? 'font-medium' : ''
            )}>
              Saved
            </span>
          </button>
          
          <button 
            className={cn(
              "py-3 flex flex-col items-center relative",
              activeItem === 'settings' ? 'text-orange-500' : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => onItemClick('settings')}
          >
            {activeItem === 'settings' && (
              <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
            )}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 mb-1 rounded-full bottom-nav-icon",
              activeItem === 'settings' ? 'bg-orange-100' : 'bg-transparent'
            )}>
              <Settings className={cn(
                "h-5 w-5", 
                activeItem === 'settings' ? 'text-orange-500' : 'text-gray-500'
              )} />
            </div>
            <span className={cn(
              "text-xs bottom-nav-label",
              activeItem === 'settings' ? 'font-medium' : ''
            )}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
