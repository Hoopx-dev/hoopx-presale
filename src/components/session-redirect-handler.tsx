'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePurchaseSession } from '@/lib/purchase/hooks';

/**
 * Global session redirect handler
 * - If user has successful purchase (purchaseStatus === 1), redirect to portfolio
 * - If user is on portfolio but no successful purchase, redirect to purchase page
 */
export default function SessionRedirectHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const { connected, publicKey } = useWallet();
  const { data: purchaseSession, isLoading } = usePurchaseSession(
    publicKey?.toBase58()
  );

  useEffect(() => {
    // Wait for session to load
    if (isLoading) return;

    // If not connected, don't redirect (let individual pages handle this)
    if (!connected) return;

    // Check if user has at least one successful purchase in orderVoList
    const hasSuccessfulPurchase =
      purchaseSession?.orderVoList?.some(order => order.purchaseStatus === 1) || false;

    // If on homepage or purchase page and has successful purchase, redirect to portfolio
    if ((pathname === '/' || pathname === '/purchase') && hasSuccessfulPurchase) {
      router.push('/portfolio');
    }

    // If on portfolio page but no successful purchase, redirect to purchase page
    if (pathname === '/portfolio' && !hasSuccessfulPurchase) {
      router.push('/purchase');
    }
  }, [connected, purchaseSession, isLoading, pathname, router]);

  return null; // This component doesn't render anything
}
