import { Pixel } from '../types/grid';

const CHUNK_SIZE = 100;

export const chunk = (pixels: Record<string, Pixel>) => {
  const chunks: Record<string, Record<string, Pixel>> = {};
  
  Object.entries(pixels).forEach(([key, pixel]) => {
    const chunkX = Math.floor(pixel.x / CHUNK_SIZE);
    const chunkY = Math.floor(pixel.y / CHUNK_SIZE);
    const chunkKey = `chunk-${chunkX}-${chunkY}`;
    
    if (!chunks[chunkKey]) {
      chunks[chunkKey] = {};
    }
    
    chunks[chunkKey][key] = pixel;
  });
  
  return chunks;
};

export const getChunkForPixel = (x: number, y: number) => {
  const chunkX = Math.floor(x / CHUNK_SIZE);
  const chunkY = Math.floor(y / CHUNK_SIZE);
  return `chunk-${chunkX}-${chunkY}`;
};