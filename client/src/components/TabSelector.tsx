import { cn } from '@/lib/utils';

export type TabOption = 'map' | 'list';

interface TabSelectorProps {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="bg-gray-50 px-4 pt-3 pb-1 sticky top-[106px] z-10">
      <div className="max-w-xl mx-auto">
        <div className="flex border-b">
          <button 
            className={cn(
              "pb-2 px-4 text-sm font-medium border-b-2", 
              activeTab === 'map' 
                ? "border-primary text-primary" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
            onClick={() => onTabChange('map')}
          >
            Map View
          </button>
          <button 
            className={cn(
              "pb-2 px-4 text-sm font-medium border-b-2", 
              activeTab === 'list' 
                ? "border-primary text-primary" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
            onClick={() => onTabChange('list')}
          >
            List View
          </button>
        </div>
      </div>
    </div>
  );
}
