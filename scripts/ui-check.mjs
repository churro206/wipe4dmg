// Full-page screenshot of the app with headless Chrome over the DevTools protocol, for UI checks.
// Start the app first: npm run build && npx vite preview --port 4173
//
// Usage: node scripts/ui-check.mjs <url> <out.png> [--dark|--light] [--width 1400] [--click "Text"]...
//   --click  clicks the first button with exactly this text, e.g. a tab ("Breakdown" or "Wiki");
//            repeat it to click several buttons in order.
// Chrome: CHROME_PATH, otherwise the usual install paths on Windows, macOS and Linux.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = 9333;
const LOAD_MS = 2500; // Recharts animates; shorter waits capture empty charts
const SETTLE_MS = 1200;
const CHROME_PATHS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const args = process.argv.slice(2);
const [url, out] = args.filter(
  (a, i) => !a.startsWith("--") && !args[i - 1]?.match(/^--(width|click)$/),
);
if (!url || !out) {
  console.error(
    'Usage: node scripts/ui-check.mjs <url> <out.png> [--dark|--light] [--width 1400] [--click "Text"]',
  );
  process.exit(1);
}
const scheme = args.includes("--dark")
  ? "dark"
  : args.includes("--light")
    ? "light"
    : null;
const width = Number(args[args.indexOf("--width") + 1]) || 1400;
const clicks = args.flatMap((a, i) => (a === "--click" ? [args[i + 1]] : []));

const chromePath =
  process.env.CHROME_PATH ?? CHROME_PATHS.find((p) => existsSync(p));
if (!chromePath) {
  console.error("Chrome not found; set CHROME_PATH.");
  process.exit(1);
}
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "ui-check-"))}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    await sleep(200);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      target = list.find((t) => t.type === "page");
    } catch {
      // Chrome is still starting.
    }
  }
  if (!target) throw new Error("Chrome did not open a page.");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => (ws.onopen = resolve));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (message) => {
    const msg = JSON.parse(message.data);
    pending.get(msg.id)?.(msg);
  };
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      pending.set(++id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true })).result
      .result.value;

  await send("Page.enable");
  await send("Runtime.enable");
  // Headless Chrome needs the colour scheme set explicitly, also for light mode.
  if (scheme)
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value: scheme }],
    });
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url });
  await sleep(LOAD_MS);

  for (const text of clicks) {
    // JSON.stringify quotes the text safely inside the expression.
    const clicked = await evaluate(
      `(() => { const b = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === ${JSON.stringify(text)}); b?.click(); return !!b; })()`,
    );
    if (!clicked) console.warn(`No button with text "${text}".`);
    await sleep(LOAD_MS);
  }

  const height = await evaluate("document.documentElement.scrollHeight");
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(SETTLE_MS);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  console.log(`Saved ${out} (${width}×${height})`);
  ws.close();
} finally {
  chrome.kill();
}
