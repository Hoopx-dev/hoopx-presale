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

  if (isLoading) {
    return (
      <div className='bg-white/5 rounded-xl p-5 border border-white/10'>
        <div className='text-white/50 text-center py-4'>Loading lock data...</div>
      </div>
    );
  }

  if (!lockData) {
    return (
      <div className='bg-white/5 rounded-xl p-5 border border-white/10'>
        <div className='text-white/50 text-center py-4'>Lock data not found</div>
      </div>
    );
  }

  // Determine status
  let statusLabel = t('locked');
  let statusColor = 'bg-yellow-500';
  if (lockData.isFullyVested && lockData.claimedAmount >= lockData.totalAmount) {
    statusLabel = t('fullyVested');
    statusColor = 'bg-green-500';
  } else if (lockData.isCliffPassed) {
    statusLabel = t('vesting');
    statusColor = 'bg-yellow-500';
  }

  return (
    <>
      <div className='bg-white/5 rounded-xl p-5 border border-white/10'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-white font-medium'>{t('lockedTokens')}</h3>
          <div className='flex items-center gap-2'>
            <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
            <span className={`text-sm ${statusColor.replace('bg-', 'text-')}`}>
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='mb-4'>
          <div className='flex justify-between text-sm mb-2'>
            <span className='text-white/70'>{t('vestingProgress')}</span>
            <span className='text-white font-medium'>
              {lockData.progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className='w-full h-2 bg-white/10 rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500'
              style={{ width: `${lockData.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Token Amounts */}
        <div className='space-y-3 mb-4'>
          <div className='flex justify-between'>
            <span className='text-white/70 text-sm'>{t('totalLocked')}</span>
            <span className='text-white font-medium'>
              {formatTokenAmount(lockData.totalAmount)} HOOPX
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-white/70 text-sm'>{t('claimed')}</span>
            <span className='text-white/50 font-medium'>
              {formatTokenAmount(lockData.claimedAmount)} HOOPX
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-white/70 text-sm'>{t('claimable')}</span>
            <span className='text-success font-medium'>
              {formatTokenAmount(lockData.claimableAmount)} HOOPX
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-white/70 text-sm'>{t('stillLocked')}</span>
            <span className='text-white/50 font-medium'>
              {formatTokenAmount(lockData.remainingAmount - lockData.claimableAmount)} HOOPX
            </span>
          </div>
        </div>

        {/* Lock Timeline */}
        <div className='bg-white/5 rounded-lg p-3 mb-4 space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-white/70'>Cliff End</span>
            <span className='text-white'>{formatDate(lockData.cliffEndDate)}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-white/70'>Vesting End</span>
            <span className='text-white'>{formatDate(lockData.vestingEndDate)}</span>
          </div>
        </div>

        {/* Claim Button */}
        {lockData.claimableAmount > 0 ? (
          <Button
            variant='primary'
            size='large'
            onClick={handleClaim}
            disabled={isClaiming || !lockData.isCliffPassed}
            className='w-full'
          >
            {isClaiming
              ? t('claiming')
              : `${t('claimAvailable', { amount: formatTokenAmount(lockData.claimableAmount) })}`}
          </Button>
        ) : (
          <div className='text-center text-white/50 text-sm'>
            {!lockData.isCliffPassed
              ? t('cliffNotPassed', { date: formatDate(lockData.cliffEndDate) })
              : t('noTokensAvailable')}
          </div>
        )}

        {/* View on Jupiter Link */}
        <div className='mt-3 text-center'>
          <a
            href={`https://lock.jup.ag/escrow/${escrowAddress}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-yellow-500 text-sm hover:underline cursor-pointer'
          >
            {t('viewOnJupiter')} ↗
          </a>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
