import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Pixel, GridSelection, GridState } from '../types/grid';
import { PIXEL_PRICE } from '../config/solana';

interface GridStore extends GridState {
  setSelection: (selection: GridSelection | null) => void;
  updatePixels: (pixels: { x: number; y: number; data: Partial<Pixel> }[]) => void;
  getPixelPrice: (x: number, y: number) => number;
  getPixel: (x: number, y: number) => Pixel | null;
  calculateTotalPrice: (selection: GridSelection) => { totalPrice: number; newPixels: number; ownedPixels: number };
}

const createOptimizedStorage = () => {
  const storage = createJSONStorage(() => localStorage);
  const memoryCache = new Map<string, Pixel>();

  return {
    getItem: async (name: string) => {
      try {
        const data = await storage.getItem(name);
        if (data && typeof data === 'object') {
          Object.entries(data.purchasedPixels || {}).forEach(([key, pixel]) => {
            memoryCache.set(key, pixel as Pixel);
          });
        }
        return data;
      } catch (err) {
        console.error('Storage getItem error:', err);
        return null;
      }
    },
    setItem: async (name: string, value: any) => {
      try {
        const chunks: Record<string, Record<string, Pixel>> = {};
        const chunkSize = 50; // Smaller chunk size for better performance

        Object.entries(value.purchasedPixels || {}).forEach(([key, pixel]) => {
          const [x, y] = key.split(',').map(Number);
          const chunkX = Math.floor(x / chunkSize);
          const chunkY = Math.floor(y / chunkSize);
          const chunkKey = `${chunkX}-${chunkY}`;

          if (!chunks[chunkKey]) {
            chunks[chunkKey] = {};
          }
          chunks[chunkKey][key] = pixel as Pixel;
        });

        // Store chunks separately
        for (const [chunkKey, chunkData] of Object.entries(chunks)) {
          await storage.setItem(`pixel-grid-chunk-${chunkKey}`, chunkData);
        }

        // Store main state without pixels
        await storage.setItem(name, {
          ...value,
          purchasedPixels: {},
        });
      } catch (err) {
        console.error('Storage setItem error:', err);
      }
    },
    removeItem: async (name: string) => {
      try {
        await storage.removeItem(name);
        memoryCache.clear();
        
        // Clear all chunks
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('pixel-grid-chunk-')) {
            localStorage.removeItem(key);
          }
        }
      } catch (err) {
        console.error('Storage removeItem error:', err);
      }
    },
  };
};

export const useGridStore = create<GridStore>()(
  persist(
    (set, get) => ({
      purchasedPixels: {},
      selection: null,
      setSelection: (selection) => set({ selection }),
      updatePixels: (updates) =>
        set((state) => {
          const newPurchasedPixels = { ...state.purchasedPixels };
          
          updates.forEach(({ x, y, data }) => {
            const key = `${x},${y}`;
            const existingPixel = state.purchasedPixels[key];
            
            if (data.owner) {
              const history = existingPixel?.history || [];
              const basePrice = existingPixel ? existingPixel.currentPrice : PIXEL_PRICE;
              const newPrice = existingPixel ? basePrice * 2 : basePrice;
              
              newPurchasedPixels[key] = {
                x,
                y,
                owner: data.owner,
                image: data.image || null,
                link: data.link || null,
                color: data.color || null,
                history: [
                  ...history,
                  {
                    owner: data.owner,
                    price: newPrice,
                    timestamp: Date.now(),
                  }
                ],
                currentPrice: newPrice,
                startX: data.startX || x,
                startY: data.startY || y,
                endX: data.endX || x,
                endY: data.endY || y,
              };
            }
          });

          return { purchasedPixels: newPurchasedPixels };
        }),
      getPixelPrice: (x: number, y: number) => {
        const pixel = get().purchasedPixels[`${x},${y}`];
        return pixel ? pixel.currentPrice * 2 : PIXEL_PRICE;
      },
      getPixel: (x: number, y: number) => {
        return get().purchasedPixels[`${x},${y}`] || null;
      },
      calculateTotalPrice: (selection) => {
        let totalPrice = 0;
        let newPixels = 0;
        let ownedPixels = 0;

        for (let y = selection.startY; y <= selection.endY; y++) {
          for (let x = selection.startX; x <= selection.endX; x++) {
            const pixel = get().getPixel(x, y);
            if (pixel) {
              ownedPixels++;
              totalPrice += pixel.currentPrice * 2;
            } else {
              newPixels++;
              totalPrice += PIXEL_PRICE;
            }
          }
        }

        return { totalPrice, newPixels, ownedPixels };
      },
    }),
    {
      name: 'pixel-grid-state',
      storage: createOptimizedStorage(),
      version: 1,
    }
  )
);