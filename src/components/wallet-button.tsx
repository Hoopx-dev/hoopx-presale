'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { IoWallet } from 'react-icons/io5';
import { useWalletStore } from '@/lib/store/useWalletStore';
import { useReferralStore } from '@/lib/store/useReferralStore';
import { useUIStore } from '@/lib/store/useUIStore';
import { Button } from './ui/button';
import MobileWalletModal from './mobile-wallet-modal';

/**
 * Detect if running on mobile device
 */
const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export default function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const { connected, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('wallet');
  const { setAddress, clearAddress, truncatedAddress } = useWalletStore();
  const { clearReferralAddress } = useReferralStore();
  const { setSelectedTier } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync wallet address to store
  useEffect(() => {
    if (connected && publicKey) {
      setAddress(publicKey.toBase58());
    } else {
      clearAddress();
    }
  }, [connected, publicKey, setAddress, clearAddress]);

  // Close mobile modal when connected
  useEffect(() => {
    if (connected && showMobileModal) {
      setShowMobileModal(false);
    }
  }, [connected, showMobileModal]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <Button variant="primary" size="small">
        Connect Wallet
      </Button>
    );
  }

  const handleClick = () => {
    if (connected) {
      setShowDropdown(!showDropdown);
    } else {
      // On mobile, show custom modal; on desktop, show standard modal
      if (isMobile()) {
        setShowMobileModal(true);
      } else {
        setVisible(true);
      }
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    // Clear all stores
    clearAddress();
    clearReferralAddress();
    setSelectedTier(null);
    setShowDropdown(false);
  };


  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant={connected ? "secondary" : "primary"}
          size="small"
          onClick={handleClick}
        >
          {connected && publicKey ? (
            <>
              <IoWallet className="text-lg flex-shrink-0" />
              {truncatedAddress}
            </>
          ) : (
            t('connectWallet')
          )}
        </Button>

        {/* Dropdown Menu */}
        {connected && showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-purple-800 rounded-lg shadow-lg border border-white/20 py-2 z-50">
            <div className="px-4 py-2 text-white/70 text-xs border-b border-white/10">
              {t('address')}
            </div>
            <div className="px-4 py-2 text-white text-sm font-mono break-all">
              {publicKey?.toBase58()}
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 transition-colors text-sm cursor-pointer"
            >
              {t('disconnect')}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Wallet Modal */}
      <MobileWalletModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />
    </>
  );
}
