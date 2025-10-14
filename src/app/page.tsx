'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useRef } from 'react';
import Header from '@/components/header';
import { usePurchaseDetails } from '@/lib/purchase/hooks';

export default function Home() {
  const t = useTranslations('home');
  const router = useRouter();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { data: purchaseDetails, isLoading } = usePurchaseDetails();
  const shouldRedirect = useRef(false);

  // Redirect to purchase page after wallet connects
  useEffect(() => {
    if (connected && shouldRedirect.current) {
      router.push('/purchase');
      shouldRedirect.current = false;
    }
  }, [connected, router]);

  // Handle buy button click
  const handleBuyClick = () => {
    if (connected) {
      // Already connected, go to purchase page
      router.push('/purchase');
    } else {
      // Not connected, trigger wallet modal and set redirect flag
      shouldRedirect.current = true;
      setVisible(true);
    }
  };

  // Calculate min and max tiers
  const minTier = purchaseDetails?.tiers?.[0] || 1000;
  const maxTier = purchaseDetails?.tiers?.[purchaseDetails.tiers.length - 1] || 5000;
  const rate = purchaseDetails?.rate || '0.003';

  // Format rate number
  const displayRate = typeof rate === 'string' ? parseFloat(rate) : rate;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900">
      <div className="container mx-auto px-4 py-6">
        <Header />

        {/* Main Content */}
        <main className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          {/* Logo Section */}
          <div className="text-center mb-12">
            {/* Coin Logo */}
            <div className="mb-8 flex justify-center">
              <Image
                src="/images/coin.png"
                alt="HOOPX Coin"
                width={200}
                height={200}
                className="w-48 h-48 object-contain"
                priority
              />
            </div>

            {/* Brand Logo */}
            <div className="mb-6">
              <Image
                src="/images/brand-logo.png"
                alt="HOOPX"
                width={200}
                height={60}
                className="w-auto h-12 object-contain mx-auto"
              />
            </div>

            {/* Title */}
            <h1 className="text-white text-2xl font-medium mb-12">
              {t('title')}
            </h1>
          </div>

          {/* Exchange Rate Display */}
          <div className="w-full mb-12 text-center">
            <p className="text-white/70 text-sm mb-3">{t('presalePrice')}</p>
            {isLoading ? (
              <p className="text-cyan-400 text-7xl font-bold mb-2">...</p>
            ) : (
              <p className="text-cyan-400 text-7xl font-bold mb-2">
                {displayRate}
              </p>
            )}
            <p className="text-white text-lg">{t('exchangeRate')}</p>
          </div>

          {/* Buy Button */}
          <button
            onClick={handleBuyClick}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold text-xl py-5 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg mb-4 cursor-pointer"
          >
            {t('buyNow')}
          </button>

          {/* Purchase Range */}
          <p className="text-white/70 text-sm text-center">
            {isLoading ? (
              '...'
            ) : (
              <>
                {minTier}-{maxTier}USDT {t('purchaseRange')}
              </>
            )}
          </p>
        </main>
      </div>
    </div>
  );
}
