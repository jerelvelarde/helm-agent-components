# Tool Call

> A card or inline block that visualizes an agent invoking a named tool — streaming its arguments, awaiting approval when required, showing execution status, and rendering the result.

**Category:** Component · **Cluster:** Agent reasoning & transparency · **Aliases:** Tool-call card, Tool invocation UI, Function-call rendering, Tool use block, Action card

## Definition

A Tool Call component is the UI surface that represents a single agent-to-tool invocation from initiation through result. It solves the transparency problem: without it, tool execution is invisible, leaving users unable to audit, trust, or intervene in agent actions. The component appears inline in the chat thread and progresses through a lifecycle driven directly by AG-UI `TOOL_CALL_*` events: arguments stream in as partial JSON, the call enters an optional human-approval gate, executes, and resolves with either a result or an error. It may render a generic JSON card via a wildcard fallback or a fully custom React component keyed to the tool name.

## When to use / when not to

- **Use** whenever an agent invokes a named tool, especially for actions with side effects — file writes, API calls, database mutations, payment flows, terminal commands.
- **Use** a custom renderer (generative UI) for high-value tools where rich output meaningfully improves comprehension: diffs, charts, maps, approval forms.
- **Use** a HITL gate for any destructive or irreversible operation — deletes, sends, deploys — and for tools with significant external consequences.
- **Do not** hide tool calls and surface only the final assistant response; concealing agent actions erodes trust and makes debugging impossible.
- **Do not** build a bespoke renderer for every incidental internal tool; use `useDefaultRenderTool` or a wildcard renderer to handle low-value calls without design overhead.

## Anatomy

```
┌─────────────────────────────────────────────────────────┐
│ [Icon] Tool name               [Status badge]  [▾]      │  ← Header row
├─────────────────────────────────────────────────────────┤
│  Arguments                                              │  ← Argument block
│  ┌──────────────────────────────────────────────────┐   │    (streaming JSON or
│  │  { "query": "Q4 revenue by region"… }            │   │     typed fields)
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  [Custom renderer or collapsible JSON result]           │  ← Result block
│  ┌──────────────────────────────────────────────────┐   │
│  │  (chart / diff / approval form / raw output)     │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  [Approve]  [Reject]   ← HITL gate (awaiting-approval)  │  ← Action row
│  [Retry]               ← error state only               │
└─────────────────────────────────────────────────────────┘
```

**Parts:**
- **Header row** — tool name (human-readable), status badge, collapse toggle.
- **Argument block** — streamed or resolved arguments; may be raw JSON or labeled fields.
- **Result block** — custom generative-UI renderer for this tool, or a collapsible default card; absent until `Complete`.
- **Action row** — Approve / Reject buttons (HITL gate) or Retry (error state); hidden in normal flow.
- **Status badge** — current lifecycle phase; drives color and icon (e.g., spinner for `executing`, check for `complete`, warning icon for error).

**Two densities.** The same lifecycle renders at two levels of chrome: a **full card** for high-value tools whose output earns the space (diffs, charts, approval forms), and a **compact line** — a status glyph, the tool name, and a one-line summary that expands on demand — for routine or low-value calls. The line is the natural shape for `useDefaultRenderTool`; collapsing it by default keeps a long transcript glanceable.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle / not invoked | No `TOOL_CALL_START` received | Component not mounted |
| Input-streaming | `TOOL_CALL_START` → `TOOL_CALL_ARGS` deltas arriving | Spinner on header; argument block renders partial JSON live; badge = "Streaming…" |
| Input-available / ready | `TOOL_CALL_END` received; no HITL gate | Args fully rendered; brief "Ready" badge before execution begins |
| Awaiting-approval | HITL tool reaches `Executing` status | Approve / Reject / Edit buttons visible; card has warning or accent border; execution blocked |
| Running / executing | Tool handler actively running (`Executing` status, no HITL) | Spinner on status badge; args locked; result block shows skeleton |
| Output-available / complete | `TOOL_CALL_RESULT` received (`Complete` status) | Result block renders; spinner replaced with check; card optionally collapsed |
| Output-error | `TOOL_CALL_RESULT` with error, or run terminated abnormally | Error message inline; badge = "Failed"; Retry button visible |

## Vocabulary

