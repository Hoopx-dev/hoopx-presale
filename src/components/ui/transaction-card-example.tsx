'use client';

import TransactionCard from './transaction-card';

/**
 * TransactionCard Component Examples
 *
 * Demonstrates usage of the reusable transaction card component
 */

export default function TransactionCardExamples() {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const handleCardClick = (txId: string) => {
    console.log('Transaction clicked:', txId);
  };

  return (
    <div className="min-h-screen p-8 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Transaction Card Component Examples
      </h1>

      {/* Example 1: Outgoing Transaction */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Outgoing Transaction</h2>
        <TransactionCard
          logo="/images/usdt-badge.png"
          tokenSymbol="USDT"
          amount={2000}
          address="CiC7nF4fZ9pQvWr3kXu2pFxZm1"
          timestamp={currentTimestamp}
          statusLabel="已转账"
          isOutgoing={true}
          onClick={() => handleCardClick('tx1')}
        />
      </section>

      {/* Example 2: Small Amount */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Small Amount</h2>
        <TransactionCard
          logo="/images/usdt-badge.png"
          tokenSymbol="USDT"
          amount={0.01}
          address="CiC7nF4fZ9pQvWr3kXu2pFxZm1"
          timestamp={currentTimestamp - 3600}
          statusLabel="已转账"
          isOutgoing={true}
        />
      </section>

      {/* Example 3: Incoming Transaction */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Incoming Transaction</h2>
        <TransactionCard
          logo="/images/usdt-badge.png"
          tokenSymbol="USDT"
          amount={1500}
          address="7xK2nQ8vF5pWr3kXu2pFxZm1nF"
          timestamp={currentTimestamp - 7200}
          statusLabel="已接收"
          isOutgoing={false}
          onClick={() => handleCardClick('tx2')}
        />
      </section>

      {/* Example 4: No Logo (Fallback) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Without Logo</h2>
        <TransactionCard
          logo=""
          tokenSymbol="HOOPX"
          amount={666666.67}
          address="CiC7nF4fZ9pQvWr3kXu2pFxZm1"
          timestamp={currentTimestamp - 86400}
          statusLabel="已转账"
          isOutgoing={true}
        />
      </section>

      {/* Example 5: Transaction List */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Transaction List</h2>
        <div className="space-y-3">
          {[
            { amount: 2000, time: currentTimestamp },
            { amount: 1000, time: currentTimestamp - 3600 },
            { amount: 500, time: currentTimestamp - 7200 },
          ].map((tx, index) => (
            <TransactionCard
              key={index}
              logo="/images/usdt-badge.png"
              tokenSymbol="USDT"
              amount={tx.amount}
              address="CiC7nF4fZ9pQvWr3kXu2pFxZm1"
              timestamp={tx.time}
              statusLabel="已转账"
              isOutgoing={true}
              onClick={() => handleCardClick(`tx-${index}`)}
            />
          ))}
        </div>
      </section>

      {/* Example 6: Without Click Handler */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Non-Clickable</h2>
        <TransactionCard
          logo="/images/usdt-badge.png"
          tokenSymbol="USDT"
          amount={2000}
          address="CiC7nF4fZ9pQvWr3kXu2pFxZm1"
          timestamp={currentTimestamp}
          statusLabel="已转账"
          isOutgoing={true}
        />
      </section>
    </div>
  );
}
