'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useRef, Suspense } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { usePurchaseDetails, usePurchaseSession } from '@/lib/purchase/hooks';
import { useReferralStore } from '@/lib/store/useReferralStore';

function HomeContent() {
  const t = useTranslations('home');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { data: purchaseDetails, isLoading } = usePurchaseDetails();
  const { data: purchaseSession } = usePurchaseSession(publicKey?.toBase58());
  const { setReferralAddress } = useReferralStore();
  const shouldRedirect = useRef(false);

  // Track current page for terms modal logic
  useEffect(() => {
    sessionStorage.setItem('hoopx-current-page', 'home');
  }, []);

  // Read referral parameter from URL and store it
  useEffect(() => {
    const referralParam = searchParams.get('referral');
    if (referralParam) {
      setReferralAddress(referralParam);
    }
  }, [searchParams, setReferralAddress]);

  // Redirect to purchase or portfolio page after wallet connects
  useEffect(() => {
    if (connected && shouldRedirect.current) {
      // Check if wallet already purchased
      if (purchaseSession?.purchaseStatus === 1) {
        router.push('/portfolio');
      } else {
        router.push('/purchase');
      }
      shouldRedirect.current = false;
    }
  }, [connected, purchaseSession, router]);

  // Handle buy button click
  const handleBuyClick = () => {
    if (connected) {
      // Already connected, check if purchased
      if (purchaseSession?.purchaseStatus === 1) {
        router.push('/portfolio');
      } else {
        router.push('/purchase');
      }
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

  // Remove trailing zeros without rounding
  const displayRate = typeof rate === 'string'
    ? parseFloat(rate).toString()
    : rate.toString();

  return (
    <div className="min-h-screen">
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
          <Button
            variant="primary"
            size="large"
            onClick={handleBuyClick}
            className="w-full mb-4"
          >
            {t('buyNow')}
          </Button>

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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
