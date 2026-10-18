import { iconUrl } from "../data";
import { monogram } from "../describe";

/**
 * Imported Bungie icon (ADR 0008), or two letters of the label if no icon exists. An optional
 * badge tells apart effects that share an icon, e.g. the surge levels "2x", "3x", "4x".
 */
export function Icon({
  iconKey,
  label,
  size = 40,
  badge,
}: {
  iconKey: string;
  label: string;
  size?: number;
  badge?: string;
}) {
  const url = iconUrl(iconKey);
  return (
    <span
      className="icon"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
      aria-hidden="true"
    >
      {url ? (
        <img src={url} alt="" width={size} height={size} />
      ) : (
        monogram(label)
      )}
      {badge && <span className="icon-badge">{badge}</span>}
    </span>
  );
}
