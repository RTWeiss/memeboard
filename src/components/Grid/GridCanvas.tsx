import React, { useRef, useEffect } from 'react';
import { useGridDrawing } from '../../hooks/useGridDrawing';
import { useGridInteraction } from '../../hooks/useGridInteraction';

interface GridCanvasProps {
  cellSize: number;
  offset: { x: number; y: number };
  setOffset: (offset: { x: number; y: number }) => void;
  maxOffset: number;
  viewportSize: number;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  cellSize,
  offset,
  setOffset,
  maxOffset,
  viewportSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { drawGrid } = useGridDrawing({
    canvasRef,
    cellSize,
    offset,
    viewportSize,
  });

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
  } = useGridInteraction({
    canvasRef,
    cellSize,
    offset,
    setOffset,
    maxOffset,
    viewportSize,
  });

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = viewportSize;
      canvasRef.current.height = viewportSize;
      drawGrid();
    }
  }, [viewportSize, drawGrid]);

  useEffect(() => {
    drawGrid();
  }, [cellSize, drawGrid]);

  return (
    <canvas
      ref={canvasRef}
      width={viewportSize}
      height={viewportSize}
      className="cursor-crosshair touch-none mx-auto relative z-10"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    />
  );
};