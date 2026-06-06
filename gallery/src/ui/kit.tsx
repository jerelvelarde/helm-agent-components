import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowUp, Check, ChevronRight, Code2, Mic, Paperclip, Square } from "lucide-react";

/** Neutral, zinc-based design tokens. Surface/text/border/fill resolve to CSS
 *  variables so they flip with [data-theme="dark"]; accent/status colors stay
 *  constant hex so `${tok.accent}NN` alpha overlays keep working in both modes. */
export const tok = {
  surfaceMain: "var(--surface-main)",
  container: "var(--surface-container)",
  containerHover: "var(--surface-container-hovered)",
  bg: "var(--fill-100)",
  borderDefault: "var(--border-default)",
  border: "var(--border-container)",
  grey200: "var(--fill-100)",
  grey300: "var(--border-container)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textDisabled: "var(--text-disabled)",
  textInvert: "var(--text-invert)",
  white50: "var(--fill-100)",
  white65: "var(--fill-100)",
  white70: "var(--fill-200)",
  indigo: "#6366f1",
  violet: "#7c3aed",
  teal: "#0d9488",
  success: "#16a34a",
  warning: "#d97706",
  error: "#dc2626",
  mono: '"Spline Sans Mono", ui-monospace, SFMono-Regular, monospace',
} as const;

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Vertical stack wrapping a story's variants. */
export function Showcase({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      {children}
    </div>
  );
}

/** A labelled state panel: a mono uppercase label + extending rule, then a white card. */
export function Variant({
  label,
  hint,
  children,
  style,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section>
      <div className="flex items-center" style={{ gap: 8, padding: "0 2px", marginBottom: 8 }}>
        <span
          style={{
            fontFamily: tok.mono,
            fontSize: 10,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: tok.textSecondary,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        {hint ? <span style={{ fontSize: 11, color: tok.textDisabled }}>{hint}</span> : null}
        <div style={{ flex: 1, height: 1, background: tok.border }} />
      </div>
      <div
        style={{
          background: tok.container,
          border: `1px solid ${tok.grey300}`,
          borderRadius: 8,
          padding: 16,
          ...style,
        }}
      >
        {children}
      </div>
    </section>
  );
}

/** Muted explanatory caption. */
export function Note({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 13, lineHeight: "20px", color: tok.textDisabled, margin: 0 }}>{children}</p>;
}

/** 10px uppercase section label with an extending hairline. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center" style={{ gap: 8, padding: "0 4px", marginBottom: 8 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 400,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: tok.textSecondary,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: tok.border }} />
    </div>
  );
}

/** Pill tag/badge. */
export function Tag({
  children,
  selected,
  mono,
}: {
  children: ReactNode;
  selected?: boolean;
  mono?: boolean;
}) {
  return (
    <span
      style={{
        fontFamily: mono ? tok.mono : undefined,
        fontSize: 12,
        lineHeight: 1.4,
        padding: "2px 8px",
        borderRadius: 9999,
        background: selected ? tok.textPrimary : tok.white65,
        color: selected ? tok.textInvert : tok.textPrimary,
        whiteSpace: "nowrap",
        border: selected ? "none" : `1px solid ${tok.border}`,
      }}
    >
      {children}
    </span>
  );
}

export type Role = "user" | "assistant" | "agent" | "tool";

export function Avatar({ role, size = 26 }: { role: Role; size?: number }) {
  const map: Record<Role, { bg: string; ch: string }> = {
    user: { bg: "var(--text-primary)", ch: "U" },
    assistant: { bg: tok.indigo, ch: "A" },
    agent: { bg: tok.violet, ch: "✦" },
    tool: { bg: tok.teal, ch: "⚙" },
  };
  const v = map[role];
  return (
    <span
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: 9999,
        background: v.bg,
        color: "var(--surface-container)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.46,
        fontWeight: 600,
      }}
    >
      {v.ch}
    </span>
  );
}

