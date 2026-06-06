import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Pause, Play, RotateCcw, Square, X } from "lucide-react";
import {
  Avatar,
  Btn,
  CodeNote,
  Note,
  Showcase,
  StatusDot,
  Tag,
  ToolFrame,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "agent-activity-traceability",
  title: "Agent Status, Activity & Traceability",
  category: "Agent transparency",
  blurb:
    "The activity timeline + provenance layer — what the agent did, why, with citations, an audit trail, and undo.",
  copilotkit: "useAgent · MESSAGES_SNAPSHOT",
  spec: "components/agent-activity-traceability.md",
};

// ─── shared sub-components ──────────────────────────────────────────────────

function StepRow({
  icon,
  label,
  duration,
  active,
  done,
}: {
  icon: "done" | "active" | "pending";
  label: string;
  duration?: string;
  active?: boolean;
  done?: boolean;
}) {
  const iconEl =
    icon === "done" ? (
      <Check size={13} color={tok.success} />
    ) : icon === "active" ? (
      <ChevronRight size={13} color={tok.indigo} />
    ) : (
      <span style={{ width: 13, height: 13, borderRadius: 9999, border: `1px solid ${tok.textDisabled}`, display: "inline-block" }} />
    );

  return (
    <div
      className="flex items-center"
      style={{
        gap: 10,
        padding: "6px 0",
        opacity: done ? 0.5 : 1,
      }}
    >
      <span style={{ width: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {iconEl}
      </span>
      <span
        style={{
          fontSize: 13,
          color: active ? tok.textPrimary : tok.textSecondary,
          fontWeight: active ? 500 : 400,
          flex: 1,
        }}
      >
        {label}
      </span>
      {duration && (
        <span style={{ fontSize: 11, fontFamily: tok.mono, color: tok.textDisabled }}>{duration}</span>
      )}
    </div>
  );
}

function TimelineEntry({
  ts,
  action,
  rationale,
  undoable,
  error,
}: {
  ts: string;
  action: string;
  rationale?: string;
  undoable?: boolean;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderLeft: `2px solid ${error ? tok.error : tok.grey300}`,
        paddingLeft: 12,
        paddingBottom: 12,
      }}
    >
      <div className="flex items-center" style={{ gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: tok.mono, color: tok.textDisabled, whiteSpace: "nowrap" }}>
          {ts}
        </span>
        <span
          style={{
            fontSize: 13,
            color: error ? tok.error : tok.textPrimary,
            lineHeight: "18px",
          }}
        >
          {action}
        </span>
        {undoable && (
          <button
            aria-label="Undo this action"
            style={{
              marginLeft: "auto",
              border: `1px solid ${tok.border}`,
              background: "transparent",
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 11,
              color: tok.textSecondary,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <RotateCcw size={10} /> Undo
          </button>
        )}
      </div>
      {rationale && (
        <div style={{ marginTop: 4 }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: tok.textDisabled,
            }}
          >
            {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            Rationale
          </button>
          {open && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                lineHeight: "18px",
                color: tok.textSecondary,
                background: tok.grey200,
                padding: "6px 10px",
                borderRadius: 6,
              }}
            >
              {rationale}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── wiring snippet ──────────────────────────────────────────────────────────

const wiring = `import { useAgent } from "@copilotkit/react-core/v2";

type RunState = {
  status: "idle" | "running" | "done" | "error";
  currentStep: string;
  log: Array<{ ts: string; action: string; rationale?: string }>;
};

function AgentActivityPanel() {
  const { agent } = useAgent<RunState>({ agentId: "research-agent" });
  const { status, currentStep, log } = agent.state ?? {
    status: "idle", currentStep: "", log: [],
  };

  return (
    <section aria-label="Agent activity">
      {/* Live status — polite region for screen readers */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {status === "running" && (
          <><span className="pulse" aria-hidden="true" />{currentStep || "Working…"}</>
        )}
        {status === "done" && "Complete"}
        {status === "error" && "Run failed"}
      </div>

      {/* Activity timeline */}
      <ol aria-label="Run log">
        {log.map((entry, i) => (
          <li key={i}>
            <time dateTime={entry.ts}>{entry.ts}</time>
            <span>{entry.action}</span>
            {entry.rationale && (
              <details><summary>Rationale</summary><p>{entry.rationale}</p></details>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

// v1 equivalent: replace useAgent with
// const { state, setState } = useCoAgent({ name: "research-agent", initialState });`;

// ─── story ───────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>

      {/* 1 — Run in progress ------------------------------------------------- */}
      <Variant label="run in progress" hint="live status text + plan tracker + run controls">
        <div className="flex flex-col" style={{ gap: 12 }}>
          {/* Run header */}
          <div
            className="flex items-center"
            style={{
              gap: 10,
              padding: "10px 14px",
              background: tok.grey200,
              borderRadius: 8,
            }}
          >
            <Avatar role="agent" size={24} />
            <div className="flex flex-col" style={{ gap: 2, flex: 1 }}>
              <div className="flex items-center" style={{ gap: 8 }}>
                <StatusDot state="running" />
                <span style={{ fontSize: 13, fontWeight: 500, color: tok.textPrimary }}>
                  Editing <code style={{ fontFamily: tok.mono, fontSize: 12 }}>app.tsx</code> line 42…
                </span>
              </div>
              <span style={{ fontSize: 11, fontFamily: tok.mono, color: tok.textDisabled }}>
                run · 00:47 elapsed
              </span>
            </div>
            <Btn variant="ghost"><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Pause size={13} /> Pause</span></Btn>
            <Btn variant="danger"><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Square size={13} /> Stop</span></Btn>
          </div>

          {/* Plan tracker */}
          <div style={{ padding: "0 4px" }}>
            <StepRow icon="done" label="Gather requirements" duration="00:03" done />
            <StepRow icon="done" label="Read current file" duration="00:12" done />
            <StepRow icon="active" label="Edit app.tsx" duration="running…" active />
            <StepRow icon="pending" label="Run tests" />
            <StepRow icon="pending" label="Commit changes" />
          </div>
        </div>
      </Variant>

      {/* 2 — Activity timeline (streaming) ----------------------------------- */}
      <Variant label="activity timeline" hint="timestamped entries with rationale + undo affordances">
        <div className="flex flex-col" style={{ gap: 0 }}>
          <TimelineEntry
            ts="14:32:01"
            action="tool_call · search_files({ pattern: 'useEffect' })"
            rationale="Needed to locate all components referencing the deprecated hook before editing, to ensure consistency across the codebase."
          />
          <TimelineEntry
            ts="14:32:04"
            action="edit · app.tsx lines 10–22"
            rationale="Replaced deprecated useEffect pattern with the v2 lifecycle hook as recommended in the migration guide."
            undoable
          />
          <TimelineEntry
            ts="14:32:09"
            action="tool_call · run_tests({ scope: 'unit' })"
            rationale="Verifying that the edit doesn't break existing unit tests before proceeding to the next step."
          />
          <div style={{ borderLeft: `2px solid ${tok.grey300}`, paddingLeft: 12 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <span style={{ fontSize: 11, fontFamily: tok.mono, color: tok.textDisabled }}>14:32:14</span>
              <span style={{ fontSize: 13, color: tok.textSecondary }}>
                Running tests<span style={{ animation: "none", opacity: 0.5 }}> …</span>
              </span>
              <span
                className="ck-pulse"
                style={{ width: 7, height: 7, borderRadius: 9999, background: tok.indigo, marginLeft: 2 }}
              />
            </div>
          </div>
        </div>
      </Variant>

      {/* 3 — Awaiting approval (HITL) ---------------------------------------- */}
      <Variant label="awaiting approval" hint="agent paused — blocking HITL interrupt inline">
        <div className="flex flex-col" style={{ gap: 10 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <StatusDot state="waiting" label="Waiting for approval" />
            <span style={{ marginLeft: "auto" }}>
              <Tag>HITL</Tag>
            </span>
          </div>
          <div
            style={{
              borderTop: `1px solid ${tok.warning}`,
              borderRight: `1px solid ${tok.warning}`,
              borderBottom: `1px solid ${tok.warning}`,
              borderLeft: `3px solid ${tok.warning}`,
              borderRadius: 8,
              padding: "12px 14px",
              background: "var(--warning-soft)",
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 500, color: tok.textPrimary }}>
              Approve file deletion?
            </p>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: tok.textSecondary, lineHeight: "18px" }}>
              The agent wants to delete <code style={{ fontFamily: tok.mono }}>legacy-utils.ts</code> (47 lines).
              This action cannot be automatically reversed.
            </p>
            <div className="flex" style={{ gap: 8 }}>
              <Btn variant="primary">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Check size={13} /> Approve</span>
              </Btn>
              <Btn variant="ghost">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><X size={13} /> Reject</span>
              </Btn>
            </div>
          </div>
        </div>
      </Variant>

      {/* 4 — Run complete ---------------------------------------------------- */}
      <Variant label="run complete" hint="all steps done, duration badge, replay affordance">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div
            className="flex items-center"
            style={{
              gap: 10,
              padding: "10px 14px",
              background: "var(--success-soft)",
              border: `1px solid ${tok.success}`,
              borderRadius: 8,
            }}
          >
            <Avatar role="agent" size={24} />
            <div className="flex flex-col" style={{ gap: 2, flex: 1 }}>
              <div className="flex items-center" style={{ gap: 8 }}>
                <StatusDot state="done" />
                <span style={{ fontSize: 13, fontWeight: 500, color: tok.success }}>Run complete</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: tok.mono, color: tok.textDisabled }}>
                5 steps · 01:12 total
              </span>
            </div>
            <button
              aria-label="Replay this run"
              style={{
                border: `1px solid ${tok.border}`,
                background: "transparent",
                borderRadius: 8,
                padding: "5px 12px",
                fontSize: 12,
                color: tok.textSecondary,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Play size={12} /> Replay
            </button>
          </div>
          <div style={{ padding: "0 4px" }}>
            <StepRow icon="done" label="Gather requirements" duration="00:03" done />
            <StepRow icon="done" label="Read current file" duration="00:12" done />
            <StepRow icon="done" label="Edit app.tsx" duration="00:31" done />
            <StepRow icon="done" label="Run tests" duration="00:18" done />
            <StepRow icon="done" label="Commit changes" duration="00:08" done />
          </div>
        </div>
      </Variant>

      {/* 5 — Run error ------------------------------------------------------- */}
      <Variant label="run error" hint="failed step highlighted, retry affordance surfaced">
        <div className="flex flex-col" style={{ gap: 10 }}>
          <div
            className="flex items-center"
            style={{
              gap: 10,
              padding: "10px 14px",
              background: "var(--error-soft)",
              border: `1px solid ${tok.error}`,
              borderRadius: 8,
            }}
          >
            <Avatar role="agent" size={24} />
            <div className="flex flex-col" style={{ gap: 2, flex: 1 }}>
              <div className="flex items-center" style={{ gap: 8 }}>
                <StatusDot state="error" />
                <span style={{ fontSize: 13, fontWeight: 500, color: tok.error }}>Run failed</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: tok.mono, color: tok.textDisabled }}>
                Failed at step 4 of 5 · 00:49 elapsed
              </span>
            </div>
            <Btn variant="ghost">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><RotateCcw size={13} /> Retry</span>
            </Btn>
          </div>
          <ToolFrame name="run_tests" status="error" args={'scope: "unit"'}>
            <span style={{ color: tok.error }}>
              Test suite exited with code 1 — 2 failing assertions in <code style={{ fontFamily: tok.mono }}>app.test.tsx</code>.
            </span>
          </ToolFrame>
        </div>
      </Variant>

      <Note>
        Model all activity as runs and steps; emit <code style={{ fontFamily: tok.mono, fontSize: 12 }}>RUN_STARTED</code> /{" "}
        <code style={{ fontFamily: tok.mono, fontSize: 12 }}>RUN_FINISHED</code> and{" "}
        <code style={{ fontFamily: tok.mono, fontSize: 12 }}>StepStarted</code> /{" "}
        <code style={{ fontFamily: tok.mono, fontSize: 12 }}>StepFinished</code> events. Store rationale in shared state
        and render it collapsible in the timeline — it's the accountability layer that makes autonomous edits trustworthy.
      </Note>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
