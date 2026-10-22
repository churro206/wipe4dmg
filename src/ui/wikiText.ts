// Wiki pages from the Markdown documents (US-15, ADR 0010). Mechanics show only their section
// "For players"; coverage and roadmap show whole. Pure functions, no file access.

export type WikiGroup = "start" | "mechanics" | "status";

export type WikiPage = {
  id: string; // file name without .md
  title: string;
  group: WikiGroup;
  markdown: string; // body without the level-1 heading, links rewritten
};

const PLAYER_HEADING = "## For players";
const START_ID = "how-it-works";
const STATUS_IDS = ["coverage", "roadmap"];
const MECHANICS_FOLDER = "/mechanics/";
const MECHANICS_INDEX = "README";

/** Text under "## For players" up to the next level-2 heading, or null without the section. */
export function playerSection(markdown: string): string | null {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((line) => line.trim() === PLAYER_HEADING);
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return (end < 0 ? rest : rest.slice(0, end)).join("\n").trim();
}

/** The level-1 heading. */
export function pageTitle(markdown: string): string {
  const line = markdown
    .replace(/\r\n/g, "\n")
    .split("\n")
    .find((l) => l.startsWith("# "));
  return line ? line.slice(2).trim() : "";
}

/**
 * Links to Markdown files that are wiki pages become wiki links (#wiki/<id>); links to other
 * documents keep only their text. Web links stay.
 */
export function rewriteLinks(markdown: string, pageIds: Set<string>): string {
  return markdown.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (link, text: string, target: string) => {
      if (/^[a-z]+:/i.test(target) || !/\.md(#|$)/.test(target)) return link;
      const id = fileId(target.split("#")[0]);
      return pageIds.has(id) ? `[${text}](#wiki/${id})` : text;
    },
  );
}

/** Wiki pages from document paths and contents: start page, mechanics by title, then status. */
export function wikiPages(files: Record<string, string>): WikiPage[] {
  const drafts = Object.entries(files).flatMap(([path, content]) => {
    const id = fileId(path);
    const isStatus = STATUS_IDS.includes(id);
    if (
      !isStatus &&
      (!path.includes(MECHANICS_FOLDER) || id === MECHANICS_INDEX)
    )
      return [];
    const section = isStatus ? withoutTitle(content) : playerSection(content);
    if (section === null) return [];
    // Subheadings of "For players" (###) are the sections of the page (##).
    const body = isStatus ? section : section.replace(/^#(#{2,}) /gm, "$1 ");
    const group: WikiGroup = isStatus
      ? "status"
      : id === START_ID
        ? "start"
        : "mechanics";
    return [{ id, title: pageTitle(content), group, markdown: body }];
  });

  const ids = new Set(drafts.map((page) => page.id));
  const order: WikiGroup[] = ["start", "mechanics", "status"];
  return drafts
    .map((page) => ({ ...page, markdown: rewriteLinks(page.markdown, ids) }))
    .sort(
      (a, b) =>
        order.indexOf(a.group) - order.indexOf(b.group) ||
        (a.group === "status"
          ? STATUS_IDS.indexOf(a.id) - STATUS_IDS.indexOf(b.id)
          : a.title.localeCompare(b.title, "en")),
    );
}

function fileId(path: string): string {
  return path.split("/").pop()!.replace(/\.md$/, "");
}

function withoutTitle(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const title = lines.findIndex((line) => line.startsWith("# "));
  return lines
    .filter((_, i) => i !== title)
    .join("\n")
    .trim();
}
