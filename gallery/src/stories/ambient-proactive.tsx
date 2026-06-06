import { useState } from "react";
import { Bell, Check, ChevronRight, Play, Sparkles, X } from "lucide-react";
import {
  Avatar,
  Btn,
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
  slug: "ambient-proactive",
  title: "Ambient / Proactive AI",
  category: "Layouts",
  blurb: "Background/async agents and proactive nudges that surface without being summoned.",
  copilotkit: "useConfigureSuggestions · useAgent",
  spec: "layouts/ambient-proactive.md",
};

// ── Shared app chrome ─────────────────────────────────────────────────────────

function AppShell({
  navExtra,
  children,
}: {
  navExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: `1px solid ${tok.grey300}`,
        borderRadius: 10,
        overflow: "hidden",
        background: tok.grey200,
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top nav bar */}
      <div
        className="flex items-center"
        style={{
          padding: "9px 14px",
          borderBottom: `1px solid ${tok.grey300}`,
          background: tok.container,
          gap: 10,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: tok.textPrimary }}>MyApp</span>
        <span style={{ flex: 1 }} />
        {navExtra}
        <Bell size={16} color={tok.textDisabled} />
        <Avatar role="user" size={24} />
      </div>
      {/* Body */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

/** Thin filler content rows to simulate a real work surface. */
function ContentRows({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} h={11} w={`${65 + (i % 3) * 12}%`} />
      ))}
    </div>
  );
}

// ── Variant 1: Idle / listening ───────────────────────────────────────────────
function IdleShell() {
  return (
    <AppShell
      navExtra={
        <span className="inline-flex items-center" style={{ gap: 5 }}>
          <StatusDot state="idle" />
          <span style={{ fontSize: 11, color: tok.textDisabled }}>Agent listening</span>
        </span>
      }
    >
      <ContentRows count={5} />
      <Note>
        A quiet status dot in the nav confirms the agent is armed. No nudge, no badge — zero cost to
        attention.
      </Note>
    </AppShell>
  );
}

