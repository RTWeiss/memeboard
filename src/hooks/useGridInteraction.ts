import { useState, useCallback } from 'react';
import { useGridStore } from '../stores/useGridStore';

interface UseGridInteractionProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  cellSize: number;
  offset: { x: number; y: number };
  setOffset: (offset: { x: number; y: number }) => void;
  maxOffset: number;
  viewportSize: number;
}

export const useGridInteraction = ({
  canvasRef,
  cellSize,
  offset,
  setOffset,
  maxOffset,
  viewportSize,
}: UseGridInteractionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const { setSelection } = useGridStore();

  const getGridCoordinates = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left + offset.x) / cellSize);
    const y = Math.floor((clientY - rect.top + offset.y) / cellSize);
    return { 
      x: Math.max(0, Math.min(x, 999)),
      y: Math.max(0, Math.min(y, 999))
    };
  }, [canvasRef, cellSize, offset]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.shiftKey) {
      setIsPanning(true);
      setStartPos({ x: e.clientX + offset.x, y: e.clientY + offset.y });
    } else {
      const { x, y } = getGridCoordinates(e.clientX, e.clientY);
      setIsDragging(true);
      setStartPos({ x, y });
      setSelection({ startX: x, startY: y, endX: x, endY: y });
    }
  }, [getGridCoordinates, offset, setSelection]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const newOffsetX = Math.max(0, Math.min(startPos.x - e.clientX, maxOffset));
      const newOffsetY = Math.max(0, Math.min(startPos.y - e.clientY, maxOffset));
      setOffset({ x: newOffsetX, y: newOffsetY });
    } else if (isDragging) {
      const { x, y } = getGridCoordinates(e.clientX, e.clientY);
      setSelection({
        startX: Math.min(startPos.x, x),
        startY: Math.min(startPos.y, y),
        endX: Math.max(startPos.x, x),
        endY: Math.max(startPos.y, y)
      });
    }
  }, [isDragging, isPanning, startPos, maxOffset, getGridCoordinates, setSelection, setOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const { x, y } = getGridCoordinates(touch.clientX, touch.clientY);
      setIsDragging(true);
      setStartPos({ x, y });
      setSelection({ startX: x, startY: y, endX: x, endY: y });
    }
  }, [getGridCoordinates, setSelection]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const { x, y } = getGridCoordinates(touch.clientX, touch.clientY);
      setSelection({
        startX: Math.min(startPos.x, x),
        startY: Math.min(startPos.y, y),
        endX: Math.max(startPos.x, x),
        endY: Math.max(startPos.y, y)
      });
    }
  }, [isDragging, startPos, getGridCoordinates, setSelection]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
  };
};