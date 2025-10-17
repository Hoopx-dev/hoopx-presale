'use client';

import { FC, ReactNode, useMemo, useEffect } from 'react';
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
  // Use Solana mainnet-beta or devnet
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);

  // Configure supported wallets - eagerly instantiate to ensure they initialize
  const wallets = useMemo(
    () => {
      const phantom = new PhantomWalletAdapter();
      const solflare = new SolflareWalletAdapter();

      // Trigger readyState check immediately to initialize adapters
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          void phantom.readyState;
          void solflare.readyState;
        }, 0);
      }

      return [phantom, solflare];
    },
    []
  );

  // Force wallet adapters to initialize on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && wallets) {
      // Access readyState to trigger adapter initialization
      wallets.forEach((wallet) => {
        void wallet.readyState;
      });
    }
  }, [wallets]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
