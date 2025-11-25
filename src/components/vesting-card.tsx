'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { OrderVO } from '@/lib/purchase/types';
import { calculateVestingProgress, formatDate } from '@/lib/vesting/calculator';

interface VestingCardProps {
  order: OrderVO;
  onClaim?: () => void;
}

export default function VestingCard({ order, onClaim }: VestingCardProps) {
  const t = useTranslations('portfolio');

  // Calculate vesting progress
  const progress = useMemo(() => calculateVestingProgress(order), [order]);

  // Format token amount with round down
  const formatTokenAmount = (num: number) => {
    const rounded = Math.floor(num * 1000000) / 1000000;
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className='bg-white/5 rounded-xl p-5 border border-white/10'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-white font-medium'>{t('lockedTokens')}</h3>
        <div className='flex items-center gap-2'>
          <div className='w-2 h-2 rounded-full bg-yellow-500'></div>
          <span className='text-yellow-500 text-sm'>
            {progress.isFullyVested ? t('fullyVested') : progress.isCliffPassed ? t('vesting') : t('locked')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='mb-4'>
        <div className='flex justify-between text-sm mb-2'>
          <span className='text-white/70'>{t('vestingProgress')}</span>
          <span className='text-white font-medium'>{progress.progressPercentage.toFixed(1)}%</span>
        </div>
        <div className='w-full h-2 bg-white/10 rounded-full overflow-hidden'>
          <div
            className='h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500'
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Token Amounts */}
      <div className='space-y-3 mb-4'>
        <div className='flex justify-between'>
          <span className='text-white/70 text-sm'>{t('totalLocked')}</span>
          <span className='text-white font-medium'>{formatTokenAmount(progress.totalAmount)} HOOPX</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-white/70 text-sm'>{t('released')}</span>
          <span className='text-success font-medium'>{formatTokenAmount(progress.releasedAmount)} HOOPX</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-white/70 text-sm'>{t('stillLocked')}</span>
          <span className='text-white/50 font-medium'>{formatTokenAmount(progress.lockedAmount)} HOOPX</span>
        </div>
      </div>

      {/* Next Unlock Info */}
      {!progress.isFullyVested && progress.nextUnlockDate && (
        <div className='bg-white/5 rounded-lg p-3 mb-4'>
          <div className='text-white/70 text-xs mb-1'>{t('nextUnlock')}</div>
          <div className='flex justify-between items-center'>
            <span className='text-white text-sm font-medium'>{formatDate(progress.nextUnlockDate)}</span>
            <span className='text-yellow-500 text-sm font-medium'>
              +{formatTokenAmount(progress.nextUnlockAmount)} HOOPX
            </span>
          </div>
        </div>
      )}

      {/* Claim Button */}
      {progress.releasedAmount > 0 && (
        <Button
          variant='primary'
          size='large'
          onClick={onClaim}
          className='w-full'
          disabled={!progress.isCliffPassed}
        >
          {progress.isFullyVested
            ? t('claimAll')
            : t('claimAvailable', { amount: formatTokenAmount(progress.releasedAmount) })}
        </Button>
      )}

      {/* Locked Message */}
      {!progress.isCliffPassed && (
        <div className='text-center text-white/50 text-sm'>
          {t('cliffNotPassed', { date: formatDate(progress.nextUnlockDate!) })}
        </div>
      )}
    </div>
  );
}
