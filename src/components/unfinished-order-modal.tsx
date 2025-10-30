"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import type { PreOrderVO } from "@/lib/purchase/types";

interface UnfinishedOrderModalProps {
  isOpen: boolean;
  preOrder: PreOrderVO | null;
  onSubmit: (trxId: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export default function UnfinishedOrderModal({
  isOpen,
  preOrder,
  onSubmit,
  onClose,
  loading = false,
}: UnfinishedOrderModalProps) {
  const t = useTranslations("unfinishedOrder");
  const [trxId, setTrxId] = useState("");
  const [error, setError] = useState("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTrxId("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !preOrder) return null;

  const handleSubmit = () => {
    if (!trxId.trim()) {
      setError(t("errorEmpty"));
      return;
    }

    // Basic validation - Solana transaction IDs are base58 encoded, typically 88 characters
    if (trxId.length < 40) {
      setError(t("errorInvalid"));
      return;
    }

    setError("");
    onSubmit(trxId.trim());
  };

  const formatNumber = (num: number) => num.toLocaleString("en-US");

  return (
    <div className='fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className='relative w-full sm:max-w-md bg-gradient-to-b from-gray-900 to-black rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className='w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6' />

        {/* Title */}
        <h2 className='text-white text-xl font-bold text-center mb-4'>
          {t("title")}
        </h2>

        {/* Description */}
        <p className='text-gray-400 text-sm text-center mb-8'>
          {t("description")}
        </p>

        {/* Order Details */}
        <div className='bg-gray-800/50 rounded-xl p-4 mb-6 space-y-3'>
          <div className='flex justify-between items-center'>
            <span className='text-gray-400 text-sm'>{t("amount")}</span>
            <span className='text-white font-medium text-sm'>
              {formatNumber(preOrder.amountUsdt)} USDT
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-gray-400 text-sm'>{t("receive")}</span>
            <span className='text-white font-medium text-sm'>
              {formatNumber(preOrder.amountToken)} HOOPX
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-gray-400 text-sm'>{t("createdAt")}</span>
            <span className='text-white font-medium text-sm'>
              {new Date(preOrder.createTime).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Transaction ID Input */}
        <div className='mb-6'>
          <label
            htmlFor='trxId'
            className='block text-white text-sm font-medium mb-2'
          >
            {t("trxIdLabel")}
          </label>
          <input
            id='trxId'
            type='text'
            value={trxId}
            onChange={(e) => {
              setTrxId(e.target.value);
              setError("");
            }}
            placeholder={t("trxIdPlaceholder")}
            className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors'
            disabled={loading}
          />
          {error && <p className='text-red-500 text-xs mt-2'>{error}</p>}
          <p className='text-gray-500 text-xs mt-2'>{t("trxIdHint")}</p>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3'>
          <Button
            variant='secondary'
            size='large'
            onClick={onClose}
            disabled={loading}
            className='flex-1'
          >
            {t("cancel")}
          </Button>
          <Button
            variant='primary'
            size='large'
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || !trxId.trim()}
            className='flex-1'
          >
            {loading ? t("submitting") : t("submit")}
          </Button>
        </div>
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
