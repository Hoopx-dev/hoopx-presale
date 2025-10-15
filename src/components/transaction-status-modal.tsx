'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHoopxWalletStore } from '@/lib/store/useHoopxWalletStore';

type TransactionStatus = 'sending' | 'success';

interface TransactionStatusModalProps {
  isOpen: boolean;
  status: TransactionStatus;
  amount: number;
  transactionId?: string;
  onClose: () => void;
}

export default function TransactionStatusModal({
  isOpen,
  status,
  amount,
  transactionId,
  onClose,
}: TransactionStatusModalProps) {
  const t = useTranslations('transaction');
  const router = useRouter();
  const { truncatedHoopxAddress } = useHoopxWalletStore();

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

  const handleClose = () => {
    onClose();
    if (status === 'success') {
      // Redirect to portfolio after successful transaction
      router.push('/portfolio');
    }
  };

  const handleViewTransaction = () => {
    if (transactionId) {
      window.open(`https://solscan.io/tx/${transactionId}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={status === 'success' ? handleClose : undefined}
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

        {/* Status Icon */}
        <div className="flex flex-col items-center mb-6">
          {status === 'sending' ? (
            // Sending animation
            <div className="relative mb-4">
              <Image
                src="/images/sending.png"
                alt="Sending"
                width={120}
                height={120}
                className="w-30 h-30 animate-pulse"
              />
            </div>
          ) : (
            // Success icon
            <div className="relative mb-4">
              <Image
                src="/images/sent.png"
                alt="Success"
                width={120}
                height={120}
                className="w-30 h-30"
              />
            </div>
          )}

          {/* Status Text */}
          <p className="text-white text-2xl font-bold mb-2">
            {status === 'sending' ? t('sending') : t('sendSuccess')}
          </p>

          {status === 'success' && (
            <p className="text-gray-400 text-sm">
              {formatNumber(amount)} USDT {t('sentTo')} {truncatedHoopxAddress}
            </p>
          )}
        </div>

        {/* View Transaction Link */}
        {status === 'success' && transactionId && (
          <button
            onClick={handleViewTransaction}
            className="w-full text-yellow-500 hover:text-yellow-400 text-sm mb-6 cursor-pointer underline"
          >
            {t('viewTransaction')}
          </button>
        )}

        {/* Close Button (only for success state) */}
        {status === 'success' && (
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold text-lg py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
          >
            {t('close')}
          </button>
        )}

        {/* Sending indicator */}
        {status === 'sending' && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        )}
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
