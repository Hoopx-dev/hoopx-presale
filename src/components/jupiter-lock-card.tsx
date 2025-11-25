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

  // Format token amount with full precision (for total locked)
  const formatTokenAmountFull = (num: number) => {
    const rounded = Math.floor(num * 1000000) / 1000000;
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  // Format token amount (round down to 2 decimals, for stats grid)
  const formatTokenAmount = (num: number) => {
    const rounded = Math.floor(num * 100) / 100;
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

  // Format frequency to human readable string
  const formatFrequency = (seconds: number): string => {
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const months = days / 30;

    if (months >= 1) {
      const monthCount = Math.round(months);
      return monthCount === 1 ? t('monthly') : `${monthCount} ${t('months')}`;
    } else if (days >= 1) {
      const dayCount = Math.round(days);
      return dayCount === 1 ? t('daily') : `${dayCount} ${t('days')}`;
    } else if (hours >= 1) {
      return `${Math.round(hours)} ${t('hours')}`;
    }
    return `${Math.round(minutes)} ${t('minutes')}`;
  };

  // Calculate next unlock date
  const getNextUnlockDate = (): Date | null => {
    if (!lockData || lockData.isFullyVested) return null;
    if (!lockData.isCliffPassed) return lockData.cliffEndDate;

    const now = Math.floor(Date.now() / 1000);
    const cliffTimestamp = Math.floor(lockData.cliffEndDate.getTime() / 1000);
    const elapsedSinceCliff = now - cliffTimestamp;
    const periodsElapsed = Math.floor(elapsedSinceCliff / lockData.frequencySeconds);
    const nextPeriodTimestamp = cliffTimestamp + ((periodsElapsed + 1) * lockData.frequencySeconds);

    return new Date(nextPeriodTimestamp * 1000);
  };

  // Handle claim
  const handleClaim = async () => {
    if (!publicKey || !signTransaction || !lockData) {
      showToastNotification(t('connectWalletFirst'), 'error');
      return;
    }

    if (lockData.claimableAmount <= 0) {
      showToastNotification(t('noClaimableTokens'), 'info');
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
          t('claimSuccess', { amount: formatTokenAmount(lockData.claimableAmount) }),
          'success'
        );
        // Refetch lock data to update UI
        setTimeout(() => refetch(), 2000);
      } else {
        showToastNotification(result.error || t('claimError'), 'error');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('claimError');
      showToastNotification(errorMessage, 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='bg-white/5 rounded-xl p-5 border border-white/10'>
        <div className='text-center space-y-4'>
          <div className='text-white font-medium'>{t('lockedTokens')}</div>
          <p className='text-white/70 text-sm'>{t('loadingLockData')}</p>
        </div>
      </div>
    );
  }

  // Error or no data state
  if (!lockData) {
    return (
      <div className='bg-white/5 rounded-xl p-5 border border-white/10'>
        <div className='text-center space-y-4'>
          <div className='text-white font-medium'>{t('lockedTokens')}</div>
          <p className='text-white/70 text-sm'>
            {t('viewLockDescription')}
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
            {t('escrowLabel')}: {escrowAddress.slice(0, 4)}...{escrowAddress.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  // Main lock display with data
  return (
    <div className='bg-white/5 rounded-xl p-5 border border-white/10 space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='text-white font-medium'>{t('lockedTokens')}</div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          lockData.isFullyVested
            ? 'bg-green-500/20 text-green-400'
            : lockData.isCliffPassed
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-white/10 text-white/70'
        }`}>
          {lockData.isFullyVested ? t('fullyVested') : lockData.isCliffPassed ? t('vesting') : t('locked')}
        </div>
      </div>

      {/* Total Locked Amount */}
      <div className='text-center py-4 border-b border-white/10'>
        <p className='text-white/70 text-sm mb-1'>{t('totalLocked')}</p>
        <p className='text-white font-bold text-2xl'>{formatTokenAmountFull(lockData.totalAmount)} HOOPX</p>
      </div>

      {/* Progress Bar */}
      <div className='space-y-2'>
        <div className='flex justify-between text-xs text-white/70'>
          <span>{t('progress')}</span>
          <span>{lockData.progressPercentage.toFixed(1)}%</span>
        </div>
        <div className='w-full bg-white/10 rounded-full h-2'>
          <div
            className='bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full transition-all duration-500'
            style={{ width: `${Math.min(lockData.progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-3 gap-4 py-4 border-y border-white/10'>
        <div className='text-center'>
          <p className='text-white/70 text-xs mb-1'>{t('claimed')}</p>
          <p className='text-green-400 font-semibold text-sm'>{formatTokenAmount(lockData.claimedAmount)}</p>
        </div>
        <div className='text-center'>
          <p className='text-white/70 text-xs mb-1'>{t('claimable')}</p>
          <p className='text-yellow-400 font-semibold text-sm'>{formatTokenAmount(lockData.claimableAmount)}</p>
        </div>
        <div className='text-center'>
          <p className='text-white/70 text-xs mb-1'>{t('stillLocked')}</p>
          <p className='text-white/70 font-semibold text-sm'>{formatTokenAmount(lockData.remainingAmount)}</p>
        </div>
      </div>

      {/* Vesting Schedule */}
      <div className='space-y-2 text-sm bg-white/5 rounded-lg p-3'>
        <div className='text-white/50 text-xs uppercase tracking-wide mb-2'>{t('vestingSchedule')}</div>
        <div className='flex justify-between'>
          <span className='text-white/70'>{t('startDate')}</span>
          <span className='text-white'>{formatDate(lockData.startDate)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-white/70'>{t('cliffEnd')}</span>
          <span className='text-white'>{formatDate(lockData.cliffEndDate)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-white/70'>{t('vestingEnd')}</span>
          <span className='text-white'>{formatDate(lockData.vestingEndDate)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-white/70'>{t('releaseFrequency')}</span>
          <span className='text-white'>{formatFrequency(lockData.frequencySeconds)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-white/70'>{t('amountPerPeriod')}</span>
          <span className='text-white'>{formatTokenAmount(lockData.periodAmount)} HOOPX</span>
        </div>
        {lockData.cliffAmount > 0 && (
          <div className='flex justify-between'>
            <span className='text-white/70'>{t('cliffUnlock')}</span>
            <span className='text-white'>{formatTokenAmount(lockData.cliffAmount)} HOOPX</span>
          </div>
        )}
        {getNextUnlockDate() && !lockData.isFullyVested && (
          <div className='flex justify-between pt-2 border-t border-white/10'>
            <span className='text-yellow-400'>{t('nextUnlock')}</span>
            <span className='text-yellow-400 font-medium'>{formatDate(getNextUnlockDate()!)}</span>
          </div>
        )}
      </div>

      {/* Claim Button */}
      {lockData.isCliffPassed && lockData.claimableAmount > 0 ? (
        <Button
          variant='primary'
          size='large'
          onClick={handleClaim}
          disabled={isClaiming}
          className='w-full'
        >
          {isClaiming ? t('claiming') : t('claimAvailable', { amount: formatTokenAmount(lockData.claimableAmount) })}
        </Button>
      ) : !lockData.isCliffPassed ? (
        <div className='text-center py-3 bg-white/5 rounded-lg'>
          <p className='text-white/70 text-sm'>{t('cliffNotPassed', { date: formatDate(lockData.cliffEndDate) })}</p>
        </div>
      ) : (
        <div className='text-center py-3 bg-white/5 rounded-lg'>
          <p className='text-white/70 text-sm'>{t('noClaimableTokens')}</p>
        </div>
      )}

      {/* View on Jupiter Link */}
      <button
        onClick={() => window.open(`https://lock.jup.ag/escrow/${escrowAddress}`, '_blank')}
        className='w-full text-center text-yellow-500 text-sm hover:text-yellow-400 transition-colors cursor-pointer'
      >
        {t('viewOnJupiter')} →
      </button>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
