"use client";

import { useLocaleSettings } from "./locale-provider";
import WalletButton from "./wallet-button";

export default function Header() {
  const { locale, setLocale } = useLocaleSettings();

  const toggleLocale = () => {
    setLocale(locale === "en" ? "cn" : "en");
  };

  return (
    <header className='flex items-center justify-end mb-4 gap-3'>
      {/* Connect Wallet Button */}
      <WalletButton />

      {/* Language Toggle */}
      <button
        onClick={toggleLocale}
        className='text-white text-base px-4 py-2 rounded-lg border border-white/30 hover:border-white/50 hover:bg-white/10 transition-all cursor-pointer font-medium h-10'
      >
        {locale === "en" ? "EN" : "中文"}
      </button>
    </header>
  );
}
