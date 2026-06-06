# Ambient / Proactive AI

> AI that surfaces on its own — triggered by events, schedules, or observed context rather than by the user opening a chat surface and typing.

**Category:** Layout · **Cluster:** Layouts & workspaces · **Aliases:** Ambient agents, Proactive AI, Background agents, Async / asynchronous agents, Observational AI, Always-on agents, Push-model AI (vs. pull-model), Agent inbox pattern, Proactive suggestions / nudges, Event-driven agents

## Definition

Ambient / Proactive AI spans a spectrum from lightweight in-context nudges — a suggestion chip that appears as the user types, a "Reply?" banner surfaced above an inbox thread — to fully detached background agents that run for minutes-to-hours and deliver a finished artifact (a PR, a draft, a summary) somewhere the user will see it later. The defining inversion versus every other placement is the trigger: the system initiates, and the user reviews or approves rather than prompts. Structurally this is not a single surface but a placement *off* the active surface, split into two sub-shapes: (1) in-context proactive, where a transient element appears in the user's current view without being summoned, and (2) detached background, where work happens in an invisible runtime and surfaces only as a notification plus a destination (an agent inbox, a draft PR, a Slack reply, a generated document). Because attention is the scarce resource, the central design problem is choosing *when to interrupt* and *where the result lands*.

## When to use / when not to

- **Use** when the task is long-running, parallelizable, or boring — codebase-wide chores, triage, doc generation — work the user wants done but does not want to babysit; delegate-and-detach beats a blocking chat.
- **Use** when success is objectively checkable after the fact (tests pass, a diff is reviewable, a draft can be skimmed) so async review is cheap and the user does not need to watch it work.
- **Use** when there is a natural "home" for the result the user already visits — a PR, an inbox, Slack, a calendar/notes app — so output lands in-workflow rather than forcing a separate login.
- **Use** when the signal-to-interrupt ratio is high: you can confidently predict *when* surfacing something is worth breaking attention.
- **Do not use** when the user needs tight, turn-by-turn control or the task is ambiguous or exploratory — a reactive [Side Panel](./side-panel.md) or [Inline Contextual](./inline-contextual.md) is better; background agents tend to fall apart the moment iteration in messy context is required.
- **Do not use** for high-stakes, irreversible actions without a review gate (sending external email, spending money, deleting data) — proactivity must be paired with notify / question / review human-in-the-loop, never silent execution.
- **Do not use** when you cannot yet predict trigger quality — if you ship proactivity before you have signal-to-noise data, you will blow the user's small daily tolerance for unsolicited notifications and they will mute, then churn.

## Anatomy

```
In-context proactive (nudge end)
┌──────────────────────────────────────────────────────────┐
│  Host Application (user's current view)                  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [Content the user is working on]                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ╔═══════════════════════════════════════════════════╗  │
│  ║  Proactive nudge / suggestion chip                ║  │  ← appears without prompt
│  ║  "Would you like to reply?"   [Reply]  [Dismiss]  ║  │
│  ╚═══════════════════════════════════════════════════╝  │
│                           ↑                              │
│              Non-blocking; ignored = implicit dismiss    │
└──────────────────────────────────────────────────────────┘

Detached background (agent inbox end)
┌──────────────────────────────────────────────────────────┐
│  Agent Inbox  (user opens on demand)                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [●] Fix: flaky auth test     Running  ▸ View logs  │  │  ← working / collapsed
│  │ [!] Draft PR: add CSV export  Needs review  [Open] │  │  ← needs-attention item
│  │ [✓] Triage: 14 issues labelled  Done  [See PR]     │  │  ← delivered item
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────── Expanded activity log ──────────────┐  │
│  │  Triggered by: issue assigned #1042                │  │  ← pull-open log
│  │  Cloned repo → ran tests → opened PR #89          │  │
│  │  [Approve]  [Request changes]  [Ignore]            │  │  ← HITL gate
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

Notification layer (both sub-shapes)
┌──────────────────────────────────────────────────────────┐
│                                                  [×]     │
│  ╔══════════════════════════════════════════════════╗   │
│  ║  Toast / badge  "PR #89 ready for review"  [Go]  ║   │  ← ephemeral, dismissible
│  ╚══════════════════════════════════════════════════╝   │
└──────────────────────────────────────────────────────────┘
```

**Parts:**

