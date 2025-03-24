import { Sun, Bookmark, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = 'explore' | 'saved' | 'settings';

interface BottomNavigationProps {
  activeItem: NavItem;
  onItemClick: (item: NavItem) => void;
}

export function BottomNavigation({ activeItem, onItemClick }: BottomNavigationProps) {
  return (
    <div className="bg-white fixed bottom-0 left-0 right-0 border-t shadow-sm">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex justify-around">
          <button 
            className={cn(
              "py-3 flex flex-col items-center",
              activeItem === 'explore' ? 'text-primary' : 'text-gray-500'
            )}
            onClick={() => onItemClick('explore')}
          >
            <Sun className={cn(
              "h-5 w-5", 
              activeItem === 'explore' ? 'text-primary' : 'text-gray-500'
            )} />
            <span className={cn(
              "text-xs mt-1",
              activeItem === 'explore' ? 'font-medium' : ''
            )}>
              Explore
            </span>
          </button>
          <button 
            className={cn(
              "py-3 flex flex-col items-center",
              activeItem === 'saved' ? 'text-primary' : 'text-gray-500'
            )}
            onClick={() => onItemClick('saved')}
          >
            <Bookmark className={cn(
              "h-5 w-5", 
              activeItem === 'saved' ? 'text-primary' : 'text-gray-500'
            )} />
            <span className={cn(
              "text-xs mt-1",
              activeItem === 'saved' ? 'font-medium' : ''
            )}>
              Saved
            </span>
          </button>
          <button 
            className={cn(
              "py-3 flex flex-col items-center",
              activeItem === 'settings' ? 'text-primary' : 'text-gray-500'
            )}
            onClick={() => onItemClick('settings')}
          >
            <Settings className={cn(
              "h-5 w-5", 
              activeItem === 'settings' ? 'text-primary' : 'text-gray-500'
            )} />
            <span className={cn(
              "text-xs mt-1",
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
