# Inline Generative UI (Static / Controlled)

> The agent selects a typed, hand-built React component at runtime and fills its props from tool-call arguments, rendering it directly in the conversation thread.

**Category:** Component · **Cluster:** Generative & Inline UI · **Aliases:** GenUI, Generative UI, Tool-based generative UI, Tool cards, Static generative UI, Display-only generative UI, LLM-rendered components, Tool-result rendering

---

## Definition

Inline generative UI is the pattern where an agent, mid-conversation, triggers a React component to appear directly in the message thread by invoking a named tool and streaming its arguments as props. The component can be purely presentational (a weather card, a chart, a search-result list) or interactive (a form, a button group, a confirmation prompt). In CopilotKit's generative-UI taxonomy this file covers the **Static** end of the spectrum — the developer predefines a fixed vocabulary of hand-built, typed components; the model picks which one to show and fills its fields. The central problem solved: replacing raw JSON or plain-text tool output with a branded, structured UI surface that communicates status, data, and affordances without leaving the conversation.

---

## When to use / when not to

- **Use it** when a tool call's result is inherently visual — a data chart, a flight itinerary, a code diff, a product card — and prose can't convey it efficiently.
- **Use it** when you need predictable, brand-consistent UI surfaces; the Static type ensures the agent can never produce a layout you haven't approved.
- **Use it** for interactive inline workflows — approval prompts, slot-filling forms, quick selections — where the agent must pause and collect a discrete user decision before continuing.
- **Do not use it** when the result is naturally textual and a formatted message bubble suffices; over-engineering every tool call into a card adds visual noise.
- **Do not use it** (Static type) when you need the agent to compose novel layouts from building blocks the developer hasn't hand-coded; reach for Declarative or Open-Ended generative UI instead.
- **Do not use it** when a tool call's output is purely internal (used only to influence the next model turn) and exposing it to the user adds no value.

---

## Anatomy

```
┌─────────────────────────────────────────────────────────┐
│  Message thread                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  TOOL CARD                                         │  │
│  │  ┌──────────┬──────────────────────────────────┐  │  │
│  │  │ Status   │  Card header / tool name          │  │  │
│  │  │ indicator│  (optional: collapse/expand btn)  │  │  │
│  │  ├──────────┴──────────────────────────────────┤  │  │
│  │  │  Body — rendered from args/result props      │  │  │
│  │  │  (chart, table, form fields, buttons, etc.)  │  │  │
│  │  │                                              │  │  │
│  │  │  [Skeleton placeholder while streaming]      │  │  │
│  │  ├─────────────────────────────────────────────┤  │  │
│  │  │  Footer — source/citation chips, timestamp   │  │  │
│  │  │           or interactive action buttons      │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│  [ Next message bubble … ]                               │
└─────────────────────────────────────────────────────────┘
```

**Parts:**

- **Status indicator** — spinner (InProgress/Executing) or checkmark/badge (Complete); conveys where the call is in its lifecycle.
- **Card header** — tool name or human-readable label; optional collapse/expand toggle to show raw args for debugging.
- **Body** — the render-function output: chart, table, form, etc., built from the tool's streamed `args` and eventual `result`.
- **Skeleton state** — shape-matched placeholder shown during `InProgress` (args still streaming) to prevent layout shift.
- **Footer** — source/citation chips, provenance timestamp, and — for interactive cards — action buttons that call back into the agent via a `respond` callback.

---

## States

| State | Trigger | UI treatment |
|---|---|---|
| **Idle / registered** | Tool declared but not yet called | Component dormant; not visible in thread |
| **InProgress** (`"inProgress"`) | `TOOL_CALL_START` → `TOOL_CALL_ARGS` delta stream | Skeleton matching final card shape; args arrive as `Partial<T>`; no interaction |
| **Executing** (`"executing"`) | `TOOL_CALL_END` — args fully received, tool running | Spinner/progress affordance; args `T` fully available; for interactive cards, `respond` callback becomes available |
| **Complete** (`"complete"`) | `TOOL_CALL_RESULT` | Result bound and rendered; status badge; controls enabled if interactive |
| **Empty** | Tool returned no data | Empty-state card with explanatory copy; no broken layout |
| **Error** | Tool call failed | Error card with retry affordance; never a raw stack trace in the thread |
| **Collapsed / Expanded** | User toggles | Compact summary vs. full payload (arguments, logs, raw result) |

---

## Vocabulary

