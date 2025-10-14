'use client';

import { usePurchaseDetails } from '@/lib/purchase/hooks';

export default function PurchaseDetailsDebug() {
  const { data, isLoading, error } = usePurchaseDetails();

  if (isLoading) {
    return (
      <div className="mt-8 p-4 bg-purple-800/30 rounded-lg">
        <p className="text-white text-sm">Loading purchase details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-900/30 rounded-lg">
        <p className="text-red-300 text-sm">
          Error loading purchase details: {error.message}
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mt-8 p-4 bg-purple-800/30 rounded-lg">
      <h3 className="text-white font-semibold mb-3">Purchase Details (Debug)</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/70">Activity ID:</span>
          <span className="text-white">{data.activityId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Exchange Rate:</span>
          <span className="text-white">{data.rate} USDT/HOOPX</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Cliff Period:</span>
          <span className="text-white">{data.cliff} days</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Vesting Period:</span>
          <span className="text-white">{data.vesting} days</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Release Frequency:</span>
          <span className="text-white">{data.vestingFrequency}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Available Tiers:</span>
          <span className="text-white">{data.tiers.join(', ')} USDT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Total Tokens:</span>
          <span className="text-white">{data.tokenTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Total Purchased:</span>
          <span className="text-white">{data.purchasedAmount.toLocaleString()} USDT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Start Time:</span>
          <span className="text-white">{data.startTime} ({data.timezone})</span>
        </div>
      </div>
    </div>
  );
}
