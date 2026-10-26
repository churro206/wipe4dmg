import type { ExoticArmorEntry, GuardianClass, Subclass } from "../../data/schema";
import { classPerksFor, exoticArmorFor } from "../../engine/exoticArmor";
import { effects, exoticArmor, gameData, generatedExoticEffects } from "../data";
import { describeExotic } from "../describe";
import { ClassPerkPicker } from "./ClassPerkPicker";
import { ExoticPicker } from "./ExoticPicker";

/** Armor: the exotic piece or class item, its pre-stacked switch and the class item perks. */
export function ArmorSection({
  guardianClass,
  subclass,
  exotic,
  classItemChosen,
  exoticHasPreBuilt,
  exoticPreBuilt,
  classPerkIds,
  onSelectExotic,
  onChooseClassItem,
  onTogglePreBuilt,
  onClassPerksChange,
}: {
  guardianClass: GuardianClass;
  subclass: Subclass;
  exotic: ExoticArmorEntry | undefined;
  classItemChosen: boolean;
  exoticHasPreBuilt: boolean;
  exoticPreBuilt: boolean;
  classPerkIds: string[];
  onSelectExotic: (id: string | undefined) => void;
  onChooseClassItem: () => void;
  onTogglePreBuilt: () => void;
  onClassPerksChange: (ids: string[]) => void;
}) {
  const classItemEntry = exoticArmor.find(
    (e) => e.slot === "classItem" && e.guardianClass === guardianClass,
  );
  const classPerks = classPerksFor(exoticArmor, guardianClass);
  const describe = (entry: ExoticArmorEntry) =>
    describeExotic(entry, effects, generatedExoticEffects);
  return (
    <>
      <h2>Armor</h2>
      <h3 className="sub">Exotic</h3>
      <div className="tile-grid">
        <ExoticPicker
          entries={exoticArmorFor(exoticArmor, guardianClass, gameData.energy)}
          selected={exotic}
          describe={describe}
          onSelect={onSelectExotic}
          classItem={
            classItemEntry && classPerks.length > 0
              ? {
                  entry: classItemEntry,
                  chosen: classItemChosen,
                  onChoose: onChooseClassItem,
                }
              : undefined
          }
        />
        {exoticHasPreBuilt && (
          <span className="tile-wrap">
            <button
              type="button"
              className="tile"
              aria-pressed={exoticPreBuilt}
              title="Kill buffs of the exotic stacked before the Damage Phase: active from 0 s for their duration, without refresh (one boss, no adds)."
              onClick={onTogglePreBuilt}
            >
              <span
                className="icon ability-none"
                style={{ width: 40, height: 40 }}
              >
                ↺
              </span>
              <span className="tile-label">Pre-stacked</span>
            </button>
          </span>
        )}
      </div>
      {subclass === "prismatic" && classItemChosen && (
        <>
          <h3 className="sub">Exotic Class Item perks</h3>
          <ClassPerkPicker
            entries={classPerks}
            selectedIds={classPerkIds}
            describe={describe}
            onChange={onClassPerksChange}
          />
        </>
      )}
    </>
  );
}
