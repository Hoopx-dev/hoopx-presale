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

    if (mobile) {
      // Mobile (Android/iOS): Use Mobile Wallet Adapter for deep linking
      // This handles ALL mobile wallets including Phantom, Solflare, Jupiter, etc.
      // Wallet Standard will auto-detect wallets when opened in their in-app browsers
      return [
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

    // Desktop: Use standard wallet adapters (Phantom, Solflare)
    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={!isMobile()}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
