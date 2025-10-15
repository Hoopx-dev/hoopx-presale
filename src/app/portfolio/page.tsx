'use client';

import { useTranslations } from 'next-intl';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/header';
import { usePurchaseDetails, usePurchaseSession } from '@/lib/purchase/hooks';
import { useTransactionHistory } from '@/lib/solana/hooks';
import { formatAddress, getExplorerUrl } from '@/lib/solana/transactions';
import { IoArrowUpCircle } from 'react-icons/io5';

export default function PortfolioPage() {
  const t = useTranslations('portfolio');
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { data: purchaseDetails } = usePurchaseDetails();
  const { data: purchaseSession, isLoading } = usePurchaseSession(publicKey?.toBase58());

  // Tab state: 'purchase' or 'transactions'
  const [activeTab, setActiveTab] = useState<'purchase' | 'transactions'>('purchase');

  // Fetch transaction history
  const { data: transactions, isLoading: transactionsLoading } = useTransactionHistory(
    publicKey?.toBase58(),
    purchaseDetails?.hoopxWalletAddress
  );

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

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  // Format timestamp to time string (HH:MM AM/PM)
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    if (!transactions) return {};

    const groups: Record<string, typeof transactions> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    transactions.forEach((tx) => {
      const txDate = new Date(tx.timestamp * 1000);
      txDate.setHours(0, 0, 0, 0);

      let label: string;
      if (txDate.getTime() === today.getTime()) {
        label = t('today');
      } else if (txDate.getTime() === yesterday.getTime()) {
        label = t('yesterday');
      } else {
        label = txDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(tx);
    });

    return groups;
  }, [transactions, t]);

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
            <button
              onClick={() => setActiveTab('purchase')}
              className={`flex-1 pb-3 font-medium transition-colors ${
                activeTab === 'purchase'
                  ? 'text-white border-b-2 border-yellow-500'
                  : 'text-white/50'
              }`}
            >
              {t('purchaseDetails')}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 pb-3 font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'text-white border-b-2 border-yellow-500'
                  : 'text-white/50'
              }`}
            >
              {t('transferRecords')}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'purchase' && (
            <>
              {/* Purchase Card */}
              <div className="bg-white/10 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="/images/token-badge.png"
                    alt="HOOPX"
                    width={48}
                    height={48}
                    className="w-12 h-12"
                  />
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">HOOPX</p>
                    <p className="text-white/70 text-sm">
                      {purchaseSession?.rate || '0.003'} USDT
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">
                      {formatNumber(purchaseSession?.purchasedAmount)} USDT
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
                    {purchaseSession?.vesting || '12'} {t('months')}
                  </span>
                </div>

                {/* Cliff Period */}
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">{t('cliffPeriod')}</span>
                  <span className="text-white font-medium text-sm">
                    {purchaseSession?.cliff || '3'} {t('months')}
                  </span>
                </div>

                {/* Release Frequency */}
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">{t('releaseFrequency')}</span>
                  <span className="text-white font-medium text-sm">
                    {purchaseSession?.vestingFrequency === '1'
                      ? t('perMonth')
                      : t('per3Months')}
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {transactionsLoading && (
                <p className="text-white/50 text-center py-8">{t('loadingTransactions')}</p>
              )}

              {!transactionsLoading && transactions && transactions.length === 0 && (
                <p className="text-white/50 text-center py-8">{t('noTransactions')}</p>
              )}

              {!transactionsLoading && Object.keys(groupedTransactions).length > 0 && (
                <>
                  {Object.entries(groupedTransactions).map(([date, txs]) => (
                    <div key={date}>
                      {/* Date Header */}
                      <h3 className="text-white text-sm mb-3">{date}</h3>

                      {/* Transaction List */}
                      <div className="space-y-3">
                        {txs.map((tx) => (
                          <a
                            key={tx.signature}
                            href={getExplorerUrl(tx.signature)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white/10 rounded-2xl p-4 hover:bg-white/15 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {/* Status Icon */}
                              <div className="flex-shrink-0 w-10 h-10 bg-purple-600/50 rounded-full flex items-center justify-center">
                                <IoArrowUpCircle className="text-white text-xl" />
                              </div>

                              {/* Transaction Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white font-medium text-sm">USDT</span>
                                  <span className="text-white/50 text-xs px-2 py-0.5 bg-white/10 rounded">
                                    {t('transferred')}
                                  </span>
                                </div>
                                <p className="text-white/50 text-xs">
                                  {t('to')}: {formatAddress(tx.to)}
                                </p>
                              </div>

                              {/* Amount and Time */}
                              <div className="text-right flex-shrink-0">
                                <p className="text-red-400 font-bold text-base mb-1">
                                  -{formatNumber(tx.amount)} USDT
                                </p>
                                <p className="text-white/50 text-xs">
                                  {formatTime(tx.timestamp)}
                                </p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* End message */}
                  <p className="text-white/50 text-center text-sm py-4">
                    {t('noTransactions')}
                  </p>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
