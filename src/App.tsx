import React from 'react';
import { WalletProvider } from './components/Wallet/WalletProvider';
import { Header } from './components/Layout/Header';
import { PixelGrid } from './components/Grid/PixelGrid';
import { PurchasePanel } from './components/Purchase/PurchasePanel';

function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-4 sm:py-8 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <div className="lg:col-span-8 xl:col-span-9 order-2 lg:order-1">
              <PixelGrid />
            </div>
            <div className="lg:col-span-4 xl:col-span-3 order-1 lg:order-2 lg:sticky lg:top-20">
              <PurchasePanel />
            </div>
          </div>
        </main>
      </div>
    </WalletProvider>
  );
}

export default App;