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
export const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});
export const signedInteger = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
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