| Term | Definition |
|---|---|
| **Static generative UI** | The highest-control type in CopilotKit's taxonomy: the developer defines a fixed set of typed components; the model picks which one to call and fills its props. No novel layouts; maximum predictability. |
| **Tool card** | The branded inline component (status + args + result) that renders in the thread in place of raw JSON or text output. |
| **Render function** | The developer-supplied function bound to a tool that maps `{name, args, status, result}` to JSX. Registered via `useRenderTool` or `useComponent`. |
| **ToolCallStatus** | The three-phase lifecycle enum exported by CopilotKit v2: `InProgress` (args streaming), `Executing` (args resolved, work running), `Complete` (result available). |
| **Streaming args / partial args** | Tool arguments arrive token-by-token as JSON deltas (`TOOL_CALL_ARGS` events); the render function receives a `Partial<T>` object before the call is final. |
| **Skeleton state** | A shape-matched placeholder rendered during `InProgress` to hold layout while args stream in, preventing reflow. |
| **Wildcard renderer** | A `"*"`-named renderer that catches any tool call without a specific registration, preventing raw JSON fallback. |
| **Display-only / render-only** | A component registered purely to visualize tool args/results with no handler and no callback into the agent. |
| **Respond / addResult callback** | The callback handed to an interactive component that sends the user's choice back to the agent, resolving the tool call and unblocking the run. Available in the `Executing` state of `useHumanInTheLoop`. |
| **Result binding** | Connecting the tool's returned data (`result: string`) to the component's final render, triggered by `TOOL_CALL_RESULT`. |
| **Source / citation chip** | An inline reference attached to a result card linking back to the data's provenance (URL, document, database row). |
| **Generative-UI loop** | The round-trip where an interactive inline widget collects user input and feeds it back to the agent, turning rendering into a bidirectional interaction. |
| **Control-vs-freedom spectrum** | CopilotKit's taxonomy axis: Static (fixed hand-built components) → Declarative (bounded structured specs) → Open-Ended (arbitrary HTML/iframes). |
| **Default / zero-config rendering** | The generic fallback card (`useDefaultRenderTool`) that shows a tool's name, arguments, and result when no custom renderer is registered. |

---

## Real-world examples

