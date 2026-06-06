import { useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
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
  slug: "sub-agents",
  title: "Sub-Agents / Multi-Agent Orchestration",
  category: "Multi-agent & research",
  blurb: "Delegation and hand-off UI — agent network, per-agent status, agent-to-agent (A2A).",
  copilotkit: "useAgent · A2A",
  spec: "components/sub-agents.md",
};

// ── shared sub types ──────────────────────────────────────────────────────────
type AgentState = "running" | "done" | "waiting" | "error" | "idle";

interface SubAgent {
  id: string;
  role: string;
  status: AgentState;
  steps: number;
  stepLabels?: string[];
}

// ── OrchestratorHeader ────────────────────────────────────────────────────────
function OrchestratorHeader({
  phase,
  count,
}: {
  phase: string;
  count?: number;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        background: tok.grey200,
        border: `1px solid ${tok.grey300}`,
        marginBottom: 12,
      }}
    >
      <Avatar role="agent" size={24} />
      <div className="flex flex-col" style={{ gap: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: tok.textPrimary }}>
          LeadResearcher
        </span>
        <span style={{ fontSize: 11, color: tok.textSecondary }}>
          {phase}
          {count !== undefined ? ` · ${count} agents` : ""}
        </span>
      </div>
    </div>
  );
}

