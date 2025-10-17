'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: ReactNode;
}

// Detect mobile devices
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
};

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
    []
  );

  // Configure supported wallets based on platform
  const wallets = useMemo(() => {
    const mobile = isMobile();

    // Standard wallet adapters for Wallet Standard detection (works in-app browsers)
    const standardWallets = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];

    if (mobile) {
      // Mobile (Android/iOS):
      // - Standard adapters enable Wallet Standard detection (for in-app browsers)
      // - MWA enables deep linking (for regular browsers like Chrome/Safari)
      return [
        ...standardWallets,
        new SolanaMobileWalletAdapter({
          addressSelector: {
            select: async (addresses) => addresses[0],
          },
          appIdentity: {
            name: 'HOOPX Token Presale',
            uri: typeof window !== 'undefined' ? window.location.origin : 'https://hoopx.gg',
            icon: '/images/coin.png',
          },
          authorizationResultCache: {
            get: async () => Promise.resolve(undefined),
            set: async () => Promise.resolve(),
            clear: async () => Promise.resolve(),
          },
          chain: 'solana:mainnet',
          onWalletNotFound: async () => {
            window.open('https://phantom.app/', '_blank');
          },
        }),
      ];
    }

    // Desktop: Use standard wallet adapters only
    return standardWallets;
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={!isMobile()}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
