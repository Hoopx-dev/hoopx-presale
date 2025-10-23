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
 * Create Jupiter deep link for mobile
 * Opens Jupiter app with the website URL in Jupiter's in-app browser
 */
export function createJupiterDeepLink(websiteUrl: string): string {
  // Encode the website URL
  const encodedUrl = encodeURIComponent(websiteUrl);

  // Jupiter uses a universal link format
  // This will open Jupiter app and load the URL in their browser
  return `https://jup.ag/browser?url=${encodedUrl}`;
}

/**
 * Open Jupiter app on mobile with current website
 */
export function openInJupiterApp(referralAddress?: string): void {
  if (typeof window === 'undefined') return;

  // Build current URL with referral params
  const currentUrl = buildUrlWithReferral(window.location.href, referralAddress);

  // Create deep link
  const deepLink = createJupiterDeepLink(currentUrl);

  // Redirect to Jupiter app
  window.location.href = deepLink;
}
