import type { ReactNode } from "react";

/** Result tabs (like gcsim): one panel visible at a time. */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  children,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  children: ReactNode;
}) {
  return (
    <div className="tabs">
      <div className="tab-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={tab.id === active}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
      >
        {children}
      </div>
    </div>
  );
}