/** Chat message bubble, role-styled. */
export function Bubble({
  role,
  children,
  full,
}: {
  role: "user" | "assistant";
  children: ReactNode;
  full?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className="flex" style={{ justifyContent: isUser ? "flex-end" : "flex-start", gap: 10 }}>
      {!isUser && <Avatar role="assistant" />}
      <div
        style={{
          maxWidth: full ? "100%" : "82%",
          padding: "10px 14px",
          borderRadius: 14,
          fontSize: 14,
          lineHeight: "22px",
          background: isUser ? tok.textPrimary : tok.container,
          color: isUser ? tok.textInvert : tok.textPrimary,
          border: isUser ? "none" : `1px solid ${tok.grey300}`,
        }}
      >
        {children}
      </div>
      {isUser && <Avatar role="user" />}
    </div>
  );
}

export type RunState = "idle" | "running" | "done" | "error" | "waiting";

export function StatusDot({ state, label }: { state: RunState; label?: string }) {
  const color: Record<RunState, string> = {
    idle: "var(--idle-dot)",
    running: tok.indigo,
    done: tok.success,
    error: tok.error,
    waiting: tok.warning,
  };
  return (
    <span className="inline-flex items-center" style={{ gap: 6 }}>
      <span
        className={state === "running" ? "ck-pulse" : ""}
        style={{ width: 8, height: 8, borderRadius: 9999, background: color[state], display: "inline-block" }}
      />
      {label ? <span style={{ fontSize: 12, color: tok.textSecondary }}>{label}</span> : null}
    </span>
  );
}

export type ToolStatus = "inProgress" | "executing" | "complete" | "error";

