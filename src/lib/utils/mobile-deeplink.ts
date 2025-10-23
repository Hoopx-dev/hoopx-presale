/**
 * Mobile deep linking utilities for wallet apps
 */

/**
 * Detect if user is in a wallet app's in-app browser
 */
export function isInWalletBrowser(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // Check for known wallet app browsers
  const walletBrowsers = [
    'phantom',
    'solflare',
    'backpack',
    'glow',
    'slope',
    'trust',
    'coinbase',
    'metamask',
  ];

  return walletBrowsers.some(wallet => userAgent.includes(wallet));
}

/**
 * Detect if user is on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detect if user is in mobile browser (not wallet app)
 */
export function isInMobileBrowser(): boolean {
  return isMobileDevice() && !isInWalletBrowser();
}

/**
 * Build URL with referral parameters
 */
export function buildUrlWithReferral(baseUrl: string, referralAddress?: string): string {
  const url = new URL(baseUrl);

  if (referralAddress) {
    url.searchParams.set('ref', referralAddress);
  }

  return url.toString();
}

/**
 * Open Jupiter app on mobile with URL
 * Try multiple deep link formats to find the one that works
 */
export function openInJupiterApp(referralAddress?: string): void {
  if (typeof window === 'undefined') return;

  // Build current URL with referral params
  const currentUrl = buildUrlWithReferral(window.location.href, referralAddress);

  // Try Jupiter deep link format: jupiter://dapp?url=...
  const deepLink = `jupiter://dapp?url=${encodeURIComponent(currentUrl)}`;

  console.log('Trying Jupiter deep link:', deepLink);
  window.location.href = deepLink;

  // Fallback: If Jupiter app doesn't open in 2 seconds, open app store
  const timeout = setTimeout(() => {
    // Detect Android or iOS
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      // Open Jupiter on Google Play Store
      window.location.href = 'https://play.google.com/store/apps/details?id=ag.jup.jupiter';
    } else if (isIOS) {
      // Open Jupiter on Apple App Store
      window.location.href = 'https://apps.apple.com/app/jupiter-wallet/id6449832272';
    }
  }, 2000);

  // Clear timeout if page unloads (app opened successfully)
  window.addEventListener('blur', () => {
    clearTimeout(timeout);
  }, { once: true });
}

/**
 * Alternative Jupiter deep link formats to try:
 * - jupiter://dapp?url={url}
 * - jupiter://open?url={url}
 * - jupiter://browse/{url}
 * - jupiter://wc?uri={url}
 */
