import type { Element, GuardianClass, Subclass } from "../../data/schema";
import type { OptimizerEntry } from "../../engine/optimizer";
import { CLASS_LABELS, effectsOf } from "../buildState";
import { InfoTip } from "./InfoTip";
import { OptimizerCards } from "./OptimizerCards";

/** Optimizer tab: run button, the stale-list note and the ranked builds. */
export function OptimizerTab({
  optimizer,
  optimizerKey,
  optimizing,
  weaponElement,
  guardianClass,
  subclass,
  selections,
  currentTotal,
  onRun,
  onApply,
  onCompare,
}: {
  optimizer: { forKey: string; entries: OptimizerEntry[] } | null;
  optimizerKey: string;
  optimizing: boolean;
  weaponElement: Element;
  guardianClass: GuardianClass;
  subclass: Subclass;
  selections: Parameters<typeof effectsOf>[0];
  currentTotal: number;
  onRun: () => void;
  onApply: (entry: OptimizerEntry) => void;
  onCompare: (entry: OptimizerEntry) => void;
}) {
  return (
    <>
      <div className="toolbar">
        <button type="button" onClick={onRun} disabled={optimizing}>
          {optimizing ? "Calculating …" : "Run optimizer"}
        </button>
        <InfoTip>
          Tries every allowed combination of your own effects for{" "}
          {CLASS_LABELS[guardianClass]} in all subclasses. Fireteam Support and
          its windows stay as set, your own effects run with their default
          duration. Effects without benefit are left out.
        </InfoTip>
      </div>
      {optimizer && optimizer.forKey !== optimizerKey && (
        <p className="note">
          This list is for an earlier build. Run the optimizer again.
        </p>
      )}
      {optimizer && (
        <OptimizerCards
          weaponElement={weaponElement}
          entries={optimizer.entries}
          guardianClass={guardianClass}
          currentTotal={currentTotal}
          currentSubclass={subclass}
          currentEffectIds={
            new Set(
              effectsOf(
                selections.filter((s) => s.provider !== "fireteamSupport"),
              ).map((e) => e.id),
            )
          }
          onApply={onApply}
          onCompare={onCompare}
        />
      )}
    </>
  );
}
