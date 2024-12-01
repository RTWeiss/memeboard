import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGridStore } from '../../stores/useGridStore';
import { ImageUpload } from './ImageUpload';
import { ColorPicker } from './ColorPicker';
import { usePixelPurchase } from '../../hooks/usePixelPurchase';
import { ShoppingCart, AlertCircle, MousePointer2, Info, Image as ImageIcon, Palette, Link as LinkIcon } from 'lucide-react';
import { PIXEL_PRICE } from '../../config/solana';
import { PixelDetails } from '../Grid/PixelDetails';

export const PurchasePanel: React.FC = () => {
  const wallet = useWallet();
  const { selection, getPixel, calculateTotalPrice } = useGridStore();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [link, setLink] = useState('');
  const [activeTab, setActiveTab] = useState<'customize' | 'details'>('customize');
  
  const { isLoading, error, purchase } = usePixelPurchase();

  useEffect(() => {
    setImageFile(null);
    setLink('');
  }, [selection]);

  const { totalPrice, pixelCount, newPixels, ownedPixels, selectedPixels } = useMemo(() => {
    if (!selection) return { 
      totalPrice: 0, 
      pixelCount: 0, 
      newPixels: 0, 
      ownedPixels: 0, 
      selectedPixels: [] 
    };
    
    const count = (selection.endX - selection.startX + 1) * (selection.endY - selection.startY + 1);
    const priceInfo = calculateTotalPrice(selection);
    const pixels = [];

    for (let y = selection.startY; y <= selection.endY; y++) {
      for (let x = selection.startX; x <= selection.endX; x++) {
        const pixel = getPixel(x, y);
        if (pixel) pixels.push(pixel);
      }
    }
    
    return { 
      ...priceInfo,
      pixelCount: count,
      selectedPixels: pixels
    };
  }, [selection, calculateTotalPrice, getPixel]);

  const handlePurchase = useCallback(async () => {
    if (!selection) return;

    try {
      let imageData = null;
      if (imageFile) {
        const reader = new FileReader();
        imageData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      await purchase(
        selection,
        imageData,
        link,
        imageData ? null : selectedColor,
        totalPrice
      );
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  }, [selection, imageFile, link, selectedColor, purchase, totalPrice]);

  if (!selection) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="text-center">
          <MousePointer2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Select Pixels</h3>
          <p className="mt-1 text-sm text-gray-500">
            Click and drag on the grid to select pixels to purchase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-12rem)] lg:h-[calc(100vh-8rem)]">
      {/* Header with price summary */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-secondary" />
            <h3 className="font-medium text-gray-900">Purchase Cart</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Price</p>
            <p className="text-lg font-bold text-secondary">{totalPrice.toFixed(3)} SOL</p>
          </div>
        </div>
        <div className="flex gap-2 text-sm text-gray-600">
          <span>{pixelCount} pixels selected</span>
          {ownedPixels > 0 && (
            <span className="text-primary">({ownedPixels} owned)</span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${
            activeTab === 'customize'
              ? 'border-secondary text-secondary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('customize')}
        >
          Customize
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium border-b-2 ${
            activeTab === 'details'
              ? 'border-secondary text-secondary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('details')}
        >
          Pixel Details
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'customize' ? (
          <div className="space-y-6">
            {!wallet.connected ? (
              <div className="text-center py-8">
                <WalletMultiButton className="!py-2 !px-4" />
                <p className="mt-2 text-sm text-gray-500">Connect your wallet to continue</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <ImageIcon className="h-4 w-4 text-secondary" />
                    <span>Upload Image</span>
                  </div>
                  <ImageUpload onImageSelected={setImageFile} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Palette className="h-4 w-4 text-secondary" />
                    <span>Choose Color</span>
                  </div>
                  <ColorPicker selectedColor={selectedColor} onChange={setSelectedColor} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <LinkIcon className="h-4 w-4 text-secondary" />
                    <span>Add Link (Optional)</span>
                  </div>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                    placeholder="https://example.com"
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {selectedPixels.map((pixel) => (
              <PixelDetails
                key={`${pixel.x}-${pixel.y}`}
                pixel={pixel}
                onClose={() => {}}
              />
            ))}
            {selectedPixels.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No owned pixels in selection
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with purchase button */}
      <div className="p-4 border-t border-gray-200">
        {error && (
          <div className="mb-4 flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {wallet.connected && (
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="purchase-button"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>
              {isLoading ? 'Processing...' : `Purchase for ${totalPrice.toFixed(3)} SOL`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};