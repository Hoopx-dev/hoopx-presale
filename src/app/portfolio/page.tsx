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

// Wrapper component that handles date grouping logic
function TransactionItemWithGrouping({
  order,
  prevOrder,
  index,
  t,
  getDateLabel,
  isSameDate
}: {
  order: OrderVO;
  prevOrder: OrderVO | null;
  index: number;
  t: (key: string) => string;
  getDateLabel: (timestamp: number) => string;
  isSameDate: (t1: number, t2: number) => boolean;
}) {
  const { data: transaction, isLoading: txLoading } = useTransaction(order.trxId);
  const { data: prevTransaction } = useTransaction(prevOrder?.trxId);

  if (txLoading) {
    return (
      <div className="text-white/50 text-center py-4">
        {t('loadingTransactions')}
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-white/50 text-center py-4">
        {t('noTransactions')}
      </div>
    );
  }

  // Show date header if:
  // 1. First transaction (index === 0), OR
  // 2. Previous transaction exists and dates are different
  const showDateHeader =
    index === 0 ||
    (prevTransaction && !isSameDate(transaction.timestamp, prevTransaction.timestamp));

  return (
    <div>
      {/* Date Header - show if first transaction or date changed from previous */}
      {showDateHeader && (
        <h3 className="text-white text-sm mb-3 mt-4">
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
  const { connected, connecting, publicKey } = useWallet();
  const { data: purchaseSession, isLoading } = usePurchaseSession(publicKey?.toBase58());
  const { data: purchaseDetails } = usePurchaseDetails();

  // Tab state: 'purchase' or 'transactions'
  const [activeTab, setActiveTab] = useState<'purchase' | 'transactions'>('purchase');

  // Collapsible state: track which order's details are expanded (by index)
  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number>(0);

  // Mounted state to prevent redirect during initial wallet reconnection
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    // Don't redirect on initial mount - give wallet time to reconnect
    if (!mounted) return;

    // Wait for wallet to finish connecting/reconnecting before redirecting
    if (connecting) return;

    // Only redirect if truly disconnected (not just reconnecting on page refresh)
    if (!connected) {
      router.push('/');
    } else if (!isLoading && successfulOrders.length === 0) {
      router.push('/'); // Rule #2: Empty session redirects to homepage
    }
  }, [mounted, connected, connecting, successfulOrders, isLoading, router]);

  // Calculate total HOOPX amount from all successful orders (round down)
  const totalHoopxAmount = useMemo(() => {
    const total = successfulOrders.reduce((sum, order) => {
      return sum + (order.amount / order.rate);
    }, 0);
    // Round down to 2 decimals if >= 100, otherwise 6 decimals
    const decimals = total >= 100 ? 2 : 6;
    const multiplier = Math.pow(10, decimals);
    return Math.floor(total * multiplier) / multiplier;
  }, [successfulOrders]);

  const formatTokenAmount = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    // If amount >= 100, round down to 2 decimals, otherwise round down to 6 decimals
    const decimals = num >= 100 ? 2 : 6;
    const multiplier = Math.pow(10, decimals);
    const roundedDown = Math.floor(num * multiplier) / multiplier;

    // Format with proper decimal places without rounding
    const [intPart, decPart = ''] = roundedDown.toFixed(decimals).split('.');
    const formattedInt = parseInt(intPart).toLocaleString('en-US');
    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
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

  // Helper to check if two timestamps are on the same date
  const isSameDate = (timestamp1: number, timestamp2: number) => {
    const date1 = new Date(timestamp1 * 1000);
    const date2 = new Date(timestamp2 * 1000);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    return date1.getTime() === date2.getTime();
  };

  // Show loading while wallet is connecting/reconnecting or not mounted
  if (!mounted || connecting || (!connected && successfulOrders.length === 0)) {
    return null; // Will redirect or still connecting
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
                              if (freq === 1) return t('perMonth');
                              // Use translation keys for different frequencies
                              const key = `per${freq}Months` as const;
                              return t(key, { defaultValue: `/${freq}${t('months')}` });
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
                  className="w-full mt-6 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity border border-yellow-500"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-2xl">•</span>
                    <span className="text-white font-medium">{t('newPresaleAvailable')}</span>
                  </div>
                  <span className="text-yellow-500 font-bold text-lg">{t('buyNowButton')}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {/* Transaction Cards - one per successful order */}
              {successfulOrders.map((order, index) => {
                // For grouping, we need to load the previous transaction to compare dates
                const prevOrder = index > 0 ? successfulOrders[index - 1] : null;

                return (
                  <TransactionItemWithGrouping
                    key={order.trxId || index}
                    order={order}
                    prevOrder={prevOrder}
                    index={index}
                    t={t}
                    getDateLabel={getDateLabel}
                    isSameDate={isSameDate}
                  />
                );
              })}

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
