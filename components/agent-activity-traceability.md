# Agent Status, Activity & Traceability
> Surfaces that answer both "what is the agent doing right now?" and "what did it do, and why?" — from a live status label through a full replayable run log.

**Category:** Component · **Cluster:** Agent reasoning & transparency · **Aliases:** Activity timeline, Agent run log, Session / sessions view, Live status text, Steps / plan tracker, Replay timeline, Mission control, Audit trail, Rationale ("why did it do this")

---

## Definition

Agent Status, Activity & Traceability is the family of surfaces that communicate the current and historical state of an agent run to the user. It covers three nested layers: a **live status text** label that updates continuously during execution; a **plan/step tracker** that shows which subtasks are queued, active, or complete; and a **persistent activity timeline** — a timestamped, ideally replayable log of every command, edit, and decision the agent took. For longer or autonomous runs the timeline becomes a full traceability layer: it surfaces rationale behind consequential actions, enables replay and inspection of past decisions, and provides controls (pause, stop, undo, approve) so users can monitor, redirect, or revert work. Together these layers answer the two core trust questions an agent UI must resolve: *Is it still working?* and *Why did it do that — and can I reverse it?*

---

## When to use / when not to

- **Use** whenever an agent run exceeds a few seconds or performs more than one tool call — users need real-time orientation, not a spinner.
- **Use** for any autonomous or background work where the agent modifies data, files, code, or external systems — traceability is the accountability layer that makes such actions acceptable.
- **Use** in multi-session / multi-agent setups to provide a "mission control" panel listing every active run with its status, so users don't lose track of background work.
- **Use** when the agent makes decisions with non-trivial stakes (legal, financial, medical, code deployments) — showing rationale alongside consequential actions is a trust prerequisite.
- **Skip** for simple single-turn Q&A that returns in under two seconds with no side-effects; the overhead of a plan tracker or activity log is pure noise at that scale.

---

## Anatomy

```
┌─────────────────────────────────────────────────┐
│  Run Header                                      │
│  ┌─────────────────────────────────────────────┐ │
│  │ [●] Live status text  "Editing app.tsx…"    │ │  ← pulse indicator + current step label
│  │     [Stop] [Pause]                          │ │  ← run controls
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  Plan Tracker (optional, collapsible)            │
│  ┌─────────────────────────────────────────────┐ │
│  │ ✓  Gather requirements          00:03       │ │  ← completed step (dim)
│  │ ►  Edit app.tsx                 running…    │ │  ← active step (highlighted)
│  │ ○  Run tests                               │ │  ← upcoming step (muted)
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  Activity / Replay Timeline                      │
│  ┌─────────────────────────────────────────────┐ │
│  │ 14:32:01  tool_call   search_files({…})     │ │  ← timestamped entry
│  │            rationale: "Find all usages…"    │ │  ← rationale (collapsible)
│  │ 14:32:04  edit        app.tsx lines 10-22   │ │
│  │            [Undo this edit]                 │ │  ← undo affordance
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  Run Footer: Duration · Status badge · [Replay ▶] │
└─────────────────────────────────────────────────┘
```

**Parts:**
- **Run header** — contains the live status text, pulse/spinner indicator, and run-level controls (stop, pause).
- **Live status text** — a short, frequently updated label for the current action; keyed to the active step and updated on each `StepStarted` event.
- **Plan tracker** — ordered list of steps with per-step status icons (queued, active, done, error) and optional durations. May be user-editable in high-agency setups.
- **Activity / replay timeline** — chronological log of every action entry (tool call, file edit, decision) with timestamps; can be scrubbable on long runs.
- **Rationale** — per-entry disclosure showing the agent's justification for the action; collapsible to reduce density.
- **Undo / revert affordance** — per-entry or run-level control to roll back an edit or action.
- **Sessions view** — when multiple runs coexist, a top-level panel listing all sessions with status badges; the "mission control" surface.

---

## States

