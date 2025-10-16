import LocaleProvider from "@/components/locale-provider";
import Providers from "@/components/providers";
import StagingWatermark from "@/components/staging-watermark";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HOOPX Presale - Basketball Token on Solana",
  description:
    "Join the HOOPX token presale. Purchase HOOPX tokens with USDT on Solana blockchain with vesting periods.",
  icons: {
    icon: "/images/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LocaleProvider>{children}</LocaleProvider>
        </Providers>
        <StagingWatermark />
        <div className='py-8'></div>
      </body>
    </html>
  );
}
