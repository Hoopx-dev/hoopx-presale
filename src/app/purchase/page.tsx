'use client';

import { useTranslations } from 'next-intl';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/header';
import ConfirmationModal from '@/components/confirmation-modal';
import TransactionStatusModal from '@/components/transaction-status-modal';
import Toast, { ToastType } from '@/components/toast';
import { usePurchaseDetails, usePurchaseSession, useRegisterPurchase } from '@/lib/purchase/hooks';
import { useUIStore } from '@/lib/store/useUIStore';
import { transferUSDT, getEstimatedFee, createSolanaConnection } from '@/lib/solana/transfer';
import { IoCheckmarkCircle } from 'react-icons/io5';

export default function PurchasePage() {
  const t = useTranslations('purchase');
  const tPresale = useTranslations('presale');
  const router = useRouter();
  const { connected, publicKey, signTransaction } = useWallet();
  const { data: purchaseDetails, isLoading: detailsLoading } = usePurchaseDetails();
  const { data: purchaseSession, isLoading: sessionLoading } = usePurchaseSession(publicKey?.toBase58());
  const { selectedTier, setSelectedTier } = useUIStore();
  const registerMutation = useRegisterPurchase();

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'sending' | 'success'>('sending');
  const [transactionId, setTransactionId] = useState<string>('');
  const [estimatedFee, setEstimatedFee] = useState(0.00001);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const [showToast, setShowToast] = useState(false);

  const showToastNotification = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Redirect if not connected
  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  // Redirect if already purchased
  useEffect(() => {
    if (!sessionLoading && purchaseSession?.purchaseStatus === 1) {
      router.push('/portfolio');
    }
  }, [purchaseSession, sessionLoading, router]);

  // Get estimated fee
  useEffect(() => {
    if (connected && publicKey && purchaseDetails?.hoopxWalletAddress) {
      const connection = createSolanaConnection();
      getEstimatedFee(
        connection,
        purchaseDetails.hoopxWalletAddress,
        publicKey
      ).then(setEstimatedFee);
    }
  }, [connected, publicKey, purchaseDetails?.hoopxWalletAddress]);

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

  const rateNumber = useMemo(() => {
    if (!purchaseDetails?.rate) return 0.003;
    return typeof purchaseDetails.rate === 'string'
      ? parseFloat(purchaseDetails.rate)
      : purchaseDetails.rate;
  }, [purchaseDetails?.rate]);

  const maxTier = Math.max(...tiers);

  // Handle buy button click
  const handleBuyClick = () => {
    if (!selectedTier || alreadyPurchased) return;
    setShowConfirmModal(true);
  };

  // Handle transaction confirmation
  const handleConfirmTransfer = async () => {
    if (!selectedTier || !publicKey || !signTransaction || !purchaseDetails?.hoopxWalletAddress) {
      showToastNotification('Missing required data for transfer', 'error');
      return;
    }

    try {
      // Close confirmation modal (Phantom wallet will open)
      setShowConfirmModal(false);

      // Create connection
      const connection = createSolanaConnection();

      // Execute transfer - this will open Phantom wallet
      // Only show sending modal AFTER user confirms in wallet
      const result = await transferUSDT(
        connection,
        publicKey,
        purchaseDetails.hoopxWalletAddress,
        selectedTier,
        signTransaction
      );

      // If user cancelled in wallet, result will have success: false
      if (!result.success) {
        throw new Error(result.error || 'Transfer failed');
      }

      // Transaction signed! Now show sending status
      setTransactionStatus('sending');
      setShowStatusModal(true);

      // Store transaction ID
      setTransactionId(result.signature);

      // Register purchase in backend
      await registerMutation.mutateAsync({
        publicKey: publicKey.toBase58(),
        amount: selectedTier,
        trxId: result.signature,
        activityId: purchaseDetails.activityId,
      });

      // Show success status
      setTransactionStatus('success');
    } catch (error: any) {
      // Close status modal on error (if it was opened)
      setShowStatusModal(false);

      // Handle different error types with user-friendly messages
      const errorMessage = error.message || 'Unknown error';

      if (errorMessage.includes('User rejected') || errorMessage.includes('cancelled')) {
        // User cancelled transaction - show info toast
        showToastNotification('Transaction cancelled', 'info');
      } else if (errorMessage.includes('do not have a USDT account')) {
        // User doesn't have USDT token account
        showToastNotification('No USDT account found. Please get USDT first.', 'error');
      } else if (errorMessage.includes('Insufficient USDT balance')) {
        // User doesn't have enough USDT - show the actual balance
        showToastNotification(errorMessage, 'error');
      } else if (errorMessage.includes('Insufficient')) {
        // Generic insufficient balance
        showToastNotification('Insufficient balance to complete transaction', 'error');
      } else if (errorMessage.includes('Network')) {
        showToastNotification('Network error. Please try again', 'error');
      } else {
        // Generic error
        showToastNotification('Transaction failed. Please try again', 'error');
      }
    }
  };

  if (!connected || alreadyPurchased) {
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
                  relative py-4 px-3 rounded-xl font-bold text-2xl transition-all text-white
                  ${selectedTier === tier
                    ? 'border-2 border-green-400'
                    : 'border border-white/30 hover:border-white/50'
                  }
                  ${alreadyPurchased ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {formatNumber(tier)}
                {selectedTier === tier && (
                  <IoCheckmarkCircle className="absolute top-2 left-2 text-green-400 text-2xl" />
                )}
              </button>
            ))}
          </div>

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
            onClick={handleBuyClick}
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

      {/* Modals */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        amount={selectedTier || 0}
        hoopxAmount={hoopxAmount}
        rate={rateNumber}
        estimatedFee={estimatedFee}
        onConfirm={handleConfirmTransfer}
        onClose={() => setShowConfirmModal(false)}
      />

      <TransactionStatusModal
        isOpen={showStatusModal}
        status={transactionStatus}
        amount={selectedTier || 0}
        transactionId={transactionId}
        onClose={() => setShowStatusModal(false)}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
