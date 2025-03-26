import { cn } from '@/lib/utils';
import { Map, List } from 'lucide-react';

export type TabOption = 'map' | 'list';

interface TabSelectorProps {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="bg-white px-4 py-2 sticky top-[160px] z-10 border-b border-gray-100">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-center">
          <button 
            className={cn(
              "flex items-center justify-center py-2 px-6 text-sm font-medium transition-all border-b-2 mx-1", 
              activeTab === 'map' 
                ? "text-amber-500 border-amber-500" 
                : "text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-200"
            )}
            onClick={() => onTabChange('map')}
          >
            <Map className="h-4 w-4 mr-2" />
            Map
          </button>
          <button 
            className={cn(
              "flex items-center justify-center py-2 px-6 text-sm font-medium transition-all border-b-2 mx-1", 
              activeTab === 'list' 
                ? "text-amber-500 border-amber-500" 
                : "text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-200"
            )}
            onClick={() => onTabChange('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </button>
        </div>
      </div>
    </div>
  );
}