// ── Variant 2: Proactive nudge / suggestion chip ──────────────────────────────
function NudgeShell() {
  const [dismissed, setDismissed] = useState(false);
  const [accepted, setAccepted] = useState(false);

  return (
    <AppShell
      navExtra={
        <span className="inline-flex items-center" style={{ gap: 5 }}>
          <StatusDot state="idle" />
          <span style={{ fontSize: 11, color: tok.textDisabled }}>Agent listening</span>
        </span>
      }
    >
      <ContentRows count={3} />

      {/* Non-blocking nudge chip — appears without being summoned */}
      {!dismissed && !accepted && (
        <div
          className="flex items-center"
          style={{
            gap: 10,
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${tok.indigo}44`,
            background: "var(--indigo-soft)",
          }}
          role="region"
          aria-live="polite"
          aria-label="Agent suggestion"
        >
          <Sparkles size={14} color={tok.indigo} />
          <span style={{ fontSize: 13, color: tok.textPrimary, flex: 1 }}>
            This thread has 3 unanswered questions. Would you like to draft replies?
          </span>
          <Btn variant="primary" onClick={() => setAccepted(true)}>
            Reply
          </Btn>
          <button
            aria-label="Dismiss suggestion"
            onClick={() => setDismissed(true)}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: tok.textDisabled, display: "flex" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {accepted && (
        <div
          className="flex items-center"
          style={{ gap: 8, padding: "10px 14px", borderRadius: 10, background: tok.grey200 }}
          aria-live="polite"
        >
          <Check size={13} color={tok.success} />
          <span style={{ fontSize: 13, color: tok.textSecondary }}>Drafting replies… opening inbox</span>
          <StatusDot state="running" />
        </div>
      )}

      {dismissed && (
        <div style={{ fontSize: 12, color: tok.textDisabled, paddingLeft: 2 }} aria-live="polite">
          Suggestion dismissed — negative signal recorded, budget decremented.
        </div>
      )}

      <ContentRows count={2} />
    </AppShell>
  );
}

// ── Variant 3: Agent Inbox — working / queued items ───────────────────────────
type InboxStatus = "running" | "needs-review" | "done" | "error";

function InboxItem({
  icon,
  title,
  status,
  label,
  onOpen,
}: {
  icon: React.ReactNode;
  title: string;
  status: InboxStatus;
  label: string;
  onOpen?: () => void;
}) {
  const dotState: Record<InboxStatus, "running" | "waiting" | "done" | "error"> = {
    running: "running",
    "needs-review": "waiting",
    done: "done",
    error: "error",
  };
  return (
    <div
      className="flex items-center"
      style={{
        gap: 10,
        padding: "9px 12px",
        borderRadius: 8,
        background: tok.container,
        border: `1px solid ${status === "needs-review" ? tok.warning : tok.grey300}`,
      }}
      role="listitem"
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 13, color: tok.textPrimary, flex: 1 }}>{title}</span>
      <StatusDot state={dotState[status]} label={label} />
      {onOpen && (
        <button
          onClick={onOpen}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: tok.indigo,
            border: `1px solid ${tok.indigo}44`,
            background: "var(--indigo-soft)",
            borderRadius: 6,
            padding: "3px 8px",
            cursor: "pointer",
          }}
        >
          Open <ChevronRight size={11} />
        </button>
      )}
    </div>
  );
}

function InboxShell() {
  const [expanded, setExpanded] = useState(false);

  return (
    <AppShell
      navExtra={
        <span
          className="inline-flex items-center"
          style={{
            gap: 5,
            background: `${tok.warning}22`,
            border: `1px solid ${tok.warning}55`,
            borderRadius: 9999,
            padding: "2px 8px",
          }}
        >
          <StatusDot state="waiting" />
          <span style={{ fontSize: 11, color: tok.warning, fontWeight: 500 }}>2 need review</span>
        </span>
      }
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: tok.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Agent Inbox
      </div>
      <div className="flex flex-col" style={{ gap: 6 }} role="list" aria-label="Agent tasks">
        <InboxItem icon="⚙" title="Fix: flaky auth test" status="running" label="Running" />
        <InboxItem
          icon="⚠"
          title="Draft PR: add CSV export"
          status="needs-review"
          label="Needs review"
          onOpen={() => setExpanded(!expanded)}
        />
        <InboxItem icon="✓" title="Triage: 14 issues labelled" status="done" label="Done" />
      </div>

      {/* Pull-open activity log */}
      {expanded && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            background: tok.grey200,
            border: `1px solid ${tok.border}`,
            fontFamily: tok.mono,
            fontSize: 12,
            lineHeight: "20px",
            color: tok.textSecondary,
          }}
          aria-label="Activity log"
        >
          <div style={{ color: tok.textDisabled, marginBottom: 6 }}>▸ Activity log</div>
          <div>Triggered by: issue #492 assigned</div>
          <div>Cloned repo → ran tests → opened PR #89</div>
          <ToolFrame name="open_pull_request" status="complete" args={'branch: "feat/csv-export"'} />
          <div className="flex" style={{ gap: 8, marginTop: 10 }}>
            <Btn variant="primary">Approve</Btn>
            <Btn variant="ghost">Request changes</Btn>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// ── Variant 4: Needs-attention — HITL review gate ────────────────────────────
function HitlShell() {
  const [responded, setResponded] = useState<"approved" | "rejected" | null>(null);

  return (
    <AppShell
      navExtra={
        <span className="inline-flex items-center" style={{ gap: 5, padding: "2px 8px", borderRadius: 9999, background: `${tok.warning}22`, border: `1px solid ${tok.warning}55` }}>
          <StatusDot state="waiting" />
          <span style={{ fontSize: 11, color: tok.warning, fontWeight: 500 }}>Action required</span>
        </span>
      }
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: tok.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Agent Inbox — PR #89
      </div>

      {!responded ? (
        <div
          className="flex flex-col"
          style={{ gap: 10, padding: "14px 16px", borderRadius: 10, background: "var(--warning-soft)", border: `1px solid ${tok.warning}` }}
          role="alertdialog"
          aria-modal="true"
          aria-label="Agent review request"
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            <StatusDot state="waiting" />
            <span style={{ fontSize: 13, fontWeight: 600, color: tok.warning }}>Review required before merge</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: tok.textSecondary }}>
            Agent opened <strong>PR #89 — Add CSV export</strong>. Adds 3 files, 120 lines. Tests pass.
            Approve to trigger CI/CD or request changes to steer.
          </p>
          <ToolFrame name="open_pull_request" status="complete" args={'files: 3, lines_added: 120'} />
          <div className="flex" style={{ gap: 8 }}>
            <Btn variant="primary" onClick={() => setResponded("approved")}>Approve</Btn>
            <Btn variant="ghost" onClick={() => setResponded("rejected")}>Request changes</Btn>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center"
          style={{ gap: 8, padding: "12px 14px", borderRadius: 10, background: tok.grey200 }}
          aria-live="polite"
        >
          {responded === "approved"
            ? <><Check size={14} color={tok.success} /><span style={{ fontSize: 13, color: tok.success }}>Approved — CI/CD pipeline triggered.</span></>
            : <><X size={14} color={tok.textDisabled} /><span style={{ fontSize: 13, color: tok.textDisabled }}>Changes requested — agent awaiting steering.</span></>
          }
        </div>
      )}
    </AppShell>
  );
}

// ── Variant 5: Delivered — toast notification ────────────────────────────────
function DeliveredShell() {
  const [toastVisible, setToastVisible] = useState(true);

  return (
    <AppShell
      navExtra={
        <span className="inline-flex items-center" style={{ gap: 5 }}>
          <StatusDot state="done" />
          <span style={{ fontSize: 11, color: tok.textDisabled }}>All tasks done</span>
        </span>
      }
    >
      {/* Toast notification layer */}
      {toastVisible && (
        <div
          className="flex items-center"
          style={{
            gap: 10,
            padding: "10px 14px",
            borderRadius: 10,
            background: tok.container,
            border: `1px solid ${tok.grey300}`,
            boxShadow: "0 2px 10px rgba(0,0,0,0.09)",
          }}
          role="region"
          aria-live="polite"
          aria-label="Agent notification"
        >
          <Check size={14} color={tok.success} />
          <span style={{ fontSize: 13, color: tok.textPrimary, flex: 1 }}>
            <strong>PR #89 ready for review.</strong> CSV export shipped to staging.
          </span>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: tok.indigo,
              border: `1px solid ${tok.indigo}44`,
              background: "var(--indigo-soft)",
              borderRadius: 6,
              padding: "3px 8px",
              cursor: "pointer",
            }}
          >
            <Play size={11} /> Go
          </button>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToastVisible(false)}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: tok.textDisabled, display: "flex" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <ContentRows count={3} />
      <Tag>Result lands where user already works — inbox, PR, Slack</Tag>
    </AppShell>
  );
}

// ── Wiring snippet ────────────────────────────────────────────────────────────

const wiring = `import { useAgent } from "@copilotkit/react-core/v2";
import { useConfigureSuggestions, useSuggestions } from "@copilotkit/react-core/v2";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { useInterrupt } from "@copilotkit/react-core";
import { z } from "zod";

// v1 equivalents: useCopilotChatSuggestions, useLangGraphInterrupt, useCoAgent

function AgentInboxShell({ agentId }: { agentId: string }) {
  // Subscribe to the agent's lifecycle without a chat window
  const { agent } = useAgent({ agentId });
  // agent.state reflects STATE_SNAPSHOT/DELTA events
  // RUN_STARTED → mark item running; RUN_FINISHED/RUN_ERROR → delivered or failed

  // In-context proactive chips — regenerate when app state changes
  useConfigureSuggestions({
    instructions: "Suggest 2-3 next actions based on the current inbox item.",
    minSuggestions: 1,
    maxSuggestions: 3,
  });
  const { suggestions } = useSuggestions();

  // Agent-chosen HITL gate (notify / question / review)
  useHumanInTheLoop({
    name: "request_review",
    description: "Pause for human approval before applying a change",
    parameters: z.object({
      summary: z.string(),
      diff: z.string().optional(),
    }),
    render: ({ status, args, respond }) =>
      status === "executing" ? (
        <div role="alertdialog" aria-modal="true" aria-label="Agent review request">
          <p>{args.summary}</p>
          {args.diff && <pre>{args.diff}</pre>}
          <button onClick={() => respond?.("approved")}>Approve</button>
          <button onClick={() => respond?.("rejected")}>Request changes</button>
        </div>
      ) : (
        <div aria-live="polite">
          {status === "complete" ? "Review submitted." : "Awaiting review…"}
        </div>
      ),
  });

  // Graph-enforced checkpoint (LangGraph interrupt() primitive)
  useInterrupt({
    enabled: ({ eventValue }) => eventValue?.type === "approval_required",
    render: ({ event, resolve }) => (
      <div role="alertdialog" aria-label="Agent checkpoint">
        <p>{event.value.message}</p>
        <button onClick={() => resolve("approved")}>Approve</button>
        <button onClick={() => resolve("rejected")}>Reject</button>
      </div>
    ),
  });

  return (
    <div>
      {/* Inline suggestion chips for proactive nudges */}
      <div role="list" aria-label="Suggested actions">
        {suggestions.map((s) => (
          <button key={s.title} role="listitem" onClick={s.onClick}>{s.title}</button>
        ))}
      </div>
      {/* Custom inbox list + toast layer — drive from agent.state and AG-UI events */}
      {/* AG-UI: RUN_STARTED / RUN_FINISHED / RUN_ERROR → item status */}
      {/* TOOL_CALL_START/ARGS/END + TOOL_CALL_RESULT → per-step activity log */}
    </div>
  );
}`;

// ── Story ─────────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      <Variant label="idle · listening" hint="agent armed; quiet status dot only — zero interruption cost">
        <IdleShell />
      </Variant>

      <Variant
        label="suggested · nudge"
        hint="useConfigureSuggestions fires a proactive chip; one-tap accept or dismiss-by-X"
      >
        <NudgeShell />
      </Variant>

      <Variant
        label="agent inbox · working"
        hint="RUN_STARTED items + pull-open activity log; needs-review badge promoted in nav"
      >
        <InboxShell />
        <Note>
          The inbox is a custom list driven by AG-UI events (RUN_STARTED / RUN_FINISHED / RUN_ERROR).
          CopilotKit ships no turnkey inbox component — the queue, status, and toast layer are yours to
          build.
        </Note>
      </Variant>

      <Variant
        label="needs-attention · HITL gate"
        hint="useHumanInTheLoop pauses the agent; alertdialog with trapped focus"
      >
        <HitlShell />
      </Variant>

      <Variant
        label="delivered · toast"
        hint="RUN_FINISHED → ephemeral toast links user to the artifact; dismissible by keyboard"
      >
        <DeliveredShell />
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
