import type { ReactNode } from "react";
import { ArrowRight, Search } from "lucide-react";
import { Avatar, Bubble, Btn, Cite, SourceCard, ToolFrame, tok } from "./ui/kit";
import {
  entries,
  groups,
  matchesQuery,
  REPO_URL,
  firstComponentSlug,
  firstExampleSlug,
} from "./registry";

/* ---------- featured live previews ---------- */

function FeatureCard({
  slug,
  title,
  category,
  children,
  delay = 0,
}: {
  slug: string;
  title: string;
  category: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <a
      href={`#/c/${slug}`}
      className="ck-card ck-fade-up"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        background: tok.container,
        border: `1px solid ${tok.border}`,
        borderRadius: 16,
        padding: 18,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: tok.mono,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: tok.textDisabled,
          }}
        >
          {category}
        </span>
      </div>
      <div style={{ pointerEvents: "none", flex: 1 }}>{children}</div>
    </a>
  );
}

function MiniPalette() {
  return (
    <div style={{ border: `1px solid ${tok.border}`, borderRadius: 10, overflow: "hidden", background: "var(--surface-container)" }}>
      <div className="flex items-center" style={{ gap: 8, padding: "9px 11px", borderBottom: `1px solid ${tok.border}` }}>
        <Search size={14} color={tok.textDisabled} />
        <span style={{ fontSize: 13, color: tok.textDisabled }}>Type a command or ask AI…</span>
      </div>
      {[
        ["⌘", "Create issue"],
        ["✦", "Ask AI to summarize"],
      ].map(([k, label], i) => (
        <div
          key={label}
          className="flex items-center"
          style={{ gap: 10, padding: "8px 11px", background: i === 1 ? tok.bg : "transparent" }}
        >
          <span style={{ fontFamily: tok.mono, fontSize: 12, color: tok.textDisabled, width: 14 }}>{k}</span>
          <span style={{ fontSize: 13 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniApproval() {
  return (
    <div style={{ borderTop: `1px solid ${tok.border}`, borderRight: `1px solid ${tok.border}`, borderBottom: `1px solid ${tok.border}`, borderLeft: `3px solid ${tok.indigo}`, borderRadius: 10, padding: 12, background: "var(--surface-container)" }}>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
        <Avatar role="agent" size={22} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Send email to 1,842 subscribers?</span>
      </div>
      <div className="flex items-center" style={{ gap: 8 }}>
        <Btn variant="ghost">Reject</Btn>
        <Btn>Approve</Btn>
      </div>
    </div>
  );
}

function MiniThinking() {
  return (
    <div style={{ border: `1px solid ${tok.border}`, borderRadius: 10, padding: 12, background: "var(--surface-container)" }}>
      <div style={{ fontFamily: tok.mono, fontSize: 12, color: tok.textSecondary, marginBottom: 8 }}>
        ▾ Thought for 4s
      </div>
      <div style={{ fontSize: 12.5, lineHeight: "18px", color: tok.textDisabled, borderLeft: `2px solid ${tok.border}`, paddingLeft: 10 }}>
        The user wants to cancel mid-run. I'll call stop(), preserve the partial
        message, and mark it as stopped rather than discarding it.
      </div>
    </div>
  );
}

function MiniRedline() {
  return (
    <div style={{ border: `1px solid ${tok.border}`, borderRadius: 10, overflow: "hidden", background: "var(--surface-container)" }}>
      <div className="flex items-center" style={{ gap: 6, padding: "8px 11px", borderBottom: `1px solid ${tok.border}` }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Suggested redline</span>
        <span style={{ fontFamily: tok.mono, fontSize: 10.5, color: tok.textDisabled, marginLeft: "auto" }}>§9.1</span>
      </div>
      <div style={{ padding: "9px 11px", display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
        <span style={{ background: "var(--error-soft)", textDecoration: "line-through", color: tok.textSecondary, borderRadius: 4, padding: "3px 6px" }}>
          …without limitation.
        </span>
        <span style={{ background: "var(--success-soft)", borderRadius: 4, padding: "3px 6px" }}>
          …subject to the §7.2 liability cap.
        </span>
      </div>
    </div>
  );
}

const FEATURED: { slug: string; title: string; category: string; render: ReactNode }[] = [
  { slug: "legal-contract-copilot", title: "Legal Contract Copilot", category: "Example", render: <MiniRedline /> },
  {
    slug: "chat-message",
    title: "Chat Message",
    category: "Conversational",
    render: (
      <div className="flex flex-col" style={{ gap: 8 }}>
        <Bubble role="user">How do I cancel a run mid-stream?</Bubble>
        <Bubble role="assistant">
          Call <code style={{ fontFamily: tok.mono, fontSize: 13 }}>stop()</code> — the partial text is kept.
          <Cite n={1} />
        </Bubble>
      </div>
    ),
  },
  {
    slug: "tool-call",
    title: "Tool Call",
    category: "Transparency",
    render: (
      <ToolFrame name="search_web" status="complete" args={'query: "agentic UI patterns"'}>
        8 results · top match: <span style={{ color: tok.indigo }}>copilotkit.ai</span>
      </ToolFrame>
    ),
  },
  { slug: "human-in-the-loop", title: "Human-in-the-Loop", category: "Human control", render: <MiniApproval /> },
  { slug: "command-palette", title: "Command Palette", category: "Layout", render: <MiniPalette /> },
  {
    slug: "web-research",
    title: "Web Research",
    category: "Research",
    render: (
      <div className="flex flex-col" style={{ gap: 10 }}>
        <div style={{ fontSize: 13, lineHeight: "20px" }}>
          AG-UI streams 25 typed events.<Cite n={1} /> CopilotKit renders them.<Cite n={2} />
        </div>
        <div className="flex" style={{ gap: 8 }}>
          <SourceCard n={1} domain="docs.ag-ui.com" title="Events — the typed protocol stream" />
          <SourceCard n={2} domain="docs.copilotkit.ai" title="Generative UI overview" />
        </div>
      </div>
    ),
  },
  { slug: "thinking-reasoning", title: "Thinking / Reasoning", category: "Transparency", render: <MiniThinking /> },
];

/* ---------- browse-all tiles ---------- */

function Tile({ slug, title, blurb, category }: { slug: string; title: string; blurb: string; category: string }) {
  return (
    <a
      href={`#/c/${slug}`}
      className="ck-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        textDecoration: "none",
        color: "inherit",
        background: tok.container,
        border: `1px solid ${tok.border}`,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div className="flex items-center" style={{ gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</span>
        <ArrowRight size={14} color={tok.textDisabled} style={{ marginLeft: "auto" }} />
      </div>
      <span style={{ fontSize: 12.5, lineHeight: "18px", color: tok.textDisabled, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {blurb}
      </span>
      <span style={{ fontFamily: tok.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", color: tok.textDisabled, marginTop: 2 }}>
        {category}
      </span>
    </a>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center" style={{ gap: 12, margin: "0 0 16px" }}>
      <h3 style={{ fontSize: 13, fontFamily: tok.mono, textTransform: "uppercase", letterSpacing: "0.08em", color: tok.textSecondary, margin: 0 }}>
        {children}
      </h3>
      <div style={{ flex: 1, height: 1, background: tok.border }} />
    </div>
  );
}

const GRID = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))",
  gap: 12,
} as const;

export function Home({ query }: { query: string }) {
  const searching = query.trim().length > 0;
  const matched = entries.filter((e) => matchesQuery(e, query));
  const layoutCount = entries.filter((e) => e.meta.category === "Layouts").length;
  const exampleCount = entries.filter((e) => e.meta.category === "Examples").length;
  const componentCount = entries.length - layoutCount - exampleCount;

  if (searching) {
    return (
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 20px 80px" }}>
        <p style={{ fontSize: 14, color: tok.textSecondary, marginBottom: 20 }}>
          {matched.length} result{matched.length === 1 ? "" : "s"} for “{query}”
        </p>
        <div style={GRID}>
          {matched.map((e) => (
            <Tile key={e.meta.slug} slug={e.meta.slug} title={e.meta.title} blurb={e.meta.blurb} category={e.meta.category} />
          ))}
        </div>
        {matched.length === 0 && <p style={{ color: tok.textDisabled }}>No components match. Try “voice”, “tool”, or “layout”.</p>}
      </main>
    );
  }

  return (
    <main>
      {/* hero */}
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "84px 20px 56px", textAlign: "center" }}>
        <a
          href={`#/c/${firstExampleSlug}`}
          className="ck-fade-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: tok.textSecondary,
            textDecoration: "none",
            background: tok.container,
            border: `1px solid ${tok.border}`,
            borderRadius: 9999,
            padding: "5px 14px",
            marginBottom: 28,
          }}
        >
          <span style={{ fontFamily: tok.mono, fontSize: 11, color: tok.indigo }}>NEW</span>
          {exampleCount} end-to-end examples — the components, composed <ArrowRight size={13} />
        </a>
        <h1
          className="ck-fade-up"
          style={{
            fontSize: "clamp(40px, 6.4vw, 76px)",
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            fontWeight: 700,
            margin: "0 0 22px",
            animationDelay: "60ms",
          }}
        >
          The component foundation
          <br />
          for agentic apps
        </h1>
        <p
          className="ck-fade-up"
          style={{
            fontSize: "clamp(16px, 2.2vw, 20px)",
            lineHeight: 1.5,
            color: tok.textSecondary,
            maxWidth: 620,
            margin: "0 auto 32px",
            animationDelay: "120ms",
          }}
        >
          A research-backed set of UI patterns for chat, tool calls, human-in-the-loop,
          generative UI, and where AI sits — each documented, with copy-pasteable CopilotKit wiring.
        </p>
        <div className="ck-fade-up flex items-center" style={{ gap: 12, justifyContent: "center", animationDelay: "180ms" }}>
          <a
            href={`#/c/${firstComponentSlug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: tok.textPrimary,
              color: tok.textInvert,
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
              padding: "12px 22px",
              borderRadius: 9999,
            }}
          >
            Browse components <ArrowRight size={16} />
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: tok.container,
              color: tok.textPrimary,
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
              padding: "12px 22px",
              borderRadius: 9999,
              border: `1px solid ${tok.border}`,
            }}
          >
            GitHub ↗
          </a>
        </div>
        <p className="ck-fade-up" style={{ fontFamily: tok.mono, fontSize: 12, color: tok.textDisabled, marginTop: 28, animationDelay: "240ms" }}>
          {componentCount} components · {layoutCount} layouts · {exampleCount} examples · CopilotKit + AG-UI grounded
        </p>
      </section>

      {/* featured collage */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {FEATURED.map((f, i) => (
            <FeatureCard key={f.slug} slug={f.slug} title={f.title} category={f.category} delay={120 + i * 60}>
              {f.render}
            </FeatureCard>
          ))}
        </div>
      </section>

      {/* browse all, grouped */}
      <section style={{ maxWidth: 1240, margin: "0 auto", padding: "44px 20px 96px" }}>
        {groups.map((g) => (
          <div key={g.category} style={{ marginBottom: 40 }}>
            <SectionHeading>{g.category}</SectionHeading>
            <div style={GRID}>
              {g.items.map((e) => (
                <Tile key={e.meta.slug} slug={e.meta.slug} title={e.meta.title} blurb={e.meta.blurb} category={e.meta.category} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
