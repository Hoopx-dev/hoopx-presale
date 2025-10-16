export interface InfoListItem {
  /**
   * Label text shown on the left
   */
  label: string;
  /**
   * Value text shown on the right
   */
  value: string | number;
  /**
   * Optional custom color for the value (e.g., "text-success", "text-white")
   */
  valueColor?: string;
  /**
   * Optional custom classes for the value
   */
  valueClassName?: string;
}

export interface InfoListCardProps {
  /**
   * Optional section label displayed above the card
   */
  sectionLabel?: string;
  /**
   * Array of items to display in the list
   */
  items: InfoListItem[];
  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function InfoListCard({
  sectionLabel,
  items,
  className = "",
}: InfoListCardProps) {
  return (
    <div className={className}>
      {/* Optional Section Label */}
      {sectionLabel && (
        <h3 className='text-white text-base font-normal mb-4'>
          {sectionLabel}
        </h3>
      )}

      {/* Card Container */}
      <div className='bg-[#1A1226]/50 rounded-2xl overflow-hidden'>
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between items-center px-5 py-4 ${
              index !== items.length - 1 ? "border-b border-white/10" : ""
            }`}
          >
            {/* Label */}
            <span className='text-white/70 text-base font-normal'>
              {item.label}
            </span>

            {/* Value */}
            <span
              className={`text-base font-normal ${
                item.valueColor || item.valueClassName || "text-white"
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
