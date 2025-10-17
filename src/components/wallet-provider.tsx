"use client";

import { useWrappedReownAdapter } from "@jup-ag/jup-mobile-adapter";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { FC, ReactNode, useMemo } from "react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({
  children,
}) => {
  // Use configured RPC endpoint or fallback to public endpoint
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"),
    []
  );

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

  // Configure supported wallets - use reownAdapter and jupiterAdapter for all platforms
  // Works for Android, iOS, and Desktop browsers
  const wallets = useMemo(() => {
    return [reownAdapter, jupiterAdapter];
  }, [reownAdapter, jupiterAdapter]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
