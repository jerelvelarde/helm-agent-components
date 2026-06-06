import { useState } from "react";
import { ChevronDown, ChevronRight, Play, RotateCcw, Sparkles, Square, Wand2 } from "lucide-react";
import {
  Avatar,
  Bubble,
  Btn,
  Caret,
  CodeNote,
  Composer,
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
  slug: "split-view",
  title: "Split View — Chat Drives a Workspace",
  category: "Layouts",
  blurb: "A chat pane that co-creates a live artifact shown beside it (Lovable, ChatGPT Canvas).",
  copilotkit: "CopilotSidebar · useAgent",
  spec: "layouts/split-view.md",
};

// ── Shared chrome ──────────────────────────────────────────────────────────────

/** Thin divider between chat and artifact pane. */
function Divider() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 4,
        background: tok.bg,
        alignSelf: "stretch",
        flexShrink: 0,
        cursor: "col-resize",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 2,
          height: 28,
          borderRadius: 2,
          background: tok.grey300,
        }}
      />
    </div>
  );
}

/** Full split-view chrome: chat left (~36%), workspace right. */
function SplitShell({
  chat,
  workspace,
}: {
  chat: React.ReactNode;
  workspace: React.ReactNode;
}) {
  return (
    <div
      className="flex"
      style={{
        height: 360,
        borderRadius: 10,
        border: `1px solid ${tok.grey300}`,
        overflow: "hidden",
        background: tok.surfaceMain,
      }}
    >
      {/* Left — chat pane */}
      <div
        className="flex flex-col"
        style={{
          width: "36%",
          background: "var(--surface-container)",
          padding: "12px 12px 10px",
          gap: 10,
          overflow: "hidden",
        }}
      >
        {chat}
      </div>

      <Divider />

      {/* Right — artifact / workspace pane */}
      <div
        className="flex flex-col"
        style={{ flex: 1, background: tok.grey200, position: "relative", overflow: "hidden" }}
      >
        {workspace}
      </div>
    </div>
  );
}

/** Workspace toolbar: Preview / Code toggle, version badge, status. */
function WorkspaceToolbar({
  fileName,
  version,
  state,
  previewActive = true,
}: {
  fileName: string;
  version?: string;
  state?: "syncing" | "done" | "error";
  previewActive?: boolean;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 8,
        padding: "9px 12px",
        borderBottom: `1px solid ${tok.border}`,
        background: "var(--surface-container)",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500, color: tok.textPrimary, flex: 1 }}>
        {fileName}
      </span>
      {/* Preview / Code toggle */}
      <div
        className="flex items-center"
        style={{
          border: `1px solid ${tok.border}`,
          borderRadius: 6,
          overflow: "hidden",
          fontSize: 11.5,
          fontWeight: 500,
        }}
      >
        <span
          style={{
            padding: "3px 9px",
            background: previewActive ? tok.textPrimary : "transparent",
            color: previewActive ? tok.textInvert : tok.textSecondary,
          }}
        >
          Preview
        </span>
        <span
          style={{
            padding: "3px 9px",
            background: !previewActive ? tok.textPrimary : "transparent",
            color: !previewActive ? tok.textInvert : tok.textSecondary,
          }}
        >
          Code
        </span>
      </div>
      {version && (
        <Tag mono>
          <RotateCcw size={9} style={{ display: "inline", marginRight: 3 }} />
          {version}
        </Tag>
      )}
      {state === "syncing" && <StatusDot state="running" label="building" />}
      {state === "done" && <StatusDot state="done" label="saved" />}
      {state === "error" && <StatusDot state="error" label="error" />}
    </div>
  );
}

// ── Variant 1 — Idle / empty ───────────────────────────────────────────────────

