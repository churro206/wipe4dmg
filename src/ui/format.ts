// Number formats for the UI (English).

export const integer = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
export const seconds = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});
// Rotation inputs from a link keep up to millisecond precision.
export const secondsInput = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  useGrouping: false,
});
/** Damage Phase field text: a tenth of a second is enough; empty or invalid text stays as it is. */
export function roundToTenth(value: number | string | null): string {
  if (value === null || value === "") return "";
  const number = Number(value);
  return Number.isFinite(number) ? String(Math.round(number * 10) / 10) : String(value);
}
export const percent =new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});
export const signedPercent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});
export const factor = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});
