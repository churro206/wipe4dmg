import { useEffect, type RefObject } from "react";

/**
 * Calls `onDismiss` when the mouse goes down outside every element of `refs` while `active`.
 * The pickers use it to close their list on a click elsewhere.
 */
export function useDismiss(
  refs: RefObject<HTMLElement | null>[],
  active: boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const handle = (event: MouseEvent) => {
      const target = event.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onDismiss();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onDismiss]);
}
