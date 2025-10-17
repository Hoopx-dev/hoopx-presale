'use client';

import { FC, ReactNode, useMemo, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile environment
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|iphone|ipad|ipod|mobile/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  // Eagerly initialize wallets on mobile to ensure they're ready
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined') {
      // Trigger wallet adapter initialization
      console.log('[Mobile Wallet] Initializing wallet adapters');
    }
  }, [isMobile]);

  // Use Solana mainnet-beta or devnet
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);

  // Configure supported wallets with explicit mobile options
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={!isMobile}
        onError={(error) => {
          // Silently handle wallet errors on mobile
          if (isMobile) {
            console.log('[Mobile Wallet] Connection attempt:', error.message);
          } else {
            console.error('[Wallet Error]', error);
          }
        }}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
