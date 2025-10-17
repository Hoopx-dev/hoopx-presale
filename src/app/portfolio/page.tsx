'use client';

import { useTranslations } from 'next-intl';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/header';
import PurchaseCard from '@/components/ui/purchase-card';
import TransactionCard from '@/components/ui/transaction-card';
import InfoListCard from '@/components/ui/info-list-card';
import { Button } from '@/components/ui/button';
import { usePurchaseSession, usePurchaseDetails } from '@/lib/purchase/hooks';
import { useTransaction } from '@/lib/solana/hooks';
import { getExplorerUrl } from '@/lib/solana/transactions';
import type { OrderVO } from '@/lib/purchase/types';

// Component for rendering individual transaction
function TransactionItem({ order, index, t, getDateLabel }: {
  order: OrderVO;
  index: number;
  t: (key: string) => string;
  getDateLabel: (timestamp: number) => string;
}) {
  const { data: transaction, isLoading: txLoading } = useTransaction(order.trxId);

  if (txLoading) {
    return (
      <div key={order.trxId || index} className="text-white/50 text-center py-4">
        {t('loadingTransactions')}
      </div>
    );
  }

  if (!transaction) {
    return (
      <div key={order.trxId || index} className="text-white/50 text-center py-4">
        {t('noTransactions')}
      </div>
    );
  }

  return (
    <div>
      {/* Date Header */}
      {index === 0 && (
        <h3 className="text-white text-sm mb-3">
          {getDateLabel(transaction.timestamp)}
        </h3>
      )}

      {/* Transaction Card */}
      <TransactionCard
        logo={transaction.tokenLogo || ''}
        tokenSymbol={transaction.tokenSymbol}
        amount={transaction.amount}
        address={transaction.to}
        timestamp={transaction.timestamp}
        statusLabel={t('transferred')}
        isOutgoing={true}
        onClick={() => window.open(getExplorerUrl(transaction.signature), '_blank')}
      />
    </div>
  );
}

