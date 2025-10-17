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

// Detect Android devices
const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
};

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Use configured RPC endpoint or fallback to public endpoint
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
    []
  );

  // Configure supported wallets based on platform
  // Android: Use both standard adapters AND Mobile Wallet Adapter (MWA)
  // - Standard adapters show in the modal UI
  // - MWA provides better connection reliability on Android via Intent system
  // iOS/Desktop: Use standard wallet adapters only
  // Note: iOS does not support MWA due to background execution limitations
  const wallets = useMemo(() => {
    const standardWallets = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ];

    if (isAndroid()) {
      // On Android, include MWA as an additional option
      // The standard wallets will appear in the modal for user selection
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

    // iOS and Desktop: Use standard wallet adapters
    return standardWallets;
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={!isAndroid()}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
