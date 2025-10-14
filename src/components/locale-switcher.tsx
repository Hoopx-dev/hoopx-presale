'use client';

import { useLocaleSettings } from './locale-provider';
import { localeNames } from '@/i18n/config';

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleSettings();

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as 'en' | 'cn')}
        className="bg-transparent text-white text-sm border border-white/20 rounded px-3 py-1 cursor-pointer hover:border-white/40 transition-colors"
      >
        {Object.entries(localeNames).map(([code, name]) => (
          <option key={code} value={code} className="bg-purple-900 text-white">
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
