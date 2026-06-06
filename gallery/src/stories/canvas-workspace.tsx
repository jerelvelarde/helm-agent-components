import { useState } from "react";
import { FileText, GitBranch, Play, RotateCcw, Sparkles } from "lucide-react";
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
  slug: "canvas-workspace",
  title: "Canvas / Workspace & Artifacts",
  category: "Layouts",
  blurb: "The agent-driven canvas/workspace + artifacts — content the agent builds beside the chat.",
  copilotkit: "useAgent · STATE_DELTA",
  spec: "layouts/canvas-workspace.md",
};

/** Thin resizable divider between chat and artifact pane. */
function Divider() {
  return (
    <div
      style={{
        width: 1,
        background: tok.border,
        alignSelf: "stretch",
        flexShrink: 0,
      }}
    />
  );
}

/** Reusable chrome shell for the split-pane layout. */
function SplitShell({
  chat,
  artifact,
}: {
  chat: React.ReactNode;
  artifact: React.ReactNode;
}) {
  return (
    <div
      className="flex"
      style={{
        height: 340,
        borderRadius: 10,
        border: `1px solid ${tok.grey300}`,
        overflow: "hidden",
        background: tok.surfaceMain,
      }}
    >
      {/* Control channel */}
      <div
        className="flex flex-col"
        style={{ width: "38%", background: "var(--surface-container)", padding: 14, gap: 10, overflow: "hidden" }}
      >
        {chat}
      </div>

      <Divider />

      {/* Artifact pane */}
      <div className="flex flex-col" style={{ flex: 1, background: tok.grey200, position: "relative" }}>
        {artifact}
      </div>
    </div>
  );
}

