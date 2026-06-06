import { useState } from "react";
import { Search, Sparkles, Command, ChevronRight, Check, X, ArrowRight } from "lucide-react";
import {
  Avatar,
  Bubble,
  Btn,
  Caret,
  CodeNote,
  Note,
  Showcase,
  Skeleton,
  StatusDot,
  Tag,
  ToolFrame,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "command-palette",
  title: "Command Palette / Cmd+K",
  category: "Layouts",
  blurb: "A keyboard-invoked overlay that blends commands with a natural-language ask; ephemeral and fast.",
  copilotkit: "cmdk + useAgent",
  spec: "layouts/command-palette.md",
};

// ── App-chrome mock behind the overlay ────────────────────────────────────────

function AppBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: tok.grey200,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overflow: "hidden",
      }}
    >
      {/* faux top bar */}
      <div
        className="flex items-center"
        style={{
          gap: 10,
          padding: "8px 14px",
          background: tok.container,
          borderRadius: 8,
          border: `1px solid ${tok.grey300}`,
        }}
      >
        <div style={{ width: 22, height: 8, borderRadius: 4, background: tok.grey300 }} />
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: tok.grey300, maxWidth: 140 }} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <Tag mono>⌘K</Tag>
        </div>
      </div>
      {/* faux content rows */}
      {[80, 60, 90, 55, 72].map((w, i) => (
        <div
          key={i}
          style={{ height: 9, borderRadius: 4, background: tok.grey300, width: `${w}%` }}
        />
      ))}
    </div>
  );
}

// ── Palette shell (the overlay itself) ────────────────────────────────────────

function PaletteShell({
  query,
  children,
  dimmed = true,
  height = 320,
}: {
  query?: string;
  children: React.ReactNode;
  dimmed?: boolean;
  height?: number;
}) {
  return (
    <div style={{ position: "relative", height, borderRadius: 10, overflow: "hidden" }}>
      <AppBackground />
      {dimmed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(1,5,7,0.36)",
            backdropFilter: "blur(1px)",
          }}
        />
      )}
      {/* centered palette card */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 440,
          maxWidth: "calc(100% - 32px)",
          background: tok.container,
          borderRadius: 12,
          border: `1px solid ${tok.grey300}`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* input row */}
        <div
          className="flex items-center"
          style={{
            gap: 10,
            padding: "11px 14px",
            borderBottom: `1px solid ${tok.grey300}`,
            background: tok.container,
          }}
        >
          <Search size={16} color={tok.textDisabled} />
          <span
            style={{
              flex: 1,
              fontSize: 14,
              color: query ? tok.textPrimary : tok.textDisabled,
              fontFamily: "inherit",
            }}
          >
            {query || "Type a command or ask AI…"}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Command row ────────────────────────────────────────────────────────────────

