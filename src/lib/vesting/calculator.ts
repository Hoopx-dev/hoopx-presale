import type { OrderVO } from '@/lib/purchase/types';

export interface VestingProgress {
  totalAmount: number;          // Total HOOPX tokens
  releasedAmount: number;        // Amount that can be claimed
  lockedAmount: number;          // Amount still locked
  progressPercentage: number;    // 0-100
  isCliffPassed: boolean;        // Whether cliff period has passed
  isFullyVested: boolean;        // Whether all tokens are unlocked
  nextUnlockDate: Date | null;   // When next unlock happens
  nextUnlockAmount: number;      // How much unlocks next
}

/**
 * Calculate vesting progress for a purchase order
 * @param order - The order to calculate vesting for
 * @returns Vesting progress information
 */
export function calculateVestingProgress(order: OrderVO): VestingProgress {
  // Calculate total HOOPX amount
  const totalAmount = order.amount / order.rate;

  // Parse subscription time (format: "2025-01-15 10:30:00" in GMT+8)
  const purchaseDate = parseGMT8DateTime(order.subscriptionTime);

  // Get current time
  const now = new Date();

  // Parse cliff and vesting periods (in months)
  const cliffMonths = parseInt(order.cliff);
  const vestingMonths = parseInt(order.vesting);

  // Calculate cliff end date
  const cliffEndDate = new Date(purchaseDate);
  cliffEndDate.setMonth(cliffEndDate.getMonth() + cliffMonths);

  // Calculate full vesting end date
  const vestingEndDate = new Date(purchaseDate);
  vestingEndDate.setMonth(vestingEndDate.getMonth() + cliffMonths + vestingMonths);

  // Check if cliff has passed
  const isCliffPassed = now >= cliffEndDate;

  // If cliff hasn't passed, nothing is released
  if (!isCliffPassed) {
    return {
      totalAmount,
      releasedAmount: 0,
      lockedAmount: totalAmount,
      progressPercentage: 0,
      isCliffPassed: false,
      isFullyVested: false,
      nextUnlockDate: cliffEndDate,
      nextUnlockAmount: calculateUnlockAmount(totalAmount, vestingMonths, order.vestingFrequency),
    };
  }

  // Check if fully vested
  const isFullyVested = now >= vestingEndDate;
  if (isFullyVested) {
    return {
      totalAmount,
      releasedAmount: totalAmount,
      lockedAmount: 0,
      progressPercentage: 100,
      isCliffPassed: true,
      isFullyVested: true,
      nextUnlockDate: null,
      nextUnlockAmount: 0,
    };
  }

  // Calculate vested amount based on time elapsed since cliff
  const monthsSinceCliff = getMonthsDifference(cliffEndDate, now);

  // Determine unlock frequency
  const frequency = order.vestingFrequency; // 1=monthly, 2=yearly
  const unlocksPerMonth = frequency === 1 ? 1 : 1 / 12; // Monthly or yearly

  // Calculate number of unlocks that have occurred
  const numUnlocks = Math.floor(monthsSinceCliff * unlocksPerMonth);

  // Calculate total number of unlocks over vesting period
  const totalUnlocks = vestingMonths * unlocksPerMonth;

  // Calculate amount per unlock
  const amountPerUnlock = totalAmount / totalUnlocks;

  // Calculate released amount
  const releasedAmount = Math.min(numUnlocks * amountPerUnlock, totalAmount);
  const lockedAmount = totalAmount - releasedAmount;

  // Calculate progress percentage
  const progressPercentage = Math.min((releasedAmount / totalAmount) * 100, 100);

  // Calculate next unlock date
  const nextUnlockDate = calculateNextUnlockDate(cliffEndDate, numUnlocks, frequency);

  return {
    totalAmount,
    releasedAmount,
    lockedAmount,
    progressPercentage,
    isCliffPassed: true,
    isFullyVested: false,
    nextUnlockDate,
    nextUnlockAmount: amountPerUnlock,
  };
}

/**
 * Parse GMT+8 datetime string to Date object
 * Format: "2025-01-15 10:30:00"
 */
function parseGMT8DateTime(dateTimeStr: string): Date {
  const [datePart, timePart] = dateTimeStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  // Create date in UTC, then adjust for GMT+8 (subtract 8 hours)
  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
  date.setHours(date.getHours() - 8);

  return date;
}

/**
 * Get difference in months between two dates
 */
function getMonthsDifference(startDate: Date, endDate: Date): number {
  const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthsDiff = endDate.getMonth() - startDate.getMonth();
  const daysDiff = endDate.getDate() - startDate.getDate();

  let totalMonths = yearsDiff * 12 + monthsDiff;

  // If days haven't reached the same day of month, don't count this month yet
  if (daysDiff < 0) {
    totalMonths -= 1;
  }

  return Math.max(0, totalMonths);
}

/**
 * Calculate amount that unlocks per period
 */
function calculateUnlockAmount(totalAmount: number, vestingMonths: number, frequency: number): number {
  const unlocksPerMonth = frequency === 1 ? 1 : 1 / 12;
  const totalUnlocks = vestingMonths * unlocksPerMonth;
  return totalAmount / totalUnlocks;
}

/**
 * Calculate the next unlock date
 */
function calculateNextUnlockDate(cliffEndDate: Date, numUnlocksPassed: number, frequency: number): Date {
  const nextUnlock = new Date(cliffEndDate);

  if (frequency === 1) {
    // Monthly unlocks
    nextUnlock.setMonth(nextUnlock.getMonth() + numUnlocksPassed + 1);
  } else {
    // Yearly unlocks
    nextUnlock.setFullYear(nextUnlock.getFullYear() + numUnlocksPassed + 1);
  }

  return nextUnlock;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
