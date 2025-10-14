'use client';

import { usePurchaseDetails } from '@/lib/purchase/hooks';
import { useEffect } from 'react';

export default function PurchaseDetailsDebug() {
  const { data, isLoading, error } = usePurchaseDetails();

  // Debug logging
  useEffect(() => {
    if (data) {
      console.log('=== Purchase Details Data ===');
      console.log('Type of data:', typeof data);
      console.log('Data object:', data);
      console.log('Data keys:', Object.keys(data));
      console.log('activityId value:', data.activityId, 'type:', typeof data.activityId);
      console.log('rate value:', data.rate, 'type:', typeof data.rate);
      console.log('===========================');
    }
  }, [data]);

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

      {/* Raw API Response */}
      <details className="mb-4">
        <summary className="text-white/70 text-xs cursor-pointer hover:text-white">
          Show Raw API Response
        </summary>
        <pre className="mt-2 text-xs text-white/60 overflow-auto max-h-40 bg-black/20 p-2 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/70">Activity ID:</span>
          <span className="text-white">{data.activityId ?? 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Exchange Rate:</span>
          <span className="text-white">
            {typeof data.rate === 'string' ? parseFloat(data.rate) : (data.rate ?? 0)} USDT/HOOPX
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Cliff Period:</span>
          <span className="text-white">{data.cliff ?? 'N/A'} months</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Vesting Period:</span>
          <span className="text-white">{data.vesting ?? 'N/A'} months</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Release Frequency:</span>
          <span className="text-white">{data.vestingFrequency ?? 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Available Tiers:</span>
          <span className="text-white">
            {Array.isArray(data.tiers)
              ? data.tiers.join(', ')
              : Array.isArray(data.tierList)
              ? data.tierList.join(', ')
              : 'N/A'} USDT
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Total Tokens:</span>
          <span className="text-white">
            {data.tokenTotal
              ? (typeof data.tokenTotal === 'string'
                ? parseFloat(data.tokenTotal).toLocaleString()
                : data.tokenTotal.toLocaleString())
              : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Total Purchased:</span>
          <span className="text-white">
            {data.purchasedAmount !== undefined && data.purchasedAmount !== null
              ? (typeof data.purchasedAmount === 'string'
                ? parseFloat(data.purchasedAmount).toLocaleString()
                : data.purchasedAmount.toLocaleString())
              : 0} USDT
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Start Time:</span>
          <span className="text-white">
            {data.startTime ?? 'N/A'} ({data.timezone ?? 'N/A'})
          </span>
        </div>
      </div>
    </div>
  );
}
