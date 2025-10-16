'use client';

import InfoListCard from './info-list-card';

/**
 * InfoListCard Component Examples
 *
 * Demonstrates usage of the reusable info list card component
 */

export default function InfoListCardExamples() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Info List Card Component Examples
      </h1>

      {/* Example 1: Without Section Label */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Without Section Label</h2>
        <InfoListCard
          items={[
            {
              label: '当前认购价格',
              value: '0.003 USDT/HOOPX',
              valueColor: 'text-success',
            },
            { label: '认购上限', value: '5000 USDT' },
            { label: '当前资产', value: '0 HOOPX' },
          ]}
        />
      </section>

      {/* Example 2: With Section Label */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">With Section Label</h2>
        <InfoListCard
          sectionLabel="认购详情"
          items={[
            { label: 'HOOPX获取', value: '666,666.666666' },
            { label: '归属期', value: '15个月' },
            { label: '锁定期', value: '3个月' },
            { label: '释放频率', value: '每月' },
          ]}
        />
      </section>

      {/* Example 3: Purchase Information */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Purchase Information</h2>
        <InfoListCard
          sectionLabel="Purchase Details"
          items={[
            { label: 'Token Price', value: '0.003 USDT', valueColor: 'text-success' },
            { label: 'Purchase Limit', value: '5000 USDT' },
            { label: 'Vesting Period', value: '12 months' },
            { label: 'Cliff Period', value: '3 months' },
            { label: 'Release Frequency', value: 'Monthly' },
          ]}
        />
      </section>

      {/* Example 4: Multiple Cards in Sequence */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Multiple Cards</h2>
        <div className="space-y-6">
          <InfoListCard
            items={[
              {
                label: 'Current Price',
                value: '0.003 USDT/HOOPX',
                valueColor: 'text-success',
              },
              { label: 'Max Purchase', value: '5000 USDT' },
              { label: 'Current Balance', value: '0 HOOPX' },
            ]}
          />
          <InfoListCard
            sectionLabel="Vesting Information"
            items={[
              { label: 'HOOPX Tokens', value: '333,333.33' },
              { label: 'Vesting Period', value: '12 months' },
              { label: 'Cliff Period', value: '3 months' },
              { label: 'Release Schedule', value: 'Monthly' },
            ]}
          />
        </div>
      </section>

      {/* Example 5: Custom Styling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Custom Styling</h2>
        <InfoListCard
          sectionLabel="Transaction Summary"
          items={[
            { label: 'Amount', value: '2000 USDT', valueColor: 'text-secondary' },
            { label: 'Fee', value: '0.00001 SOL', valueColor: 'text-white/70' },
            { label: 'Total', value: '2000 USDT', valueClassName: 'font-bold text-white' },
          ]}
          className="max-w-md"
        />
      </section>
    </div>
  );
}
