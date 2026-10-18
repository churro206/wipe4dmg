import { Icon } from "./Icon";

/** A row of buttons of which exactly one is active, e.g. class or subclass; optional icons. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; iconKey?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.iconKey && (
            <Icon iconKey={option.iconKey} label={option.label} size={24} />
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}
