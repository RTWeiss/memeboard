import { useCallback } from 'react';
import { useGridStore } from '../stores/useGridStore';
import { useImageLoader } from '../utils/imageLoader';

interface UseGridDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  cellSize: number;
  offset: { x: number; y: number };
  viewportSize: number;
}

export const useGridDrawing = ({
  canvasRef,
  cellSize,
  offset,
  viewportSize,
}: UseGridDrawingProps) => {
  const { loadImage } = useImageLoader();
  const { purchasedPixels, selection, getPixel } = useGridStore();

  const drawGrid = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate visible range with padding
    const startX = Math.max(0, Math.floor(offset.x / cellSize) - 1);
    const startY = Math.max(0, Math.floor(offset.y / cellSize) - 1);
    const endX = Math.min(startX + Math.ceil(viewportSize / cellSize) + 2, 1000);
    const endY = Math.min(startY + Math.ceil(viewportSize / cellSize) + 2, 1000);

    // Draw grid lines with improved visibility
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = startX; x <= endX; x++) {
      const screenX = x * cellSize - offset.x;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, viewportSize);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y++) {
      const screenY = y * cellSize - offset.y;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(viewportSize, screenY);
      ctx.stroke();
    }

    // Draw major grid lines (every 10 cells)
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.2)';
    ctx.lineWidth = 1;

    for (let x = Math.floor(startX / 10) * 10; x <= endX; x += 10) {
      const screenX = x * cellSize - offset.x;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, viewportSize);
      ctx.stroke();
    }

    for (let y = Math.floor(startY / 10) * 10; y <= endY; y += 10) {
      const screenY = y * cellSize - offset.y;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(viewportSize, screenY);
      ctx.stroke();
    }

    // Draw purchased pixels
    const drawnAreas = new Set();

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const pixel = getPixel(x, y);
        if (pixel) {
          const areaKey = `${pixel.startX},${pixel.startY},${pixel.endX},${pixel.endY}`;
          if (!drawnAreas.has(areaKey)) {
            drawnAreas.add(areaKey);
            
            const screenX = pixel.startX * cellSize - offset.x;
            const screenY = pixel.startY * cellSize - offset.y;
            const width = (pixel.endX - pixel.startX + 1) * cellSize;
            const height = (pixel.endY - pixel.startY + 1) * cellSize;

            if (pixel.image) {
              try {
                const img = await loadImage(pixel.image);
                ctx.drawImage(img, screenX, screenY, width, height);
              } catch (error) {
                console.error('Failed to load image:', error);
                ctx.fillStyle = pixel.color || '#e5e7eb';
                ctx.fillRect(screenX, screenY, width, height);
              }
            } else if (pixel.color) {
              ctx.fillStyle = pixel.color;
              ctx.fillRect(screenX, screenY, width, height);
            }

            // Add subtle border to purchased pixels
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.strokeRect(screenX, screenY, width, height);
          }
        }
      }
    }

    // Draw selection with improved visibility
    if (selection) {
      const selectionX = selection.startX * cellSize - offset.x;
      const selectionY = selection.startY * cellSize - offset.y;
      const selectionWidth = (selection.endX - selection.startX + 1) * cellSize;
      const selectionHeight = (selection.endY - selection.startY + 1) * cellSize;

      // Draw selection background
      ctx.fillStyle = 'rgba(79, 70, 229, 0.1)';
      ctx.fillRect(selectionX, selectionY, selectionWidth, selectionHeight);
      
      // Draw selection border
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2;
      ctx.strokeRect(selectionX, selectionY, selectionWidth, selectionHeight);
      
      // Add selection corners
      const cornerSize = 4;
      ctx.fillStyle = '#4f46e5';
      
      // Top-left corner
      ctx.fillRect(selectionX - cornerSize/2, selectionY - cornerSize/2, cornerSize, cornerSize);
      // Top-right corner
      ctx.fillRect(selectionX + selectionWidth - cornerSize/2, selectionY - cornerSize/2, cornerSize, cornerSize);
      // Bottom-left corner
      ctx.fillRect(selectionX - cornerSize/2, selectionY + selectionHeight - cornerSize/2, cornerSize, cornerSize);
      // Bottom-right corner
      ctx.fillRect(selectionX + selectionWidth - cornerSize/2, selectionY + selectionHeight - cornerSize/2, cornerSize, cornerSize);
    }
  }, [canvasRef, cellSize, offset, viewportSize, selection, getPixel, loadImage]);

  return { drawGrid };
};