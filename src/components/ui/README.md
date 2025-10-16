# Button Component

A flexible, reusable button component built with TypeScript, Tailwind CSS, and class-variance-authority.

## Features

- ✅ 4 Variants: `primary`, `primary-disabled`, `secondary`, `secondary-selected`
- ✅ 3 Sizes: `small`, `default`, `large`
- ✅ Loading state with spinner animation
- ✅ Optional checkmark icon for selected state
- ✅ Fully type-safe with TypeScript
- ✅ Accessible with proper ARIA attributes
- ✅ Customizable with className prop
- ✅ Follows HOOPX design system

## Installation

Dependencies are already installed:
- `class-variance-authority` - For variant management
- `clsx` - For conditional classes
- `tailwind-merge` - For Tailwind class deduplication

## Usage

### Basic Examples

```tsx
import { Button } from '@/components/ui/button';

// Primary button (yellow/gold)
<Button variant="primary">确认转账</Button>

// Disabled button (dark gray)
<Button variant="primary-disabled">下一步</Button>

// Secondary button (white with border)
<Button variant="secondary">2000</Button>

// Selected button (green border with checkmark)
<Button variant="secondary-selected" showCheckmark>2000</Button>
```

### Sizes

```tsx
// Small button (height: 40px)
<Button size="small">Small Button</Button>

// Default button (height: 48px)
<Button size="default">Default Button</Button>

// Large button (height: 56px)
<Button size="large">Large Button</Button>
```

### Loading State

```tsx
<Button loading>Processing...</Button>
```

### Event Handling

```tsx
<Button
  variant="primary"
  onClick={() => console.log('Button clicked!')}
>
  Click Me
</Button>
```

### With Custom Classes

```tsx
<Button className="w-full mt-4">
  Full Width Button
</Button>
```

### Disabled State

```tsx
<Button disabled>Cannot Click</Button>
```

## Variants

### Primary (`variant="primary"`)
- **Background**: Yellow/Gold (`#FCB825`)
- **Text Color**: Dark purple (`#1A0033`)
- **Use Case**: Primary actions (confirm, submit, purchase)
- **Example**: "确认转账" (Confirm Transfer)

### Primary Disabled (`variant="primary-disabled"`)
- **Background**: Dark gray (`#2D2140`)
- **Text Color**: Muted gray (`#6B5E7A`)
- **Use Case**: Countdown timers, disabled primary actions
- **Example**: "下一步" (Next Step) with countdown

### Secondary (`variant="secondary"`)
- **Background**: White
- **Border**: Light gray (`#E5E5E5`)
- **Text Color**: Dark purple (`#1A0033`)
- **Use Case**: Purchase tiers, alternative actions
- **Example**: "2000" USDT tier selection

### Secondary Selected (`variant="secondary-selected"`)
- **Background**: White
- **Border**: Success green (`#31D99C`)
- **Text Color**: Success green
- **Icon**: Green checkmark (when `showCheckmark={true}`)
- **Use Case**: Selected purchase tier
- **Example**: "2000" with checkmark

## Sizes

| Size | Height | Padding X | Font Size | Gap |
|------|--------|-----------|-----------|-----|
| `small` | 40px | 16px | 14px | 6px |
| `default` | 48px | 24px | 16px | 8px |
| `large` | 56px | 32px | 18px | 10px |

## Props API

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button visual style
   * @default "primary"
   */
  variant?: 'primary' | 'primary-disabled' | 'secondary' | 'secondary-selected';

  /**
   * Button size
   * @default "default"
   */
  size?: 'small' | 'default' | 'large';

  /**
   * Show checkmark icon (only works with secondary-selected variant)
   * @default false
   */
  showCheckmark?: boolean;

  /**
   * Loading state - shows spinner and disables button
   * @default false
   */
  loading?: boolean;

  /**
   * Additional CSS classes to apply
   */
  className?: string;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Button content
   */
  children: React.ReactNode;
}
```

## Real-World Examples

### Purchase Page - Tier Selection

```tsx
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/store/useUIStore';

export default function PurchasePage() {
  const { selectedTier, setSelectedTier } = useUIStore();
  const tiers = [1000, 2000, 3000, 4000, 5000];

  return (
    <div className="grid grid-cols-2 gap-4">
      {tiers.map((tier) => (
        <Button
          key={tier}
          variant={selectedTier === tier ? 'secondary-selected' : 'secondary'}
          showCheckmark={selectedTier === tier}
          onClick={() => setSelectedTier(tier)}
        >
          {tier}
        </Button>
      ))}
    </div>
  );
}
```

### Confirmation Modal - Submit Button

```tsx
import { Button } from '@/components/ui/button';

export default function ConfirmationModal({ onConfirm, isProcessing }) {
  return (
    <Button
      variant="primary"
      size="large"
      loading={isProcessing}
      onClick={onConfirm}
      className="w-full"
    >
      {isProcessing ? '处理中...' : '确认转账'}
    </Button>
  );
}
```

### Terms Modal - Countdown Button

```tsx
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function TermsModal({ onAccept }) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <Button
      variant={countdown > 0 ? 'primary-disabled' : 'primary'}
      disabled={countdown > 0}
      onClick={onAccept}
      className="w-full"
    >
      继续 {countdown > 0 && `(${countdown})`}
    </Button>
  );
}
```

## Accessibility

The button component includes:
- ✅ Proper `cursor-pointer` on interactive states
- ✅ `cursor-not-allowed` on disabled states
- ✅ `pointer-events-none` to prevent interaction when disabled
- ✅ Focus ring for keyboard navigation
- ✅ All standard button HTML attributes supported

## Styling Guide

The component uses the HOOPX color system defined in `globals.css`:

```css
--color-primary: #512784;    /* Purple - not used in button yet */
--color-secondary: #FCB825;  /* Yellow/Gold - primary button background */
--color-success: #31D99C;    /* Green - selected state */
--color-danger: #FF4B4B;     /* Red - not used in button yet */
```

## Testing the Component

To view all button variants and sizes, create a test page:

```tsx
// app/test-buttons/page.tsx
import ButtonExamples from '@/components/ui/button-examples';

export default function TestButtonsPage() {
  return <ButtonExamples />;
}
```

Navigate to `/test-buttons` to see the interactive showcase.

## Future Enhancements

Potential additions:
- [ ] Icon support (left/right icons)
- [ ] Button groups
- [ ] Ghost variant
- [ ] Outline variant
- [ ] Link button variant
- [ ] Accessibility improvements (ARIA labels)
- [ ] Animation customization
- [ ] Ripple effect

## Related Files

- `src/components/ui/button.tsx` - Main component
- `src/components/ui/button-examples.tsx` - Usage examples
- `src/lib/utils.ts` - Utility function for class merging
- `src/styles/theme.ts` - Theme color constants
- `src/app/globals.css` - Global CSS variables
