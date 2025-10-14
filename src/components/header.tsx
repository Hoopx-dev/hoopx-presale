"use client";

import Image from "next/image";
import { useLocaleSettings } from "./locale-provider";
import WalletButton from "./wallet-button";

export default function Header() {
  const { locale, setLocale } = useLocaleSettings();

  const toggleLocale = () => {
    setLocale(locale === "en" ? "cn" : "en");
  };

  return (
    <header className='flex items-center justify-between mb-4 gap-3'>
      {/* Logo */}
      <div className="flex-shrink-0">
        <Image
          src="/images/brand-logo.png"
          alt="HOOPX"
          width={120}
          height={36}
          className="w-auto h-9 object-contain"
          priority
        />
      </div>

      {/* Right Side Buttons */}
      <div className="flex items-center gap-3">
        {/* Connect Wallet Button */}
        <WalletButton />

        {/* Language Toggle */}
        <button
          onClick={toggleLocale}
          className='text-white text-base px-4 py-2 rounded-lg border border-white/30 hover:border-white/50 hover:bg-white/10 transition-all cursor-pointer font-medium h-10'
        >
          {locale === "en" ? "EN" : "中文"}
        </button>
      </div>
    </header>
  );
}
