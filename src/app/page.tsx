'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState, Suspense } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { usePurchaseDetails, usePurchaseSession, useConvertToFormal } from '@/lib/purchase/hooks';
import MobileWalletModal from '@/components/mobile-wallet-modal';
import UnfinishedOrderModal from '@/components/unfinished-order-modal';
import Toast, { ToastType } from '@/components/toast';

/**
 * Detect if running on mobile device
 */
const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

function HomeContent() {
  const t = useTranslations('home');
  const tUnfinished = useTranslations('unfinishedOrder');
  const router = useRouter();
  const { connected, connecting, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { data: purchaseDetails, isLoading } = usePurchaseDetails();
  const { data: purchaseSession, isLoading: sessionLoading } = usePurchaseSession(
    publicKey?.toBase58(),
    purchaseDetails?.activityId
  );
  const convertToFormalMutation = useConvertToFormal();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showUnfinishedOrderModal, setShowUnfinishedOrderModal] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const [showToast, setShowToast] = useState(false);

  // Mounted state to prevent redirect during initial wallet reconnection
  const [mounted, setMounted] = useState(false);

  const showToastNotification = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile modal when connected
  useEffect(() => {
    if (connected && showMobileModal) {
      setShowMobileModal(false);
    }
  }, [connected, showMobileModal]);

  // Track current page for terms modal logic
  useEffect(() => {
    sessionStorage.setItem('hoopx-current-page', 'home');
  }, []);

  // Check for unfinished order and show modal
  useEffect(() => {
    if (connected && !sessionLoading && purchaseSession?.preOrderVO) {
      // Has unfinished order - show modal
      setShowUnfinishedOrderModal(true);
    }
  }, [connected, sessionLoading, purchaseSession]);

  // Redirect to portfolio if connected with successful purchase (Rule #3)
  useEffect(() => {
    // Don't redirect on initial mount - give wallet time to reconnect
    if (!mounted) return;

    // Wait for wallet to finish connecting/reconnecting before redirecting
    if (connecting) return;

    // Only redirect if fully connected and session data is available
    if (connected && publicKey && purchaseSession !== undefined) {
      const hasSuccessfulPurchase = purchaseSession?.orderVoList?.some(
        order => order.purchaseStatus === 1
      );
      if (hasSuccessfulPurchase) {
        router.push('/portfolio');
      }
    }
  }, [mounted, connected, connecting, publicKey, purchaseSession, router]);

  // Handle buy button click
  const handleBuyClick = () => {
    if (connected) {
      // Check for unfinished pre-order first
      if (purchaseSession?.preOrderVO) {
        // Has unfinished order - show modal instead of redirecting
        setShowUnfinishedOrderModal(true);
        return;
      }

      // Check if already purchased
      const hasSuccessfulPurchase = purchaseSession?.orderVoList?.some(
        order => order.purchaseStatus === 1
      );
      if (hasSuccessfulPurchase) {
        router.push('/portfolio');
      } else {
        router.push('/purchase');
      }
    } else {
      // Not connected, trigger appropriate wallet modal
      if (isMobile()) {
        setShowMobileModal(true);
      } else {
        setVisible(true);
      }
    }
  };

  // Handle completing unfinished order
  const handleCompleteUnfinishedOrder = async (trxId: string) => {
    if (!publicKey || !purchaseSession?.preOrderVO) return;

    try {
      const preOrder = purchaseSession.preOrderVO;

      // Validate preOrderId exists
      if (!preOrder.preOrderId) {
        showToastNotification(tUnfinished('errorMessage'), 'error');
        return;
      }

      // Convert to formal order
      const result = await convertToFormalMutation.mutateAsync({
        preOrderId: preOrder.preOrderId,
        trxId: trxId,
        publicKey: publicKey.toBase58(),
      });

      // Close modal
      setShowUnfinishedOrderModal(false);

      // Show success toast
      showToastNotification(tUnfinished('successMessage'), 'success');

      // Check if registration was successful
      const hasSuccessfulOrder = result.orderVoList?.some(
        (order) => order.purchaseStatus === 1
      );
      if (hasSuccessfulOrder) {
        // Redirect to portfolio after a short delay
        setTimeout(() => {
          router.push('/portfolio');
        }, 1500);
      }
    } catch (error: unknown) {
      // Check if error is from API response
      let errorMessage = tUnfinished('errorMessage');

      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { msg?: string } } };
        const msg = apiError.response?.data?.msg;

        // Check for transaction hash mismatch error
        if (msg && msg.includes("交易哈希与订单数据匹配不通过")) {
          errorMessage = tUnfinished('errorMismatch');
        } else if (msg) {
          errorMessage = msg;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      showToastNotification(errorMessage, 'error');
    }
  };

  // Check if no active activity (purchaseDetails is null/undefined)
  const hasActiveActivity = !isLoading && purchaseDetails !== null && purchaseDetails !== undefined;

  // Calculate min and max tiers
  const minTier = purchaseDetails?.tiers?.[0] || 1000;
  const maxTier = purchaseDetails?.tiers?.[purchaseDetails.tiers.length - 1] || 5000;
  const rate = purchaseDetails?.rate || '0.003';

  // Remove trailing zeros without rounding
  const displayRate = typeof rate === 'string'
    ? parseFloat(rate).toString()
    : rate.toString();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Header />

        {/* Main Content */}
        <main className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          {/* Logo Section */}
          <div className="text-center mb-12">
            {/* Coin Logo */}
            <div className="mb-8 flex justify-center">
              <Image
                src="/images/coin.png"
                alt="HOOPX Coin"
                width={200}
                height={200}
                className="w-48 h-48 object-contain"
                priority
              />
            </div>

            {/* Brand Logo */}
            <div className="mb-6">
              <Image
                src="/images/brand-logo.png"
                alt="HOOPX"
                width={200}
                height={60}
                className="w-auto h-12 object-contain mx-auto"
              />
            </div>

            {/* Coming Soon or Title */}
            {!hasActiveActivity && !isLoading ? (
              <h1 className="text-white text-4xl font-medium mb-12">
                {t('comingSoon')}
              </h1>
            ) : (
              <h1 className="text-white text-2xl font-medium mb-12">
                {t('title')}
              </h1>
            )}
          </div>

          {/* Show activity details only if there's an active activity */}
          {hasActiveActivity && (
            <>
              {/* Exchange Rate Display */}
              <div className="w-full mb-12 text-center">
                <p className="text-white/70 text-sm mb-3">{t('presalePrice')}</p>
                <p className="text-cyan-400 text-7xl font-bold mb-2">
                  {displayRate}
                </p>
                <p className="text-white text-lg">{t('exchangeRate')}</p>
              </div>

              {/* Buy Button */}
              <Button
                variant="primary"
                size="large"
                onClick={handleBuyClick}
                className="w-full mb-4"
              >
                {t('buyNow')}
              </Button>

              {/* Purchase Range */}
              <p className="text-white/70 text-sm text-center">
                {minTier}-{maxTier}USDT {t('purchaseRange')}
              </p>
            </>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="w-full text-center">
              <p className="text-white/50 text-lg">...</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Wallet Modal */}
      <MobileWalletModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />

      {/* Unfinished Order Modal */}
      <UnfinishedOrderModal
        isOpen={showUnfinishedOrderModal}
        preOrder={purchaseSession?.preOrderVO || null}
        onSubmit={handleCompleteUnfinishedOrder}
        onClose={() => setShowUnfinishedOrderModal(false)}
        loading={convertToFormalMutation.isPending}
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
