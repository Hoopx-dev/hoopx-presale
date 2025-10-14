'use client';

import { useTranslations } from 'next-intl';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import Header from '@/components/header';
import { usePurchaseDetails, usePurchaseSession } from '@/lib/purchase/hooks';
import { useUIStore } from '@/lib/store/useUIStore';
import { IoCheckmarkCircle } from 'react-icons/io5';

export default function PurchasePage() {
  const t = useTranslations('purchase');
  const tPresale = useTranslations('presale');
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { data: purchaseDetails, isLoading: detailsLoading } = usePurchaseDetails();
  const { data: purchaseSession } = usePurchaseSession(publicKey?.toBase58());
  const { selectedTier, setSelectedTier } = useUIStore();

  // Redirect if not connected
  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  // Calculate HOOPX amount based on selected tier and rate
  const hoopxAmount = useMemo(() => {
    if (!selectedTier || !purchaseDetails?.rate) return 0;
    const rate = typeof purchaseDetails.rate === 'string'
      ? parseFloat(purchaseDetails.rate)
      : purchaseDetails.rate;
    return selectedTier / rate;
  }, [selectedTier, purchaseDetails?.rate]);

  // Get available tiers from API
  const tiers = useMemo(() => {
    if (!purchaseDetails) return [1000, 2000, 3000, 4000, 5000];
    const tierData = purchaseDetails.tiers || purchaseDetails.tierList || [];
    return tierData.map(t => typeof t === 'string' ? parseInt(t) : t);
  }, [purchaseDetails]);

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  // Check if wallet already purchased
  const alreadyPurchased = purchaseSession?.purchaseStatus === 1;

  const displayRate = useMemo(() => {
    if (!purchaseDetails?.rate) return '0.003';
    return typeof purchaseDetails.rate === 'string'
      ? purchaseDetails.rate
      : purchaseDetails.rate.toString();
  }, [purchaseDetails?.rate]);

  const maxTier = Math.max(...tiers);

  if (!connected) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900">
      <div className="container mx-auto px-4 py-6">
        <Header />

        <main className="max-w-md mx-auto">
          {/* Title */}
          <h1 className="text-white text-2xl font-bold mb-6 text-center">
            {t('title')}
          </h1>

          {/* Tier Selection Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {tiers.map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                disabled={alreadyPurchased || detailsLoading}
                className={`
                  relative py-4 px-3 rounded-xl font-bold text-base transition-all
                  ${selectedTier === tier
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                  }
                  ${alreadyPurchased ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {formatNumber(tier)}
                {selectedTier === tier && (
                  <IoCheckmarkCircle className="absolute top-2 right-2 text-purple-900 text-xl" />
                )}
              </button>
            ))}
          </div>

          {/* Already Purchased Warning */}
          {alreadyPurchased && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm text-center">
                {t('alreadyPurchased')}
              </p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="space-y-3 mb-6">
            {/* Current Price */}
            <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
              <span className="text-white/70 text-sm">{t('currentPrice')}</span>
              <span className="text-white font-bold text-lg">
                {detailsLoading ? '...' : displayRate}
              </span>
            </div>

            {/* Purchase Limit */}
            <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
              <span className="text-white/70 text-sm">{t('purchaseLimit')}</span>
              <span className="text-white font-bold text-lg">
                {detailsLoading ? '...' : `${formatNumber(maxTier)} USDT`}
              </span>
            </div>

            {/* Current Assets */}
            <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
              <span className="text-white/70 text-sm">{t('currentAssets')}</span>
              <span className="text-white font-bold text-lg">
                {purchaseSession?.purchasedAmount
                  ? `${formatNumber(purchaseSession.purchasedAmount)} HOOPX`
                  : '0 HOOPX'
                }
              </span>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="bg-white/10 rounded-xl p-5 mb-6">
            <h2 className="text-white font-bold text-lg mb-4">{t('purchaseDetails')}</h2>

            <div className="space-y-3">
              {/* HOOPX to Receive */}
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">{t('hoopxReceive')}</span>
                <span className="text-cyan-400 font-bold text-lg">
                  {selectedTier ? formatNumber(hoopxAmount) : '0'}
                </span>
              </div>

              {/* Vesting Period */}
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">{t('vestingPeriod')}</span>
                <span className="text-white font-medium">
                  {detailsLoading ? '...' : `${purchaseDetails?.vesting || '12'} ${t('months')}`}
                </span>
              </div>

              {/* Cliff Period */}
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">{t('cliffPeriod')}</span>
                <span className="text-white font-medium">
                  {detailsLoading ? '...' : `${purchaseDetails?.cliff || '3'} ${t('months')}`}
                </span>
              </div>

              {/* Release Frequency */}
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">{t('releaseFrequency')}</span>
                <span className="text-white font-medium">
                  {detailsLoading ? '...' : (purchaseDetails?.vestingFrequency || t('monthly'))}
                </span>
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <button
            disabled={!selectedTier || alreadyPurchased || detailsLoading}
            className={`
              w-full py-5 px-6 rounded-2xl font-bold text-xl transition-all duration-200
              ${!selectedTier || alreadyPurchased || detailsLoading
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 cursor-pointer transform hover:scale-105 shadow-lg'
              }
            `}
          >
            {selectedTier
              ? `${t('buyButton')} - ${formatNumber(selectedTier)} USDT`
              : t('selectAmount')
            }
          </button>

          {/* Note */}
          <p className="text-white/50 text-xs text-center mt-4">
            {t('note')}
          </p>
        </main>
      </div>
    </div>
  );
}
