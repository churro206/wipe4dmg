// Windows toast for the owner, sent only by the main session (skill abarbeiten).
// Uses the owner's ~/.claude/hooks/toast.ps1; does nothing if it is missing.
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const message = process.argv.slice(2).join(" ") || "Du bist dran.";
const script = join(homedir(), ".claude", "hooks", "toast.ps1");
if (existsSync(script)) {
  spawnSync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script, "-Title", "wipe4dmg", "-Message", message],
    { stdio: "ignore" },
  );
}
