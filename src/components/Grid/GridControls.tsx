import React from 'react';
import { ZoomIn, ZoomOut, Move, Info } from 'lucide-react';

interface GridControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const GridControls: React.FC<GridControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 rounded-t-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
            <button
              onClick={onZoomOut}
              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-medium text-gray-700">
              {zoom}x
            </span>
            <button
              onClick={onZoomIn}
              className="p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Move className="h-4 w-4" />
            <span className="hidden sm:inline">Hold Shift + Drag to pan</span>
            <span className="sm:hidden">Shift + Drag: pan</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Info className="h-4 w-4 text-indigo-600" />
            <span className="hidden sm:inline">Click and drag to select pixels</span>
            <span className="sm:hidden">Drag to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};