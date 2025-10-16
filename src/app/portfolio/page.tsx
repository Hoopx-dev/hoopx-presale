'use client';

import { useTranslations } from 'next-intl';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/header';
import PurchaseCard from '@/components/ui/purchase-card';
import TransactionCard from '@/components/ui/transaction-card';
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

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
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
              {formatNumber(hoopxAmount)}
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
                tokenPrice={purchaseSession?.rate?.toString() || '0.003'}
                amount={purchaseSession?.purchasedAmount || 0}
                tokenAmount={hoopxAmount}
                className="mb-6"
              />

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
                    {(() => {
                      const freq = parseInt(purchaseSession?.vestingFrequency || '1');
                      return freq === 1 ? t('perMonth') : `/${freq}${t('months')}`;
                    })()}
                  </span>
                </div>
              </div>
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
