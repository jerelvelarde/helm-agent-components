import { useEffect, useState } from "react";
import { TopBar, type Route } from "./ui/TopBar";
import { Home } from "./Home";
import { SectionLabel, Tag, tok } from "./ui/kit";
import { type Entry, entries, getEntry, groups, matchesQuery, REPO_BLOB } from "./registry";

function parseRoute(hash: string): Route {
  const m = hash.match(/^#\/c\/(.+)$/);
  if (m) return { view: "browse", slug: decodeURIComponent(m[1]) };
  return { view: "home" };
}

function useRoute(): Route {
  const [hash, setHash] = useState<string>(() =>
    typeof window === "undefined" ? "#/" : window.location.hash || "#/",
  );
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return parseRoute(hash);
}

function Browse({ current, query }: { current: Entry; query: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const Current = current.Component;

  const filtered = groups
    .map((g) => ({ category: g.category, items: g.items.filter((e) => matchesQuery(e, query)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
      <aside
        className="ck-scroll"
        style={{
          width: 290,
          minWidth: 290,
          borderRight: `1px solid ${tok.border}`,
          background: "var(--surface-background)",
          overflowY: "auto",
          padding: "16px 12px",
        }}
      >
        {filtered.map((g) => (
          <div key={g.category} style={{ marginBottom: 14 }}>
            <SectionLabel>{g.category}</SectionLabel>
            <div className="flex flex-col" style={{ gap: 2 }}>
              {g.items.map((e) => {
                const active = e.meta.slug === current.meta.slug;
                const hot = hovered === e.meta.slug && !active;
                return (
                  <a
                    key={e.meta.slug}
                    data-slug={e.meta.slug}
                    href={`#/c/${e.meta.slug}`}
                    onMouseEnter={() => setHovered(e.meta.slug)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      textDecoration: "none",
                      borderRadius: 7,
                      padding: "7px 10px",
                      background: active ? "var(--surface-container)" : hot ? tok.bg : "transparent",
                      border: active ? `1px solid ${tok.border}` : "1px solid transparent",
                      boxShadow: active ? "0 1px 2px rgba(9,9,11,0.05)" : "none",
                      display: "block",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: active ? 600 : 500,
                        color: tok.textPrimary,
                        lineHeight: 1.3,
                      }}
                    >
                      {e.meta.title}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ fontSize: 13, color: tok.textDisabled, padding: "8px 10px" }}>No components match.</p>
        )}
      </aside>

      <main className="ck-scroll" style={{ flex: 1, overflowY: "auto", background: tok.surfaceMain }}>
        <div style={{ padding: "32px 36px 80px", maxWidth: 960, margin: "0 auto" }}>
          <div style={{ marginBottom: 26 }}>
            <span
              style={{
                fontFamily: tok.mono,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: tok.textDisabled,
              }}
            >
              {current.meta.category}
            </span>
            <h2 style={{ fontSize: 34, lineHeight: 1.08, letterSpacing: "-0.02em", fontWeight: 700, margin: "8px 0 0" }}>
              {current.meta.title}
            </h2>
            <p style={{ fontSize: 16, lineHeight: "24px", color: tok.textSecondary, margin: "12px 0 0", maxWidth: 720 }}>
              {current.meta.blurb}
            </p>
            <div className="flex items-center" style={{ gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <Tag mono>{current.meta.copilotkit}</Tag>
              <a
                href={`${REPO_BLOB}${current.meta.spec}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: tok.indigo, textDecoration: "none" }}
              >
                spec ↗
              </a>
            </div>
          </div>
          <Current />
        </div>
      </main>
    </div>
  );
}

export function App() {
  const route = useRoute();
  const [query, setQuery] = useState("");
  const routeKey = route.view === "browse" ? route.slug : "home";
  const current = route.view === "browse" ? getEntry(route.slug) ?? entries[0] : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [routeKey]);

  return (
    <div style={{ minHeight: "100vh", background: tok.surfaceMain }}>
      <TopBar route={route} query={query} onQuery={setQuery} currentCategory={current?.meta.category} />
      {route.view === "browse" && current ? (
        <Browse current={current} query={query} />
      ) : (
        <Home query={query} />
      )}
    </div>
  );
}
