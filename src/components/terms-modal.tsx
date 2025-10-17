'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import ReactMarkdown from 'react-markdown';
import { useTerms } from '@/lib/purchase/hooks';
import { useLocaleSettings } from '@/components/locale-provider';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function TermsModal({ isOpen, onAccept }: TermsModalProps) {
  const t = useTranslations('terms');
  const tCommon = useTranslations('common');
  const { locale } = useLocaleSettings();
  // Map 'cn' to 'zh' for API call, 'en' stays as 'en'
  const apiLang = locale === 'cn' ? 'zh' : 'en';
  const { data: termsMarkdown, isLoading } = useTerms(apiLang, isOpen);
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
            {t('modalTitle')}
          </h2>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-white/80">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-white mb-3 mt-5">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-white/80 mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2 text-white/80">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2 text-white/80">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-white/80 leading-relaxed">
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-bold">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-white/90 italic">
                      {children}
                    </em>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-cyan-400 pl-4 italic text-white/70 my-4">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-800 text-cyan-300 px-1.5 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  ),
                }}
              >
                {termsText || ''}
              </ReactMarkdown>
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
                ? 'text-yellow-400 hover:text-yellow-300 cursor-pointer transform hover:scale-105'
                : 'text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {canClose ? tCommon('continue') : `${tCommon('continue')} (${countdown})`}
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
