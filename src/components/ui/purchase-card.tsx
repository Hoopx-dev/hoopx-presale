import Image from 'next/image';

export interface PurchaseCardProps {
  /**
   * Token logo image path
   */
  logo: string;
  /**
   * Token name (e.g., "HOOPX")
   */
  tokenName: string;
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
  tokenName,
  tokenPrice,
  amount,
  tokenAmount,
  className = '',
}: PurchaseCardProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
            alt={tokenName}
            width={64}
            height={64}
            className="w-16 h-16"
          />
        </div>

        {/* Token Info */}
        <div className="flex-1">
          <h3 className="text-white font-bold text-xl mb-1">{tokenName}</h3>
          <p className="text-white/70 text-sm">{tokenPrice} USDT</p>
        </div>

        {/* Amount Info */}
        <div className="text-right">
          <p className="text-white font-bold text-2xl mb-1">
            {formatNumber(amount)} USDT
          </p>
          <p className="text-white/70 text-sm">
            {formatNumber(tokenAmount)} {tokenName}
          </p>
        </div>
      </div>
    </div>
  );
}
