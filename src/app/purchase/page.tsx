'use client';

import { useTranslations } from 'next-intl';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Header from '@/components/header';
import ConfirmationModal from '@/components/confirmation-modal';
import TransactionStatusModal from '@/components/transaction-status-modal';
import TermsModal from '@/components/terms-modal';
import Toast, { ToastType } from '@/components/toast';
import { Button } from '@/components/ui/button';
import InfoListCard from '@/components/ui/info-list-card';
import { usePurchaseDetails, usePurchaseSession, useRegisterPurchase } from '@/lib/purchase/hooks';
import { useUIStore } from '@/lib/store/useUIStore';
import { useReferralStore } from '@/lib/store/useReferralStore';
import { transferUSDT, getEstimatedFee, createSolanaConnection } from '@/lib/solana/transfer';

export default function PurchasePage() {
  const t = useTranslations('purchase');
  const router = useRouter();
  const { connected, publicKey, signTransaction } = useWallet();
  const { data: purchaseDetails, isLoading: detailsLoading } = usePurchaseDetails();
  const { data: purchaseSession, isLoading: sessionLoading, refetch: refetchSession } = usePurchaseSession(publicKey?.toBase58());
  const { selectedTier, setSelectedTier } = useUIStore();
  const { referralAddress } = useReferralStore();
  const registerMutation = useRegisterPurchase();

  // Referral input state
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralInput, setReferralInput] = useState('');

  // Auto-fill referral input from store
  useEffect(() => {
    if (referralAddress) {
      setReferralInput(referralAddress);
      setShowReferralInput(true);
    }
  }, [referralAddress]);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
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

  // Terms modal state
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  // Handle terms acceptance
  const handleAcceptTerms = () => {
    localStorage.setItem('hoopx-terms-accepted', 'true');
    setShowTermsModal(false);
  };

  // Check if user has accepted terms on mount
  useEffect(() => {
    if (connected && !sessionLoading && !alreadyPurchased) {
      const hasAcceptedTerms = localStorage.getItem('hoopx-terms-accepted');
      if (!hasAcceptedTerms) {
        setShowTermsModal(true);
      }
    }
  }, [connected, sessionLoading, alreadyPurchased]);

  const displayRate = useMemo(() => {
    if (!purchaseDetails?.rate) return '0.003';
    const rate = typeof purchaseDetails.rate === 'string'
      ? parseFloat(purchaseDetails.rate)
      : purchaseDetails.rate;
    return rate.toFixed(3);
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
      // Set loading state on confirm button
      setConfirmLoading(true);

      // Refetch session to ensure wallet hasn't purchased yet
      const { data: latestSession } = await refetchSession();

      // Check if wallet already purchased (double-purchase prevention)
      if (latestSession?.purchaseStatus === 1) {
        showToastNotification('You have already made a purchase', 'error');
        setTimeout(() => {
          router.push('/portfolio');
        }, 1500);
        return;
      }

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

      // Transaction signed! Close confirmation modal and show sending status
      setShowConfirmModal(false);
      setConfirmLoading(false);
      setTransactionStatus('sending');
      setShowStatusModal(true);

      // Store transaction ID
      setTransactionId(result.signature);

      // Validate required fields before registration
      const registrationPayload = {
        publicKey: publicKey.toBase58(),
        amount: selectedTier,
        trxId: result.signature,
        activityId: purchaseDetails.activityId,
      };

      // Validate all required fields exist
      if (!registrationPayload.publicKey || !registrationPayload.amount || !registrationPayload.trxId || !registrationPayload.activityId) {
        throw new Error('Missing required registration data');
      }

      // Add referral address if provided
      const registrationData = referralInput.trim()
        ? { ...registrationPayload, referralWalletAddress: referralInput.trim() }
        : registrationPayload;

      // Register purchase in backend
      const registrationResult = await registerMutation.mutateAsync(registrationData);

      // Show success status
      setTransactionStatus('success');

      // Redirect to portfolio if purchase was successful
      if (registrationResult.purchaseStatus === 1) {
        // Small delay to show success modal briefly
        setTimeout(() => {
          router.push('/portfolio');
        }, 1500);
      }
    } catch (error: unknown) {
      // Reset loading and close modals on error
      setConfirmLoading(false);
      setShowConfirmModal(false);
      setShowStatusModal(false);

      // Handle different error types with user-friendly messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

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
    <div className="min-h-screen">
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
              <Button
                key={tier}
                variant={selectedTier === tier ? "secondary-selected" : "secondary"}
                size="default"
                onClick={() => setSelectedTier(tier)}
                disabled={alreadyPurchased || detailsLoading}
                showCheckmark={selectedTier === tier}
              >
                {formatNumber(tier)}
              </Button>
            ))}
          </div>

          {/* Summary Cards */}
          <InfoListCard
            items={[
              {
                label: t('currentPrice'),
                value: detailsLoading ? '...' : `${displayRate} USDT/HOOPX`,
                valueColor: 'text-success',
              },
              {
                label: t('purchaseLimit'),
                value: detailsLoading ? '...' : `${formatNumber(maxTier)} USDT`,
              },
              {
                label: t('currentAssets'),
                value: purchaseSession?.purchasedAmount
                  ? `${formatNumber(purchaseSession.purchasedAmount)} HOOPX`
                  : '0 HOOPX',
              },
            ]}
            className="mb-6"
          />

          {/* Purchase Details */}
          <InfoListCard
            sectionLabel={t('purchaseDetails')}
            items={[
              {
                label: t('hoopxReceive'),
                value: selectedTier ? formatNumber(hoopxAmount) : '0',
              },
              {
                label: t('vestingPeriod'),
                value: detailsLoading
                  ? '...'
                  : `${purchaseDetails?.vesting || '12'} ${t('months')}`,
              },
              {
                label: t('cliffPeriod'),
                value: detailsLoading
                  ? '...'
                  : `${purchaseDetails?.cliff || '3'} ${t('months')}`,
              },
              {
                label: t('releaseFrequency'),
                value: detailsLoading
                  ? '...'
                  : (() => {
                      const freq = parseInt(purchaseDetails?.vestingFrequency || '1');
                      return freq === 1 ? t('perMonth') : `/${freq}${t('months')}`;
                    })(),
              },
            ]}
            className="mb-6"
          />

          {/* Referral Section */}
          <div className="mb-6">
            {/* Collapsible Header */}
            <button
              type="button"
              onClick={() => setShowReferralInput(!showReferralInput)}
              className="w-full flex items-center justify-between text-white/70 text-sm py-3 cursor-pointer hover:text-white transition-colors"
            >
              <span>{t('haveReferral')}</span>
              {showReferralInput ? (
                <FiChevronUp className="w-4 h-4" />
              ) : (
                <FiChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Collapsible Input */}
            {showReferralInput && (
              <div className="mt-2">
                <input
                  type="text"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value)}
                  placeholder={t('referralPlaceholder')}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            )}
          </div>

          {/* Buy Button */}
          <Button
            variant={!selectedTier || alreadyPurchased || detailsLoading ? "primary-disabled" : "primary"}
            size="large"
            onClick={handleBuyClick}
            disabled={!selectedTier || alreadyPurchased || detailsLoading}
            className="w-full"
          >
            {selectedTier
              ? `${t('buyButton')} - ${formatNumber(selectedTier)} USDT`
              : t('selectAmount')
            }
          </Button>

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
        rate={rateNumber}
        estimatedFee={estimatedFee}
        loading={confirmLoading}
        onConfirm={handleConfirmTransfer}
        onClose={() => {
          if (!confirmLoading) {
            setShowConfirmModal(false);
          }
        }}
      />

      <TransactionStatusModal
        isOpen={showStatusModal}
        status={transactionStatus}
        amount={selectedTier || 0}
        transactionId={transactionId}
        onClose={() => setShowStatusModal(false)}
      />

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onAccept={handleAcceptTerms}
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