function EmptyState() {
  return (
    <SplitShell
      chat={
        <>
          <div
            className="flex items-center"
            style={{ gap: 8, marginBottom: 4, paddingBottom: 10, borderBottom: `1px solid ${tok.grey300}` }}
          >
            <Sparkles size={14} color={tok.indigo} />
            <span style={{ fontSize: 13, fontWeight: 600, color: tok.textPrimary }}>
              Co-author
            </span>
          </div>
          <div
            className="flex flex-col items-center"
            style={{ flex: 1, justifyContent: "center", gap: 12, padding: "12px 0" }}
          >
            <Avatar role="assistant" size={36} />
            <p style={{ fontSize: 13, color: tok.textSecondary, textAlign: "center", margin: 0 }}>
              Describe what you want to build. I'll create it in the workspace.
            </p>
            {/* Suggestion pills */}
            <div className="flex flex-wrap" style={{ gap: 6, justifyContent: "center" }}>
              {["Build a dashboard", "Draft a doc", "Write a component"].map((s) => (
                <button
                  key={s}
                  style={{
                    fontSize: 12,
                    padding: "5px 10px",
                    borderRadius: 9999,
                    border: `1px solid ${tok.border}`,
                    background: tok.container,
                    color: tok.textPrimary,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {s} <ChevronRight size={11} color={tok.textDisabled} />
                </button>
              ))}
            </div>
          </div>
          <Composer placeholder="What should we build?" />
        </>
      }
      workspace={
        <div
          className="flex flex-col items-center"
          style={{ flex: 1, justifyContent: "center", gap: 12, padding: 24 }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: tok.grey300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Wand2 size={22} color={tok.textDisabled} />
          </div>
          <span style={{ fontSize: 13, color: tok.textSecondary, textAlign: "center" }}>
            Your artifact will appear here once you send a prompt.
          </span>
          <Tag>UI preview · Document · Code · App</Tag>
        </div>
      }
    />
  );
}

// ── Variant 2 — Streaming / building ──────────────────────────────────────────

function StreamingState() {
  return (
    <SplitShell
      chat={
        <>
          <Bubble role="user">Build a metric cards dashboard with revenue, users, and churn.</Bubble>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Avatar role="assistant" size={22} />
            <span style={{ fontSize: 13, color: tok.textSecondary }}>Building dashboard…</span>
            <StatusDot state="running" />
          </div>
          <ToolFrame
            name="updateDocument"
            status="executing"
            args={'artifact: "dashboard.tsx", streaming: true'}
          />
          <div style={{ flex: 1 }} />
          <div className="flex items-center" style={{ gap: 8 }}>
            <Composer placeholder="Generating…" streaming />
          </div>
        </>
      }
      workspace={
        <>
          <WorkspaceToolbar fileName="dashboard.tsx" version="v1" state="syncing" />
          <div className="flex flex-col" style={{ flex: 1, padding: 16, gap: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {/* Partially-built metric cards streaming in */}
              {[
                { label: "Revenue", value: "$84,320", color: "var(--indigo-soft)" },
                { label: "Active Users", value: "12,841", color: "var(--success-soft)" },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    border: `1px solid ${tok.border}`,
                    background: card.color,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 11, color: tok.textSecondary, marginBottom: 4 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: tok.textPrimary }}>
                    {card.value}
                  </div>
                </div>
              ))}
              {/* Third card still streaming */}
              <div
                style={{
                  flex: 1,
                  borderRadius: 8,
                  border: `1px dashed ${tok.border}`,
                  background: "var(--surface-container)",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <Skeleton h={10} w="55%" />
                <Skeleton h={18} w="70%" />
              </div>
            </div>
            {/* Chart area streaming */}
            <Skeleton h={110} w="100%" style={{ borderRadius: 8 }} />
            <div style={{ fontSize: 12, color: tok.indigo, display: "flex", alignItems: "center", gap: 4 }}>
              <Caret /> Building chart…
            </div>
          </div>
          {/* Stop button always reachable */}
          <div
            className="flex items-center"
            style={{ gap: 8, padding: "8px 12px", borderTop: `1px solid ${tok.border}`, background: "var(--surface-container)" }}
          >
            <div style={{ flex: 1 }} />
            <Btn variant="ghost">
              <Square size={12} style={{ display: "inline", marginRight: 4 }} />
              Stop
            </Btn>
          </div>
        </>
      }
    />
  );
}

// ── Variant 3 — Settled / applied (direct-edit available) ─────────────────────

function SettledState() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <SplitShell
      chat={
        <>
          <Bubble role="user">Build a metric cards dashboard with revenue, users, and churn.</Bubble>
          <Bubble role="assistant">
            Done — your dashboard is live. Click any card to edit it directly, or ask me to refine
            it.
          </Bubble>
          <div style={{ flex: 1 }} />
          <Composer placeholder="Refine the dashboard…" />
        </>
      }
      workspace={
        <>
          <WorkspaceToolbar fileName="dashboard.tsx" version="v2" state="done" />
          <div className="flex flex-col" style={{ flex: 1, padding: 16, gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { id: "rev", label: "Revenue", value: "$84,320", bg: "var(--indigo-soft)" },
                { id: "usr", label: "Active Users", value: "12,841", bg: "var(--success-soft)" },
                { id: "churn", label: "Churn Rate", value: "2.4%", bg: "var(--warning-soft)" },
              ].map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelected(card.id === selected ? null : card.id)}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    border: `1px solid ${card.id === selected ? tok.indigo : tok.border}`,
                    background: card.id === selected ? "var(--indigo-soft)" : card.bg,
                    padding: "10px 12px",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                    outline: card.id === selected ? `2px solid ${tok.indigo}33` : "none",
                  }}
                >
                  <div style={{ fontSize: 11, color: tok.textSecondary, marginBottom: 4 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: tok.textPrimary }}>
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
            {selected && (
              <div
                style={{
                  fontSize: 12,
                  color: tok.indigo,
                  background: "var(--indigo-soft)",
                  borderRadius: 6,
                  padding: "5px 10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  alignSelf: "flex-start",
                }}
              >
                <Wand2 size={12} /> Design Mode — click to edit this element directly
              </div>
            )}
            <div
              style={{
                flex: 1,
                borderRadius: 8,
                border: `1px solid ${tok.border}`,
                background: "var(--surface-container)",
                padding: 12,
                minHeight: 80,
              }}
            >
              <div style={{ fontSize: 11, color: tok.textDisabled, marginBottom: 6 }}>
                Revenue (30 days)
              </div>
              {/* Faux sparkline */}
              <svg viewBox="0 0 200 40" style={{ width: "100%", height: 40 }}>
                <polyline
                  points="0,35 30,28 60,20 90,24 120,12 150,16 200,8"
                  fill="none"
                  stroke={tok.indigo}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div
            className="flex items-center"
            style={{ gap: 8, padding: "8px 12px", borderTop: `1px solid ${tok.border}`, background: "var(--surface-container)" }}
          >
            <RotateCcw size={13} color={tok.textDisabled} />
            <span style={{ fontSize: 12, color: tok.textDisabled }}>v2 of 2</span>
            <div style={{ flex: 1 }} />
            <Btn variant="ghost">
              <Play size={12} style={{ display: "inline", marginRight: 4 }} />
              Preview
            </Btn>
          </div>
        </>
      }
    />
  );
}

