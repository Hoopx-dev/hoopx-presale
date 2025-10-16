'use client';

import { useTranslations } from 'next-intl';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/header';
import PurchaseCard from '@/components/ui/purchase-card';
import TransactionCard from '@/components/ui/transaction-card';
import InfoListCard from '@/components/ui/info-list-card';
import { usePurchaseDetails, usePurchaseSession } from '@/lib/purchase/hooks';
import { useTransaction } from '@/lib/solana/hooks';
import { getExplorerUrl } from '@/lib/solana/transactions';

export default function PortfolioPage() {
  const t = useTranslations('portfolio');
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { data: purchaseDetails } = usePurchaseDetails();
  const { data: purchaseSession, isLoading } = usePurchaseSession(publicKey?.toBase58());

  // Tab state: 'purchase' or 'transactions'
  const [activeTab, setActiveTab] = useState<'purchase' | 'transactions'>('purchase');

  // Fetch the specific transaction from the session using just the trxId
  const { data: transaction, isLoading: transactionLoading } = useTransaction(
    purchaseSession?.trxId
  );

  // Track current page for terms modal logic
  useEffect(() => {
    sessionStorage.setItem('hoopx-current-page', 'portfolio');
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('[Portfolio] Transaction query params:');
    console.log('  - trxId:', purchaseSession?.trxId);
    console.log('  - isLoading:', transactionLoading);
    console.log('  - transaction:', transaction);
    if (transaction) {
      console.log('  - tokenSymbol:', transaction.tokenSymbol);
      console.log('  - tokenLogo:', transaction.tokenLogo);
      console.log('  - tokenMint:', transaction.tokenMint);
      console.log('  - amount:', transaction.amount);
      console.log('  - to:', transaction.to);
    }
  }, [purchaseSession?.trxId, transactionLoading, transaction]);

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

  if (!connected || !purchaseSession) {
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
              {formatTokenAmount(hoopxAmount)}
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
            <>
              {/* Purchase Card */}
              <PurchaseCard
                logo="/images/token-badge.png"
                tokenName="HOOPX"
                tokenPrice={
                  purchaseSession?.rate
                    ? (typeof purchaseSession.rate === 'string'
                        ? parseFloat(purchaseSession.rate)
                        : purchaseSession.rate
                      ).toString()
                    : '0.003'
                }
                amount={purchaseSession?.purchasedAmount || 0}
                tokenAmount={hoopxAmount}
                className="mb-6"
              />

              {/* Purchase Info */}
              <InfoListCard
                items={[
                  {
                    label: t('purchaseTime'),
                    value: purchaseDetails?.startTime || '2025-10-20 18:00',
                  },
                  {
                    label: t('purchaseStatus'),
                    value: t('notReleased'),
                  },
                  {
                    label: t('vestingPeriod'),
                    value: `${purchaseSession?.vesting || '12'} ${t('months')}`,
                  },
                  {
                    label: t('cliffPeriod'),
                    value: `${purchaseSession?.cliff || '3'} ${t('months')}`,
                  },
                  {
                    label: t('releaseFrequency'),
                    value: (() => {
                      const freq = parseInt(purchaseSession?.vestingFrequency || '1');
                      return freq === 1 ? t('perMonth') : `/${freq}${t('months')}`;
                    })(),
                  },
                ]}
              />
            </>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {transactionLoading && (
                <p className="text-white/50 text-center py-8">{t('loadingTransactions')}</p>
              )}

              {!transactionLoading && !transaction && (
                <p className="text-white/50 text-center py-8">{t('noTransactions')}</p>
              )}

              {!transactionLoading && transaction && (
                <>
                  {/* Date Header */}
                  <h3 className="text-white text-sm mb-3">
                    {getDateLabel(transaction.timestamp)}
                  </h3>

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
