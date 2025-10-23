'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { buildUrlWithReferral, openInJupiterApp } from '@/lib/utils/mobile-deeplink';

interface JupiterInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralAddress?: string;
}

export default function JupiterInstructionsModal({
  isOpen,
  onClose,
  referralAddress,
}: JupiterInstructionsModalProps) {
  const t = useTranslations('wallet');
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const url = buildUrlWithReferral(window.location.href, referralAddress);
      setCurrentUrl(url);
    }
  }, [isOpen, referralAddress]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenJupiter = () => {
    // Try to open Jupiter app with URL and referral params
    openInJupiterApp(referralAddress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-purple-900 to-purple-950 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 p-6 animate-slide-up sm:animate-none max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">{t('connectWithJupiter')}</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-black font-bold">
              1
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-2">{t('jupiterStep1Title')}</p>
              <p className="text-white/70 text-sm mb-3">{t('jupiterStep1Desc')}</p>
              <button
                onClick={handleOpenJupiter}
                className="w-full px-4 py-3 bg-secondary hover:bg-secondary/90 text-black font-medium rounded-xl transition-colors"
              >
                {t('openJupiterApp')}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-black font-bold">
              2
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-2">{t('jupiterStep2Title')}</p>
              <p className="text-white/70 text-sm">{t('jupiterStep2Desc')}</p>
            </div>
          </div>

          {/* Step 3 - Copy URL */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-black font-bold">
              3
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-2">{t('jupiterStep3Title')}</p>
              <p className="text-white/70 text-sm mb-3">{t('jupiterStep3Desc')}</p>

              {/* URL Display */}
              <div className="mb-3 p-3 bg-white/5 border border-white/10 rounded-lg break-all text-white/70 text-xs">
                {currentUrl}
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyUrl}
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    {t('copyUrl')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-black font-bold">
              4
            </div>
            <div className="flex-1">
              <p className="text-white font-medium mb-2">{t('jupiterStep4Title')}</p>
              <p className="text-white/70 text-sm">{t('jupiterStep4Desc')}</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
        >
          {t('gotIt')}
        </button>
      </div>
    </div>
  );
}