function CmdRow({
  label,
  hint,
  active,
  ai,
}: {
  label: string;
  hint?: string;
  active?: boolean;
  ai?: boolean;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 8,
        padding: "9px 14px",
        background: active ? tok.grey200 : "transparent",
        cursor: "pointer",
      }}
    >
      {ai ? (
        <Sparkles size={14} color={tok.indigo} />
      ) : (
        <Command size={13} color={tok.textDisabled} />
      )}
      <span style={{ flex: 1, fontSize: 13, color: ai ? tok.indigo : tok.textPrimary }}>{label}</span>
      {hint && (
        <span
          style={{
            fontSize: 11,
            color: tok.textDisabled,
            fontFamily: tok.mono,
            padding: "2px 6px",
            background: tok.grey200,
            borderRadius: 4,
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

// ── Wiring snippet ─────────────────────────────────────────────────────────────

const wiring = `import { useCallback, useEffect, useRef, useState } from "react";
import { Command } from "cmdk";
import {
  useFrontendTool,
  useCopilotReadable,
  useConfigureSuggestions,
  useHumanInTheLoop,
  useAgent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

// v1 equivalents: useCopilotAction, useCoAgent, useCopilotChat

function AppCommandPalette({ appContext, onNavigate, onCreateIssue }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [aiMode, setAiMode] = useState(false);

  // Bind Cmd/Ctrl+K globally at the app root
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Reset on close
  useEffect(() => {
    if (!open) { setQuery(""); setAiMode(false); }
  }, [open]);

  // Ground the AI in what the user currently sees
  useCopilotReadable({ description: "Current app context", value: appContext });

  // Seed idle / recent suggestions
  useConfigureSuggestions({
    instructions: "Suggest 3 quick actions the user can take right now.",
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  // Register an action — callable by both the fuzzy palette AND the AI tool
  useFrontendTool({
    name: "createIssue",
    description: "Create a new issue with a title and optional assignee",
    parameters: z.object({ title: z.string(), assignee: z.string().optional() }),
    handler: async ({ title, assignee }) => {
      await onCreateIssue({ title, assignee });
      setOpen(false);
    },
    render: ({ status, args }) => (
      <div>{status === "complete" ? \`Created: \${args.title}\` : \`Creating "\${args.title}"…\`}</div>
    ),
  });

  // Gate destructive actions with HITL — fires before the tool executes
  useHumanInTheLoop({
    name: "deleteProject",
    parameters: z.object({ projectId: z.string(), name: z.string() }),
    render: ({ status, args, respond }) =>
      status === "executing" ? (
        <div>
          <p>Delete project <strong>{args.name}</strong>?</p>
          <button onClick={() => respond?.("confirmed")}>Delete</button>
          <button onClick={() => respond?.("cancelled")}>Cancel</button>
        </div>
      ) : (
        <div>Awaiting confirmation…</div>
      ),
  });

  // Headless AI branch
  const { agent } = useAgent({ agentId: "app-agent" });
  const copilotkit = useCopilotKit();

  const runAI = useCallback(async () => {
    if (!query.trim()) return;
    agent.addMessage({ role: "user", content: query });
    await copilotkit.runAgent({ agent });
    // RUN_STARTED  → streaming slot shows
    // TEXT_MESSAGE_CONTENT → token-by-token render
    // TOOL_CALL_*  → inline tool card lifecycle
    // RUN_FINISHED → settle; RUN_ERROR → inline retry
  }, [query, agent, copilotkit]);

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command palette">
      <Command.Input
        value={query}
        onValueChange={setQuery}
        placeholder="Type a command or ask AI…"
        onKeyDown={(e) => {
          if (e.key === "Tab") { e.preventDefault(); setAiMode(true); }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {!aiMode ? (
        <Command.List>
          <Command.Empty>
            <button onClick={() => setAiMode(true)}>Ask AI "{query}"</button>
          </Command.Empty>
          <Command.Group heading="Actions">
            <Command.Item onSelect={() => onNavigate("/settings")}>Open settings</Command.Item>
          </Command.Group>
          {query && (
            <Command.Item onSelect={() => setAiMode(true)}>
              Ask AI "{query}" — Tab
            </Command.Item>
          )}
        </Command.List>
      ) : (
        <div aria-live="polite">
          {agent.isRunning
            ? <Command.Loading>Thinking…</Command.Loading>
            : agent.messages.filter((m) => m.role === "assistant").map((m) => (
                <p key={m.id}>{m.content}</p>
              ))
          }
          <button onClick={runAI} disabled={agent.isRunning || !query.trim()}>
            {agent.isRunning ? "Working…" : "Ask"}
          </button>
        </div>
      )}
    </Command.Dialog>
  );
}`;

// ── Story ──────────────────────────────────────────────────────────────────────

export default function Story() {
  const [hitlState, setHitlState] = useState<"pending" | "approved" | "rejected">("pending");

  return (
    <Showcase>

      {/* 1. Idle / closed — only the hint chip is visible */}
      <Variant label="idle · closed" hint="palette not rendered; ⌘K chip in app bar teaches discoverability">
        <div style={{ position: "relative", height: 200, borderRadius: 10, overflow: "hidden" }}>
          <AppBackground />
        </div>
        <Note>
          Only a visible{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>⌘K</code> chip (or a launcher button) signals
          the palette exists — never a hidden shortcut alone.
        </Note>
      </Variant>

      {/* 2. Invoked / open — empty query, recent suggestions shown */}
      <Variant label="invoked · open" hint="Cmd+K pressed; input focused; recent / suggested commands before any typing">
        <PaletteShell>
          <div style={{ padding: "6px 0" }}>
            <div style={{ padding: "4px 14px 6px", fontSize: 11, color: tok.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Recent
            </div>
            <CmdRow label="Create issue" hint="↵" active />
            <CmdRow label="Assign to…" hint="↵" />
            <CmdRow label="Open settings" hint="↵" />
            <CmdRow label="Archive project" hint="↵" />
            <CmdRow label='Ask AI — Tab to start' hint="Tab" ai />
          </div>
        </PaletteShell>
      </Variant>

      {/* 3. Filtering (command mode) */}
      <Variant label="filtering · command mode" hint="per-keystroke fuzzy re-rank; non-matches hidden; zero server latency">
        <PaletteShell query="creat is">
          <div style={{ padding: "6px 0" }}>
            <div style={{ padding: "4px 14px 6px", fontSize: 11, color: tok.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Actions
            </div>
            <CmdRow label="Create issue" hint="↵" active />
            <CmdRow label="Create project" hint="↵" />
            <CmdRow label='Ask AI "creat is"' hint="Tab" ai />
          </div>
        </PaletteShell>
        <Note>
          Fuzzy scoring surfaces the right command from a fragment — alias synonyms expand match coverage;
          the <code style={{ fontFamily: tok.mono, fontSize: 12 }}>Ask AI</code> row is always the last
          resort fallback.
        </Note>
      </Variant>

      {/* 4. AI mode — streaming answer */}
      <Variant label="ask-ai · streaming" hint="Tab handoff; RUN_STARTED → TEXT_MESSAGE_CONTENT; tokens render live; query preserved">
        <PaletteShell query="Summarise open issues" height={360}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderBottom: `1px solid ${tok.grey300}`,
              background: tok.grey200,
            }}
          >
            <Sparkles size={13} color={tok.indigo} />
            <span style={{ fontSize: 12, color: tok.indigo, fontWeight: 500 }}>AI mode</span>
            <Tag>Tab to switch back</Tag>
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <Avatar role="assistant" size={22} />
              <StatusDot state="running" label="Thinking…" />
            </div>
            <div style={{ fontSize: 14, lineHeight: "22px", color: tok.textPrimary, paddingLeft: 30 }}>
              There are{" "}
              <strong>4 open issues</strong> across your active projects. Two are high-priority (
              <em>AUTH-112</em> and <em>DASH-88</em>
              ), one is blocked, and one is awaiting review.<Caret />
            </div>
            <div style={{ paddingLeft: 30 }}>
              <Skeleton h={10} w="80%" />
            </div>
            <div className="flex items-center" style={{ gap: 8, paddingLeft: 30, marginTop: 4 }}>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: tok.textSecondary,
                  border: `1px solid ${tok.border}`,
                  background: tok.container,
                  borderRadius: 6,
                  padding: "3px 8px",
                  cursor: "pointer",
                }}
              >
                Stop
              </button>
            </div>
          </div>
        </PaletteShell>
      </Variant>

      {/* 5. Awaiting approval (HITL) */}
      <Variant label="awaiting approval · HITL" hint="useHumanInTheLoop fires; input locked; agent paused on destructive action">
        <PaletteShell query="Delete the Q1 planning project" height={360}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderBottom: `1px solid ${tok.grey300}`,
              background: tok.grey200,
            }}
          >
            <Sparkles size={13} color={tok.indigo} />
            <span style={{ fontSize: 12, color: tok.indigo, fontWeight: 500 }}>AI mode</span>
            <StatusDot state="waiting" label="waiting for approval" />
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            {hitlState === "pending" && (
              <div
                style={{
                  borderRadius: 10,
                  background: "var(--warning-soft)",
                  border: `1px solid ${tok.warning}`,
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div className="flex items-center" style={{ gap: 8 }}>
                  <StatusDot state="waiting" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: tok.warning }}>Approval required</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: "20px", margin: 0, color: tok.textSecondary }}>
                  Agent wants to <strong>delete project "Q1 Planning"</strong>. This cannot be undone.
                </p>
                <div className="flex" style={{ gap: 8 }}>
                  <Btn variant="danger" onClick={() => setHitlState("approved")}>Delete</Btn>
                  <Btn variant="ghost" onClick={() => setHitlState("rejected")}>Cancel</Btn>
                </div>
              </div>
            )}
            {hitlState === "approved" && (
              <div className="flex items-center" style={{ gap: 8 }}>
                <Check size={15} color={tok.success} />
                <span style={{ fontSize: 13, color: tok.success }}>Approved — deleting project…</span>
              </div>
            )}
            {hitlState === "rejected" && (
              <div className="flex items-center" style={{ gap: 8 }}>
                <X size={15} color={tok.textDisabled} />
                <span style={{ fontSize: 13, color: tok.textDisabled }}>Cancelled — project unchanged.</span>
              </div>
            )}
            {hitlState !== "pending" && (
              <button
                onClick={() => setHitlState("pending")}
                style={{ alignSelf: "flex-start", fontSize: 11, color: tok.textDisabled, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Reset demo
              </button>
            )}
          </div>
        </PaletteShell>
        <Note>
          Gate all consequential agent actions with{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>useHumanInTheLoop</code> — the palette
          input is locked and the agent is paused until the user responds.
        </Note>
      </Variant>

      {/* 6. Answered / action strip */}
      <Variant label="answered · action strip" hint="RUN_FINISHED; answer rendered; Copy / Open in chat / Retry controls">
        <PaletteShell query="Who is assigned to AUTH-112?" height={340}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderBottom: `1px solid ${tok.grey300}`,
              background: tok.grey200,
            }}
          >
            <Sparkles size={13} color={tok.indigo} />
            <span style={{ fontSize: 12, color: tok.indigo, fontWeight: 500 }}>AI mode</span>
            <StatusDot state="done" label="done" />
          </div>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 14, lineHeight: "22px", color: tok.textPrimary }}>
              <strong>AUTH-112</strong> is assigned to <strong>Maya Chen</strong>. It's marked{" "}
              <Tag>high priority</Tag> and currently blocked on a dependency in the auth-refresh branch.
            </div>
            <div
              style={{
                borderTop: `1px solid ${tok.grey300}`,
                paddingTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Btn variant="ghost">Copy</Btn>
              <Btn variant="ghost">
                Open in chat <ArrowRight size={12} style={{ display: "inline", marginLeft: 4 }} />
              </Btn>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: tok.textDisabled }}>Esc to dismiss</span>
            </div>
          </div>
        </PaletteShell>
        <Note>
          Post-answer controls let users copy the result, hand off to a persistent chat, or retry —
          keeping the palette transactional while providing an escape hatch for deeper sessions.
        </Note>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
