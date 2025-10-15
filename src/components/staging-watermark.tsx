'use client';

/**
 * Staging watermark displayed at bottom left of all pages
 * Only visible when NEXT_PUBLIC_IS_STAGING=true
 */
export default function StagingWatermark() {
  const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

  if (!isStaging) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] pointer-events-none select-none">
      <div className="bg-yellow-500/90 text-black px-4 py-2 rounded-lg shadow-lg border-2 border-yellow-600">
        <p className="font-bold text-sm uppercase tracking-wider">
          ⚠️ Staging Environment
        </p>
      </div>
    </div>
  );
}
