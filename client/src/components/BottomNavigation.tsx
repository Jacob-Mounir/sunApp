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
    <div className="bg-white fixed bottom-0 left-0 right-0 border-t border-gray-200 shadow-md z-50 bottom-nav-safe-area">
      <div className="max-w-xl mx-auto bottom-nav-container">
        <div className="flex justify-around items-center h-16">
          <button 
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center relative",
              activeItem === 'explore' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-700'
            )}
            onClick={() => onItemClick('explore')}
          >
            {activeItem === 'explore' && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-amber-500 rounded-full"></span>
            )}
            <Sun className={cn(
              "h-6 w-6 mb-1", 
              activeItem === 'explore' ? 'text-amber-500' : 'text-gray-400'
            )} />
            <span className={cn(
              "text-xs tracking-tight",
              activeItem === 'explore' ? 'font-medium' : 'font-normal'
            )}>
              Explore
            </span>
          </button>
          
          <button 
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center relative",
              activeItem === 'saved' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-700'
            )}
            onClick={() => onItemClick('saved')}
          >
            {activeItem === 'saved' && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-amber-500 rounded-full"></span>
            )}
            <Bookmark className={cn(
              "h-6 w-6 mb-1", 
              activeItem === 'saved' ? 'text-amber-500' : 'text-gray-400'
            )} />
            <span className={cn(
              "text-xs tracking-tight",
              activeItem === 'saved' ? 'font-medium' : 'font-normal'
            )}>
              Saved
            </span>
          </button>
          
          <button 
            className={cn(
              "flex-1 h-full flex flex-col items-center justify-center relative",
              activeItem === 'settings' ? 'text-amber-500' : 'text-gray-400 hover:text-gray-700'
            )}
            onClick={() => onItemClick('settings')}
          >
            {activeItem === 'settings' && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-amber-500 rounded-full"></span>
            )}
            <Settings className={cn(
              "h-6 w-6 mb-1", 
              activeItem === 'settings' ? 'text-amber-500' : 'text-gray-400'
            )} />
            <span className={cn(
              "text-xs tracking-tight",
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
