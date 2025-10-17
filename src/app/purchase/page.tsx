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
  const tError = useTranslations('errors');
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
  const [referralError, setReferralError] = useState('');

  // Auto-fill referral input from store (only if it's not the connected wallet)
  useEffect(() => {
    if (referralAddress && publicKey) {
      // Don't auto-fill if referral address is the same as connected wallet
      if (referralAddress !== publicKey.toBase58()) {
        setReferralInput(referralAddress);
        setShowReferralInput(true);
      }
    }
  }, [referralAddress, publicKey]);

  // Validate referral address on blur
  const handleReferralBlur = () => {
    const trimmedReferral = referralInput.trim();
    if (trimmedReferral) {
      if (trimmedReferral === publicKey?.toBase58()) {
        setReferralError(t('cannotReferSelf'));
      } else {
        setReferralError('');
      }
    } else {
      setReferralError('');
    }
  };

  // Clear error when input changes
  const handleReferralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralInput(e.target.value);
    if (referralError) {
      setReferralError('');
    }
  };

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

  // Redirect if already purchased current activity
  useEffect(() => {
    if (!sessionLoading && purchaseDetails?.activityId) {
      const hasPurchasedCurrentActivity = purchaseSession?.orderVoList?.some(
        order => order.purchaseStatus === 1 && order.activityId === purchaseDetails.activityId
      );
      if (hasPurchasedCurrentActivity) {
        router.push('/portfolio');
      }
    }
  }, [purchaseSession, sessionLoading, purchaseDetails?.activityId, router]);

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

  // Format token amounts with round down
  const formatTokenAmount = (num: number) => {
    // If amount >= 100, round down to 2 decimals, otherwise round down to 6 decimals
    const decimals = num >= 100 ? 2 : 6;
    const multiplier = Math.pow(10, decimals);
    const roundedDown = Math.floor(num * multiplier) / multiplier;
    return roundedDown.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  };

  // Check if wallet already purchased current activity
  const alreadyPurchased = useMemo(() => {
    if (!purchaseDetails?.activityId) return false;
    return purchaseSession?.orderVoList?.some(
      order => order.purchaseStatus === 1 && order.activityId === purchaseDetails.activityId
    ) || false;
  }, [purchaseSession, purchaseDetails?.activityId]);

  // Handle terms acceptance
  const handleAcceptTerms = () => {
    // Mark terms as accepted in sessionStorage
    sessionStorage.setItem('hoopx-terms-accepted-session', 'true');
    setShowTermsModal(false);
  };

  // Show terms modal only when navigating from a different page (not on refresh or language change)
  useEffect(() => {
    const previousPage = sessionStorage.getItem('hoopx-current-page');

    // If previous page wasn't purchase page, clear the acceptance flag
    // This ensures modal shows when coming from another page
    if (previousPage !== 'purchase') {
      sessionStorage.removeItem('hoopx-terms-accepted-session');
    }

    // Update current page to purchase
    sessionStorage.setItem('hoopx-current-page', 'purchase');

    // Check if terms have been accepted after potential clearing
    const hasAcceptedInSession = sessionStorage.getItem('hoopx-terms-accepted-session');

    // Show modal if not accepted in this session
    if (connected && !sessionLoading && !alreadyPurchased && !hasAcceptedInSession) {
      setShowTermsModal(true);
    }
  }, [connected, sessionLoading, alreadyPurchased]);

  const displayRate = useMemo(() => {
    if (!purchaseDetails?.rate) return '0.003';
    const rate = typeof purchaseDetails.rate === 'string'
      ? parseFloat(purchaseDetails.rate)
      : purchaseDetails.rate;
    // Remove trailing zeros without rounding
    return rate.toString();
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
      showToastNotification(tError('missingData'), 'error');
      return;
    }

    try {
      // Set loading state on confirm button
      setConfirmLoading(true);

      // Refetch session to ensure wallet hasn't purchased current activity yet
      const { data: latestSession } = await refetchSession();

      // Check if wallet already purchased current activity (double-purchase prevention)
      const hasExistingPurchase = latestSession?.orderVoList?.some(
        order => order.purchaseStatus === 1 && order.activityId === purchaseDetails.activityId
      );
      if (hasExistingPurchase) {
        showToastNotification(tError('alreadyPurchasedError'), 'error');
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

      // Validate referral address is not the same as user's wallet
      const trimmedReferral = referralInput.trim();
      if (trimmedReferral && trimmedReferral === publicKey.toBase58()) {
        throw new Error('Cannot use your own wallet address as referral');
      }

      // Add referral address if provided
      const registrationData = trimmedReferral
        ? { ...registrationPayload, referralWalletAddress: trimmedReferral }
        : registrationPayload;

      // Register purchase in backend
      const registrationResult = await registerMutation.mutateAsync(registrationData);

      // Show success status
      setTransactionStatus('success');

      // Redirect to portfolio after successful purchase
      // Registration result should contain the updated session with orderVoList
      const hasSuccessfulOrder = registrationResult.orderVoList?.some(
        order => order.purchaseStatus === 1
      );
      if (hasSuccessfulOrder) {
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
        showToastNotification(tError('transactionCancelled'), 'info');
      } else if (errorMessage.includes('Cannot use your own wallet address as referral')) {
        // User tried to use their own address as referral
        showToastNotification(t('cannotReferSelf'), 'error');
      } else if (errorMessage.includes('do not have a USDT account')) {
        // User doesn't have USDT token account
        showToastNotification(tError('noUsdtAccount'), 'error');
      } else if (errorMessage.includes('Insufficient USDT balance')) {
        // User doesn't have enough USDT - extract values and use translation
        // Message format: "Insufficient USDT balance. You have X USDT but need Y USDT."
        const match = errorMessage.match(/have ([\d.]+) USDT but need ([\d.]+) USDT/);
        if (match) {
          const [, current, required] = match;
          showToastNotification(
            tError('insufficientUsdtBalance', { current, required }),
            'error'
          );
        } else {
          showToastNotification(tError('insufficientBalanceGeneric'), 'error');
        }
      } else if (errorMessage.includes('Insufficient')) {
        // Generic insufficient balance
        showToastNotification(tError('insufficientBalanceGeneric'), 'error');
      } else if (errorMessage.includes('Network')) {
        showToastNotification(tError('networkError'), 'error');
      } else {
        // Generic error
        showToastNotification(tError('transactionFailed'), 'error');
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
                value: (() => {
                  // Calculate total HOOPX from all successful orders
                  const totalHoopx = purchaseSession?.orderVoList
                    ?.filter(order => order.purchaseStatus === 1)
                    .reduce((sum, order) => sum + (order.amount / order.rate), 0) || 0;
                  return totalHoopx > 0 ? `${formatTokenAmount(totalHoopx)} HOOPX` : '0 HOOPX';
                })(),
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
                value: selectedTier ? formatTokenAmount(hoopxAmount) : '0',
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
                  onChange={handleReferralChange}
                  onBlur={handleReferralBlur}
                  placeholder={t('referralPlaceholder')}
                  className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none transition-colors ${
                    referralError
                      ? 'border-danger focus:border-danger'
                      : 'border-white/20 focus:border-secondary'
                  }`}
                />
                {referralError && (
                  <p className="text-danger text-xs mt-2">{referralError}</p>
                )}
              </div>
            )}
          </div>

          {/* Buy Button */}
          <Button
            variant={!selectedTier || alreadyPurchased || detailsLoading || !!referralError ? "primary-disabled" : "primary"}
            size="large"
            onClick={handleBuyClick}
            disabled={!selectedTier || alreadyPurchased || detailsLoading || !!referralError}
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
