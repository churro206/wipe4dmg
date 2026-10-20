import type { GuardianClass } from "../../data/schema";
import type { OptimizerEntry } from "../../engine/optimizer";
import { effectsOf, SUBCLASS_LABELS } from "../buildState";
import { levelBadge, effectIconKey } from "../describe";
import { integer, signedPercent } from "../format";
import { weapon } from "../data";
import { Icon } from "./Icon";

/**
 * Optimizer ranking as cards (like Raidbots Top Gear): rank, subclass and effect icons, a bar
 * relative to the best build, total damage and the change against the current build.
 */
export function OptimizerCards({
  entries,
  guardianClass,
  currentTotal,
  onApply,
  onCompare,
}: {
  entries: OptimizerEntry[];
  guardianClass: GuardianClass;
  currentTotal: number;
  onApply: (entry: OptimizerEntry) => void;
  onCompare: (entry: OptimizerEntry) => void;
}) {
  const best = entries[0]?.totalDamage ?? 0;
  return (
    <ol className="optimizer-cards">
      {entries.map((entry, i) => {
        const own = effectsOf(
          entry.selections.filter((s) => s.provider !== "fireteamSupport"),
        );
        const relative =
          currentTotal > 0 ? entry.totalDamage / currentTotal - 1 : null;
        const names = [
          SUBCLASS_LABELS[entry.subclass],
          ...own.map((e) => e.name),
        ].join(", ");
        return (
          <li key={i} className="optimizer-card">
            <span className="optimizer-rank">#{i + 1}</span>
            <div className="optimizer-body">
              <div className="icon-row" title={names}>
                <Icon
                  iconKey={`subclass:${guardianClass}:${entry.subclass}`}
                  label={SUBCLASS_LABELS[entry.subclass]}
                  size={28}
                />
                {own.map((effect) => (
                  <Icon
                    key={effect.id}
                    iconKey={effectIconKey(effect, weapon.element)}
                    label={effect.shortName}
                    size={28}
                    badge={levelBadge(effect.shortName)}
                  />
                ))}
                <span className="visually-hidden">{names}</span>
              </div>
              <div
                className="optimizer-bar"
                style={{
                  width: `${best > 0 ? (entry.totalDamage / best) * 100 : 0}%`,
                }}
                aria-hidden="true"
              />
            </div>
            <span className="optimizer-total">
              {integer.format(entry.totalDamage)}
              <span className="delta">
                {relative === null ? "–" : signedPercent.format(relative)}
              </span>
            </span>
            <span className="row-actions">
              <button type="button" onClick={() => onApply(entry)}>
                Übernehmen
              </button>
              <button type="button" onClick={() => onCompare(entry)}>
                Vergleichen
              </button>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