// ── Variant 4 — HITL approve/reject gate ──────────────────────────────────────

function HitlState() {
  const [responded, setResponded] = useState<"approved" | "rejected" | null>(null);
  return (
    <SplitShell
      chat={
        <>
          <Bubble role="user">Replace the chart with a full table of raw transactions.</Bubble>
          {!responded && (
            <div
              className="flex flex-col"
              style={{
                gap: 10,
                padding: "12px 14px",
                borderRadius: 12,
                background: "var(--warning-soft)",
                border: `1px solid ${tok.warning}`,
              }}
            >
              <div className="flex items-center" style={{ gap: 8 }}>
                <StatusDot state="waiting" />
                <span style={{ fontSize: 13, fontWeight: 500, color: tok.warning }}>
                  Confirm before applying
                </span>
              </div>
              <p style={{ fontSize: 12.5, lineHeight: "18px", margin: 0, color: tok.textSecondary }}>
                Agent will <strong>remove the sparkline chart</strong> and replace it with a raw
                transactions table. This rewrites a significant portion of the artifact.
              </p>
              <div className="flex" style={{ gap: 8 }}>
                <Btn variant="primary" onClick={() => setResponded("approved")}>
                  Approve
                </Btn>
                <Btn variant="ghost" onClick={() => setResponded("rejected")}>
                  Reject
                </Btn>
              </div>
            </div>
          )}
          {responded === "approved" && (
            <div style={{ fontSize: 13, color: tok.success }}>Approved — applying changes…</div>
          )}
          {responded === "rejected" && (
            <div style={{ fontSize: 13, color: tok.textDisabled }}>
              Rejected — artifact unchanged.
            </div>
          )}
          <div style={{ flex: 1 }} />
          <Composer placeholder={responded ? "Ask a follow-up…" : "Awaiting your decision…"} />
        </>
      }
      workspace={
        <>
          <WorkspaceToolbar
            fileName="dashboard.tsx"
            version="v2"
            state={responded === "approved" ? "syncing" : "done"}
          />
          <div
            className="flex flex-col items-center"
            style={{ flex: 1, justifyContent: "center", gap: 12, padding: 24 }}
          >
            {responded ? (
              <span style={{ fontSize: 13, color: tok.textSecondary }}>
                {responded === "approved"
                  ? "Rewriting artifact…"
                  : "No changes made — artifact preserved."}
              </span>
            ) : (
              <>
                <StatusDot state="waiting" label="Artifact locked — awaiting approval" />
                <span style={{ fontSize: 12, color: tok.textDisabled, textAlign: "center" }}>
                  No changes will be written until you approve or reject the proposed edit.
                </span>
              </>
            )}
          </div>
        </>
      }
    />
  );
}