| Term | Definition |
|---|---|
| Tool call / function call | The model's structured request to execute a named tool with typed arguments. |
| Streaming arguments (partial JSON) | Tool arguments rendered incrementally as the model emits delta fragments before the JSON is syntactically complete. |
| Tool result / output | The value returned from executing the tool, fed back to the model and rendered in the card's result block. |
| `ToolCallStatus` | CopilotKit's three-phase enum: `InProgress` (args streaming), `Executing` (args resolved; tool running or HITL paused), `Complete` (result available). |
| Generative UI / custom renderer | Replacing the default JSON card with a bespoke React component keyed to the tool name, registered via `useRenderTool`. |
| Wildcard / catch-all renderer | A fallback renderer registered with name `"*"` that handles any tool without a dedicated component. |
| Human-in-the-loop (HITL) tool | A tool whose render function receives a `respond` callback; execution is blocked until `respond(...)` is called, pausing the agent at `Executing` status. |
| Approval / allowlist | A consent gate before a sensitive tool runs; allowlisting lets pre-approved commands bypass the gate automatically. |
| Retry | Re-issuing a failed tool call from the error state, typically via a button that re-triggers the same call. |

## Real-world examples

- **assistant-ui** — `makeAssistantToolUI({ toolName, render })` registers a per-tool component whose `render` receives `args`, `result`, `isError`, an `addResult` callback for HITL, and a `status` object with type `running | complete | incomplete | requires-action`. The `useToolArgsStatus` hook exposes a per-field `propStatus` map (`'streaming' → 'complete'`) as partial JSON arrives. [https://www.assistant-ui.com/docs/guides/tool-ui](https://www.assistant-ui.com/docs/guides/tool-ui)
- **Cursor (Agent)** — Renders each tool call inline (terminal, file edits, search) with diffs shown before apply. Allowlisted commands run immediately; others are gated by an LLM safety classifier with a "Run in Sandbox" or "Run Everything" mode toggle — an explicit layered approval model directly on the card. [https://cursor.com/docs/agent/tools/terminal](https://cursor.com/docs/agent/tools/terminal)
- **GitHub Copilot agent mode (VS Code)** — Every tool invocation is transparently shown in chat; terminal commands require a "Run in Terminal" confirmation the user can edit before accepting. An "Undo Last Edit" control in the view title bar reverts to the state before the most recent file-edit tool call. [https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode](https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode)

## CopilotKit & AG-UI mapping

**AG-UI event sequence** that drives this component:

```
TOOL_CALL_START  → card mounts, name visible, status = InProgress
TOOL_CALL_ARGS   → arguments stream into argument block (partial JSON)
TOOL_CALL_END    → args resolved, status = Executing (or awaiting-approval for HITL)
TOOL_CALL_RESULT → result rendered, status = Complete
```

**Hooks:**
- `useRenderTool` (v2) — register a renderer for a named tool or `"*"` wildcard. Rendering only; no handler.
- `useDefaultRenderTool` — built-in collapsible JSON card for any tool without a dedicated renderer.
- `useHumanInTheLoop` (v2) — pauses agent at `Executing` until `respond(...)` is called; no `handler`.
- `useFrontendTool` (v2) — for browser-side tools with a handler; accepts an optional `render`.
- v1 equivalents: `useCopilotAction({ render })` for rendering; `useCopilotAction({ renderAndWaitForResponse })` for HITL.

```tsx
import { useRenderTool, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Named renderer for a backend search tool
useRenderTool({
  name: "search_documents",
  parameters: z.object({ query: z.string(), topK: z.number().optional() }),
  render: ({ status, args, result }) => {
    if (status === "inProgress") {
      return (
        <ToolCard
          title={`Searching${args.query ? ` "${args.query}"` : "…"}`}
          state="streaming"
        />
      );
    }
    if (status === "executing") {
      return <ToolCard title={`Searching "${args.query}"`} state="running" />;
    }
    // status === "complete"
    return (
      <ToolCard
        title={`Results for "${args.query}"`}
        state="complete"
        result={result}
      />
    );
  },
});

// HITL gate for a destructive operation
useHumanInTheLoop({
  name: "delete_records",
  parameters: z.object({ ids: z.array(z.string()), reason: z.string() }),
  render: ({ status, args, respond }) =>
    status === "executing" ? (
      <ApprovalCard
        action={`Delete ${args.ids?.length ?? "?"} records`}
        reason={args.reason}
        onApprove={() => respond?.("approved")}
        onReject={() => respond?.("rejected")}
      />
    ) : (
      <ToolCard title="Delete records" state={status} />
    ),
});
```

*v1 equivalents: `useCopilotAction({ name, parameters: [...], render })` for rendering; `useCopilotAction({ renderAndWaitForResponse })` for HITL.*

## Best practices

- Drive the card off an explicit three-phase state machine (`InProgress → Executing → Complete` / error) and render a visually distinct treatment at each phase — a user glancing at the transcript must immediately understand where the call stands.
- Stream partial arguments visibly so the agent's intent is legible before the call executes; a blank card with a spinner gives users nothing to act on.
- Gate every destructive or irreversible tool behind an explicit approval UI; make the consequence concrete in the card copy ("Delete 47 records permanently") not abstract ("Confirm action"). Support an allowlist for trusted, repetitive commands to avoid approval fatigue.
- Surface errors inline with the reason and a one-click Retry; never silently swallow a failed call or leave the card in a perpetual streaming state.
- Build custom generative-UI renderers for high-value tools (diffs, charts, maps, approval forms) and fall back to `useDefaultRenderTool` or a wildcard `"*"` renderer for low-value internal calls — invest design effort proportionally.
- Keep result payloads collapsed by default with a human-readable summary visible in the header; expand-on-demand prevents the transcript from becoming unreadable when tools return large payloads.
- Provide an undo affordance for file edits and mutations where technically feasible; "Undo Last Edit" (Copilot pattern) prevents an unwanted tool action from being permanent.
- Announce state transitions (`aria-live="polite"`) — "Running…", "Done", "Failed — retry available" — so screen-reader users are not excluded from the agent's activity stream.

## Anti-patterns

- **Raw JSON dumps** — Rendering unformatted argument and result JSON as the only representation of a tool call. Labels, collapsing, and type-specific formatting are non-negotiable for usability.
- **Ungated destructive tools** — Auto-running file writes, shell commands, payments, or sends without an approval step. Equivalently bad: an approval gate that is so frequent and uniform users develop reflexive click-through ("approval fatigue").
- **Stuck streaming state** — Failing to drive the card to a terminal state (`Complete` or error) when the backend returns malformed input or times out. Invalid tool input can leave the call streaming indefinitely; always time out and render an error.
- **Hidden tool calls** — Suppressing the card entirely so the final answer appears to materialize from nothing. This destroys auditability and trust, especially in regulated or high-stakes domains.
- **Premature result rendering** — Showing the result block before a result actually exists, or labeling the card "Complete" when `TOOL_CALL_RESULT` has not arrived. Bind result rendering strictly to `status === "complete"`.

## Accessibility

- Wrap the card in a `role="status"` or `role="log"` region and attach an `aria-live="polite"` live region so screen readers announce state transitions ("Searching documents… Done.") without interrupting active reading.
- Make Approve, Reject, and Retry interactive elements real `<button>` elements — not `<div>` click targets — so they are keyboard-focusable and appear in the Tab order immediately after the card that triggered them.
- Use `aria-label` on the status badge icon to convey meaning beyond color ("Running", "Complete", "Failed") — never rely on color alone.
- When a HITL approval card appears, move focus to the card's primary action button or the heading so keyboard and screen-reader users are not left at an arbitrary position in the thread.
- Respect `prefers-reduced-motion`: suppress spinner animations and skeleton shimmer; a static "Running…" label is sufficient for users who have opted out of motion.
- For collapsible argument/result blocks, use `aria-expanded` on the toggle and associate the controlled region via `aria-controls` so the expand/collapse state is communicated to assistive technology.

## Related

- [./thinking-reasoning.md](./thinking-reasoning.md) — chain-of-thought disclosure that often precedes a tool call in the same turn.
- [./generative-ui-inline.md](./generative-ui-inline.md) — the static generative-UI component mounted inside the result block for high-value tools.
- [./human-in-the-loop.md](./human-in-the-loop.md) — the full HITL pattern: approval prompts, blocking modals, interrupt-based gates.
- [./agent-activity-traceability.md](./agent-activity-traceability.md) — higher-level activity log and audit trail that aggregates multiple tool calls.
- [./sub-agents.md](./sub-agents.md) — multi-agent orchestration, where tool calls may themselves spawn sub-agent runs.
- [./web-research.md](./web-research.md) — search and fetch tools rendered as tool-call cards with streaming results.
- [../reference/copilotkit-primitives.md](../reference/copilotkit-primitives.md) — `useRenderTool`, `useHumanInTheLoop`, `ToolCallStatus` API reference.
- [../reference/ag-ui-protocol.md](../reference/ag-ui-protocol.md) — `TOOL_CALL_START/ARGS/END/RESULT` event definitions.

## Sources

- https://www.assistant-ui.com/docs/guides/tool-ui
- https://cursor.com/docs/agent/tools/terminal
- https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderToolCall
- https://docs.ag-ui.com/concepts/events
