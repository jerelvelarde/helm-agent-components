# Sub-Agents / Multi-Agent Orchestration
> Surfaces the structure and live progress of a coordinating agent delegating work to multiple specialized sub-agents, making an otherwise-invisible org chart legible to the user.
**Category:** Component · **Cluster:** Multi-agent & research · **Aliases:** multi-agent orchestration, agent network, agent swarm, orchestrator-worker, supervisor + workers, agent handoffs, agent teams, agent-to-agent (A2A), agent fleet, agent mesh

## Definition
A sub-agents / multi-agent orchestration component renders the runtime structure of a system where one orchestrator (lead agent / supervisor / router) decomposes a task, delegates it to N specialized sub-agents running in parallel or serial, and synthesizes their outputs. It solves the transparency problem inherent to multi-agent systems: users (and developers) cannot reason about progress, failures, or attribution when the internal delegation is invisible. The component appears wherever a single response requires coordinating work that exceeds one agent's context or expertise — parallel research fleets, coding swarms, analytical pipelines, and A2A-based cross-vendor workflows.

## When to use / when not to
- **Use** when the orchestrator spawns two or more sub-agents whose work is meaningful to the user — parallel research threads, domain-specialized analysts, concurrent coding agents in separate worktrees.
- **Use** when handoffs change the responding agent mid-conversation and attribution matters; silent swaps erode trust.
- **Use** when partial results from sub-agents should be streamed progressively rather than held until full synthesis.
- **Avoid** for a single-agent run with sequential tool calls — rendering it as multi-agent adds visual complexity without informational value; use [Tool Call](./tool-call.md) instead.
- **Avoid** when the orchestration is an internal implementation detail that users have no actionable relationship with; in those cases surface only the synthesized result.

## Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator header                               [▾ plan] │
│  "LeadResearcher · Planning (3 agents)"                     │
├──────────┬──────────────┬──────────────┬────────────────────┤
│ Agent lane│ Agent lane   │ Agent lane   │                    │
│ [Search] │ [Citation]   │ [Analysis]   │ (idle lane)        │
│ ■ running│ ● done       │ ◌ waiting    │                    │
│ 12 steps │ 3 steps      │ — blocked    │                    │
│ [steps▾] │ [result▾]    │ [reason▾]    │                    │
├──────────┴──────────────┴──────────────┴────────────────────┤
│  Synthesis bar  ████████░░░░░░  "Merging 2 of 3 results"    │
└─────────────────────────────────────────────────────────────┘
│  Handoff chip:  "→ Handed off to Citation agent  12:34:01"  │
└─────────────────────────────────────────────────────────────┘
```

**Parts:**
- **Orchestrator header** — identity, current phase label, and an expandable plan/decomposition rationale.
- **Agent lane** — one row or card per sub-agent: role label, status indicator, step count or token progress, and an expand/collapse trigger for the agent's own [tool calls](./tool-call.md) or [thinking](./thinking-reasoning.md).
- **Status indicator** — per-lane icon/color representing the sub-agent's current state (running, done, waiting, error).
- **Synthesis bar** — aggregate progress indicator shown during fan-in; communicates how many sub-agent results have been incorporated.
- **Handoff chip** — timestamped event pill rendered inline in the thread when control transfers between agents.
- **Aggregate view** — collapsed summary (default) showing overall progress; expands to per-lane detail (progressive disclosure).

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle / no active agents | No run in progress | Orchestrator header absent or shows last-run summary |
| Planning | Orchestrator receives input; decomposes task | Header shows "Planning…"; optional spinning indicator; plan text streams in if exposed |
| Spawning / fan-out | Orchestrator emits sub-agent creation | Agent lanes appear with "Spawning…" skeleton; optimistic count shown ("3 agents starting") |
| Running in parallel | Sub-agents active; each streaming independently | Per-lane status = running; step counts increment; synthesis bar absent |
| Handoff in progress | Control transfers from one agent to another | Handoff chip rendered in thread with source → target label and timestamp |
| Waiting / blocked | Sub-agent needs external input or dependency | Lane status = waiting; [Human-in-the-Loop](./human-in-the-loop.md) prompt may appear |
| Synthesizing / fan-in | Orchestrator merging sub-agent results | Synthesis bar visible; lanes transition to done/merged; orchestrator header shows "Synthesizing" |
| Done | Orchestrator emits final answer | All lanes settled; synthesis bar full or hidden; final message appended to thread |
| Error / failed sub-agent | One or more lanes error | Errored lane shows error indicator + retry affordance; synthesis continues from successful lanes |

## Vocabulary

| Term | Definition |
|---|---|
| Orchestrator / lead agent | The coordinating agent that analyzes the query, plans strategy, spawns sub-agents, and synthesizes their results. |
| Sub-agent / worker | A specialized agent spawned by the orchestrator, typically with its own context window, that chases one independent thread and returns findings. |
| Handoff | Explicit transfer of control from one agent to another while carrying conversation context; the core abstraction in swarm-style systems. |
| Supervisor vs. swarm | Supervisor = central router picks the next worker each turn; swarm = routing intelligence is distributed and each agent decides independently when to hand off. |
| Agents-as-tools | Hierarchical pattern where a sub-agent is exposed to the orchestrator as a callable tool rather than a peer it hands off to. |
| Fan-out / fan-in | Spawning N sub-agents in parallel (fan-out) then collapsing their results back into the lead agent (fan-in) for synthesis. |
| Agent Card (A2A) | JSON metadata document published by an A2A server describing identity, capabilities, skills, endpoint, and auth — lets agents discover each other and decide who handles a task. |
| Task (A2A) | The unit of delegated work in A2A, with a tracked lifecycle (submitted → working → completed / failed). |
| Agents window / agent lane | A dedicated workspace (e.g., Cursor 3.0) for running and managing many agent sessions in parallel, each showing its own task and status. |
| Tracing / span | Observability primitive recording the chain of agent calls, handoffs, and tool invocations for debugging and replay. |

## Real-world examples

- **Anthropic Claude (Research)** — LeadResearcher orchestrator decomposes a query and spins up 3–5 subagents in parallel (separate context windows), each searching independently; a CitationAgent then processes findings to locate specific citations. In the Claude UI this surfaces as a collapsible thinking/research block showing the lead's plan and per-subagent activity rolling up to a cited report. [Source](https://www.anthropic.com/engineering/multi-agent-research-system)
- **Cursor 3.0** — Agent-first redesign (April 2026) whose primary interface is a full-screen "Agents Window" for running many agents in parallel across repos and environments (local, git worktrees, cloud, remote SSH), with sessions in tabs/grids viewable side by side and portable between local and cloud. [Source](https://cursor.com/changelog/3-0)
- **Microsoft Copilot Studio** — Multi-agent orchestration (announced Build 2025) lets Microsoft 365, Azure AI, and Fabric agents collaborate by delegating tasks and sharing results; supports the open A2A protocol so agents connect to third-party platforms. [Source](https://www.microsoft.com/en-us/microsoft-365/blog/2025/05/19/introducing-microsoft-365-copilot-tuning-multi-agent-orchestration-and-more-from-microsoft-build-2025/)
- **Google A2A protocol** — Open protocol (announced April 2025, donated to Linux Foundation June 2025) where agents publish an Agent Card for capability discovery and exchange Tasks with explicit lifecycle states over JSON-RPC / HTTP+SSE, standardizing delegation and status reporting across vendors. [Source](https://a2a-protocol.org/latest/specification/)

## CopilotKit & AG-UI mapping

The orchestrator's shared progress state is the source of truth for all lane rendering. Use `useAgent` (v2) to subscribe to this state — the backend agent pushes intermediate sub-agent status via `copilotkit_emit_state`, which arrives as AG-UI `STATE_SNAPSHOT` / `STATE_DELTA` events and is exposed on `agent.state`. Render each sub-agent's tool calls with `useRenderTool` keyed by sub-agent role. Per-run lifecycle (`RUN_STARTED` / `RUN_FINISHED` / `RUN_ERROR`) drives the orchestrator-level working/done/error transitions; step lifecycle events from AG-UI track individual sub-agent phases.

**v1 equivalent:** `useCoAgent({ name, initialState })` for shared state; `useCopilotAction({ render })` for tool-call rendering.

Relevant AG-UI events: `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`, `STATE_SNAPSHOT`, `STATE_DELTA`, `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END`, `TOOL_CALL_RESULT`.

```tsx
import { useAgent } from "@copilotkit/react-core/v2";
import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

// ── 1. Subscribe to orchestrator shared state (carries per-sub-agent progress)
const { agent } = useAgent({ agentId: "lead-researcher" });
const { subAgents } = agent.state as {
  subAgents: Array<{ id: string; role: string; status: string; steps: string[] }>;
};

// ── 2. Render tool calls emitted by the orchestrator as handoff chips
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

