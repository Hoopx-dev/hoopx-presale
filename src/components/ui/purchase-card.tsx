import Image from 'next/image';

export interface PurchaseCardProps {
  /**
   * Token logo image path
   */
  logo: string;
  /**
   * Activity name (e.g., "Hoopx Preseed")
   */
  activityName: string;
  /**
   * Token symbol (e.g., "HOOPX")
   */
  tokenSymbol?: string;
  /**
   * Token price in USDT
   */
  tokenPrice: string;
  /**
   * Amount in USDT
   */
  amount: number;
  /**
   * Amount in tokens
   */
  tokenAmount: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function PurchaseCard({
  logo,
  activityName,
  tokenSymbol = 'HOOPX',
  tokenPrice,
  amount,
  tokenAmount,
  className = '',
}: PurchaseCardProps) {
  const formatUSDT = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatTokenAmount = (num: number) => {
    // If amount >= 100, round down to 2 decimals, otherwise round down to 6 decimals
    const decimals = num >= 100 ? 2 : 6;
    const multiplier = Math.pow(10, decimals);
    const roundedDown = Math.floor(num * multiplier) / multiplier;
    return roundedDown.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals
    });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 ${className}`}
      style={{
        background: 'linear-gradient(to right, rgba(81, 39, 132, 0.4) 0%, rgba(81, 39, 132, 0.1) 100%)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Token Logo */}
        <div className="flex-shrink-0">
          <Image
            src={logo}
            alt={activityName}
            width={64}
            height={64}
            className="w-16 h-16"
          />
        </div>

        {/* Token Info */}
        <div className="flex-1">
          <h3 className="text-white font-bold text-xl mb-1">{activityName}</h3>
          <p className="text-white/70 text-sm">{tokenPrice} USDT</p>
        </div>

        {/* Amount Info */}
        <div className="text-right">
          <p className="text-white font-bold text-base mb-1">
            {formatUSDT(amount)} USDT
          </p>
          <p className="text-white/70 text-sm">
            {formatTokenAmount(tokenAmount)} {tokenSymbol}
          </p>
        </div>
      </div>
    </div>
  );
}
