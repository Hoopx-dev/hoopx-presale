# InfoListCard Component

A reusable card component for displaying lists of key-value pairs with a dark background and clean layout.

## Design

The card features:
- **Dark Background**: Solid `#1A1226` background color
- **Key-Value Rows**: Each row displays a label on the left and value on the right
- **Row Dividers**: Thin white/10 border between rows
- **Optional Section Label**: Can display a header above the card
- **Custom Value Styling**: Support for different value colors and classes
- **Responsive Layout**: Flexbox with space-between alignment

## Props

```typescript
interface InfoListItem {
  label: string;              // Label text shown on the left
  value: string | number;     // Value text shown on the right
  valueColor?: string;        // Optional color class (e.g., "text-success")
  valueClassName?: string;    // Optional custom classes for value
}

interface InfoListCardProps {
  sectionLabel?: string;      // Optional section label above the card
  items: InfoListItem[];      // Array of items to display
  className?: string;         // Additional CSS classes (optional)
}
```

## Usage

### Basic Usage (Without Section Label)

```tsx
import InfoListCard from '@/components/ui/info-list-card';

export default function MyComponent() {
  return (
    <InfoListCard
      items={[
        { label: 'Current Price', value: '0.003 USDT/HOOPX', valueColor: 'text-success' },
        { label: 'Purchase Limit', value: '5000 USDT' },
        { label: 'Current Assets', value: '0 HOOPX' },
      ]}
    />
  );
}
```

### With Section Label

```tsx
<InfoListCard
  sectionLabel="Purchase Details"
  items={[
    { label: 'HOOPX to Receive', value: '666,666.67' },
    { label: 'Vesting Period', value: '15 months' },
    { label: 'Cliff Period', value: '3 months' },
    { label: 'Release Frequency', value: 'Monthly' },
  ]}
/>
```

### With Dynamic Values

```tsx
import { useTranslations } from 'next-intl';

export default function PurchasePage() {
  const t = useTranslations('purchase');
  const rate = '0.003';
  const maxTier = 5000;

  return (
    <InfoListCard
      items={[
        {
          label: t('currentPrice'),
          value: `${rate} USDT/HOOPX`,
          valueColor: 'text-success',
        },
        {
          label: t('purchaseLimit'),
          value: `${maxTier.toLocaleString()} USDT`,
        },
        {
          label: t('currentAssets'),
          value: '0 HOOPX',
        },
      ]}
    />
  );
}
```

### With Custom Value Styling

```tsx
<InfoListCard
  sectionLabel="Transaction Summary"
  items={[
    { label: 'Amount', value: '2000 USDT', valueColor: 'text-secondary' },
    { label: 'Fee', value: '0.00001 SOL', valueColor: 'text-white/70' },
    { label: 'Total', value: '2000 USDT', valueClassName: 'font-bold text-white' },
  ]}
/>
```

### Multiple Cards in Sequence

```tsx
<div className="space-y-6">
  <InfoListCard
    items={[
      { label: 'Current Price', value: '0.003 USDT/HOOPX', valueColor: 'text-success' },
      { label: 'Max Purchase', value: '5000 USDT' },
      { label: 'Current Balance', value: '0 HOOPX' },
    ]}
  />

  <InfoListCard
    sectionLabel="Vesting Information"
    items={[
      { label: 'HOOPX Tokens', value: '333,333.33' },
      { label: 'Vesting Period', value: '12 months' },
      { label: 'Cliff Period', value: '3 months' },
      { label: 'Release Schedule', value: 'Monthly' },
    ]}
  />
</div>
```

### In Purchase Page

Used in `/app/purchase/page.tsx`:

```tsx
import InfoListCard from '@/components/ui/info-list-card';

{/* Summary Cards */}
<InfoListCard
  items={[
    {
      label: t('currentPrice'),
      value: `${displayRate} USDT/HOOPX`,
      valueColor: 'text-success',
    },
    { label: t('purchaseLimit'), value: `${formatNumber(maxTier)} USDT` },
    { label: t('currentAssets'), value: '0 HOOPX' },
  ]}
  className="mb-6"
/>

{/* Purchase Details */}
<InfoListCard
  sectionLabel={t('purchaseDetails')}
  items={[
    { label: t('hoopxReceive'), value: formatNumber(hoopxAmount) },
    { label: t('vestingPeriod'), value: `${vesting} ${t('months')}` },
    { label: t('cliffPeriod'), value: `${cliff} ${t('months')}` },
    { label: t('releaseFrequency'), value: t('perMonth') },
  ]}
  className="mb-6"
/>
```

### In Portfolio Page

Used in `/app/portfolio/page.tsx`:

```tsx
import InfoListCard from '@/components/ui/info-list-card';

<InfoListCard
  items={[
    { label: t('purchaseTime'), value: '2025-10-20 18:00' },
    { label: t('purchaseStatus'), value: t('notReleased') },
    { label: t('vestingPeriod'), value: '12 months' },
    { label: t('cliffPeriod'), value: '3 months' },
    { label: t('releaseFrequency'), value: 'Monthly' },
  ]}
/>
```

## Background Color

The component uses a solid dark background:
```css
background-color: #1A1226;
```

This is different from the gradient cards (PurchaseCard, TransactionCard) and provides visual variety in the UI.

## Value Color Options

Common value colors:
- `text-success` - Green (#31D99C) for positive values like prices
- `text-secondary` - Yellow (#FCB825) for highlights
- `text-danger` - Red (#FF4B4B) for warnings
- `text-white` - Default white
- `text-white/70` - 70% opacity white for muted values
- `text-cyan-400` - Cyan for calculated amounts

## Typography

- **Label**: `text-white/70 text-base font-normal` (70% opacity)
- **Value**: `text-base font-normal` (default white, customizable)
- **Section Label**: `text-white text-base font-normal` (displayed above card)

## Layout

- **Padding**: 20px (p-5) on each side
- **Row Height**: 16px top/bottom padding (py-4)
- **Border Radius**: 16px (rounded-2xl)
- **Divider**: 1px solid white/10 between rows

## Customization

### Adding Custom Spacing

```tsx
<InfoListCard
  items={[...]}
  className="mb-8 px-2"
/>
```

### Changing Container Width

```tsx
<InfoListCard
  items={[...]}
  className="max-w-md mx-auto"
/>
```

### Different Text Sizes

Use `valueClassName` to override text size:

```tsx
items={[
  {
    label: 'Total',
    value: '10000 USDT',
    valueClassName: 'text-xl font-bold text-white'
  }
]}
```

## Accessibility

- Uses semantic HTML structure
- Proper text hierarchy with labels and values
- Sufficient color contrast for readability
- Screen reader friendly with clear label-value associations

## Browser Support

- Modern browsers with CSS Flexbox support
- Responsive design works on all screen sizes
- No special polyfills required

## Related Components

- `PurchaseCard` - Card with gradient background for purchase summary
- `TransactionCard` - Card with gradient background for transaction history
- `Button` - For interactive elements

## File Location

```
src/components/ui/info-list-card.tsx
src/components/ui/info-list-card-example.tsx
```
