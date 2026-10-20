import { useState } from "react";
import type { Weapon, WeaponType } from "../../data/schema";
import { Icon } from "./Icon";

const WEAPON_TYPE_LABELS: Record<WeaponType, string> = {
  autoRifle: "Auto Rifle",
  bow: "Bow",
  fusionRifle: "Fusion Rifle",
  glaive: "Glaive",
  grenadeLauncher: "Grenade Launcher",
  handCannon: "Hand Cannon",
  linearFusionRifle: "Linear Fusion Rifle",
  machineGun: "Machine Gun",
  pulseRifle: "Pulse Rifle",
  rocketLauncher: "Rocket Launcher",
  scoutRifle: "Scout Rifle",
  shotgun: "Shotgun",
  sidearm: "Sidearm",
  submachineGun: "SMG",
  sniperRifle: "Sniper Rifle",
  sword: "Sword",
  traceRifle: "Trace Rifle",
};

/**
 * The chosen weapon as a tile; a click opens a list with search and a filter by weapon type
 * (W1-6). Renders the tile and the list as two grid items of the surrounding tile grid.
 */
export function WeaponPicker({
  weapons,
  selected,
  onSelect,
}: {
  weapons: Weapon[];
  selected: Weapon;
  onSelect: (weaponId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<WeaponType | "all">("all");
  const types = [...new Set(weapons.map((w) => w.weaponType))].sort((a, b) =>
    WEAPON_TYPE_LABELS[a].localeCompare(WEAPON_TYPE_LABELS[b]),
  );
  const needle = query.trim().toLowerCase();
  const shown = weapons.filter(
    (w) =>
      (type === "all" || w.weaponType === type) &&
      w.name.toLowerCase().includes(needle),
  );

  return (
    <>
      <span className="tile-wrap weapon-wrap">
        <button
          type="button"
          className="tile weapon-tile"
          aria-expanded={open}
          onClick={() => setOpen((on) => !on)}
        >
          <Icon iconKey={`weapon:${selected.id}`} label={selected.name} />
          <span className="tile-label">
            {selected.name}
            <span className="tile-sub">
              {WEAPON_TYPE_LABELS[selected.weaponType]} · wechseln
            </span>
          </span>
        </button>
      </span>
      {open && (
        <div className="weapon-picker" role="group" aria-label="Waffe wählen">
          <input
            type="search"
            placeholder="Waffe suchen"
            aria-label="Waffe suchen"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
          <div className="chips" role="group" aria-label="Waffentyp">
            {(["all", ...types] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => setType(t)}
              >
                {t === "all" ? "Alle" : WEAPON_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <ul className="weapon-list">
            {shown.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  aria-pressed={w.id === selected.id}
                  onClick={() => {
                    onSelect(w.id);
                    setOpen(false);
                  }}
                >
                  <Icon iconKey={`weapon:${w.id}`} label={w.name} size={32} />
                  <span>{w.name}</span>
                  <span className="muted">
                    {WEAPON_TYPE_LABELS[w.weaponType]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {shown.length === 0 && <p className="note">Keine Waffe gefunden.</p>}
        </div>
      )}
    </>
  );
}