export default function PortfolioPage() {
  const t = useTranslations('portfolio');
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { data: purchaseSession, isLoading } = usePurchaseSession(publicKey?.toBase58());
  const { data: purchaseDetails } = usePurchaseDetails();

  // Tab state: 'purchase' or 'transactions'
  const [activeTab, setActiveTab] = useState<'purchase' | 'transactions'>('purchase');

  // Collapsible state: track which order's details are expanded (by index)
  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number>(0);

  // Get all successful orders from orderVoList
  const successfulOrders = useMemo(() => {
    return purchaseSession?.orderVoList?.filter(order => order.purchaseStatus === 1) || [];
  }, [purchaseSession]);

  // Check if user has purchased current active activity
  const hasPurchasedCurrentActivity = useMemo(() => {
    if (!purchaseDetails?.activityId) return false;
    return successfulOrders.some(order => order.activityId === purchaseDetails.activityId);
  }, [successfulOrders, purchaseDetails]);

  // Track current page for terms modal logic
  useEffect(() => {
    sessionStorage.setItem('hoopx-current-page', 'portfolio');
  }, []);

  // Redirect if not connected or no purchase (Rules #1, #2)
  useEffect(() => {
    if (!connected) {
      router.push('/');
    } else if (!isLoading && successfulOrders.length === 0) {
      router.push('/'); // Rule #2: Empty session redirects to homepage
    }
  }, [connected, successfulOrders, isLoading, router]);

  // Calculate total HOOPX amount from all successful orders
  const totalHoopxAmount = useMemo(() => {
    return successfulOrders.reduce((total, order) => {
      return total + (order.amount / order.rate);
    }, 0);
  }, [successfulOrders]);

  const formatTokenAmount = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    // If amount >= 100, round down to 2 decimals, otherwise round down to 6 decimals
    const decimals = num >= 100 ? 2 : 6;
    const multiplier = Math.pow(10, decimals);
    const roundedDown = Math.floor(num * multiplier) / multiplier;
    return roundedDown.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  };

  // Get date label for transaction
  const getDateLabel = (timestamp: number) => {
    const txDate = new Date(timestamp * 1000);
    txDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (txDate.getTime() === today.getTime()) {
      return t('today');
    } else if (txDate.getTime() === yesterday.getTime()) {
      return t('yesterday');
    } else {
      return txDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  if (!connected || successfulOrders.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Header />

        <main className="max-w-md mx-auto">
          {/* Total Assets */}
          <div className="text-center mb-8">
            <p className="text-white/70 text-sm mb-2">{t('totalAssets')}</p>
            <p className="text-white text-6xl font-bold mb-1">
              {formatTokenAmount(totalHoopxAmount)}
            </p>
            <p className="text-white text-xl">HOOPX</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/20 mb-6">
            <button
              onClick={() => setActiveTab('purchase')}
              className={`flex-1 pb-3 font-medium transition-colors cursor-pointer ${
                activeTab === 'purchase'
                  ? 'text-white border-b-2 border-yellow-500'
                  : 'text-white/50'
              }`}
            >
              {t('purchaseDetails')}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 pb-3 font-medium transition-colors cursor-pointer ${
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
            <div className="space-y-4">
              {/* Purchase Cards - one per successful order */}
              {successfulOrders.map((order, index) => {
                const orderHoopxAmount = order.amount / order.rate;
                const isExpanded = expandedOrderIndex === index;

                return (
                  <div key={order.trxId || index}>
                    {/* Purchase Card - clickable to toggle details */}
                    <div
                      onClick={() => setExpandedOrderIndex(isExpanded ? -1 : index)}
                      className="cursor-pointer"
                    >
                      <PurchaseCard
                        logo="/images/token-badge.png"
                        activityName={order.activityName}
                        tokenSymbol="HOOPX"
                        tokenPrice={
                          order.rate
                            ? (typeof order.rate === 'string'
                                ? parseFloat(order.rate)
                                : order.rate
                              ).toString()
                            : '0.003'
                        }
                        amount={order.amount}
                        tokenAmount={orderHoopxAmount}
                        className="mb-2"
                      />
                    </div>

                    {/* Collapsible Purchase Details */}
                    {isExpanded && (
                      <InfoListCard
                        items={[
                          {
                            label: t('purchaseTime'),
                            value: order.subscriptionTime || '-',
                          },
                          {
                            label: t('purchaseStatus'),
                            value: t('notReleased'),
                          },
                          {
                            label: t('vestingPeriod'),
                            value: `${order.vesting || '12'} ${t('months')}`,
                          },
                          {
                            label: t('cliffPeriod'),
                            value: `${order.cliff || '3'} ${t('months')}`,
                          },
                          {
                            label: t('releaseFrequency'),
                            value: (() => {
                              const freq = parseInt(order.vestingFrequency || '1');
                              return freq === 1 ? t('perMonth') : `/${freq}${t('months')}`;
                            })(),
                          },
                        ]}
                        className="mb-4"
                      />
                    )}
                  </div>
                );
              })}

              {/* Buy Button for Current Activity (if not purchased) */}
              {purchaseDetails && !hasPurchasedCurrentActivity && (
                <div
                  onClick={() => router.push('/purchase')}
                  className="w-full mt-6 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity border border-orange-500"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-2xl">•</span>
                    <span className="text-white font-medium">New presale available!</span>
                  </div>
                  <span className="text-orange-500 font-bold text-lg">BUY NOW</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {/* Transaction Cards - one per successful order */}
              {successfulOrders.map((order, index) => (
                <TransactionItem
                  key={order.trxId || index}
                  order={order}
                  index={index}
                  t={t}
                  getDateLabel={getDateLabel}
                />
              ))}

              {/* End message */}
              {successfulOrders.length > 0 && (
                <p className="text-white/50 text-center text-sm py-4">
                  {t('noTransactions')}
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