- **Perplexity (Finance & answers)** — Finance asset pages embed inline quote cards, upgraded price charts (OHLCV tooltips, candlestick/area toggle, SMA overlay), market heatmaps, peer comparisons, earnings summaries, and numbered citation chips. The conversational answer wraps the cards; the cards own the data visualization. [perplexity.ai/finance](https://www.perplexity.ai/finance)
- **CopilotKit (tool rendering)** — Per the docs, `useComponent` registers a React component (e.g. a Recharts chart) that renders from the agent's args with no handler required; `useRenderTool` and a `"*"` wildcard ensure no tool call ever degrades to raw JSON. [docs.copilotkit.ai/generative-ui/display](https://docs.copilotkit.ai/generative-ui/display)
- **assistant-ui** — `makeAssistantToolUI` (and the newer `Tools()` API) binds a tool name to a render component typed as `ToolCallMessagePartProps<TArgs, TResult>`; the render function receives `args`, `result`, a `status` string (`'running' | 'complete' | 'incomplete' | 'requires-action'`), and an `addResult` callback for HITL. `useToolArgsStatus` enables per-field progressive reveal as args stream in. [assistant-ui.com/docs/guides/tool-ui](https://www.assistant-ui.com/docs/guides/tool-ui)
- **Microsoft Copilot (declarative agents)** — UX guidelines mandate an "inline mode" where widgets appear before the model's text response; widgets must show explicit loading/disabled/success/error states and expose at most two actions. Adaptive Cards emit JSON-based interactive surfaces inline; each Submit action includes unique identifying data for correct resolution when multiple cards are visible. [learn.microsoft.com — declarative-agent-ui-widgets-guidelines](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/declarative-agent-ui-widgets-guidelines)
- **OpenAI ChatKit widgets** — JSON-defined widget trees (`WidgetRoot` containing `WidgetNode` components: cards, lists, forms, buttons) streamed from the backend; clicking a button sends a custom action payload back to the app's backend. The Apps SDK (over MCP) embeds interactive surfaces inside ChatGPT. [developers.openai.com/api/docs/guides/chatkit-widgets](https://developers.openai.com/api/docs/guides/chatkit-widgets)
- **Claude / GitHub Copilot Chat** — Tool invocations render as structured, mostly read-only status blocks (collapsible "searched the web", "ran code", "read file" affordances) inline in the transcript, keeping the thread scannable without exposing raw output. [docs.github.com — copilot-chat](https://docs.github.com/en/copilot/using-github-copilot/copilot-chat)

---

## CopilotKit & AG-UI mapping

**Static generative UI maps to:** `useRenderTool` / `useComponent` (v2) on top of the `TOOL_CALL_*` AG-UI event sequence.

**Event skeleton:**
```
TOOL_CALL_START → TOOL_CALL_ARGS (deltas) → TOOL_CALL_END → TOOL_CALL_RESULT
     InProgress          InProgress              Executing       Complete
```

**Key primitives (v2, from `@copilotkit/react-core/v2`):**

- `useRenderTool` — named renderer (typed Zod `parameters`) or wildcard `"*"` fallback; render-only, no handler.
- `useComponent` — convenience wrapper that registers a component directly from tool args (no handler).
- `useDefaultRenderTool` — zero-config generic card for any unregistered tool.
- `useRenderToolCall` — internal resolution; rarely called directly.
- `useFrontendTool` — when you need both a `handler` (browser-side side effect) *and* a `render` (inline UI).
- `useHumanInTheLoop` — interactive variant where the render receives a `respond` callback in the `Executing` state; agent is paused until `respond` is called.

**v1 equivalent:** `useCopilotAction({ name, parameters, render })` with no `handler` for display-only; `useCopilotAction({ renderAndWaitForResponse })` for interactive/HITL.

**`ToolCallStatus` enum:** `InProgress` | `Executing` | `Complete` (exported from `@copilotkit/react-core/v2`).

```tsx
import { useRenderTool, useDefaultRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Named, typed renderer — renders a stock quote card for the `get_quote` tool.
// AG-UI events: TOOL_CALL_START → TOOL_CALL_ARGS → TOOL_CALL_END → TOOL_CALL_RESULT
useRenderTool({
  name: "get_quote",
  parameters: z.object({
    ticker: z.string(),
    price: z.number().optional(),
    change: z.number().optional(),
  }),
  render: ({ status, args, result }) => {
    if (status === "inProgress") {
      // Skeleton — shape matches the final card to prevent layout shift
      return <QuoteCardSkeleton ticker={args.ticker} />;
    }
    if (status === "executing") {
      return <QuoteCard ticker={args.ticker} loading />;
    }
    // status === "complete"
    const data = result ? JSON.parse(result) : args;
    return <QuoteCard ticker={data.ticker} price={data.price} change={data.change} />;
  },
});

// Wildcard fallback — catches any tool call without a specific renderer.
// Prevents raw JSON from ever appearing in the thread.
useDefaultRenderTool(); // zero-config generic card
// — or a custom wildcard —
useRenderTool({
  name: "*",
  render: ({ name, args, status }) => (
    <GenericToolCard name={name} args={args} status={status} />
  ),
});
```

v1 equivalent: `useCopilotAction({ name: "get_quote", parameters: [...], render: ({ status, args }) => <QuoteCard ... /> })`.

Relevant AG-UI events: `TOOL_CALL_START`, `TOOL_CALL_ARGS` (delta-accumulated JSON), `TOOL_CALL_END`, `TOOL_CALL_RESULT`. These map exactly to the `InProgress → Executing → Complete` status machine.

---

## Best practices

- **Render a shape-matched skeleton on `TOOL_CALL_START`** — don't wait for `TOOL_CALL_END` to mount the card. The skeleton should mirror the final card's dimensions so the thread doesn't reflow when args resolve.
- **Always register a wildcard renderer** — either `useDefaultRenderTool()` or a custom `useRenderTool({ name: "*", ... })`. Raw JSON appearing in the thread is a hard failure mode, not a graceful degradation.
- **Validate streaming args against a Zod schema before rendering** — treat partial args as potentially malformed. Guard every optional field in the render function; a half-streamed prop should never crash the component.
- **Never re-mount the component on each arg delta** — update props in place. Re-mounting on every `TOOL_CALL_ARGS` event causes flicker, loses focus state in interactive cards, and breaks streaming animations.
- **For interactive components, call `respond` exactly once** — disable all controls immediately after submission and show a confirmed state. Double-firing `respond` corrupts the agent's tool-call resolution.
- **Keep display-only cards genuinely side-effect-free on mount** — if you need to trigger a side effect (navigation, mutation), wire it to an explicit user action, not to the card rendering. This keeps re-renders during streaming safe.
- **Attach provenance to every data card** — surface the tool name, originating arguments, source URLs, or timestamps as citation chips. Users cannot evaluate trust without knowing where data came from.
- **Gate destructive actions behind explicit confirmation** — inline action buttons that write, delete, or send should use `useHumanInTheLoop` (or a local confirm step) rather than auto-firing from `Complete` state.
- **Define explicit empty and error states** — a tool returning zero results is not the same as a tool that failed; show distinct empty-state copy and an error card with retry rather than leaving a blank or perpetually-loading card.

---

## Anti-patterns

- **Dumping raw tool-call JSON or stack traces into the thread** when no renderer matches — always register a wildcard fallback to prevent this.
- **Re-mounting the entire component on every `TOOL_CALL_ARGS` delta** — causes visible flicker, breaks keyboard focus inside interactive cards, and makes progressive-reveal impossible.
- **Letting streamed args directly trigger irreversible side effects** (API writes, emails sent, files deleted) without validation or an explicit human confirmation step — partial args are untrusted input.
- **Skipping empty and error states** so a failed or zero-result tool call renders a broken, blank, or indefinitely-spinning card.
- **Embedding charts and data tables with no accessible text equivalent** — invisible to screen readers and to users who disable visual styling; always provide a text summary or accessible data table alongside visual outputs.

---

## Accessibility

- **Region role and accessible name** — wrap each tool card in a `<section aria-label="...">` or equivalent landmark; the label should identify the tool (e.g. "Stock quote for AAPL") so screen-reader users can navigate between cards.
- **Live region for status transitions** — announce `InProgress → Executing → Complete` state changes via an `aria-live="polite"` region so screen readers report completion without interrupting ongoing narration. Use `aria-busy="true"` on the card container during InProgress/Executing.
- **Keyboard access to all controls** — interactive cards (forms, buttons, confirmations) must be fully operable via keyboard in DOM source order. Do not trap focus inside a streaming card; focus should flow naturally through the thread.
- **Collapse/expand as a real button** — the toggle between summary and full payload must be a `<button>` with `aria-expanded` and a descriptive `aria-label`; never implement it as a click-on-div.
- **Charts and visuals must have text alternatives** — provide either an `aria-label` describing the key finding, a visually-hidden data table, or a `<figcaption>` so the visualization is not the only vehicle for the data.
- **Reduced motion** — wrap animations (skeleton shimmer, spinner, result fade-in) in `@media (prefers-reduced-motion: reduce)` and substitute instant swaps or simple opacity changes.

---

## Related

- [./tool-call.md](./tool-call.md) — Tool Call (generic tool-call card anatomy and status lifecycle)
- [./human-in-the-loop.md](./human-in-the-loop.md) — Human-in-the-Loop Prompt (interactive `respond`-callback pattern)
- [./thinking-reasoning.md](./thinking-reasoning.md) — Thinking / Reasoning Display (co-rendered with tool calls in agentic traces)
- [./agent-activity-traceability.md](./agent-activity-traceability.md) — Agent Status, Activity & Traceability (multi-step progress wrapping tool renders)
- [./chat-message.md](./chat-message.md) — Chat Message (the surrounding message thread)
- [./suggestions-capabilities.md](./suggestions-capabilities.md) — Suggestions & Capability Surfacing (post-result next-best-action prompts)
- [./web-research.md](./web-research.md) — Web Research / Search (tool cards for search result sets)
- [./deep-research.md](./deep-research.md) — Deep Research (multi-step research rendered as inline progress + result cards)
- [../layouts/canvas-workspace.md](../layouts/canvas-workspace.md) — Canvas / Workspace & Artifacts (when tool results render outside the thread)
- [../reference/copilotkit-primitives.md](../reference/copilotkit-primitives.md) — CopilotKit primitive reference
- [../reference/ag-ui-protocol.md](../reference/ag-ui-protocol.md) — AG-UI protocol reference
- [../reference/glossary.md](../reference/glossary.md) — Master vocabulary

---

## Sources

- https://docs.copilotkit.ai/generative-ui/display
- https://docs.copilotkit.ai/learn/generative-ui
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderToolCall
- https://docs.ag-ui.com/concepts/events
- https://www.perplexity.ai/finance
- https://www.assistant-ui.com/docs/guides/tool-ui
- https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/declarative-agent-ui-widgets-guidelines
- https://developers.openai.com/api/docs/guides/chatkit-widgets
- https://docs.github.com/en/copilot/using-github-copilot/copilot-chat
