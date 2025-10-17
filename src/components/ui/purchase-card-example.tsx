'use client';

import PurchaseCard from './purchase-card';

/**
 * PurchaseCard Component Examples
 *
 * Demonstrates usage of the reusable purchase card component
 */

export default function PurchaseCardExamples() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Purchase Card Component Examples
      </h1>

      {/* Example 1: Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Basic Usage</h2>
        <PurchaseCard
          logo="/images/token-badge.png"
          activityName="Hoopx Preseed"
          tokenSymbol="HOOPX"
          tokenPrice="0.003"
          amount={2000}
          tokenAmount={666666.67}
        />
      </section>

      {/* Example 2: Different Amounts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Different Amounts</h2>
        <div className="space-y-3">
          <PurchaseCard
            logo="/images/token-badge.png"
            activityName="Hoopx Preseed"
            tokenSymbol="HOOPX"
            tokenPrice="0.003"
            amount={1000}
            tokenAmount={333333.33}
          />
          <PurchaseCard
            logo="/images/token-badge.png"
            activityName="Hoopx Preseed"
            tokenSymbol="HOOPX"
            tokenPrice="0.003"
            amount={3000}
            tokenAmount={1000000}
          />
          <PurchaseCard
            logo="/images/token-badge.png"
            activityName="Hoopx Preseed"
            tokenSymbol="HOOPX"
            tokenPrice="0.003"
            amount={5000}
            tokenAmount={1666666.67}
          />
        </div>
      </section>

      {/* Example 3: With Custom Class */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">With Custom Styling</h2>
        <PurchaseCard
          logo="/images/token-badge.png"
          activityName="Hoopx Preseed"
          tokenSymbol="HOOPX"
          tokenPrice="0.003"
          amount={2000}
          tokenAmount={666666.67}
          className="shadow-lg hover:shadow-xl transition-shadow"
        />
      </section>

      {/* Example 4: In a Grid Layout */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Grid Layout</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PurchaseCard
            logo="/images/token-badge.png"
            activityName="Hoopx Preseed"
            tokenSymbol="HOOPX"
            tokenPrice="0.003"
            amount={1000}
            tokenAmount={333333.33}
          />
          <PurchaseCard
            logo="/images/token-badge.png"
            activityName="Hoopx Preseed"
            tokenSymbol="HOOPX"
            tokenPrice="0.003"
            amount={2000}
            tokenAmount={666666.67}
          />
        </div>
      </section>
    </div>
  );
}
