import React, { useState, useRef } from 'react';
import { useWindowSize } from '../../hooks/useWindowSize';
import { GridControls } from './GridControls';
import { GridBackground } from './GridBackground';
import { GridCanvas } from './GridCanvas';

const MIN_ZOOM = 1;
const MAX_ZOOM = 10;
const INITIAL_ZOOM = 2;
const GRID_SIZE = 1000;
const BASE_CELL_SIZE = 10;

export const PixelGrid: React.FC = () => {
  const { width } = useWindowSize();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const cellSize = BASE_CELL_SIZE * zoom;
  const viewportSize = Math.min(
    width ? width - 32 : 800,
    containerRef.current?.offsetWidth || 800
  );
  const maxOffset = GRID_SIZE * cellSize - viewportSize;

  const handleZoomIn = () => setZoom(z => Math.min(MAX_ZOOM, z + 1));
  const handleZoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z - 1));

  return (
    <div className="space-y-4" ref={containerRef}>
      <GridControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      
      <div className="pixel-grid-container relative">
        <GridBackground />
        <GridCanvas
          cellSize={cellSize}
          offset={offset}
          setOffset={setOffset}
          maxOffset={maxOffset}
          viewportSize={viewportSize}
        />
      </div>
    </div>
  );
};