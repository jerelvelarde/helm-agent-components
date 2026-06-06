import { ChevronRight, History, Play, Sparkles, Terminal } from "lucide-react";
import {
  Bubble,
  Btn,
  CodeNote,
  Composer,
  Composes,
  Note,
  SectionLabel,
  Showcase,
  StatusDot,
  ToolFrame,
  ToolLine,
  WindowFrame,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "coding-agent",
  title: "Coding Agent Panel",
  category: "Examples",
  blurb:
    "A Cursor/Devin-style coding agent docked beside the editor — it plans, edits files as reviewable diffs, and pauses before it runs a command.",
  copilotkit: "CopilotSidebar · useRenderTool · useHumanInTheLoop · useCoAgent",
  spec: "layouts/side-panel.md",
};

// ── Editor work surface ──────────────────────────────────────────────────────

const FILE: { n: number; s: string; edit?: boolean }[] = [
  { n: 10, s: 'import { redirect, next } from "./router"' },
  { n: 11, s: "" },
  { n: 12, s: "export function handleLogin(session) {" },
  { n: 13, s: '  if (session.expired) redirect("/login")', edit: true },
  { n: 14, s: "  return next()" },
  { n: 15, s: "}" },
];

function Editor() {
  return (
    <div style={{ flex: 1, minWidth: 0, background: "var(--surface-main)", display: "flex", flexDirection: "column" }}>
      <div className="flex items-center" style={{ borderBottom: `1px solid ${tok.grey300}`, background: "var(--fill-100)" }}>
        <span
          style={{
            fontFamily: tok.mono,
            fontSize: 12,
            padding: "8px 14px",
            background: "var(--surface-main)",
            borderRight: `1px solid ${tok.grey300}`,
            borderTop: `2px solid ${tok.indigo}`,
            color: tok.textPrimary,
          }}
        >
          auth.ts
        </span>
        <span style={{ fontFamily: tok.mono, fontSize: 12, padding: "8px 14px", color: tok.textDisabled }}>router.ts</span>
      </div>
      <div style={{ padding: "12px 0", fontFamily: tok.mono, fontSize: 12.5, lineHeight: "20px" }}>
        {FILE.map((l) => (
          <div
            key={l.n}
            className="flex"
            style={{ background: l.edit ? "var(--indigo-soft)" : "transparent", padding: "0 8px" }}
          >
            <span style={{ width: 28, textAlign: "right", color: tok.textDisabled, userSelect: "none", marginRight: 14, flexShrink: 0 }}>
              {l.n}
            </span>
            <span style={{ color: l.edit ? tok.textPrimary : tok.textSecondary, whiteSpace: "pre" }}>{l.s || " "}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div
        className="flex items-center"
        style={{ gap: 6, padding: "5px 12px", borderTop: `1px solid ${tok.grey300}`, fontFamily: tok.mono, fontSize: 10.5, color: tok.textDisabled }}
      >
        <span style={{ color: tok.indigo }}>● main</span>
        <span>·</span>
        <span>2 files changed by agent</span>
      </div>
    </div>
  );
}

// ── Generative-UI diff card (the edit_file result) ───────────────────────────

const DIFF: { t: "ctx" | "del" | "add"; s: string }[] = [
  { t: "ctx", s: "  export function handleLogin(session) {" },
  { t: "del", s: '    if (session.expired) redirect("/login")' },
  { t: "add", s: '    if (session.expired) return redirect("/login")' },
  { t: "ctx", s: "    return next()" },
];

function DiffCard() {
  return (
    <div style={{ borderRadius: 6, overflow: "hidden", border: `1px solid ${tok.grey300}`, fontFamily: tok.mono, fontSize: 11.5, lineHeight: "18px" }}>
      {DIFF.map((l, i) => (
        <div
          key={i}
          className="flex"
          style={{
            background:
              l.t === "add" ? "var(--success-soft)" : l.t === "del" ? "var(--error-soft)" : "transparent",
            padding: "0 8px",
          }}
        >
          <span style={{ width: 12, color: tok.textDisabled, flexShrink: 0 }}>
            {l.t === "add" ? "+" : l.t === "del" ? "−" : " "}
          </span>
          <span
            style={{
              color: l.t === "del" ? tok.error : l.t === "add" ? tok.success : tok.textSecondary,
              whiteSpace: "pre",
              textDecoration: l.t === "del" ? "line-through" : "none",
            }}
          >
            {l.s}
          </span>
        </div>
      ))}
    </div>
  );
}

function RunGate({ compact }: { compact?: boolean }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${tok.grey300}`,
        borderRight: `1px solid ${tok.grey300}`,
        borderBottom: `1px solid ${tok.grey300}`,
        borderLeft: `3px solid ${tok.warning}`,
        borderRadius: 8,
        padding: compact ? 14 : 11,
        background: tok.container,
      }}
    >
      <div className="flex items-center" style={{ gap: 7, marginBottom: 8 }}>
        <Terminal size={compact ? 15 : 13} color={tok.warning} />
        <span style={{ fontSize: compact ? 13.5 : 12.5, fontWeight: 600 }}>Run a command?</span>
      </div>
      <div
        style={{
          fontFamily: tok.mono,
          fontSize: 12,
          background: "var(--fill-100)",
          border: `1px solid ${tok.grey300}`,
          borderRadius: 6,
          padding: "6px 9px",
          marginBottom: 10,
          color: tok.textPrimary,
        }}
      >
        $ npm test
      </div>
      <div className="flex items-center" style={{ gap: 8 }}>
        <Btn variant="ghost">Skip</Btn>
        <Btn>
          <span className="flex items-center" style={{ gap: 5 }}>
            <Play size={12} /> Run
          </span>
        </Btn>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10.5, color: tok.textDisabled, fontFamily: tok.mono }}>runs in your shell</span>
      </div>
    </div>
  );
}

function AgentPanel() {
  return (
    <div
      style={{
        width: 360,
        minWidth: 360,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-background)",
        borderLeft: `1px solid ${tok.grey300}`,
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: 8, padding: "10px 14px", borderBottom: `1px solid ${tok.grey300}`, background: tok.container }}
      >
        <Sparkles size={14} color={tok.indigo} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Agent</span>
        <StatusDot state="running" label="working" />
      </div>

      {/* threads / history strip */}
      <button
        className="flex items-center"
        style={{
          gap: 7,
          padding: "7px 14px",
          borderBottom: `1px solid ${tok.grey300}`,
          background: "transparent",
          cursor: "pointer",
          fontSize: 12,
          color: tok.textSecondary,
          width: "100%",
          textAlign: "left",
        }}
      >
        <History size={13} color={tok.textDisabled} />
        <span style={{ flex: 1, color: tok.textPrimary, fontWeight: 500 }}>Fix login redirect loop</span>
        <span style={{ fontSize: 11, color: tok.textDisabled }}>3 sessions</span>
        <ChevronRight size={13} color={tok.textDisabled} />
      </button>

      <div className="ck-scroll" style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <ToolLine name="plan" status="complete" summary="3 edits · 2 files" defaultOpen>
          <span>1. Add missing <code style={{ fontFamily: tok.mono }}>return</code> · 2. Guard null session · 3. Add a test</span>
        </ToolLine>

        <Bubble role="user">The login redirect loops when the session is expired. Fix it.</Bubble>

        <Bubble role="assistant" full>
          The redirect runs but execution falls through to <code style={{ fontFamily: tok.mono, fontSize: 12 }}>next()</code>,
          so it re-enters the handler. Adding a <code style={{ fontFamily: tok.mono, fontSize: 12 }}>return</code> stops the loop.
        </Bubble>

        <ToolFrame name="edit_file" status="complete" args={'path: "auth.ts" · +1 −1'}>
          <DiffCard />
        </ToolFrame>

        <RunGate />

        <div style={{ fontSize: 10.5, color: tok.textDisabled, fontFamily: tok.mono, padding: "0 2px" }}>
          2 files edited · 1 command pending approval
        </div>
      </div>

      <div style={{ padding: "10px 12px", borderTop: `1px solid ${tok.grey300}` }}>
        <Composer placeholder="Ask the agent to change something…" streaming />
      </div>
    </div>
  );
}

// ── Wiring ───────────────────────────────────────────────────────────────────

const wiring = `import { CopilotSidebar } from "@copilotkit/react-ui";
import {
  useCoAgent,
  useRenderTool,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

function IDE({ workspace }) {
  // Shared state keeps the editor + agent on the same file tree.
  const { state } = useCoAgent({ name: "coder", initialState: workspace });

  // File edits render as reviewable diffs, not opaque "done".
  useRenderTool({
    name: "edit_file",
    parameters: z.object({ path: z.string(), patch: z.string() }),
    render: ({ status, args, result }) => (
      <ToolFrame name="edit_file" status={status} args={\`path: "\${args.path}"\`}>
        {status === "complete" && <DiffCard hunks={result.hunks} />}
      </ToolFrame>
    ),
  });

  // Running a command has real side effects → gate it behind approval.
  useHumanInTheLoop({
    name: "run_command",
    parameters: z.object({ cmd: z.string() }),
    render: ({ args, respond }) => (
      <RunGate
        cmd={args.cmd}
        onRun={() => respond?.("run")}
        onSkip={() => respond?.("skip")}
      />
    ),
  });

  return (
    <div style={{ display: "flex" }}>
      <Editor files={state.files} />
      <CopilotSidebar defaultOpen labels={{ title: "Agent" }} />
    </div>
  );
}

// AG-UI events in play:
// STATE_SNAPSHOT/DELTA → file tree + plan stay in sync with the run
// TOOL_CALL_* (edit)   → edit_file → diff card
// CUSTOM (interrupt)   → run_command approval → resolve(run|skip)
// RUN_FINISHED         → settle; surface files changed`;

// ── Story ────────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      <SectionLabel>Live screen · the agent fixing a bug beside the editor</SectionLabel>
      <WindowFrame title="acme-app — auth.ts">
        <div style={{ display: "flex", height: 560 }}>
          <Editor />
          <AgentPanel />
        </div>
      </WindowFrame>
      <Note>
        The IDE-copilot model. The agent shares the workspace state, so it sees the same files you do; it{" "}
        <strong>plans before it acts</strong>, renders each file edit as a <strong>reviewable diff</strong> (never an
        opaque "done"), and — because running a command touches your machine — it <strong>pauses for approval</strong>{" "}
        before executing. Past runs live in <strong>thread history</strong>, so a long debugging session is resumable.
      </Note>

      <SectionLabel>Command approval · the agent pauses before it executes</SectionLabel>
      <div style={{ maxWidth: 440 }}>
        <RunGate compact />
      </div>
      <Note>
        Reading a file is free; running <code style={{ fontFamily: tok.mono, fontSize: 12 }}>npm test</code> (or a
        migration, or a deploy) is not. Side-effecting tools route through the same{" "}
        <code style={{ fontFamily: tok.mono, fontSize: 12 }}>useHumanInTheLoop</code> gate, with the exact command shown.
      </Note>

      <SectionLabel>Composes</SectionLabel>
      <Composes
        items={[
          { slug: "side-panel", label: "Side Panel", role: "Agent rail docked beside the code editor." },
          { slug: "threads-history", label: "Threads / History", role: "Resumable debugging sessions per task." },
          { slug: "thinking-reasoning", label: "Thinking / Reasoning", role: "The plan the agent commits to before editing." },
          { slug: "tool-call", label: "Tool Call", role: "edit_file and run_command as inspectable cards." },
          { slug: "generative-ui-inline", label: "Inline Generative UI", role: "The +/− diff card rendered from an edit." },
          { slug: "human-in-the-loop", label: "Human-in-the-Loop", role: "Approval before any command runs in your shell." },
          { slug: "chat-message", label: "Chat Message", role: "The developer ↔ agent transcript." },
          { slug: "agent-activity-traceability", label: "Activity & Traceability", role: "Files changed + pending-action count." },
        ]}
      />

      <CodeNote title="CopilotKit wiring · the assembled IDE agent" code={wiring} />
    </Showcase>
  );
}
