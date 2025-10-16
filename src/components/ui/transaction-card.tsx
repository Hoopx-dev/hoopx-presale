import Image from 'next/image';
import { FiArrowUpRight } from 'react-icons/fi';
import { formatAddress } from '@/lib/solana/transactions';

export interface TransactionCardProps {
  /**
   * Token logo image path
   */
  logo: string;
  /**
   * Token symbol (e.g., "USDT")
   */
  tokenSymbol: string;
  /**
   * Transaction amount (negative for outgoing, positive for incoming)
   */
  amount: number;
  /**
   * Recipient or sender address
   */
  address: string;
  /**
   * Transaction timestamp (in seconds)
   */
  timestamp: number;
  /**
   * Transaction status label (e.g., "Transferred", "Received")
   */
  statusLabel: string;
  /**
   * Whether the transaction is outgoing (true) or incoming (false)
   */
  isOutgoing?: boolean;
  /**
   * Click handler for the card
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function TransactionCard({
  logo,
  tokenSymbol,
  amount,
  address,
  timestamp,
  statusLabel,
  isOutgoing = true,
  onClick,
  className = '',
}: TransactionCardProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4 ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
      style={{
        background: 'linear-gradient(to right, rgba(81, 39, 132, 0.4) 0%, rgba(81, 39, 132, 0.1) 100%)',
      }}
    >
      {/* Top row: Status and Time */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1 bg-purple-900/60 rounded-full px-3 py-1">
          <FiArrowUpRight className="w-3 h-3 text-green-400" />
          <span className="text-green-400 text-xs">{statusLabel}</span>
        </div>
        <span className="text-white/50 text-xs">
          {formatTime(timestamp)}
        </span>
      </div>

      {/* Bottom row: Logo, Info, Amount */}
      <div className="flex items-center gap-3">
        {/* Token Logo */}
        {logo ? (
          <Image
            src={logo}
            alt={tokenSymbol}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">
              {tokenSymbol.charAt(0)}
            </span>
          </div>
        )}

        {/* Transaction Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-xl mb-1">
            {tokenSymbol}
          </p>
          <p className="text-white/50 text-sm">
            {isOutgoing ? '至' : '来自'}: {formatAddress(address)}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className={`font-bold text-xl ${
            isOutgoing ? 'text-red-400' : 'text-green-400'
          }`}>
            {isOutgoing ? '-' : '+'}{formatNumber(Math.abs(amount))} {tokenSymbol}
          </p>
        </div>
      </div>
    </div>
  );
}
