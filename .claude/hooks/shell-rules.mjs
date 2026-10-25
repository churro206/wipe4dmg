// PreToolUse hook for Bash and PowerShell: enforces CLAUDE.md, "Befehle und Shell".
// Exit 2 blocks the call and shows stderr to Claude.
let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let call;
  try {
    call = JSON.parse(input);
  } catch {
    process.exit(0);
  }
  const reason = check(call.tool_name ?? "", call.tool_input?.command ?? "");
  if (reason) {
    process.stderr.write(`Blocked (CLAUDE.md, "Befehle und Shell"): ${reason}\n`);
    process.exit(2);
  }
  process.exit(0);
});

// Commands Bash may run; everything else goes through Grep, Glob, Read, Edit or Write.
const ALLOWED = [
  /^npm (run|test|ci)\b/,
  /^npx (tsc -b|eslint|vitest)\b/,
  /^npx tsx scripts\//,
  /^git /,
  /^curl -o /,
  /^node (tmp|scripts)\/\S+\.(ts|mjs|js)\b/,
];

function check(tool, command) {
  if (tool === "PowerShell") {
    return "no PowerShell tool. Bash only for npm, npx tsc -b, git and curl -o; files via Grep, Glob, Read, Edit, Write.";
  }
  if (tool !== "Bash") return null;
  const trimmed = command.trim();
  // Quoted text (commit messages) may hold anything; check only what the shell parses.
  const bare = trimmed.replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, '""');
  if (/&&|\|\||[;|`]|\$\(|<</.test(bare)) {
    return "one command per call: no &&, ||, ;, |, $(), backticks or heredocs.";
  }
  if (/^cd\b/.test(bare)) return "no cd; use absolute paths.";
  if (!ALLOWED.some((pattern) => pattern.test(bare))) {
    return (
      "Bash only for `npm run …`, `npx tsc -b`, `git`, `curl -o` and `node tmp/<file>.ts`. " +
      "Look-ups: `npm run facts -- \"<Name>\"`, then Grep and Read with offset."
    );
  }
  return null;
}
