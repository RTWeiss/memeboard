import React from 'react';
import { Grid, Menu, X } from 'lucide-react';
import { useGridStore } from '../../stores/useGridStore';

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onToggle }) => {
  const { selection, setSelection } = useGridStore();

  const handleClearSelection = () => {
    setSelection(null);
    onToggle();
  };

  return (
    <div className="lg:hidden">
      <button
        onClick={onToggle}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Grid className="w-6 h-6 text-indigo-600" />
                <span className="text-lg font-bold">Menu</span>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <nav className="space-y-4">
                {selection && (
                  <button
                    onClick={handleClearSelection}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Clear Selection
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};