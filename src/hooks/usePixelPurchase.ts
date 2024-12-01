import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useGridStore } from '../stores/useGridStore';
import { purchasePixels } from '../utils/solana';
import { GridSelection } from '../types/grid';

interface UsePixelPurchaseReturn {
  isLoading: boolean;
  error: string | null;
  purchase: (
    selection: GridSelection, 
    imageData: string | null, 
    link: string,
    color: string | null,
    totalPrice: number
  ) => Promise<void>;
}

export const usePixelPurchase = (): UsePixelPurchaseReturn => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { updatePixels } = useGridStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchase = useCallback(async (
    selection: GridSelection,
    imageData: string | null,
    link: string,
    color: string | null,
    totalPrice: number
  ) => {
    if (!wallet.connected || !wallet.publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await purchasePixels(connection, wallet, selection, totalPrice);

      if (result.success) {
        const updates = [];
        for (let y = selection.startY; y <= selection.endY; y++) {
          for (let x = selection.startX; x <= selection.endX; x++) {
            updates.push({
              x,
              y,
              data: {
                owner: wallet.publicKey.toBase58(),
                image: imageData,
                color: color,
                link: link || null,
                startX: selection.startX,
                startY: selection.startY,
                endX: selection.endX,
                endY: selection.endY,
              },
            });
          }
        }
        updatePixels(updates);
        useGridStore.getState().setSelection(null);
      }
    } catch (err) {
      console.error('Purchase failed:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Transaction failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [connection, wallet, updatePixels]);

  return { isLoading, error, purchase };
};