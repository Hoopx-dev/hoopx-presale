'use client';

import { useEffect, useState } from 'react';
import { useTerms } from '@/lib/purchase/hooks';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function TermsModal({ isOpen, onAccept }: TermsModalProps) {
  const { data: termsMarkdown, isLoading } = useTerms(isOpen);
  const [countdown, setCountdown] = useState(10);
  const [canClose, setCanClose] = useState(false);

  // Type assertion for termsMarkdown (it's a string from the API)
  const termsText = termsMarkdown as string | undefined;

  // Countdown timer
  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setCanClose(false);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
    }
  }, [isOpen, countdown]);

  // Prevent body scroll when modal is open
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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-gray-900 rounded-3xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-700">
          <h2 className="text-white text-xl font-bold text-center">
            HOOPX Token 用户认购条款
          </h2>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
              {termsText}
            </div>
          )}
        </div>

        {/* Footer - Continue Button */}
        <div className="px-6 py-5 border-t border-gray-700">
          <button
            onClick={onAccept}
            disabled={!canClose}
            className={`
              w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200
              ${canClose
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 cursor-pointer transform hover:scale-105 shadow-lg'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {canClose ? '继续' : `继续 (${countdown})`}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
