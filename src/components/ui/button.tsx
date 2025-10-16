import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-[16px] font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-secondary text-[#1A0033] hover:bg-secondary/90 active:bg-secondary/80 focus:ring-secondary/50 shadow-sm",
        "primary-disabled":
          "bg-[#2D2140] text-[#6B5E7A] cursor-not-allowed pointer-events-none",
        secondary:
          "bg-white/10 text-white border border-white/30 hover:border-white/50 font-normal",
        "secondary-selected":
          "bg-white/10 text-success border border-success active:border-success/70",
      },
      size: {
        small: "h-10 px-4 text-sm gap-1.5",
        default: "h-12 px-6 text-base gap-2",
        large: "h-14 px-8 text-lg gap-2.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Shows a checkmark icon (for secondary-selected variant)
   */
  showCheckmark?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      showCheckmark = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading || variant === "primary-disabled";

    // Use primary-disabled styling when primary button is loading
    const effectiveVariant = loading && variant === "primary" ? "primary-disabled" : variant;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant: effectiveVariant, size, className }))}
        {...props}
      >
        {loading && (
          <svg
            className='animate-spin -ml-1 h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        )}

        {showCheckmark && variant === "secondary-selected" && (
          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle cx='10' cy='10' r='10' fill='currentColor' />
            <path
              d='M6 10L8.5 12.5L14 7'
              stroke='white'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        )}

        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
