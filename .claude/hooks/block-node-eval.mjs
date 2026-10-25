// PreToolUse hook for Bash and PowerShell: blocks inline Node code (CLAUDE.md, "Befehle und Shell").
// Exit 2 blocks the call and shows stderr to Claude.
let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let command = "";
  try {
    command = JSON.parse(input).tool_input?.command ?? "";
  } catch {
    process.exit(0);
  }
  // Only `node` where a command starts, so a commit message that mentions "node -e" passes.
  const node = String.raw`(?:^|[;&|(\n])\s*node(?:\.exe)?`;
  const patterns = [
    new RegExp(String.raw`${node}\s+(?:-e|--eval|-p|--print)\b`), // node -e "…"
    new RegExp(String.raw`${node}\s*<`), // node <<EOF, node < file
    new RegExp(String.raw`\|\s*node(?:\.exe)?\s*(?:$|[;&|)\n])`), // … | node
  ];
  if (patterns.some((pattern) => pattern.test(command))) {
    process.stderr.write(
      "Blocked: no inline Node code in wipe4dmg (CLAUDE.md). Use `npm run facts -- \"<Name>\"`, " +
        "then Grep and Read with offset. For an evaluation over many lines: announce it, " +
        "write tmp/<file>.ts and run `node tmp/<file>.ts`.\n",
    );
    process.exit(2);
  }
  process.exit(0);
});
