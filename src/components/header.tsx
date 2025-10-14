"use client";

import { useLocaleSettings } from "./locale-provider";

export default function Header() {
  const { locale, setLocale } = useLocaleSettings();

  const toggleLocale = () => {
    setLocale(locale === "en" ? "cn" : "en");
  };

  return (
    <header className='flex items-center justify-between mb-12'>
      <div className='flex items-center gap-2'>
        <div className='w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center'>
          <span className='text-white text-2xl'>🏀</span>
        </div>
        <h1 className='text-white text-2xl font-bold'>HOOPX</h1>
      </div>
      <button
        onClick={toggleLocale}
        className='text-white text-sm px-3 py-1 rounded border border-white/20 hover:border-white/40 transition-colors cursor-pointer'
      >
        {locale === "en" ? "中文" : "EN"}
      </button>
    </header>
  );
}