- **Proactive nudge / suggestion chip** — transient element appearing in the user's current view without being summoned; one-tap accept or implicit dismiss-by-ignoring.
- **Toast / notification badge** — ephemeral, dismissible interrupt linking the user to where results landed; must be keyboard-dismissible and never auto-close faster than a screen reader can read it.
- **Agent inbox** — a persistent queue of agent items awaiting human attention, modeled on an email inbox + support-ticket queue; each item has a status, a destination link, and an optional HITL gate.
- **Activity log** — pull-open audit trail for a running or completed agent; shows triggered-by, steps taken, and errors; always available, never forced open.
- **HITL gate** — the approve / request-changes / ignore affordance embedded in each inbox item; renders a `useHumanInTheLoop` or `useInterrupt` card.
- **Overview / status indicator** — a quiet status dot or badge in a persistent nav element showing the agent is armed and listening; invisible when fully idle.
- **Config / kill switch** — user-accessible toggle for per-source on/off, quiet hours, and trigger rules; must exist.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle / listening | Agent armed; nothing to surface | Invisible or a quiet status dot; no notification, no nudge |
| Triggered / queued | Event fired or task delegated; environment provisioning | Compact queued entry in inbox or activity log; "Starting…" label; `RUN_STARTED` received or pending |
| Working / running (collapsed) | Agent executing detached | Inline progress indicator or spinner in inbox entry; pull-open activity log available; live token streaming is the exception, not the norm |
| Needs-attention / pending review | Agent paused at HITL gate (notify / question / review) | Item promoted in inbox with a badge; HITL card rendered inside the expanded log; count badge in nav |
| Suggested (nudge) | In-context proactive chip / banner / ghost-text shown | Non-blocking element in current view; one-tap accept or explicit / implicit dismiss |
| Delivered / applied | Run finished; result landed at destination | Toast or inbox item marked Done; notification links to artifact; nudge accepted = suggestion inserted |
| Dismissed / ignored | User declined or skipped | Nudge vanishes; inbox item archived; system decrements notification budget and records negative signal |
| Error / failed | `RUN_ERROR`; timeout; stuck run | Inbox item shows error with what happened; retry and steer affordances; never silent disappearance |

## Vocabulary

