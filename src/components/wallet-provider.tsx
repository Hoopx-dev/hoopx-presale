"use client";

import { useWrappedReownAdapter } from "@jup-ag/jup-mobile-adapter";
import { SolanaMobileWalletAdapter } from "@solana-mobile/wallet-adapter-mobile";
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
import { FC, ReactNode, useMemo } from "react";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: ReactNode;
}

// Detect Android devices
const isAndroid = () => {
  if (typeof window === "undefined") return false;
  return /android/i.test(navigator.userAgent);
};

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
        description: "Join the HOOPX presale and be part of the future of basketball on blockchain",
        url: typeof window !== "undefined" ? window.location.origin : "https://hoopx.gg",
        icons: ["/images/coin.png"],
      },
      projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "",
      features: {
        analytics: false,
        socials: ["google", "x", "apple"],
        email: false,
      },
      enableWallets: false,
    },
  });

  // Configure supported wallets based on platform
  // Android: Use Mobile Wallet Adapter (MWA) for proper deep link handling
  // iOS/Desktop: Use standard wallet adapters
  // Note: iOS does not support MWA due to background execution limitations
  // iOS Chrome users should use Safari or wallet in-app browsers for best experience
  const wallets = useMemo(() => {
    if (isAndroid()) {
      return [
        new SolanaMobileWalletAdapter({
          addressSelector: {
            select: async (addresses) => addresses[0],
          },
          appIdentity: {
            name: "HOOPX Token Presale",
            uri:
              typeof window !== "undefined"
                ? window.location.origin
                : "https://hoopx.gg",
            icon: "/images/coin.png",
          },
          authorizationResultCache: {
            get: async () => Promise.resolve(undefined),
            set: async () => Promise.resolve(),
            clear: async () => Promise.resolve(),
          },
          chain: "solana:mainnet",
          onWalletNotFound: async () => {
            window.open("https://phantom.app/", "_blank");
          },
        }),
      ];
    }

    // iOS and Desktop: Use standard wallet adapters
    return [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={!isAndroid()}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
