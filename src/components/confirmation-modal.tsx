'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useHoopxWalletStore } from '@/lib/store/useHoopxWalletStore';
import { getSolPrice } from '@/lib/solana/price';

interface ConfirmationModalProps {
  isOpen: boolean;
  amount: number;
  hoopxAmount: number;
  rate: number;
  estimatedFee: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmationModal({
  isOpen,
  amount,
  hoopxAmount,
  rate,
  estimatedFee,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const t = useTranslations('transaction');
  const { truncatedHoopxAddress } = useHoopxWalletStore();
  const [solPrice, setSolPrice] = useState(150); // Default $150 per SOL

  // Fetch real-time SOL price when modal opens
  useEffect(() => {
    if (isOpen) {
      getSolPrice().then(setSolPrice);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatNumber = (num: number) => num.toLocaleString('en-US');

  // Calculate fee in USD based on current SOL price
  const feeInUsd = estimatedFee * solPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-md bg-gradient-to-b from-gray-900 to-black rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />

        {/* Title */}
        <h2 className="text-white text-xl font-bold text-center mb-8">
          {t('reviewTitle')}
        </h2>

        {/* USDT Icon and Amount */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Image
              src="/images/usdt.png"
              alt="USDT"
              width={80}
              height={80}
              className="w-20 h-20"
            />
            <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
          <p className="text-white text-4xl font-bold mb-1">
            {formatNumber(amount)} USDT
          </p>
          <p className="text-gray-400 text-sm">
            ${formatNumber(amount * 1.0)}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-8">
          {/* Destination */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{t('destination')}</span>
            <span className="text-white font-medium text-sm">
              {truncatedHoopxAddress || 'Loading...'}
            </span>
          </div>

          {/* Price */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{t('price')}</span>
            <span className="text-white font-medium text-sm">
              1 HOOPX = {rate} USDT
            </span>
          </div>

          {/* Transaction Fee */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{t('transactionFee')}</span>
            <span className="text-white font-medium text-sm">
              ${feeInUsd.toFixed(4)} ({estimatedFee.toFixed(5)} SOL)
            </span>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={onConfirm}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold text-lg py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
        >
          {t('confirmTransfer')}
        </button>

        {/* Note */}
        <p className="text-gray-500 text-xs text-center mt-4">
          *{t('confirmTransfer')}后，此钱包地址将会是您的接收地址
        </p>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
