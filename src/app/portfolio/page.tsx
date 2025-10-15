'use client';

import { useTranslations } from 'next-intl';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import Header from '@/components/header';
import { usePurchaseDetails, usePurchaseSession } from '@/lib/purchase/hooks';

export default function PortfolioPage() {
  const t = useTranslations('portfolio');
  const tPresale = useTranslations('presale');
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { data: purchaseDetails } = usePurchaseDetails();
  const { data: purchaseSession, isLoading } = usePurchaseSession(publicKey?.toBase58());

  // Redirect if not connected or no purchase
  useEffect(() => {
    if (!connected) {
      router.push('/');
    } else if (!isLoading && (!purchaseSession || purchaseSession.purchaseStatus !== 1)) {
      router.push('/purchase');
    }
  }, [connected, purchaseSession, isLoading, router]);

  // Calculate HOOPX amount
  const hoopxAmount = useMemo(() => {
    if (!purchaseSession?.purchasedAmount || !purchaseSession?.rate) return 0;
    return purchaseSession.purchasedAmount / purchaseSession.rate;
  }, [purchaseSession]);

  const formatNumber = (num: number) => num.toLocaleString('en-US', { maximumFractionDigits: 2 });

  if (!connected || !purchaseSession) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900">
      <div className="container mx-auto px-4 py-6">
        <Header />

        <main className="max-w-md mx-auto">
          {/* Total Assets */}
          <div className="text-center mb-8">
            <p className="text-white/70 text-sm mb-2">{t('totalAssets')}</p>
            <p className="text-white text-6xl font-bold mb-1">
              {formatNumber(hoopxAmount)}
            </p>
            <p className="text-white text-xl">HOOPX</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/20 mb-6">
            <button className="flex-1 pb-3 text-white font-medium border-b-2 border-yellow-500">
              {t('purchaseDetails')}
            </button>
            <button className="flex-1 pb-3 text-white/50 font-medium">
              {t('transferRecords')}
            </button>
          </div>

          {/* Purchase Card */}
          <div className="bg-white/10 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/coin.png"
                alt="HOOPX"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <div className="flex-1">
                <p className="text-white font-bold text-lg">HOOPX</p>
                <p className="text-white/70 text-sm">
                  {purchaseSession.rate} USDT
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">
                  {formatNumber(purchaseSession.purchasedAmount)} USDT
                </p>
                <p className="text-cyan-400 text-sm">
                  {formatNumber(hoopxAmount)} HOOPX
                </p>
              </div>
            </div>
          </div>

          {/* Purchase Info */}
          <div className="space-y-3">
            {/* Purchase Time */}
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">{t('purchaseTime')}</span>
              <span className="text-white font-medium text-sm">
                {purchaseDetails?.startTime || '2025-10-20 18:00'}
              </span>
            </div>

            {/* Purchase Status */}
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">{t('purchaseStatus')}</span>
              <span className="text-white font-medium text-sm">
                {t('notReleased')}
              </span>
            </div>

            {/* Vesting Period */}
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">{t('vestingPeriod')}</span>
              <span className="text-white font-medium text-sm">
                {purchaseSession.vesting} {t('months')}
              </span>
            </div>

            {/* Cliff Period */}
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">{t('cliffPeriod')}</span>
              <span className="text-white font-medium text-sm">
                {purchaseSession.cliff} {t('months')}
              </span>
            </div>

            {/* Release Frequency */}
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">{t('releaseFrequency')}</span>
              <span className="text-white font-medium text-sm">
                {purchaseSession.vestingFrequency || t('monthly')}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
