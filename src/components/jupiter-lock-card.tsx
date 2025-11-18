'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { useJupiterLock } from '@/lib/jupiter-lock/hooks';
import { claimJupiterLock } from '@/lib/jupiter-lock/claim';
import Toast, { ToastType } from '@/components/toast';

interface JupiterLockCardProps {
  escrowAddress: string;
}

export default function JupiterLockCard({ escrowAddress }: JupiterLockCardProps) {
  const t = useTranslations('portfolio');
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  // Fetch lock data from Jupiter Lock program
  const { data: lockData, isLoading, refetch } = useJupiterLock(escrowAddress);

  // Claiming state
  const [isClaiming, setIsClaiming] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const [showToast, setShowToast] = useState(false);

  const showToastNotification = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Format token amount
  const formatTokenAmount = (num: number) => {
    const rounded = Math.floor(num * 1000000) / 1000000;
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle claim
  const handleClaim = async () => {
    if (!publicKey || !signTransaction || !lockData) {
      showToastNotification('Please connect your wallet', 'error');
      return;
    }

    if (lockData.claimableAmount <= 0) {
      showToastNotification('No tokens available to claim yet', 'info');
      return;
    }

    setIsClaiming(true);

    try {
      const result = await claimJupiterLock(
        connection,
        escrowAddress,
        publicKey,
        signTransaction
      );

      if (result.success) {
        showToastNotification(
          `Successfully claimed ${formatTokenAmount(lockData.claimableAmount)} HOOPX!`,
          'success'
        );
        // Refetch lock data to update UI
        setTimeout(() => refetch(), 2000);
      } else {
        showToastNotification(result.error || 'Failed to claim tokens', 'error');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToastNotification(errorMessage, 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  /**
   * Temporary: Show Jupiter Lock link until proper SDK integration
   *
   * TODO: Implement proper Jupiter Lock integration
   * - Get IDL from Jupiter Lock program (LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn)
   * - Use Anchor or Codama to deserialize account data
   * - Display real-time lock info, claimable amounts
   * - Add direct claim functionality
   *
   * For now, redirect to Jupiter Lock website
   */
  return (
    <div className='bg-white/5 rounded-xl p-5 border border-white/10'>
      <div className='text-center space-y-4'>
        <div className='text-white font-medium'>{t('lockedTokens')}</div>
        <p className='text-white/70 text-sm'>
          View your locked tokens and claim when available on Jupiter Lock
        </p>
        <Button
          variant='primary'
          size='large'
          onClick={() => window.open(`https://lock.jup.ag/escrow/${escrowAddress}`, '_blank')}
          className='w-full'
        >
          {t('viewOnJupiter')}
        </Button>
        <p className='text-white/50 text-xs'>
          Escrow: {escrowAddress.slice(0, 4)}...{escrowAddress.slice(-4)}
        </p>
      </div>
    </div>
  );
}
