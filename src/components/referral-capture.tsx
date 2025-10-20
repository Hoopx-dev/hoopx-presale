'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useReferralStore } from '@/lib/store/useReferralStore';

/**
 * Global component that captures referral parameters from URL
 * Works on any page, even when deep linked from wallet apps
 */
export default function ReferralCapture() {
  const searchParams = useSearchParams();
  const { setReferralAddress } = useReferralStore();

  useEffect(() => {
    const referralParam = searchParams.get('referral');
    if (referralParam) {
      // Store referral address (persists to localStorage via Zustand persist middleware)
      setReferralAddress(referralParam);
      console.log('[Referral] Captured from URL:', referralParam);
    }
  }, [searchParams, setReferralAddress]);

  // This component doesn't render anything
  return null;
}
