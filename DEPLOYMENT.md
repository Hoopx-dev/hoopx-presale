# Vercel Deployment Guide

## Issues Fixed

### 1. Removed Turbopack from Production Build
- **Issue**: Turbopack (`--turbopack`) is experimental and not fully supported by Vercel
- **Fix**: Updated `package.json` to only use Turbopack in development
  ```json
  "scripts": {
    "dev": "next dev --turbopack -p 3007",  // Turbopack for dev
    "build": "next build",                  // Standard build for production
  }
  ```

### 2. HTTP API on HTTPS Deployment
- **Issue**: Your API URL is `http://54.46.105.230:9092` (HTTP)
- **Problem**: Vercel deploys over HTTPS, causing mixed content warnings/errors
- **Solution Options**:
  1. Use HTTPS for your API (recommended)
  2. Configure a reverse proxy
  3. Use Vercel's API routes as a proxy

## Vercel Environment Variables Setup

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

### Required Variables

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://54.46.105.230:9092` | ⚠️ HTTP may cause issues on HTTPS |
| `NEXT_PUBLIC_IS_STAGING` | `false` (production)<br>`true` (staging) | Controls staging watermark |
| `NEXT_PUBLIC_AES_KEY` | `9rDwYuLr+WvuC8OnfBfCbg==` | AES encryption key |
| `NEXT_PUBLIC_AES_IV` | `l8RvOT8Vgfp6zyBxKY7Hxw==` | AES initialization vector |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY` | Solana RPC endpoint |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `a68ca0938f2edf95553df17e33a52d54` | WalletConnect project ID |

### Environment Scopes

For each variable, select the appropriate environments:
- ✅ **Production** - Live site
- ✅ **Preview** - Pull request previews
- ✅ **Development** - Local development (optional)

## Deployment Steps

### 1. Commit Changes
```bash
git add package.json next.config.ts
git commit -m "fix: Remove Turbopack from production build for Vercel compatibility"
git push origin main
```

### 2. Configure Vercel Environment Variables
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Select your project
- Go to **Settings → Environment Variables**
- Add all variables listed above

### 3. Redeploy
- Go to **Deployments**
- Click **⋮** (three dots) on the latest deployment
- Click **Redeploy**

## Fixing the HTTP API Issue

### Option 1: Use HTTPS for API (Recommended)
Update your API server to support HTTPS, then change the env var:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.hoopx.gg
```

### Option 2: Use Vercel API Proxy
Create a proxy in Next.js to avoid mixed content:

1. Create `/src/app/api/proxy/[...path]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api/proxy/', '');
  const apiUrl = `http://54.46.105.230:9092/${path}`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  return NextResponse.json(data);
}
```

2. Update `NEXT_PUBLIC_API_BASE_URL`:
```env
NEXT_PUBLIC_API_BASE_URL=/api/proxy
```

### Option 3: Use Cloudflare Tunnel (Advanced)
Set up a Cloudflare tunnel to expose your HTTP API as HTTPS.

## Troubleshooting

### Build Still Failing?

1. **Check build logs** in Vercel dashboard for specific errors
2. **Verify environment variables** are set correctly
3. **Test build locally**:
   ```bash
   pnpm build
   ```
4. **Clear Vercel cache**:
   - Go to Settings → General
   - Click "Clear Build Cache"

### Mixed Content Errors?

If you see console errors about "mixed content" (HTTP on HTTPS):
- This is due to HTTP API URL on HTTPS deployment
- Use Option 2 (API Proxy) above as a quick fix

### API Not Responding?

- Check if `54.46.105.230:9092` is accessible from Vercel's servers
- Verify your API server allows requests from Vercel's IP ranges
- Check CORS configuration on your API

## Performance Tips

1. **Use HTTPS API**: Faster and more secure
2. **CDN for static assets**: Vercel automatically handles this
3. **Optimize images**: Use Next.js Image component (already implemented)
4. **Monitor bundle size**: Run `pnpm build` locally to check sizes

## Support

If issues persist:
- Check [Vercel Status](https://www.vercel-status.com/)
- Contact Vercel Support with deployment ID
- Check build logs for specific error messages
