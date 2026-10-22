import { marked } from "marked";
import { useMemo, useState, type MouseEvent } from "react";
import { wikiPages, type WikiGroup } from "../wikiText";

// The documents are bundled at build time; the app loads nothing at runtime (ADR 0003, ADR 0010).
const files = import.meta.glob<string>(
  [
    "../../../docs/mechanics/*.md",
    "../../../docs/coverage.md",
    "../../../docs/roadmap.md",
  ],
  { query: "?raw", import: "default", eager: true },
);
const pages = wikiPages(files);

const GROUP_LABELS: Record<WikiGroup, string | null> = {
  start: null,
  mechanics: "Mechanics",
  status: "Status",
};
const WIKI_LINK = "#wiki/";

/** Wiki (US-15): navigation of pages on the left, the page as rendered Markdown on the right. */
export function WikiView() {
  const [pageId, setPageId] = useState(pages[0]?.id);
  const page = pages.find((p) => p.id === pageId) ?? pages[0];
  // Our own documents, bundled at build time; no user input reaches this HTML.
  const html = useMemo(
    () => (page ? marked.parse(page.markdown, { async: false }) : ""),
    [page],
  );

  const open = (id: string) => {
    setPageId(id);
    window.scrollTo({ top: 0 });
  };
  const followWikiLink = (event: MouseEvent) => {
    const link = (event.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href");
    if (!href?.startsWith(WIKI_LINK)) return;
    event.preventDefault();
    open(href.slice(WIKI_LINK.length));
  };

  const groups = (Object.keys(GROUP_LABELS) as WikiGroup[]).filter((group) =>
    pages.some((p) => p.group === group),
  );
  return (
    <div className="wiki">
      <nav className="wiki-nav" aria-label="Wiki">
        {groups.map((group) => (
          <div key={group}>
            {GROUP_LABELS[group] && <h2>{GROUP_LABELS[group]}</h2>}
            <ul>
              {pages
                .filter((p) => p.group === group)
                .map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-current={p.id === page?.id ? "page" : undefined}
                      onClick={() => open(p.id)}
                    >
                      {p.title}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>
      {page && (
        <article className="wiki-page" onClick={followWikiLink}>
          <h1>{page.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      )}
    </div>
  );
}
