"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocaleSettings } from "./locale-provider";
import WalletButton from "./wallet-button";
import { Button } from "./ui/button";

export default function Header() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocaleSettings();
  const isHomepage = pathname === "/";

  const toggleLocale = () => {
    setLocale(locale === "en" ? "cn" : "en");
  };

  return (
    <header className='flex items-center justify-between mb-4 gap-2 sm:gap-3'>
      {/* Logo - hidden on homepage */}
      {!isHomepage && (
        <div className="flex-shrink-0">
          <Image
            src="/images/brand-logo.png"
            alt="HOOPX"
            width={120}
            height={36}
            className="w-auto h-7 sm:h-9 object-contain"
            priority
          />
        </div>
      )}

      {/* Right Side Buttons */}
      <div className={`flex items-center gap-2 sm:gap-3 ${isHomepage ? 'ml-auto' : ''}`}>
        {/* Connect Wallet Button */}
        <WalletButton />

        {/* Language Toggle */}
        <Button
          variant="secondary"
          size="small"
          onClick={toggleLocale}
          className="flex-shrink-0"
        >
          {locale === "en" ? "EN" : "中文"}
        </Button>
      </div>
    </header>
  );
}
