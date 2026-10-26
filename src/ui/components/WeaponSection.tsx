import type { Weapon } from "../../data/schema";
import { hasCatalyst } from "../../engine/weaponInfo";
import { weapons } from "../data";
import { describeCatalyst } from "../describe";
import { Icon } from "./Icon";
import { WeaponPicker } from "./WeaponPicker";

/** Weapon: the picker and the catalyst switch of the chosen weapon. */
export function WeaponSection({
  weapon,
  catalyst,
  onSelectWeapon,
  onToggleCatalyst,
}: {
  weapon: Weapon;
  catalyst: boolean;
  onSelectWeapon: (id: string) => void;
  onToggleCatalyst: () => void;
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