| State | Trigger | UI treatment |
|---|---|---|
| **Idle** | No active run; agent waiting for input | Status text hidden or shows "Ready"; plan tracker empty; timeline shows prior runs if any |
| **Run started** | `RUN_STARTED` event | Live status text appears with pulse indicator; timer starts; plan tracker activates; send button disables |
| **Step in progress** | `StepStarted` event | Active step row highlighted; live status text updates to match step label; prior steps dimmed |
| **Streaming / intermediate results** | `STATE_DELTA` events during run | Timeline entries append in real time; shared-state surfaces (canvas, doc) update incrementally |
| **Awaiting input / paused** | HITL tool call or framework interrupt | Live status text switches to "Waiting for approval"; approval card rendered inline; `aria-live="assertive"` region fires |
| **Run finished** | `RUN_FINISHED` event | Pulse stops; all steps marked done; status badge shows "Complete" with duration; input re-enables |
| **Run error / failed** | `RUN_ERROR` event | Error entry appended to timeline; status label turns destructive; retry affordance surfaced |
| **Reviewing / replay** | User opens past run or scrubs timeline | Timeline enters read-only replay mode; step tracker reflects replayed position; controls show "Replay ▶" |

---

## Vocabulary

| Term | Definition |
|---|---|
| **Run** | One bounded agent execution, delimited by `RUN_STARTED` and `RUN_FINISHED` / `RUN_ERROR` events; the top-level unit of activity in the timeline. |
| **Step** | A nested, observable phase within a run (e.g., planning, retrieval, a specific tool call) that has its own start/finish events and can be tracked individually. |
| **Live status text** | A short, continuously updated label describing the current activity (e.g., "Searching the web…", "Editing app.tsx…"). Keyed to `StepStarted`. |
| **Activity / replay timeline** | A chronological, often scrubbable record of every command, edit, and action the agent took, with timestamps and optional rationale. |
| **Plan tracker** | A visible — and in some products, user-editable — ordered list of upcoming/completed subtasks the agent intends to execute. |
| **Rationale** | The agent's explanation of why it took an action (e.g., commit rationale, decision justification), surfaced next to the timeline entry. |
| **Sessions view / mission control** | A panel listing all active and background agent sessions with per-session status badges, used to monitor and switch between concurrent runs. |
| **Undo / revert** | A control to roll back the agent's last edit or action to a prior known state; may be per-entry or run-level. |
| **Shared state** | State streamed from the agent to the UI (progress, intermediate results) and optionally back to the agent via `STATE_SNAPSHOT` / `STATE_DELTA` events, keeping the user and agent in sync. |

---

## Real-world examples

