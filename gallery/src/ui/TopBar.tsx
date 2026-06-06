import { useState } from "react";
import { Moon, Search, Sun } from "lucide-react";
import { tok } from "./kit";
import { REPO_URL, firstComponentSlug, firstLayoutSlug, firstExampleSlug } from "../registry";

export type Route = { view: "home" } | { view: "browse"; slug: string };

function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(
    () => typeof document !== "undefined" && document.documentElement.dataset.theme === "dark",
  );
  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("helm-theme", next);
    } catch {
      /* ignore */
    }
    setDark(!dark);
  };
  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={dark ? "Switch to light" : "Switch to dark"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: 9999,
        cursor: "pointer",
        background: "transparent",
        border: `1px solid ${tok.border}`,
        color: tok.textSecondary,
      }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export function TopBar({
  route,
  query,
  onQuery,
  currentCategory,
}: {
  route: Route;
  query: string;
  onQuery: (v: string) => void;
  currentCategory?: string;
}) {
  const isHome = route.view === "home";
  const onLayouts = route.view === "browse" && currentCategory === "Layouts";
  const onExamples = route.view === "browse" && currentCategory === "Examples";
  const onComponents = route.view === "browse" && !onLayouts && !onExamples;

  const nav = [
    { label: "Home", href: "#/", active: isHome },
    { label: "Components", href: `#/c/${firstComponentSlug}`, active: onComponents },
    { label: "Layouts", href: `#/c/${firstLayoutSlug}`, active: onLayouts },
    { label: "Examples", href: `#/c/${firstExampleSlug}`, active: onExamples },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 56,
        background: "var(--topbar-bg)",
        backdropFilter: "saturate(180%) blur(10px)",
        WebkitBackdropFilter: "saturate(180%) blur(10px)",
        borderBottom: `1px solid ${tok.border}`,
      }}
    >
      <div
        style={{
          height: "100%",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        <a
          href="#/"
          style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: tok.textPrimary }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              background: tok.textPrimary,
              color: tok.textInvert,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            H
          </span>
          <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>Helm</span>
        </a>

        <nav className="flex items-center" style={{ gap: 2 }}>
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                color: n.active ? tok.textPrimary : tok.textSecondary,
                padding: "6px 10px",
                borderRadius: 8,
                background: n.active ? tok.bg : "transparent",
              }}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <span style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: tok.bg,
            border: `1px solid ${tok.border}`,
            borderRadius: 9999,
            padding: "6px 12px",
            width: 220,
            maxWidth: "30vw",
          }}
        >
          <Search size={15} color={tok.textDisabled} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search components…"
            aria-label="Search components"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              fontFamily: "inherit",
              color: tok.textPrimary,
              width: "100%",
            }}
          />
        </div>

        <ThemeToggle />

        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 13, fontWeight: 500, textDecoration: "none", color: tok.textSecondary, whiteSpace: "nowrap" }}
        >
          GitHub ↗
        </a>
      </div>
    </header>
  );
}
