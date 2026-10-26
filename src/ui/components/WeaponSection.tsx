import type { Weapon } from "../../data/schema";
import { hasCatalyst } from "../../engine/weaponInfo";
import { weapons } from "../data";
import { describeCatalyst } from "../describe";
import { Icon } from "./Icon";
import { WeaponPicker } from "./WeaponPicker";

/** Weapon: the picker, the catalyst switch and, for a weapon with a setup, its pre-stacked switch. */
export function WeaponSection({
  weapon,
  catalyst,
  preBuilt,
  onSelectWeapon,
  onToggleCatalyst,
  onTogglePreBuilt,
}: {
  weapon: Weapon;
  catalyst: boolean;
  preBuilt: boolean;
  onSelectWeapon: (id: string) => void;
  onToggleCatalyst: () => void;
  onTogglePreBuilt: () => void;
}) {
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