// ── Variant 5 — Error / interrupted ───────────────────────────────────────────

function ErrorState() {
  return (
    <SplitShell
      chat={
        <>
          <Bubble role="user">Add a real-time WebSocket feed to the dashboard.</Bubble>
          <div
            className="flex items-center"
            style={{
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--error-soft)",
              border: `1px solid ${tok.error}33`,
            }}
          >
            <span style={{ fontSize: 13, color: tok.error, flex: 1 }}>
              Generation interrupted mid-build. Partial artifact preserved.
            </span>
            <Btn variant="ghost" onClick={() => {}}>
              Retry
            </Btn>
          </div>
          <div style={{ flex: 1 }} />
          <Composer placeholder="Continue or ask a follow-up…" />
        </>
      }
      workspace={
        <>
          <WorkspaceToolbar fileName="dashboard.tsx" version="v3 (partial)" state="error" />
          <div className="flex flex-col" style={{ flex: 1, padding: 16, gap: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Revenue", value: "$84,320", bg: "var(--indigo-soft)" },
                { label: "Active Users", value: "12,841", bg: "var(--success-soft)" },
                { label: "Churn Rate", value: "2.4%", bg: "var(--warning-soft)" },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    border: `1px solid ${tok.border}`,
                    background: card.bg,
                    padding: "10px 12px",
                    opacity: 0.7,
                  }}
                >
                  <div style={{ fontSize: 11, color: tok.textSecondary, marginBottom: 4 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: tok.textPrimary }}>
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
            {/* Incomplete section indicator */}
            <div
              style={{
                borderRadius: 8,
                border: `1px dashed ${tok.error}66`,
                background: "var(--error-soft)",
                padding: "10px 12px",
                fontSize: 12,
                color: tok.error,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ChevronDown size={14} />
              WebSocket section incomplete — retry to continue from here
            </div>
          </div>
        </>
      }
    />
  );
}

// ── Wiring snippet ─────────────────────────────────────────────────────────────

const wiring = `import { CopilotSidebar } from "@copilotkit/react-ui";
import {
  useAgent,
  useFrontendTool,
  useRenderTool,
  useHumanInTheLoop,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

// v1 equivalents: useCoAgent, useCopilotAction, useCopilotChatSuggestions

interface DashboardState {
  components: string[];
  version: number;
}

function DashboardWorkspace() {
  // Bidirectional shared state — STATE_SNAPSHOT + STATE_DELTA keep the
  // workspace pane in sync with every agent turn
  const { agent } = useAgent<DashboardState>({ agentId: "dashboard-agent" });

  // Agent calls this tool to mutate the right-pane artifact
  useFrontendTool({
    name: "updateDocument",
    description: "Rewrite the dashboard artifact with new or revised components",
    parameters: z.object({
      components: z.array(z.string()),
      changeSummary: z.string(),
    }),
    handler: async ({ components }) => {
      agent.setState((prev) => ({
        ...prev,
        components,
        version: prev.version + 1,
      }));
    },
    render: ({ status, args }) => (
      <div className="tool-badge">
        {status === "complete"
          ? \`Applied: \${args.changeSummary}\`
          : "Rewriting dashboard…"}
      </div>
    ),
  });

  // Gate large structural rewrites with an approve/reject step
  useHumanInTheLoop({
    name: "confirmMajorRewrite",
    parameters: z.object({ preview: z.string(), reason: z.string() }),
    render: ({ status, args, respond }) =>
      status === "executing" ? (
        <div className="hitl-card">
          <p>{args.reason}</p>
          <button onClick={() => respond?.("approved")}>Approve</button>
          <button onClick={() => respond?.("rejected")}>Reject</button>
        </div>
      ) : (
        <div className="hitl-card hitl-card--settled">Decision recorded</div>
      ),
  });

  // Render backend tool calls with live status in the chat thread
  useRenderTool({
    name: "fetchData",
    parameters: z.object({ source: z.string() }),
    render: ({ status, args, result }) => (
      <div className="tool-card">
        {status === "complete"
          ? \`Loaded \${result} rows from "\${args.source}"\`
          : \`Fetching "\${args.source}"…\`}
      </div>
    ),
  });

  // Seed the empty/idle state with context-aware starter prompts
  useConfigureSuggestions({
    instructions: "Suggest 3 short dashboard-building actions.",
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left — chat pane; CopilotSidebar supports the receding-chat pattern */}
      <CopilotSidebar
        defaultOpen={true}
        labels={{ title: "Dashboard Co-author" }}
      />

      {/* Right — artifact pane rendered as ordinary React, NOT inside the chat */}
      <main style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
        {agent.state?.components.map((c) => (
          <div key={c}>{c}</div>
        ))}
      </main>
    </div>
  );
}

// AG-UI events in play:
// RUN_STARTED        → disable composer, show planning state
// TEXT_MESSAGE_*     → stream chat tokens in left pane
// STATE_SNAPSHOT     → hydrate artifact on first load
// STATE_DELTA        → incremental workspace updates (JSON Patch, RFC 6902)
// TOOL_CALL_*        → updateDocument / confirmMajorRewrite / fetchData lifecycle
// RUN_FINISHED/ERROR → settle or show partial-artifact error state`;

// ── Story export ───────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      <Variant
        label="idle · empty"
        hint="workspace awaits first prompt; suggestion pills seed the empty state"
      >
        <EmptyState />
        <Note>
          Both panes load together — never show the workspace as a spinner. Suggestion pills from{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>useConfigureSuggestions</code> prime
          the first turn.
        </Note>
      </Variant>

      <Variant
        label="streaming · building"
        hint="STATE_DELTA fills the workspace incrementally; Stop is always reachable"
      >
        <StreamingState />
        <Note>
          The artifact renders progressively — skeletons hold space for components still arriving.
          Stop Generation must be keyboard-reachable without tabbing through partial tokens.
        </Note>
      </Variant>

      <Variant
        label="settled · direct-edit"
        hint="RUN_FINISHED; artifact complete; click to enter Design Mode without a chat turn"
      >
        <SettledState />
        <Note>
          Click a card to select it in Design Mode — direct manipulation writes back to artifact
          state, bypassing chat for pixel-level tweaks. Version selector (v2 of 2) is always
          visible.
        </Note>
      </Variant>

      <Variant
        label="awaiting approval (HITL)"
        hint="useHumanInTheLoop blocks the agent; artifact locked until user responds"
      >
        <HitlState />
        <Note>
          Consequential rewrites show an approve/reject card in the chat thread before touching the
          artifact. The workspace is frozen until the user decides.
        </Note>
      </Variant>

      <Variant
        label="error · partial artifact"
        hint="RUN_ERROR mid-stream; partial artifact preserved; retry-from-partial offered"
      >
        <ErrorState />
        <Note>
          On error the workspace keeps the partial artifact visible — never blank it. A Retry
          control in the chat thread lets the agent continue from where it stopped.
        </Note>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