// ── AgentLane ─────────────────────────────────────────────────────────────────
function AgentLane({
  agent,
  expanded,
  onToggle,
}: {
  agent: SubAgent;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const stateLabel: Record<AgentState, string> = {
    running: "running",
    done: "done",
    waiting: "waiting",
    error: "error",
    idle: "idle",
  };

  return (
    <div
      style={{
        border: `1px solid ${tok.grey300}`,
        borderRadius: 8,
        overflow: "hidden",
        background: tok.container,
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: 8, padding: "9px 12px", cursor: onToggle ? "pointer" : "default" }}
        onClick={onToggle}
        role={onToggle ? "button" : undefined}
        aria-expanded={expanded}
        aria-label={`${agent.role} — ${stateLabel[agent.status]}, ${agent.steps} steps`}
      >
        <StatusDot state={agent.status} />
        <span style={{ fontSize: 13, fontWeight: 500, color: tok.textPrimary, flex: 1 }}>
          {agent.role}
        </span>
        <span style={{ fontFamily: tok.mono, fontSize: 11, color: tok.textDisabled }}>
          {agent.steps} steps
        </span>
        {onToggle ? (
          expanded ? (
            <ChevronDown size={14} color={tok.textDisabled} />
          ) : (
            <ChevronRight size={14} color={tok.textDisabled} />
          )
        ) : null}
      </div>

      {expanded && agent.stepLabels && (
        <div
          style={{
            borderTop: `1px solid ${tok.grey300}`,
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {agent.stepLabels.map((s, i) => (
            <div key={i} className="flex items-center" style={{ gap: 8 }}>
              <span
                style={{
                  fontFamily: tok.mono,
                  fontSize: 10,
                  color: tok.textDisabled,
                  minWidth: 16,
                  textAlign: "right",
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 12, color: tok.textSecondary }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SynthesisBar ──────────────────────────────────────────────────────────────
function SynthesisBar({ done, total }: { done: number; total: number }) {
  const pct = Math.round((done / total) * 100);
  return (
    <div style={{ marginTop: 12 }}>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: tok.textSecondary }}>
          Synthesizing — merging {done} of {total} results
        </span>
        <span style={{ marginLeft: "auto", fontFamily: tok.mono, fontSize: 11, color: tok.indigo }}>
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 9999,
          background: tok.grey300,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 9999,
            background: tok.indigo,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── HandoffChip ───────────────────────────────────────────────────────────────
function HandoffChip({
  from,
  to,
  time,
}: {
  from: string;
  to: string;
  time: string;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 8,
        padding: "6px 12px",
        borderRadius: 9999,
        background: tok.grey200,
        border: `1px solid ${tok.grey300}`,
        display: "inline-flex",
        alignSelf: "center",
        margin: "4px auto",
      }}
      role="status"
    >
      <span style={{ fontSize: 11, color: tok.textSecondary }}>
        Handed off:
      </span>
      <Tag>{from}</Tag>
      <ChevronRight size={12} color={tok.textDisabled} />
      <Tag selected>{to}</Tag>
      <span style={{ fontFamily: tok.mono, fontSize: 10, color: tok.textDisabled }}>{time}</span>
    </div>
  );
}

// ── wiring snippet ────────────────────────────────────────────────────────────
const wiring = `import { useAgent } from "@copilotkit/react-core/v2";
import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

// 1. Subscribe to orchestrator shared state (carries per-sub-agent progress).
//    The backend pushes updates via copilotkit_emit_state → AG-UI STATE_SNAPSHOT/DELTA.
const { agent } = useAgent({ agentId: "lead-researcher" });
const { subAgents } = agent.state as {
  subAgents: Array<{
    id: string;
    role: string;
    status: "running" | "done" | "waiting" | "error";
    steps: string[];
  }>;
};

// 2. Render the hand_off_to_agent tool call as a timestamped handoff chip.
useRenderTool({
  name: "hand_off_to_agent",
  parameters: z.object({ targetAgent: z.string(), reason: z.string() }),
  render: ({ status, args }) => (
    <HandoffChip
      target={args.targetAgent}
      reason={args.reason}
      pending={status === "inProgress" || status === "executing"}
    />
  ),
});

// 3. Render one lane per sub-agent from shared state.
return (
  <AgentFleetView>
    {subAgents.map((sa) => (
      <AgentLane key={sa.id} role={sa.role} status={sa.status} steps={sa.steps} />
    ))}
  </AgentFleetView>
);

// v1 equivalent: useCoAgent({ name: "lead-researcher", initialState: {} }) for state;
// useCopilotAction({ name: "hand_off_to_agent", render }) for the handoff chip.`;

// ── Story ─────────────────────────────────────────────────────────────────────
export default function Story() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const parallelAgents: SubAgent[] = [
    {
      id: "search",
      role: "Search agent",
      status: "running",
      steps: 12,
      stepLabels: [
        "web_search(\"AI regulation EU 2026\")",
        "web_search(\"enterprise AI governance frameworks\")",
        "parse_results()",
      ],
    },
    {
      id: "citation",
      role: "Citation agent",
      status: "done",
      steps: 5,
      stepLabels: [
        "extract_claims(doc_1)",
        "locate_sources()",
        "format_citations()",
      ],
    },
    {
      id: "analysis",
      role: "Analysis agent",
      status: "waiting",
      steps: 0,
    },
  ];

  const synthesizingAgents: SubAgent[] = [
    { id: "search", role: "Search agent", status: "done", steps: 14 },
    { id: "citation", role: "Citation agent", status: "done", steps: 5 },
    { id: "analysis", role: "Analysis agent", status: "running", steps: 3 },
  ];

  return (
    <Showcase>
      {/* ── 1. Spawning / fan-out ──────────────────────────────────────────── */}
      <Variant label="spawning" hint="optimistic skeletons while sub-agents initialize">
        <OrchestratorHeader phase="Planning complete — spawning 3 agents" count={3} />
        <div
          role="list"
          aria-label="Active agents"
          className="flex flex-col"
          style={{ gap: 8 }}
        >
          {["Search agent", "Citation agent", "Analysis agent"].map((name) => (
            <div
              key={name}
              role="listitem"
              style={{
                border: `1px solid ${tok.grey300}`,
                borderRadius: 8,
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Skeleton w={8} h={8} style={{ borderRadius: 9999, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: tok.textSecondary }}>{name}</span>
              <Skeleton w={80} h={10} style={{ marginLeft: "auto" }} />
            </div>
          ))}
        </div>
      </Variant>

      {/* ── 2. Running in parallel ─────────────────────────────────────────── */}
      <Variant
        label="running in parallel"
        hint="per-lane status — expand to inspect steps"
      >
        <OrchestratorHeader phase="Running" count={3} />
        <div role="list" aria-label="Active agents" className="flex flex-col" style={{ gap: 8 }}>
          {parallelAgents.map((a) => (
            <div role="listitem" key={a.id}>
              <AgentLane
                agent={a}
                expanded={expanded === a.id}
                onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
              />
            </div>
          ))}
        </div>
        <Note>Click a lane to expand its step list. Waiting lanes surface Human-in-the-Loop prompts if blocked on external input.</Note>
      </Variant>

      {/* ── 3. Handoff chip ────────────────────────────────────────────────── */}
      <Variant label="handoff" hint="timestamped chip when control transfers between agents">
        <div className="flex flex-col" style={{ gap: 10 }}>
          <ToolFrame name="hand_off_to_agent" status="complete" args='targetAgent: "Citation agent"  reason: "Search complete, hand off for citation extraction"'>
            <span style={{ fontSize: 13, color: tok.textSecondary }}>
              Control transferred — Citation agent now active.
            </span>
          </ToolFrame>
          <div className="flex" style={{ justifyContent: "center" }}>
            <HandoffChip from="Search agent" to="Citation agent" time="14:02:47" />
          </div>
        </div>
      </Variant>

      {/* ── 4. Synthesizing / fan-in ───────────────────────────────────────── */}
      <Variant label="synthesizing" hint="fan-in: synthesis bar + per-lane settled state">
        <OrchestratorHeader phase="Synthesizing" count={3} />
        <div role="list" aria-label="Active agents" className="flex flex-col" style={{ gap: 8 }}>
          {synthesizingAgents.map((a) => (
            <div role="listitem" key={a.id}>
              <AgentLane agent={a} />
            </div>
          ))}
        </div>
        <SynthesisBar done={2} total={3} />
      </Variant>

      {/* ── 5. Error / partial failure ─────────────────────────────────────── */}
      <Variant label="error — partial failure" hint="one crashed lane; synthesis continues from successful agents">
        <OrchestratorHeader phase="Synthesizing (1 error)" count={3} />
        <div role="list" aria-label="Active agents" className="flex flex-col" style={{ gap: 8 }}>
          {[
            { id: "search", role: "Search agent", status: "done" as AgentState, steps: 14 },
            { id: "citation", role: "Citation agent", status: "error" as AgentState, steps: 2 },
            { id: "analysis", role: "Analysis agent", status: "done" as AgentState, steps: 6 },
          ].map((a) => (
            <div role="listitem" key={a.id}>
              {a.status === "error" ? (
                <div
                  style={{
                    borderTop: `1px solid ${tok.error}`,
                    borderRight: `1px solid ${tok.error}`,
                    borderBottom: `1px solid ${tok.error}`,
                    borderLeft: `3px solid ${tok.error}`,
                    borderRadius: 8,
                    padding: "9px 12px",
                    background: "var(--error-soft)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <StatusDot state="error" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: tok.error, flex: 1 }}>
                    {a.role}
                  </span>
                  <span style={{ fontSize: 11, color: tok.error }}>Failed: timeout after 30s</span>
                  <button
                    style={{
                      border: `1px solid ${tok.error}`,
                      background: "transparent",
                      color: tok.error,
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 12,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <RotateCcw size={12} />
                    Retry
                  </button>
                </div>
              ) : (
                <AgentLane agent={a} />
              )}
            </div>
          ))}
        </div>
        <SynthesisBar done={2} total={3} />
        <Note>
          Errored lanes are marked failed with a retry affordance. Synthesis continues from completed lanes — one crash never aborts the full run.
        </Note>
      </Variant>

      {/* ── 6. Done ────────────────────────────────────────────────────────── */}
      <Variant label="done" hint="all lanes settled; synthesis bar hidden; final message in thread">
        <OrchestratorHeader phase="Complete" count={3} />
        <div role="list" aria-label="Active agents" className="flex flex-col" style={{ gap: 8 }}>
          {[
            { id: "s", role: "Search agent", status: "done" as AgentState, steps: 14 },
            { id: "c", role: "Citation agent", status: "done" as AgentState, steps: 5 },
            { id: "a", role: "Analysis agent", status: "done" as AgentState, steps: 6 },
          ].map((a) => (
            <div role="listitem" key={a.id}>
              <AgentLane agent={a} />
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--success-soft)",
            border: `1px solid ${tok.success}`,
            fontSize: 13,
            color: tok.success,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <StatusDot state="done" />
          All 3 sub-agents finished — synthesized report ready.
        </div>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
