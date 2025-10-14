// src/components/locale-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/i18n/locales/en.json';
import cn from '@/i18n/locales/cn.json';

type Lang = 'en' | 'cn';
type Ctx = { locale: Lang; setLocale: (l: Lang) => void };

const LocaleCtx = createContext<Ctx | null>(null);

const MESSAGES: Record<Lang, Record<string, unknown>> = { en, cn };

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Lang>('en');

  // load from storage once
  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved === 'en' || saved === 'cn') setLocale(saved);
  }, []);

  // persist on change
  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const value = useMemo<Ctx>(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleCtx.Provider value={value}>
      {/* key={locale} ensures the provider remounts with new messages */}
      <NextIntlClientProvider
        key={locale}
        locale={locale}
        messages={MESSAGES[locale]}
        timeZone="Asia/Shanghai"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleCtx.Provider>
  );
}

export function useLocaleSettings() {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error('useLocaleSettings must be used within <LocaleProvider>');
  return ctx;
}
