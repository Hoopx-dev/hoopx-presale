# PurchaseCard Component

A reusable card component for displaying token purchase information with a gradient background that fades from left to right.

## Design

The card features:
- **Gradient Background**: Fades from `rgba(81, 39, 132, 0.4)` (left) to `rgba(81, 39, 132, 0.1)` (right)
- **Token Logo**: 64x64px image on the left
- **Token Info**: Name and price in the center
- **Amount Info**: USDT amount and token amount on the right
- **Rounded Corners**: 16px border radius
- **Responsive Layout**: Flexbox with proper spacing

## Props

```typescript
interface PurchaseCardProps {
  logo: string;           // Token logo image path
  tokenName: string;      // Token name (e.g., "HOOPX")
  tokenPrice: string;     // Token price in USDT
  amount: number;         // Amount in USDT
  tokenAmount: number;    // Amount in tokens
  className?: string;     // Additional CSS classes (optional)
}
```

## Usage

### Basic Usage

```tsx
import PurchaseCard from '@/components/ui/purchase-card';

export default function MyComponent() {
  return (
    <PurchaseCard
      logo="/images/token-badge.png"
      tokenName="HOOPX"
      tokenPrice="0.003"
      amount={2000}
      tokenAmount={666666.67}
    />
  );
}
```

### With Custom Styling

```tsx
<PurchaseCard
  logo="/images/token-badge.png"
  tokenName="HOOPX"
  tokenPrice="0.003"
  amount={2000}
  tokenAmount={666666.67}
  className="shadow-lg hover:shadow-xl transition-shadow"
/>
```

### In a List

```tsx
const purchases = [
  { amount: 1000, tokenAmount: 333333.33 },
  { amount: 2000, tokenAmount: 666666.67 },
  { amount: 3000, tokenAmount: 1000000 },
];

return (
  <div className="space-y-3">
    {purchases.map((purchase, index) => (
      <PurchaseCard
        key={index}
        logo="/images/token-badge.png"
        tokenName="HOOPX"
        tokenPrice="0.003"
        amount={purchase.amount}
        tokenAmount={purchase.tokenAmount}
      />
    ))}
  </div>
);
```

### In Portfolio Page

```tsx
import PurchaseCard from '@/components/ui/purchase-card';
import { usePurchaseSession } from '@/lib/purchase/hooks';

export default function PortfolioPage() {
  const { data: purchaseSession } = usePurchaseSession(walletAddress);

  const hoopxAmount = purchaseSession.purchasedAmount / purchaseSession.rate;

  return (
    <PurchaseCard
      logo="/images/token-badge.png"
      tokenName="HOOPX"
      tokenPrice={purchaseSession.rate.toString()}
      amount={purchaseSession.purchasedAmount}
      tokenAmount={hoopxAmount}
    />
  );
}
```

## Gradient Background

The component uses a CSS gradient that creates a fade effect from left to right:

```css
background: linear-gradient(
  to right,
  rgba(81, 39, 132, 0.4) 0%,    /* Left: 40% opacity */
  rgba(81, 39, 132, 0.1) 100%   /* Right: 10% opacity */
);
```

This creates a subtle, elegant fade that matches the design mockup.

## Number Formatting

The component automatically formats numbers with:
- **Thousand separators**: 666,666.67
- **Fixed decimals**: 2 decimal places
- **Locale-aware**: Uses `en-US` number formatting

## Customization

### Changing Gradient Colors

To customize the gradient, modify the `background` style in the component:

```tsx
style={{
  background: 'linear-gradient(to right, rgba(R, G, B, 0.4) 0%, rgba(R, G, B, 0.1) 100%)',
}}
```

### Adjusting Layout

The component uses Flexbox for layout. You can modify spacing by changing:
- `gap-3`: Gap between elements
- `p-5`: Padding inside the card
- `rounded-2xl`: Border radius

## Accessibility

- Uses semantic HTML with proper heading hierarchy
- Includes alt text for images
- Sufficient color contrast for text readability

## Browser Support

- Modern browsers with CSS gradient support
- Responsive design works on all screen sizes
- Fixed number formatting works in all major browsers

## Related Components

- `Button` - For interactive elements
- `Header` - For page navigation
- `Toast` - For notifications

## File Location

```
src/components/ui/purchase-card.tsx
src/components/ui/purchase-card-example.tsx
```
