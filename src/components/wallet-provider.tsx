"use client";

import { useWrappedReownAdapter } from "@jup-ag/jup-mobile-adapter";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { FC, ReactNode, useMemo, useState, useEffect } from "react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: ReactNode;
}

/**
 * Detect if running on mobile device
 */
const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const WalletContextProvider: FC<WalletContextProviderProps> = ({
  children,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use configured RPC endpoint or fallback to public endpoint
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"),
    []
  );

  // Initialize Jupiter mobile adapter for mobile devices
  const { reownAdapter, jupiterAdapter } = useWrappedReownAdapter({
    appKitOptions: {
      metadata: {
        name: "HOOPX Token Presale",
        description:
          "Join the HOOPX presale and be part of the future of basketball on blockchain",
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : "https://hoopx.gg",
        icons: ["/images/token-badge.png"],
      },
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
      features: {
        analytics: false,
        socials: false,
        email: false,
      },
      enableWallets: true,
    },
  });

  // Configure wallets based on platform
  const wallets = useMemo(() => {
    if (!mounted) return [];

    const mobile = isMobile();

    if (mobile) {
      // Mobile: Use Jupiter adapter with WalletConnect for mobile wallets
      return [reownAdapter, jupiterAdapter];
    } else {
      // Desktop: Use standard browser extension wallets + WalletConnect as fallback
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        reownAdapter, // WalletConnect for wallets without extensions
        jupiterAdapter, // Jupiter WalletConnect
      ];
    }
  }, [mounted, reownAdapter, jupiterAdapter]);

  // Prevent hydration issues
  if (!mounted) {
    return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[]} autoConnect={false}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={!isMobile()}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