/** Toolbar strip at the top of the artifact pane. */
function ArtifactToolbar({
  title,
  version,
  state,
}: {
  title: string;
  version?: string;
  state?: "syncing" | "done" | "error";
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
      <FileText size={14} color={tok.textSecondary} />
      <span style={{ fontSize: 13, fontWeight: 500, color: tok.textPrimary, flex: 1 }}>{title}</span>
      {version && (
        <Tag mono>
          <GitBranch size={10} style={{ display: "inline", marginRight: 3 }} />
          {version}
        </Tag>
      )}
      {state === "syncing" && <StatusDot state="running" label="syncing" />}
      {state === "done" && <StatusDot state="done" label="saved" />}
      {state === "error" && <StatusDot state="error" label="error" />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Variant 1 — Empty / welcome state
// ---------------------------------------------------------------------------
function EmptyPane() {
  return (
    <SplitShell
      chat={
        <>
          <Bubble role="user">Draft a product brief for our new analytics dashboard.</Bubble>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: tok.textDisabled, paddingLeft: 4 }}>
            Send a message to open the canvas…
          </div>
        </>
      }
      artifact={
        <div
          className="flex flex-col items-center"
          style={{ flex: 1, justifyContent: "center", gap: 12, padding: 24 }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: tok.grey300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={22} color={tok.textDisabled} />
          </div>
          <span style={{ fontSize: 13, color: tok.textSecondary, textAlign: "center" }}>
            No artifact yet. Ask the agent to create something substantial.
          </span>
          <Tag>Docs · Code · Diagrams · Apps</Tag>
        </div>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Variant 2 — Agent generating (streaming into pane)
// ---------------------------------------------------------------------------
function StreamingPane() {
  return (
    <SplitShell
      chat={
        <>
          <Bubble role="user">Draft a product brief for our new analytics dashboard.</Bubble>
          <div className="flex items-center" style={{ gap: 8, marginTop: 4 }}>
            <Avatar role="agent" size={22} />
            <span style={{ fontSize: 13, color: tok.textSecondary }}>Writing brief…</span>
            <StatusDot state="running" />
          </div>
          <ToolFrame name="write_document" status="executing" args={'artifact: "product-brief.md"'} />
        </>
      }
      artifact={
        <>
          <ArtifactToolbar title="product-brief.md" version="v1" state="syncing" />
          <div className="flex flex-col" style={{ flex: 1, padding: 16, gap: 8, overflow: "hidden" }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: tok.textPrimary }}>
              Analytics Dashboard — Product Brief
            </p>
            <p style={{ fontSize: 13, lineHeight: "20px", margin: 0, color: tok.textPrimary }}>
              <strong>Overview:</strong> A real-time analytics dashboard enabling data teams to monitor
              key business metrics, set threshold alerts, and share live snapshots with stakeholders.
            </p>
            <p style={{ fontSize: 13, lineHeight: "20px", margin: 0, color: tok.textPrimary }}>
              <strong>Problem:</strong> Current reporting requires manual exports and is always 24h
              stale. Teams spend{" "}
              <span style={{ borderRight: `2px solid ${tok.indigo}` }}>&nbsp;</span>
              <Caret />
            </p>
            <Skeleton h={12} w="90%" />
            <Skeleton h={12} w="70%" />
            <Skeleton h={12} w="82%" />
          </div>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Variant 3 — Editable (generation complete, user can edit)
// ---------------------------------------------------------------------------
function EditablePane() {
  const [edited, setEdited] = useState(false);
  return (
    <SplitShell
      chat={
        <>
          <Bubble role="user">Draft a product brief for our new analytics dashboard.</Bubble>
          <Bubble role="assistant">
            Done. Your brief is in the canvas — click any section to edit it directly.
          </Bubble>
        </>
      }
      artifact={
        <>
          <ArtifactToolbar title="product-brief.md" version="v2" state="done" />
          <div className="flex flex-col" style={{ flex: 1, padding: 16, gap: 8 }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: tok.textPrimary }}>
              Analytics Dashboard — Product Brief
            </p>
            <div
              onClick={() => setEdited(true)}
              style={{
                fontSize: 13,
                lineHeight: "20px",
                padding: "6px 8px",
                borderRadius: 6,
                border: `1px solid ${edited ? tok.indigo : "transparent"}`,
                cursor: "text",
                color: tok.textPrimary,
                background: edited ? "var(--indigo-soft)" : "transparent",
                transition: "border-color 0.15s",
              }}
            >
              <strong>Problem:</strong> Current reporting requires manual exports and is always 24h
              stale. Teams spend ~3 h/week assembling slide decks from raw CSVs.{" "}
              {edited && <span style={{ color: tok.indigo }}>[cursor]</span>}
            </div>
            <div style={{ fontSize: 12, color: tok.textDisabled, paddingLeft: 4 }}>
              {edited ? "Editing — changes sync to agent state on blur" : "Click a paragraph to edit inline"}
            </div>
          </div>
          <div
            className="flex items-center"
            style={{ gap: 8, padding: "9px 12px", borderTop: `1px solid ${tok.border}`, background: "var(--surface-container)" }}
          >
            <RotateCcw size={13} color={tok.textDisabled} />
            <span style={{ fontSize: 12, color: tok.textDisabled }}>v2 of 3</span>
            <div style={{ flex: 1 }} />
            <Btn variant="ghost">Show diff</Btn>
            <Btn variant="primary">
              <Play size={12} style={{ display: "inline", marginRight: 4 }} />
              Run
            </Btn>
          </div>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Variant 4 — Diff / compare view (version history)
// ---------------------------------------------------------------------------
function DiffPane() {
  return (
    <SplitShell
      chat={
        <>
          <Bubble role="user">Shorten the problem statement to two sentences.</Bubble>
          <Bubble role="assistant">
            Done — here's what changed. <strong>Accept</strong> to keep it or <strong>Revert</strong>{" "}
            to restore v2.
          </Bubble>
        </>
      }
      artifact={
        <>
          <ArtifactToolbar title="product-brief.md" version="v3 → v2 diff" />
          <div className="flex flex-col" style={{ flex: 1, padding: 16, gap: 6, fontFamily: tok.mono, fontSize: 12.5 }}>
            <div style={{ color: tok.textDisabled, marginBottom: 4 }}>
              @@ -4,6 +4,4 @@ Analytics Dashboard — Product Brief
            </div>
            {/* Deleted lines */}
            <div
              style={{
                background: "var(--error-soft)",
                color: tok.error,
                padding: "3px 8px",
                borderRadius: 4,
                lineHeight: "18px",
                textDecoration: "line-through",
              }}
            >
              − Current reporting requires manual exports and is always 24h stale. Teams spend ~3 h/week
              assembling slide decks from raw CSVs, a process prone to version conflicts and human error.
            </div>
            {/* Added lines */}
            <div
              style={{
                background: "var(--success-soft)",
                color: tok.success,
                padding: "3px 8px",
                borderRadius: 4,
                lineHeight: "18px",
              }}
            >
              + Manual exports make dashboards perpetually stale and waste ~3 h/week per analyst.
            </div>
          </div>
          <div
            className="flex items-center"
            style={{ gap: 8, padding: "9px 12px", borderTop: `1px solid ${tok.border}`, background: "var(--surface-container)" }}
          >
            <div style={{ flex: 1 }} />
            <Btn variant="ghost">
              <RotateCcw size={12} style={{ display: "inline", marginRight: 4 }} />
              Revert to v2
            </Btn>
            <Btn variant="primary">Accept changes</Btn>
          </div>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Variant 5 — HITL approval gate (consequential edit)
// ---------------------------------------------------------------------------
function HitlPane() {
  const [responded, setResponded] = useState<"approved" | "rejected" | null>(null);
  return (
    <SplitShell
      chat={
        <>
          <Bubble role="user">Restructure the brief into a formal spec with numbered sections.</Bubble>
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
                  Approval required
                </span>
              </div>
              <p style={{ fontSize: 12.5, lineHeight: "18px", margin: 0, color: tok.textSecondary }}>
                Agent wants to <strong>restructure the entire document</strong> into 6 numbered sections.
                This will reorganise all existing content.
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
            <div style={{ fontSize: 13, color: tok.success }}>
              Approved — agent is restructuring…
            </div>
          )}
          {responded === "rejected" && (
            <div style={{ fontSize: 13, color: tok.textDisabled }}>
              Rejected — document unchanged.
            </div>
          )}
        </>
      }
      artifact={
        <>
          <ArtifactToolbar
            title="product-brief.md"
            version="v3"
            state={responded === "approved" ? "syncing" : "done"}
          />
          <div
            className="flex flex-col items-center"
            style={{ flex: 1, justifyContent: "center", gap: 10, padding: 24 }}
          >
            {responded ? (
              <span style={{ fontSize: 13, color: tok.textSecondary }}>
                {responded === "approved" ? "Restructuring in progress…" : "Awaiting next instruction."}
              </span>
            ) : (
              <>
                <StatusDot state="waiting" label="Awaiting approval before applying changes" />
                <span style={{ fontSize: 12, color: tok.textDisabled }}>
                  Artifact locked until user responds.
                </span>
              </>
            )}
          </div>
        </>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Wiring snippet
// ---------------------------------------------------------------------------
const wiring = `import { useAgent } from "@copilotkit/react-core/v2";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { z } from "zod";

// Bidirectional shared state — agent writes via STATE_DELTA, UI reads in real time
const { agent } = useAgent({ agentId: "doc-agent" });
// v1 equivalent: const { state, setState } = useCoAgent({ name: "doc-agent", initialState });

// Gate irreversible rewrites behind explicit user approval
useHumanInTheLoop({
  name: "apply_structural_change",
  description: "Agent wants to restructure the document",
  parameters: z.object({
    sectionId: z.string(),
    summary: z.string(),
    newContent: z.string(),
  }),
  render: ({ status, args, respond }) =>
    status === "executing" ? (
      <ApprovalCard
        title={\`Restructure "\${args.sectionId}"?\`}
        description={args.summary}
        onApprove={() => respond?.("approved")}
        onReject={() => respond?.("rejected")}
      />
    ) : (
      <ApprovalCard title={\`Restructure "\${args.sectionId}"?\`} disabled />
    ),
});

export function DocumentWorkspace() {
  // agent.state re-renders on every STATE_SNAPSHOT / STATE_DELTA event
  const content = agent.state?.documentContent ?? "";

  return (
    <div className="canvas-workspace">
      {/* Chat control channel — TEXT_MESSAGE_*, TOOL_CALL_*, HITL */}
      <CopilotSidebar defaultOpen />

      {/* Artifact pane — user edits write back via agent.setState */}
      <DocumentEditor
        value={content}
        onChange={(next) => agent.setState({ ...agent.state, documentContent: next })}
      />
    </div>
  );
}`;

// ---------------------------------------------------------------------------
// Story export
// ---------------------------------------------------------------------------
export default function Story() {
  return (
    <Showcase>
      <Variant label="empty" hint="no artifact yet — chat is the focus, pane shows welcome state">
        <EmptyPane />
      </Variant>

      <Variant
        label="agent generating"
        hint="STATE_DELTA events filling the artifact pane; streaming cursor + skeletons"
      >
        <StreamingPane />
      </Variant>

      <Variant label="editable" hint="generation complete; user edits sync back to agent via useAgent">
        <EditablePane />
      </Variant>

      <Variant label="diff / compare" hint="version toolbar shows additions (green) and deletions (red)">
        <DiffPane />
      </Variant>

      <Variant
        label="awaiting approval (HITL)"
        hint="useHumanInTheLoop blocks the agent until user approves or rejects"
      >
        <HitlPane />
      </Variant>

      <Note>
        Shared state (STATE_SNAPSHOT / STATE_DELTA) is the single source of truth for both panes — never
        let chat and artifact diverge. Gate large structural rewrites with useHumanInTheLoop so users
        always have an undo path.
      </Note>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
