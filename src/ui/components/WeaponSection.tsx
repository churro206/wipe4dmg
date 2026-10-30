import type { Weapon } from "../../data/schema";
import { playstylesOf } from "../../engine/playstyle";
import { hasCatalyst } from "../../engine/weaponInfo";
import { weapons } from "../data";
import { describeCatalyst } from "../describe";
import { Icon } from "./Icon";
import { SegmentedControl } from "./SegmentedControl";
import { WeaponPicker } from "./WeaponPicker";

/**
 * Weapon: the picker, the catalyst switch, for a weapon with a setup its pre-stacked switch, and for
 * one with playstyles (e.g. the charge levels of Whirling Ovation) their choice.
 */
export function WeaponSection({
  weapon,
  catalyst,
  preBuilt,
  playstyle,
  onSelectWeapon,
  onToggleCatalyst,
  onTogglePreBuilt,
  onSelectPlaystyle,
}: {
  weapon: Weapon;
  catalyst: boolean;
  preBuilt: boolean;
  playstyle: string | undefined;
  onSelectWeapon: (id: string) => void;
  onToggleCatalyst: () => void;
  onTogglePreBuilt: () => void;
  onSelectPlaystyle: (id: string | undefined) => void;
}) {
  const playstyles = playstylesOf(weapon);
  return (
    <>
      <h2>Weapon</h2>
      <div className="tile-grid">
        <WeaponPicker
          weapons={weapons}
          selected={weapon}
          onSelect={onSelectWeapon}
        />
        {hasCatalyst(weapon) && (
          <span className="tile-wrap">
            <button
              type="button"
              className="tile"
              aria-pressed={catalyst}
              aria-describedby="catalyst-card"
              onClick={onToggleCatalyst}
            >
              <Icon iconKey={`catalyst:${weapon.id}`} label="Catalyst" />
              <span className="tile-label">Catalyst</span>
            </button>
            <span role="tooltip" id="catalyst-card" className="hover-card">
              <strong>{weapon.catalyst?.name ?? "Catalyst"}</strong>
              {describeCatalyst(weapon).map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          </span>
        )}
        {weapon.setup && (
          <span className="tile-wrap">
            <button
              type="button"
              className="tile"
              aria-pressed={preBuilt}
              title={`${weapon.setup.name} charges built before the Damage Phase: the first shot deploys it.`}
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
      {playstyles.length > 0 && (
        <SegmentedControl
          label="Playstyle"
          options={[
            { value: "", label: weapon.playstyleBaseName ?? "Default" },
            ...playstyles.map((p) => ({ value: p.id, label: p.name })),
          ]}
          value={playstyles.some((p) => p.id === playstyle) ? playstyle! : ""}
          onChange={(value) => onSelectPlaystyle(value || undefined)}
        />
      )}
      {catalyst &&
        weapon.options?.some(
          (o) =>
            o.kind === "catalyst" &&
            (o.durationSeconds !== null || o.condition !== null),
        ) && (
          <p className="note">
            The catalyst applies for the whole Damage Phase here; in game it is
            limited.
          </p>
        )}
    </>
  );
}
