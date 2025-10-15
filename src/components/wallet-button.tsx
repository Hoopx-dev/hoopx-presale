'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { IoWallet } from 'react-icons/io5';
import { useWalletStore } from '@/lib/store/useWalletStore';

export default function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { connected, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('wallet');
  const { setAddress, clearAddress, truncatedAddress } = useWalletStore();

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
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 font-bold text-sm py-2 px-4 rounded-lg h-10 flex items-center">
        <span>Connect Wallet</span>
      </div>
    );
  }

  const handleClick = () => {
    if (connected) {
      setShowDropdown(!showDropdown);
    } else {
      setVisible(true);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setShowDropdown(false);
  };


  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleClick}
        className={
          connected
            ? 'text-white text-base px-4 py-2 rounded-lg border border-white/30 hover:border-white/50 hover:bg-white/10 transition-all cursor-pointer font-medium h-10 flex items-center gap-2'
            : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold text-sm py-2 px-4 rounded-lg transition-all cursor-pointer h-10'
        }
      >
        {connected && publicKey ? (
          <>
            <IoWallet className="text-lg flex-shrink-0" />
            {truncatedAddress}
          </>
        ) : (
          t('connectWallet')
        )}
      </button>

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
  );
}
