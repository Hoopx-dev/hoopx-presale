'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import * as React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { isInMobileBrowser, openInJupiterApp } from '@/lib/utils/mobile-deeplink';
import { useReferralStore } from '@/lib/store/useReferralStore';

interface MobileWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Get display name for wallet
 */
const getWalletDisplayName = (walletName: string): string => {
  // Rename WalletConnect/Reown to "Other wallets"
  if (walletName === 'WalletConnect/Reown') {
    return 'Other wallets';
  }
  // Keep Jupiter Mobile as is
  return walletName;
};

export default function MobileWalletModal({ isOpen, onClose }: MobileWalletModalProps) {
  const { wallets, select, connecting } = useWallet();
  const t = useTranslations('wallet');
  const { referralAddress } = useReferralStore();
  const [redirecting, setRedirecting] = React.useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleWalletSelect = async (walletName: string) => {
    try {
      // Special handling for Jupiter on mobile browser
      if (walletName === 'Jupiter Mobile' && isInMobileBrowser()) {
        // Show redirecting state
        setRedirecting(true);

        // Small delay to show the message
        await new Promise(resolve => setTimeout(resolve, 300));

        // Open Jupiter app with deep link, passing referral params
        openInJupiterApp(referralAddress || undefined);

        // Reset state after redirect attempt
        setTimeout(() => {
          setRedirecting(false);
        }, 2000);

        return;
      }

      // Standard WalletConnect flow for other wallets or if already in wallet browser
      select(walletName as import('@solana/wallet-adapter-base').WalletName);
      // Modal will close when connection succeeds
    } catch (error) {
      console.error('Failed to select wallet:', error);
      setRedirecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-purple-900 to-purple-950 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 p-6 animate-slide-up sm:animate-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">{t('selectWallet')}</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Wallet List */}
        <div className="space-y-3">
          {redirecting && (
            <div className="text-center py-4">
              <div className="text-white text-lg font-medium mb-2">{t('openingJupiter')}</div>
              <div className="text-white/50 text-sm">{t('redirectingToJupiter')}</div>
            </div>
          )}

          {!redirecting && wallets.map((wallet) => (
            <button
              key={wallet.adapter.name}
              onClick={() => handleWalletSelect(wallet.adapter.name)}
              disabled={connecting}
              className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {wallet.adapter.icon && (
                <Image
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg"
                  unoptimized
                />
              )}
              <div className="flex-1 text-left">
                <div className="text-white font-medium">{getWalletDisplayName(wallet.adapter.name)}</div>
                {connecting && (
                  <div className="text-white/50 text-sm mt-1">Connecting...</div>
                )}
              </div>
              <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Info Text */}
        <p className="text-white/50 text-xs text-center mt-6">
          {t('connectDescription')}
        </p>
      </div>
    </div>
  );
}