/** Tool-call card keyed to CopilotKit's ToolCallStatus lifecycle. */
export function ToolFrame({
  name,
  status,
  args,
  children,
}: {
  name: string;
  status: ToolStatus;
  args?: ReactNode;
  children?: ReactNode;
}) {
  const accent =
    status === "complete" ? tok.success : status === "error" ? tok.error : tok.indigo;
  const label: Record<ToolStatus, string> = {
    inProgress: "in progress",
    executing: "executing",
    complete: "complete",
    error: "error",
  };
  const busy = status === "inProgress" || status === "executing";
  return (
    <div
      style={{
        background: tok.container,
        borderTop: `1px solid ${tok.grey300}`,
        borderRight: `1px solid ${tok.grey300}`,
        borderBottom: `1px solid ${tok.grey300}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div className="flex items-center" style={{ gap: 8, padding: "9px 12px" }}>
        <span
          className={busy ? "ck-pulse" : ""}
          style={{ width: 7, height: 7, borderRadius: 9999, background: accent }}
        />
        <span style={{ fontFamily: tok.mono, fontSize: 12.5, color: tok.textPrimary }}>{name}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: tok.mono, fontSize: 11, color: tok.textDisabled }}>{label[status]}</span>
      </div>
      {args ? (
        <div style={{ padding: "0 12px 10px 12px", fontFamily: tok.mono, fontSize: 12, color: tok.textSecondary }}>
          {args}
        </div>
      ) : null}
      {children ? (
        <div style={{ padding: "10px 12px", borderTop: `1px solid ${tok.grey300}`, fontSize: 13, lineHeight: "20px" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** Compact, collapsible tool-call line — the low-chrome density that pairs with
 *  ToolFrame (the rich card). One glanceable summary row; expands on demand to
 *  reveal arguments + result. This is the natural shape for useDefaultRenderTool. */
export function ToolLine({
  name,
  status,
  summary,
  args,
  children,
  defaultOpen = false,
}: {
  name: string;
  status: ToolStatus;
  summary?: ReactNode;
  args?: ReactNode;
  children?: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const busy = status === "inProgress" || status === "executing";
  const accent = status === "complete" ? tok.success : status === "error" ? tok.error : tok.indigo;
  const verb: Record<ToolStatus, string> = {
    inProgress: "Calling",
    executing: "Running",
    complete: "Ran",
    error: "Failed",
  };
  const expandable = Boolean(args || children);
  return (
    <div style={{ fontSize: 13 }}>
      <button
        onClick={() => expandable && setOpen((o) => !o)}
        aria-expanded={expandable ? open : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          width: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          padding: "3px 2px",
          cursor: expandable ? "pointer" : "default",
          fontFamily: "inherit",
          fontSize: 13,
        }}
      >
        {status === "complete" ? (
          <Check size={13} color={accent} strokeWidth={2.5} style={{ flexShrink: 0 }} />
        ) : (
          <span
            className={busy ? "ck-pulse" : ""}
            style={{ width: 7, height: 7, borderRadius: 9999, background: accent, display: "inline-block", flexShrink: 0 }}
          />
        )}
        <span style={{ color: tok.textDisabled }}>{verb[status]}</span>
        <span style={{ fontFamily: tok.mono, fontSize: 12.5, color: tok.textPrimary }}>{name}</span>
        {summary ? (
          <span style={{ color: tok.textDisabled, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            · {summary}
          </span>
        ) : null}
        <span style={{ flex: 1 }} />
        {expandable ? (
          <ChevronRight
            size={14}
            color={tok.textDisabled}
            style={{ flexShrink: 0, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }}
          />
        ) : null}
      </button>
      {expandable && open ? (
        <div
          style={{
            marginLeft: 6,
            borderLeft: `1px solid ${tok.grey300}`,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "5px 0 5px 14px",
          }}
        >
          {args ? <div style={{ fontFamily: tok.mono, fontSize: 12, color: tok.textSecondary }}>{args}</div> : null}
          {children ? <div style={{ fontSize: 13, lineHeight: "20px", color: tok.textPrimary }}>{children}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

export function Btn({
  children,
  variant = "primary",
  onClick,
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  onClick?: () => void;
}) {
  const styles: Record<string, CSSProperties> = {
    primary: { background: tok.textPrimary, color: tok.textInvert, border: "none" },
    ghost: { background: "transparent", color: tok.textPrimary, border: `1px solid ${tok.border}` },
    danger: { background: tok.error, color: "var(--surface-container)", border: "none" },
  };
  return (
    <button
      onClick={onClick}
      style={{
        ...styles[variant],
        borderRadius: 8,
        padding: "7px 14px",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

/** Read-only mock form field. */
export function Field({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <label className="flex flex-col" style={{ gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: tok.textSecondary }}>{label}</span>
      <div
        style={{
          background: "var(--surface-container)",
          border: `1px solid ${tok.border}`,
          borderRadius: 6,
          padding: "8px 10px",
          fontSize: 13,
          color: value ? tok.textPrimary : tok.textDisabled,
        }}
      >
        {value || placeholder}
      </div>
    </label>
  );
}

export function Skeleton({ w = "100%", h = 12, style }: { w?: number | string; h?: number | string; style?: CSSProperties }) {
  return <div className="ck-skeleton" style={{ width: w, height: h, ...style }} />;
}

/** Blinking text caret for streaming states. */
export function Caret() {
  return <span className="ck-caret" />;
}

/** Inline numbered citation marker. */
export function Cite({ n }: { n: number }) {
  return (
    <sup
      style={{
        fontFamily: tok.mono,
        fontSize: 10,
        color: tok.indigo,
        background: "var(--indigo-soft)",
        borderRadius: 4,
        padding: "0 4px",
        marginLeft: 2,
      }}
    >
      {n}
    </sup>
  );
}

/** Search/research source card. */
export function SourceCard({ n, domain, title }: { n: number; domain: string; title: string }) {
  return (
    <div
      style={{
        background: "var(--surface-container)",
        border: `1px solid ${tok.grey300}`,
        borderRadius: 8,
        padding: "8px 10px",
        minWidth: 170,
        maxWidth: 240,
      }}
    >
      <div className="flex items-center" style={{ gap: 6, marginBottom: 4 }}>
        <span style={{ width: 14, height: 14, borderRadius: 3, background: tok.bg, display: "inline-block" }} />
        <span style={{ fontSize: 11, color: tok.textDisabled, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {domain}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: tok.mono, fontSize: 10, color: tok.indigo }}>{n}</span>
      </div>
      <div style={{ fontSize: 12.5, lineHeight: "16px", color: tok.textPrimary }}>{title}</div>
    </div>
  );
}

/** Mock composer / input bar. */
export function Composer({
  value,
  placeholder = "Message the agent…",
  streaming,
}: {
  value?: string;
  placeholder?: string;
  streaming?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface-container)",
        border: `1px solid ${tok.border}`,
        borderRadius: 12,
        padding: "10px 10px 10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Paperclip size={18} color={tok.textDisabled} />
      <span style={{ flex: 1, fontSize: 14, color: value ? tok.textPrimary : tok.textDisabled }}>
        {value || placeholder}
      </span>
      <Mic size={18} color={tok.textDisabled} />
      <button
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: "none",
          background: tok.textPrimary,
          color: "var(--surface-container)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {streaming ? <Square size={15} /> : <ArrowUp size={17} />}
      </button>
    </div>
  );
}

/** Desktop window chrome — traffic-light dots + an optional title/URL bar.
 *  Wraps an example's full-app mockup so a composed screen reads as a product. */
export function WindowFrame({
  title,
  children,
  style,
}: {
  title?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        border: `1px solid ${tok.grey300}`,
        borderRadius: 12,
        overflow: "hidden",
        background: tok.container,
        boxShadow: "var(--card-shadow)",
        ...style,
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: 8, padding: "9px 12px", borderBottom: `1px solid ${tok.grey300}`, background: "var(--fill-100)" }}
      >
        <span className="flex" style={{ gap: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} style={{ width: 11, height: 11, borderRadius: 9999, background: c, display: "inline-block" }} />
          ))}
        </span>
        {title ? (
          <span style={{ marginLeft: 6, fontSize: 12, color: tok.textDisabled, fontFamily: tok.mono }}>{title}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** The Helm components an example composes — each chip links to that component's
 *  story in the gallery (#/c/<slug>), making the composition explicit & browsable. */
export function Composes({ items }: { items: { slug: string; label: string; role: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(228px, 1fr))", gap: 8 }}>
      {items.map((it) => (
        <a
          key={it.slug + it.label}
          href={`#/c/${it.slug}`}
          className="ck-card"
          style={{
            textDecoration: "none",
            color: "inherit",
            background: tok.container,
            border: `1px solid ${tok.grey300}`,
            borderRadius: 8,
            padding: "9px 11px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <span className="flex items-center" style={{ gap: 4, fontSize: 12.5, fontWeight: 600, color: tok.textPrimary }}>
            {it.label}
            <ChevronRight size={12} color={tok.textDisabled} style={{ marginLeft: "auto" }} />
          </span>
          <span style={{ fontSize: 11.5, color: tok.textDisabled, lineHeight: "16px" }}>{it.role}</span>
        </a>
      ))}
    </div>
  );
}

/** Renders the copy-pasteable CopilotKit wiring snippet for a story. */
export function CodeNote({ title = "CopilotKit wiring", code }: { title?: string; code: string }) {
  return (
    <div style={{ background: tok.container, border: `1px solid ${tok.grey300}`, borderRadius: 8, overflow: "hidden" }}>
      <div
        className="flex items-center"
        style={{
          gap: 6,
          fontFamily: tok.mono,
          fontSize: 11,
          color: tok.textSecondary,
          padding: "7px 12px",
          borderBottom: `1px solid ${tok.grey300}`,
          background: "var(--fill-100)",
        }}
      >
        <Code2 size={13} /> {title}
      </div>
      <pre
        className="ck-scroll"
        style={{
          margin: 0,
          padding: 14,
          fontFamily: tok.mono,
          fontSize: 12.5,
          lineHeight: 1.55,
          overflowX: "auto",
          color: "var(--code-fg)",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
