import { useId, type ReactNode } from "react";

/** Small ⓘ that shows an explanation on hover or keyboard focus, instead of a paragraph. */
export function InfoTip({ children }: { children: ReactNode }) {
  const id = useId();
  return (
    <span className="info-tip">
      <button type="button" className="info-tip-button" aria-describedby={id}>
        ⓘ
      </button>
      <span role="tooltip" id={id} className="hover-card">
        {children}
      </span>
    </span>
  );
}
