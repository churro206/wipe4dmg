// Number formats for the UI (German).

export const integer = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
});
export const seconds = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 1,
});
// Rotation inputs from a link keep up to millisecond precision.
export const secondsInput = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 3,
  useGrouping: false,
});
export const percent = new Intl.NumberFormat("de-DE", {
  style: "percent",
  maximumFractionDigits: 0,
});
export const signedInteger = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});
export const signedPercent = new Intl.NumberFormat("de-DE", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});
export const factor = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});