// ── 3. Render the fleet — one lane per sub-agent from shared state
return (
  <AgentFleetView>
    {subAgents.map((sa) => (
      <AgentLane key={sa.id} role={sa.role} status={sa.status} steps={sa.steps} />
    ))}
  </AgentFleetView>
);
// v1 equivalent: useCoAgent({ name: "lead-researcher", initialState: {} }) for state;
// useCopilotAction({ name: "hand_off_to_agent", render }) for handoff chip.
```

Surface the orchestration inside `CopilotChat`, `CopilotSidebar`, or `CopilotPopup`. For A2A-based cross-agent delegation, configure the `CopilotRuntime` with an A2A adapter; sub-agent status arrives through the same `STATE_SNAPSHOT` / `STATE_DELTA` path. See [CopilotKit A2A docs](https://docs.copilotkit.ai) and [`../reference/copilotkit-primitives.md`](../reference/copilotkit-primitives.md).

## Best practices

- **Make the org chart legible.** Always label each sub-agent by role ("Search agent", "Citation agent") not opaque IDs. Users cannot form a mental model of a swarm they can't read.
- **Render handoffs as discrete events.** Timestamped handoff chips ("→ Handed off to Code agent  12:34:01") prevent the conversation from appearing to contradict itself when the responding agent changes persona.
- **Progressive disclosure for sub-agent detail.** Show the aggregate view (N agents working, synthesis progress) by default; let users expand any lane into its own step list or tool calls. Dumping all token streams into a flat transcript is unreadable.
- **Optimistic fan-out skeletons.** Render "Spawning…" lane placeholders immediately when the orchestrator starts fan-out — a blank screen during sub-agent initialization reads as a hang.
- **Expose the delegation rationale.** Surface the orchestrator's decomposition reasoning ("Spawning 3 agents to cover pricing, security, and integrations") so the parallel structure is auditable, not just observable.
- **Degrade gracefully on partial failure.** Mark an errored lane as failed and continue synthesizing from successful ones. A single crashed sub-agent should never abort the entire run and discard completed work.
- **Accessibility: announce state transitions.** Wrap the orchestrator header and active agent indicator in an `aria-live="polite"` region so screen-reader users hear handoff and status changes without polling.
- **Latency: indicate expected parallelism.** Show "3 agents working" with individual progress rather than a generic spinner — this signals to users that the system is making progress on multiple fronts simultaneously.

## Anti-patterns

- **Single spinner for the whole run.** Hiding which agent is active and how many are working makes it impossible to distinguish progress from a hang, and provides no granularity for debugging.
- **Silent handoffs.** Swapping the responding agent with no event causes the conversation to appear to contradict itself or shift persona without explanation, breaking attribution and trust.
- **Flat interleaved transcript.** Piping all sub-agent token streams into one unstructured transcript produces an unreadable wall — users cannot tell which agent said what or what phase they're in.
- **Exposing internal IDs and framework jargon.** Strings like `node_3 → tool_call_7` or LangGraph node names are meaningless to users; always translate to human-readable role names before display.
- **No partial-failure handling.** Letting one crashed sub-agent abort the entire orchestration discards already-completed work and fails the user unnecessarily.

## Accessibility

- Wrap the orchestrator status header in an `aria-live="polite"` region; announce transitions such as "Planning complete, 3 agents spawned" and "Handed off to Citation agent" without requiring focus.
- Expose each agent lane as a list item (`role="listitem"`) inside a labeled list (`role="list"`, `aria-label="Active agents"`) so screen readers enumerate the fleet.
- Compose each lane's accessible name from role + current status: `aria-label="Search agent — running, 12 steps"`.
- Expand/collapse triggers for lane detail must be `<button>` elements (not `<div>`) with `aria-expanded="true|false"` and `aria-controls` pointing to the collapsible region.
- Handoff chips appended to the transcript should carry `role="status"` or be injected into the `aria-live` region so they are announced when rendered.
- Respect `prefers-reduced-motion`: replace animated lane progress bars and spinning status indicators with static equivalents or stepped transitions.

## Related

- [Tool Call](./tool-call.md) — each sub-agent's individual tool invocations render as tool-call cards; sub-agent lanes embed these.
- [Thinking / Reasoning Display](./thinking-reasoning.md) — orchestrator planning and sub-agent chain-of-thought surface as thinking disclosures inside each lane.
- [Human-in-the-Loop Prompt](./human-in-the-loop.md) — sub-agents in the "waiting / blocked" state may require a HITL approval before proceeding.
- [Agent Status, Activity & Traceability](./agent-activity-traceability.md) — per-agent trace spans and the full activity log are the observability layer beneath the multi-agent component.
- [Deep Research](./deep-research.md) — the canonical application of the orchestrator-worker pattern; deep research UIs are multi-agent orchestration surfaces specialized for research pipelines.
- [Threads / Conversation History](./threads-history.md) — multi-agent runs produce threads; `MESSAGES_SNAPSHOT` rehydrates the full handoff-and-synthesis history.
- [Reference: CopilotKit primitives](../reference/copilotkit-primitives.md) — verified API reference for `useAgent`, `useRenderTool`, `useInterrupt`, and `CopilotRuntime` / A2A.
- [Reference: AG-UI protocol](../reference/ag-ui-protocol.md) — wire-level event taxonomy: `RUN_*`, `STATE_SNAPSHOT/DELTA`, `TOOL_CALL_*`.

## Sources

- https://www.anthropic.com/engineering/multi-agent-research-system
- https://cursor.com/changelog/3-0
- https://www.microsoft.com/en-us/microsoft-365/blog/2025/05/19/introducing-microsoft-365-copilot-tuning-multi-agent-orchestration-and-more-from-microsoft-build-2025/
- https://a2a-protocol.org/latest/specification/
- https://docs.copilotkit.ai
- https://docs.ag-ui.com/concepts/events