| Term | Definition |
|---|---|
| Reactive ↔ proactive (pull vs. push) spectrum | Reactive AI waits for the user to ask (pull); proactive/ambient AI initiates from events or observed context (push). Most real systems sit between, not at the extremes. |
| Ambient agent | An agent that listens to an event stream and acts on relevant events without sole reliance on a human message, often handling multiple events at a time. |
| Background / async agent | A detached agent that runs in its own remote environment (cloud VM, CI runner) for minutes-to-hours while the user does other things, delivering a finished artifact when done. |
| Agent inbox | A dedicated queue of agent items awaiting human attention — modeled on a combination of an email inbox and a customer-support ticketing system — where outstanding actions are tracked, sorted, and resolved. |
| Notification budget | The small daily ceiling on unsolicited AI interrupts a user tolerates before they mute or uninstall; treat notifications as withdrawals from a finite account rather than something to maximize. |
| Interruption cost | The cognitive price of breaking focus — context recovery can take many minutes and interruptions measurably raise error rates — which is why proactivity must be value-gated. |
| Notify / Question / Review | The three human-in-the-loop touchpoints for ambient agents: notify (FYI, no action required), question (unblock me — don't guess), review (approve / edit / give feedback on a proposed action). |
| Trust calibration | Aligning the user's perceived reliability of the agent with its actual track record over time, so they neither over-trust (rubber-stamp bad output) nor under-trust (micromanage everything). |
| Where results land | The destination an async result surfaces in — inline toast, agent inbox, draft PR, Slack thread, email, generated document — chosen to be a place the user already works rather than a new silo. |

## Real-world examples

- **Cursor — Background Agents (Cloud Agents)** — Spawn an async agent from the IDE or by @-mentioning `@Cursor` in Slack; it clones your repo into a fresh remote VM, works on its own branch, runs tests, and opens a PR. A Feb 2026 upgrade gives each Cloud Agent a full desktop and browser to verify UI changes visually. Iteration happens by replying in the Slack thread. One practitioner notes it shines for greenfield additions but "quickly falls apart when you need to iterate on its solution or it needs to work in a messy part of the code." [Source](https://cursor.com/changelog/1-1)
- **GitHub Copilot coding agent (async PRs)** — Assign a GitHub issue to Copilot (or @copilot-mention it on a PR); it runs in an ephemeral GitHub Actions environment (hard 59-minute cap), pushes commits to a draft PR, and iterates as you steer it with normal PR review comments. PRs require human approval before any CI/CD workflows run; results ride GitHub's native notifications rather than a bespoke push system. [Source](https://github.blog/changelog/2025-09-25-copilot-coding-agent-is-now-generally-available/)
- **LangChain — Ambient agents + Agent Inbox (email assistant)** — Canonical articulation of the pattern: ambient agents "listen to an event stream and act on it accordingly, potentially acting on multiple events at a time," with three HITL touchpoints — notify, question, and review. The open-source Agent Inbox UI centralizes every open human↔agent line, "modeled after some combination of an email inbox and a customer support ticketing system," built on LangGraph's interrupt primitives. [Source](https://www.langchain.com/blog/introducing-ambient-agents)
- **Granola — AI meeting notes** — Ambient capture without interruption: no bot joins the call; Granola transcribes the computer's audio while you jot sparse notes, then AI enhances those notes into a structured summary with action items afterward — so you stay present in the meeting. The trigger is the calendar event, not a from-scratch click. Raw audio is not stored — a deliberate trust stance for always-listening capture. [Source](https://www.granola.ai/)
- **Gmail — Nudges & Gemini proactive surfacing** — Classic in-context proactive suggestion: Nudges detects emails you received but haven't replied to and, after a few days, bumps the message to the top of the inbox with a prompt asking if you want to reply — a surfaced reminder, not a sent action. User-toggleable in Settings, an explicit control valve on proactivity. [Source](https://blog.google/products-and-platforms/products/gmail/gmail-is-entering-the-gemini-era/)

## CopilotKit & AG-UI mapping

**Primitives:** `useConfigureSuggestions` / `useSuggestions` (in-context nudges), `useHumanInTheLoop` (agent-chosen HITL gate), `useInterrupt` (graph-enforced checkpoint), `useAgent` (run lifecycle + state), `useRenderTool` / `useFrontendTool` (working / delivered states).

For in-context proactive suggestions (the nudge end), `useConfigureSuggestions` (v2) registers dynamic, context-aware suggestion chips — provide `instructions` and `minSuggestions` / `maxSuggestions`, regenerated as app state changes via a `deps` array. Read the current set with `useSuggestions` to render a fully custom chip UI. (v1 equivalent: `useCopilotChatSuggestions`.)

For HITL gates in inbox items, use `useHumanInTheLoop` (v2) when the *agent* chooses to pause — no `handler`; the `render` function receives a `respond` callback in the `Executing` state that the agent waits on. Use `useInterrupt` when the pause is a *graph-enforced* checkpoint (e.g., a LangGraph `interrupt()`) rather than a model decision — this is the declarative primitive that backs an agent-inbox review item. (v1 equivalent: `useLangGraphInterrupt`.)

For activity-log and inbox-list state, `useAgent` (v2) returns the AG-UI agent instance and lets you subscribe to its lifecycle events — drive a custom inbox surface or status badge without a chat window. The AG-UI event stream makes all states designable: `RUN_STARTED` → optional step events → `RUN_FINISHED` / `RUN_ERROR` for working/done/error, and `TOOL_CALL_START` → `TOOL_CALL_ARGS` → `TOOL_CALL_END` → `TOOL_CALL_RESULT` for per-action progress. CopilotKit does not ship a turnkey agent-inbox component or notification-budget governor — the inbox list, toast layer, and daily-cap logic are yours to build.

```tsx
import { useAgent } from "@copilotkit/react-core/v2";
import { useConfigureSuggestions, useSuggestions } from "@copilotkit/react-core/v2";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { useInterrupt } from "@copilotkit/react-core";
import { z } from "zod";

// v1 equivalents: useCopilotChatSuggestions, useLangGraphInterrupt, useCoAgent

function AgentInboxShell({ agentId }: { agentId: string }) {
  // Subscribe to the agent's lifecycle without a chat window
  const { agent } = useAgent({ agentId });
  // agent.state reflects STATE_SNAPSHOT/DELTA events
  // subscribe to RUN_STARTED / RUN_FINISHED / RUN_ERROR to drive inbox item status

  // In-context proactive chips (nudge end) — regenerate when doc changes
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
        <div role="dialog" aria-modal="true" aria-label="Agent review request">
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

  // Graph-enforced interrupt (LangGraph interrupt() checkpoint)
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
      {/* Inline suggestion chips for in-context proactive nudges */}
      <div role="list" aria-label="Suggested actions">
        {suggestions.map((s) => (
          <button key={s.title} role="listitem" onClick={s.onClick}>
            {s.title}
          </button>
        ))}
      </div>

      {/* Custom inbox list — drives status from agent.state and AG-UI events */}
      {/* Toast / notification layer — built outside CopilotKit */}
    </div>
  );
}
```

> AG-UI events in play: `RUN_STARTED` (mark item as running), `RUN_FINISHED` / `RUN_ERROR` (mark delivered or failed), `TOOL_CALL_START/ARGS/END` + `TOOL_CALL_RESULT` (per-step activity log), `STATE_SNAPSHOT/DELTA` (agent state reflected in inbox item), tool-call pause + `useInterrupt` event (HITL gate rendered inline).

## Best practices

- **Budget interruptions like money.** Enforce a per-user daily cap on unsolicited notifications across all sources; make the planner aware of the remaining budget as part of its state; score each candidate by expected-value-minus-disruption before spending. Optimize for notifications *acted on*, not notifications *sent*.
- **Treat a dismissal as a negative signal, not engagement.** Fatigue lags engagement — users tapping "dismiss" today may be churning later. Decrement budget on dismissals and demote signals the user repeatedly ignores.
- **Make where-it-lands a first-class decision.** Send results to tools the user already lives in (PR, inbox, Slack, calendar). Match destination to urgency: ephemeral toast for low-stakes FYI, durable inbox item for decisions, PR for reviewable artifacts.
- **Pair proactivity with explicit HITL gates for anything risky.** Use notify (FYI), question (unblock without guessing), and review (approve / edit / reject) before irreversible or external actions. These gates are the main trust-builder and lower the stakes of shipping autonomy.
- **Calibrate trust progressively.** Start supervised (review every action), show a per-domain track record, and offer autonomy upgrades (auto-merge, no-review) only once performance warrants — then let users dial autonomy per task type. Never silently widen autonomy.
- **Design the latency and working states honestly.** Background runs cold-boot (provisioning, repo clone can take many seconds); show queued → running → done with a pull-open activity log. Failure and timeout are normal states with retry and steer affordances — never let a run vanish silently.
- **Always provide a kill switch and config surface.** An obvious per-source on/off, quiet hours, and a way to tune triggers (rules, ideally backtestable). Notifications must be announced to assistive technology, dismissible by keyboard, never auto-dismissed faster than a screen reader can read, and never reliant on color or motion alone for state.
- **Be transparent about what is being watched.** Keep the privacy posture legible — especially for always-on, observational agents. Disclose local vs. cloud processing, what is stored, and what is deleted. Ambient capture earns trust by being non-intrusive *and* auditable.

## Anti-patterns

- **Notification spam / proactivity without a budget.** Surfacing every signal the model finds "interesting" blows past the user's attention ceiling; users mute, then uninstall, and the launch metric (notifications sent) inverts the retention metric over time.
- **Silent autonomy on high-stakes actions.** Letting a proactive agent send the email, merge the PR, or spend money without a notify / question / review gate. One bad irreversible action destroys trust that took dozens of good outcomes to build.
- **Interrupting mid-flow with low-value nudges.** A modal or toast that breaks deep focus to surface something marginal. The interruption cost (minutes of context recovery, measurably higher error rates) dwarfs the suggestion's value; prefer non-blocking, ignorable surfaces.
- **Burying results in a new silo.** Forcing the user to remember to check a separate dashboard. If output does not land where they already work — or at least ping them there — the agent's work is invisible and effectively did not happen.
- **Faking proactivity with no review path or no off switch.** Surfacing AI output the user cannot easily inspect, correct, dismiss, or disable. Proactive systems must be auditable (activity log) and controllable (config + kill switch), or they read as creepy and uncontrollable.

## Accessibility

- Wrap toast and banner elements in an `aria-live="polite"` region so screen readers announce new notifications after they settle — never `aria-live="assertive"`, which reads every partial update and is unsuitable for streaming content.
- Ensure every notification and nudge is **dismissible by keyboard** (Escape or a visible, focusable close button) and never auto-dismisses faster than a screen reader can read the full text — a minimum of 6 seconds is a useful baseline.
- Render HITL gate dialogs (`useHumanInTheLoop`, `useInterrupt`) with `role="alertdialog"` and `aria-modal="true"`, trap focus within the dialog until the user responds, and return focus to the inbox item or trigger element on close.
- The agent inbox list should be a `role="list"` with each item as a `role="listitem"`; status changes (running → needs-attention → done) must be announced via a live region, not only via color or icon change.
- For always-on observational agents, provide a **persistent status indicator** accessible as a landmark (`role="status"`) so screen-reader users can confirm whether the agent is actively listening without navigating the full settings surface.
- Respect `prefers-reduced-motion`: suppress spinning indicators and transition animations on the inbox and activity log; convey running state with text or a static badge instead of motion.

## Related

- [Side Panel](./side-panel.md) — reactive docked assistant; the pull-model counterpart to ambient push
- [Inline Contextual](./inline-contextual.md) — lightweight in-context assists; shares the nudge end of this spectrum
- [Command Palette](./command-palette.md) — explicit invocation pattern; contrast with push-model trigger
- [Main Panel / Full-Page Chat](./main-panel.md) — dedicated chat when agent interaction is the primary task
- [Split View](./split-view.md) — side-by-side layout for reviewing agent-produced artifacts alongside source
- [Human-in-the-Loop Prompt](../components/human-in-the-loop.md) — the HITL card rendered inside inbox items and thread
- [Agent Activity & Traceability](../components/agent-activity-traceability.md) — the pull-open activity log and step-by-step audit trail
- [Threads / Conversation History](../components/threads-history.md) — persistent thread management for multi-session agents
- [Tool Call](../components/tool-call.md) — per-step tool-call card rendered inside the activity log
- [Suggestions & Capability Surfacing](../components/suggestions-capabilities.md) — suggestion chips at the nudge end of this pattern
- [Sub-agents](../components/sub-agents.md) — orchestrating multiple background agents within a run
- [Deep Research](../components/deep-research.md) — long-running background research pattern
- [Layouts README](./README.md) — "Where AI Sits" placement decision framework and index of all layouts
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary / glossary](../reference/glossary.md)

## Sources

- https://cursor.com/changelog/1-1
- https://cursor.com/docs/cloud-agent
- https://cursor.com/blog/agent-computer-use
- https://swizec.com/blog/cursor-background-agents-in-slack-changed-my-workflow/
- https://github.blog/changelog/2025-09-25-copilot-coding-agent-is-now-generally-available/
- https://github.blog/ai-and-ml/github-copilot/assigning-and-completing-issues-with-coding-agent-in-github-copilot/
- https://docs.github.com/copilot/concepts/agents/coding-agent/about-coding-agent
- https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/
- https://www.granola.ai/
- https://www.langchain.com/blog/introducing-ambient-agents
- https://github.com/langchain-ai/agent-inbox
- https://docs.langchain.com/oss/python/langchain/human-in-the-loop
- https://tianpan.co/blog/2026-05-13-background-agents-notification-budget-attention-economy
- https://www.bprigent.com/article/7-ux-patterns-for-human-oversight-in-ambient-ai-agents
- https://www.aiuxdesign.guide/patterns/trust-calibration
- https://www.bonanza-studios.com/blog/proactive-ai-vs-reactive-ai-in-ux-design
- https://blog.buildbetter.ai/ai-agents-that-watch-you-work-how-personal-ai-learns-from-observation-in-2026/
- https://blog.google/products-and-platforms/products/gmail/gmail-is-entering-the-gemini-era/
- https://docs.ag-ui.com/sdk/js/core/events
- https://www.copilotkit.ai/blog/master-the-17-ag-ui-event-types-for-building-agents-the-right-way
- https://docs.copilotkit.ai/copilot-suggestions
- https://docs.copilotkit.ai/reference/v2/hooks/useConfigureSuggestions
- https://docs.copilotkit.ai/reference/v2/hooks/useSuggestions
- https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop
- https://docs.copilotkit.ai/reference/v2/hooks/useInterrupt
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderToolCall
- https://docs.copilotkit.ai/reference/v2/hooks/useFrontendTool
- https://docs.copilotkit.ai/reference/v2/hooks/useAgent
- https://slack.com/blog/developers/coding-agents-in-slack
