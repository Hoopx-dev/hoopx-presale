'use client';

import { Button } from './button';

/**
 * Button Component Examples
 *
 * This file demonstrates all available button variants and sizes.
 * Use this as a reference for implementing buttons throughout the app.
 */

export default function ButtonExamples() {
  return (
    <div className="p-8 space-y-12 bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Button Component Examples
      </h1>

      {/* Primary Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Primary Buttons
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" size="small">
            确认转账
          </Button>
          <Button variant="primary" size="default">
            确认转账
          </Button>
          <Button variant="primary" size="large">
            确认转账
          </Button>
        </div>
      </section>

      {/* Primary Disabled Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Primary Disabled Buttons
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary-disabled" size="small">
            下一步
          </Button>
          <Button variant="primary-disabled" size="default">
            下一步
          </Button>
          <Button variant="primary-disabled" size="large">
            下一步
          </Button>
        </div>
      </section>

      {/* Secondary Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Secondary Buttons
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="secondary" size="small">
            1000
          </Button>
          <Button variant="secondary" size="default">
            2000
          </Button>
          <Button variant="secondary" size="large">
            3000
          </Button>
        </div>
      </section>

      {/* Secondary Selected Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Secondary Selected Buttons (with checkmark)
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="secondary-selected" size="small" showCheckmark>
            1000
          </Button>
          <Button variant="secondary-selected" size="default" showCheckmark>
            2000
          </Button>
          <Button variant="secondary-selected" size="large" showCheckmark>
            3000
          </Button>
        </div>
      </section>

      {/* Loading State Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Loading States
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary" size="small" loading>
            Processing...
          </Button>
          <Button variant="primary" size="default" loading>
            Processing...
          </Button>
          <Button variant="primary" size="large" loading>
            Processing...
          </Button>
        </div>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Interactive Examples
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button
            variant="primary"
            onClick={() => alert('Primary button clicked!')}
          >
            Click Me
          </Button>
          <Button
            variant="secondary"
            onClick={() => alert('Secondary button clicked!')}
          >
            Click Me
          </Button>
          <Button
            variant="secondary-selected"
            showCheckmark
            onClick={() => alert('Selected button clicked!')}
          >
            Selected
          </Button>
        </div>
      </section>

      {/* Size Comparison */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Size Comparison (All Variants)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground/70">Small</h3>
            <Button variant="primary" size="small" className="w-full">
              Primary Small
            </Button>
            <Button variant="primary-disabled" size="small" className="w-full">
              Disabled Small
            </Button>
            <Button variant="secondary" size="small" className="w-full">
              Secondary Small
            </Button>
            <Button
              variant="secondary-selected"
              size="small"
              showCheckmark
              className="w-full"
            >
              Selected Small
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground/70">
              Default
            </h3>
            <Button variant="primary" size="default" className="w-full">
              Primary Default
            </Button>
            <Button
              variant="primary-disabled"
              size="default"
              className="w-full"
            >
              Disabled Default
            </Button>
            <Button variant="secondary" size="default" className="w-full">
              Secondary Default
            </Button>
            <Button
              variant="secondary-selected"
              size="default"
              showCheckmark
              className="w-full"
            >
              Selected Default
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground/70">Large</h3>
            <Button variant="primary" size="large" className="w-full">
              Primary Large
            </Button>
            <Button variant="primary-disabled" size="large" className="w-full">
              Disabled Large
            </Button>
            <Button variant="secondary" size="large" className="w-full">
              Secondary Large
            </Button>
            <Button
              variant="secondary-selected"
              size="large"
              showCheckmark
              className="w-full"
            >
              Selected Large
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
