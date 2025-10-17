'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import { useWrappedReownAdapter } from '@jup-ag/jup-mobile-adapter';
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

// Inner component that uses the Jupiter adapter hook
const WalletProviderWithJupiter: FC<WalletContextProviderProps> = ({ children }) => {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
    []
  );

  // Initialize Jupiter Mobile adapter with WalletConnect
  const { reownAdapter, jupiterAdapter } = useWrappedReownAdapter({
    appKitOptions: {
      metadata: {
        name: 'HOOPX Token Presale',
        description: 'HOOPX is a token presale platform built on the Solana blockchain',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://hoopx.gg',
        icons: ['/images/coin.png'],
      },
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      features: {
        analytics: false,
        socials: [],
        email: false,
      },
      enableWallets: false,
    },
  });

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

    // Desktop: Use standard wallet adapters + Jupiter WalletConnect
    const standardWallets = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];
    const jupiterWallets = [reownAdapter, jupiterAdapter].filter(Boolean);

    return [...standardWallets, ...jupiterWallets];
  }, [reownAdapter, jupiterAdapter]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={!isMobile()}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Export the Jupiter-enabled wallet provider as the main export
export const WalletContextProvider = WalletProviderWithJupiter;