- **Devin (Cognition) — Session UI / Devin 2.0** — Works inside a cloud IDE; every session page exposes a replayable timeline the user can scrub with arrow keys. A four-waypoint header (Task, Plan, PR, Summary) tracks run-level milestones. An Interactive Planner lets users scope changes and approve Devin's plan before autonomous execution begins. [Source](https://docs.devin.ai/release-notes/2025)
- **GitHub Copilot — Agent Sessions view (VS Code)** — A dedicated "Agent sessions" sidebar panel serves as mission control: task status at a glance, per-session logs in context, jump-in affordances for approval requests, and rationale surfaced alongside each commit as it happens. Paired with an "Undo Last Edit" control for file-level reversals. [Source](https://github.blog/changelog/2025-11-13-manage-copilot-coding-agent-tasks-in-visual-studio-code/)
- **Microsoft 365 Copilot — Researcher with Computer Use** — Streams periodic screenshots, terminal output, and search visuals back to the user in near-real time as the agent works inside a sandboxed Windows 365 VM. The experience is consent-gated and admin-governed; humans can step in when credentials or approvals are needed. [Source](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/introducing-researcher-with-computer-use-in-microsoft-365-copilot/4464766)
- **Harvey (legal AI) — Agents** — Introduces "thinking states" surfaced inline as the agent works through legal workflows, giving attorneys visibility into decision logic and execution progress as a first-class transparency feature rather than an afterthought. [Source](https://www.harvey.ai/blog/introducing-harvey-agents)

---

## CopilotKit & AG-UI mapping

**AG-UI lifecycle events** drive every state in this component. The mandatory run boundary is `RUN_STARTED` → `RUN_FINISHED` | `RUN_ERROR`; step events (`StepStarted` / `StepFinished`) are optional but power the plan tracker. `STATE_SNAPSHOT` / `STATE_DELTA` (JSON Patch) stream shared state to the UI for live progress and intermediate results.

**CopilotKit React primitives:**
- `useAgent` (v2) — reads and writes shared agent state; drives the activity timeline with live progress fields the agent publishes to its state object.
- `useCopilotReadable` — pushes app context into the agent so it can reference the user's current view in its reasoning.
- `useRenderTool` — renders individual tool-call entries in the timeline (see [./tool-call.md](./tool-call.md)).
- `useHumanInTheLoop` / `useInterrupt` — surfaces the "awaiting input" state inline (see [./human-in-the-loop.md](./human-in-the-loop.md)).

> v1 equivalent: replace `useAgent` with `useCoAgent({ name, initialState })` from `@copilotkit/react-core`.

```tsx
import { useAgent } from "@copilotkit/react-core/v2";

type RunState = {
  status: "idle" | "running" | "done" | "error";
  currentStep: string;
  log: Array<{ ts: string; action: string; rationale?: string }>;
};

function AgentActivityPanel() {
  const { agent } = useAgent<RunState>({ agentId: "research-agent" });
  const { status, currentStep, log } = agent.state ?? {
    status: "idle",
    currentStep: "",
    log: [],
  };

  return (
    <section aria-label="Agent activity">
      {/* Live status — polite region so screen readers announce updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="agent-status"
      >
        {status === "running" && (
          <>
            <span className="pulse" aria-hidden="true" />
            {currentStep || "Working…"}
          </>
        )}
        {status === "done" && "Complete"}
        {status === "error" && "Run failed"}
      </div>

      {/* Activity timeline */}
      <ol className="agent-timeline" aria-label="Run log">
        {log.map((entry, i) => (
          <li key={i}>
            <time dateTime={entry.ts}>{entry.ts}</time>
            <span>{entry.action}</span>
            {entry.rationale && (
              <details>
                <summary>Rationale</summary>
                <p>{entry.rationale}</p>
              </details>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
```

The agent backend writes `status`, `currentStep`, and appends to `log` using `STATE_DELTA` patches; `useAgent` surfaces the merged state in `agent.state` after each patch. There is no single CopilotKit primitive for undo or rationale — implement those as fields in shared state and pair with HITL for approval flows. See [docs.copilotkit.ai/learn/whats-new/v1-50](https://docs.copilotkit.ai/learn/whats-new/v1-50) for the `useAgent` shared-state model.

---

## Best practices

- **Name the current action specifically.** "Editing `app.tsx` line 42" is more trustworthy than "Working…". Pull the current step label from `STATE_DELTA` and display it in the live status text so users can follow the agent's exact focus.
- **Model all activity as runs and steps.** Emit `RUN_STARTED` and `RUN_FINISHED` (with duration) for every bounded execution, and `StepStarted`/`StepFinished` for observable phases. This gives the UI a consistent lifecycle to render progress, per-step timing, and graceful error recovery from.
- **Persist a timestamped timeline.** Append every tool call, edit, and decision to a durable log. For runs longer than ~30 seconds, make the timeline scrubbable or paginated so users can review work without scrolling through wall-of-text.
- **Show the plan before and during execution.** A visible plan tracker sets user expectations, reduces anxiety on long runs, and gives users a concrete intervention point — especially if you let them edit or approve steps before the agent acts.
- **Expose rationale for consequential actions.** Display the agent's justification next to commits, file edits, or financial decisions. Collapsible by default to reduce density, but always present for auditability.
- **Always provide stop and undo.** A user who cannot halt a run or reverse an edit loses trust immediately. Stop and per-entry undo should be keyboard-accessible and visible at all times during a run.
- **Separate concurrent sessions clearly.** In multi-agent or background-task setups, a sessions view with per-run status prevents users from losing track of active work. Each session row should be deep-linkable.
- **Reconcile streaming state with final results.** Optimistic UI updates from `STATE_DELTA` may be overwritten when `RUN_FINISHED` delivers final state. Handle the merge so the timeline does not flash or lose entries.

---

## Anti-patterns

- **Opaque background automation.** Running an agent with no visible steps, no log, and no way to inspect what happened leaves users unable to evaluate or trust the output — a critical failure for any consequential domain.
- **The generic spinner.** A static "Working…" or indefinite progress bar with no status text, no step breakdown, and no ETA breaks trust on runs longer than ~10 seconds. Users have no signal whether to wait, intervene, or refresh.
- **No undo or stop control.** If an agent's mistaken edit or action cannot be halted or reversed, users will avoid using the feature for anything important. This is a non-negotiable for file-editing, code-writing, or data-mutating agents.
- **Discarding rationale.** Logging what the agent did without preserving why leaves users unable to audit, debug, or learn from the agent's behavior. Store rationale in shared state; render it collapsible in the timeline.
- **Burying concurrent sessions.** When multiple agents run in background tabs or queues and there is no sessions view, users discover stale or failed runs only by accident — eroding confidence in the whole system.

---

## Accessibility

- Place the live status text in a `role="status"` element with `aria-live="polite"` and `aria-atomic="true"` so screen readers announce updates without interrupting the user mid-sentence. Upgrade to `aria-live="assertive"` only for blocking states like approval requests.
- Ensure Stop, Pause, and Undo controls are native `<button>` elements (not divs) with descriptive `aria-label` values tied to the action they affect (e.g., `aria-label="Stop current run"`), and that they remain in the keyboard tab order throughout an active run.
- Mark the activity timeline as an ordered list (`<ol>`) with `aria-label="Run log"` so assistive technologies can enumerate entries and users can navigate by item count.
- Use `<time dateTime="…">` for timestamps in timeline entries so screen readers and tools can parse and localize them correctly.
- Apply `prefers-reduced-motion` media query to suppress the pulse/spinner animation on the live status indicator — a CSS `animation: none` override is sufficient.
- When a run transitions to the awaiting-input state, move keyboard focus to the approval or interrupt component so keyboard users are not left on a now-irrelevant status indicator.

---

## Related

- [./tool-call.md](./tool-call.md) — Tool Call: individual tool-call entries that appear inside the activity timeline
- [./thinking-reasoning.md](./thinking-reasoning.md) — Thinking / Reasoning Display: chain-of-thought surfaces that pair with rationale in the timeline
- [./human-in-the-loop.md](./human-in-the-loop.md) — Human-in-the-Loop Prompt: the approval/interrupt surface triggered from the awaiting-input state
- [./sub-agents.md](./sub-agents.md) — Sub-Agents / Multi-Agent Orchestration: the sessions-view / mission-control pattern for concurrent runs
- [./deep-research.md](./deep-research.md) — Deep Research: long autonomous runs that most benefit from a full plan tracker and replay timeline
- [../reference/copilotkit-primitives.md](../reference/copilotkit-primitives.md) — CopilotKit primitive reference
- [../reference/ag-ui-protocol.md](../reference/ag-ui-protocol.md) — AG-UI protocol reference
- [../reference/glossary.md](../reference/glossary.md) — Master vocabulary

---

## Sources

- https://docs.devin.ai/release-notes/2025
- https://github.blog/changelog/2025-11-13-manage-copilot-coding-agent-tasks-in-visual-studio-code/
- https://techcommunity.microsoft.com/blog/microsoft365copilotblog/introducing-researcher-with-computer-use-in-microsoft-365-copilot/4464766
- https://www.harvey.ai/blog/introducing-harvey-agents
- https://docs.copilotkit.ai/learn/whats-new/v1-50
- https://docs.ag-ui.com/concepts/events
- https://docs.ag-ui.com/concepts/architecture
