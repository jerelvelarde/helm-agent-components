# CopilotKit Primitive Reference

> The verified mapping between this design system's components and CopilotKit's React primitives + the AG-UI protocol. Every component file links here instead of re-deriving the API. Reflects the **v1 (classic)** and **v2 (recommended)** hook sets as documented at [docs.copilotkit.ai](https://docs.copilotkit.ai). Where a hook exists in both, v2 is shown first and v1 noted as "still supported."

---

## What CopilotKit is, and where it sits

CopilotKit is a React UI layer + runtime for building agent-native applications. It renders the chat surface, streams tokens, renders tool calls as components, manages threads, and brokers human-in-the-loop. Under the hood it speaks **[AG-UI](https://docs.ag-ui.com)** — the open Agent–User Interaction protocol — so the same UI works across LangGraph, CrewAI, Mastra, Google ADK, Microsoft Agent Framework, LlamaIndex, AG2, Pydantic AI, and CopilotKit's own built-in agent. See [`ag-ui-protocol.md`](./ag-ui-protocol.md) for the wire-level event model.

```
┌─────────────────────────────────────────────────────────┐
│  Your React app                                          │
│  ┌─────────────────┐   hooks: useFrontendTool,           │
│  │ CopilotChat /   │   useRenderTool, useHumanInTheLoop, │
│  │ CopilotSidebar  │   useAgent (shared state), …        │
│  └────────┬────────┘                                     │
│           │  AG-UI events (TEXT_MESSAGE_*, TOOL_CALL_*,   │
│           │  STATE_SNAPSHOT/DELTA, RUN_*, THINKING_*)     │
│  ┌────────┴────────┐                                     │
│  │ CopilotRuntime  │  (Next.js route handler / Node)      │
│  └────────┬────────┘                                     │
└───────────┼─────────────────────────────────────────────┘
            │  framework adapter / MCP connectors / A2A
        ┌───┴────┐
        │ Agent  │  LangGraph · CrewAI · Mastra · ADK · …
        └────────┘
```

### v1 vs v2 at a glance

| Concern | v2 (recommended) | v1 (still supported) | Import |
|---|---|---|---|
| Client-side tool (handler) | `useFrontendTool` | `useCopilotAction` | `@copilotkit/react-core` |
| Render a tool call in chat | `useRenderTool` / `useDefaultRenderTool` / `useComponent` | `useCopilotAction({ render })` | `@copilotkit/react-core/v2` |
| Human-in-the-loop (tool) | `useHumanInTheLoop` | `useHumanInTheLoop` / `useCopilotAction({ renderAndWaitForResponse })` | `@copilotkit/react-core/v2` |
| Framework interrupt HITL | `useInterrupt` | `useLangGraphInterrupt` (legacy) | `@copilotkit/react-core` |
| Shared agent state | `useAgent` → `agent.state` / `agent.setState` | `useCoAgent` | `@copilotkit/react-core/v2` |
| App→agent readable context | `useCopilotReadable` | `useCopilotReadable` | `@copilotkit/react-core` |
| Suggestions | `useConfigureSuggestions` / `useSuggestions` | `useCopilotChatSuggestions` | `@copilotkit/react-core/v2` |
| Headless chat state | `useAgent` + `useCopilotKit` | `useCopilotChat` / `useCopilotChatHeadless_c` | — |
| Chat components | `CopilotChat`, `CopilotSidebar`, `CopilotPopup`, `CopilotChatView`, `CopilotSidebarView`, `CopilotChatToggleButton` | `CopilotSidebar`, `CopilotPopup`, `CopilotChat`, `CopilotTextarea` | `@copilotkit/react-ui` / v2 |
| Styles | `@copilotkit/react-core/v2/styles.css` | `@copilotkit/react-ui/styles.css` | — |

> **When you write code examples in a component file, prefer the v2 hook and add a one-line "v1 equivalent" note.** Do not invent hook names — if unsure, describe the capability and link the relevant docs page.

---

## 1. Frontend tools (the agent acts in the browser)

`useFrontendTool` (v2) registers a client-side tool the agent can call. The `handler` runs in the browser; an optional `render` shows progress/result in the chat. Parameters are a **Zod** schema in v2 (plain parameter arrays in v1's `useCopilotAction`).

```tsx
import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

useFrontendTool({
  name: "highlightRange",
  description: "Highlight a date range on the active chart",
  parameters: z.object({ from: z.string(), to: z.string() }),
  handler: async ({ from, to }) => chart.highlight(from, to), // runs in the browser
  render: ({ status, args }) => <HighlightBadge status={status} {...args} />, // optional
});
```

- **v1 equivalent:** `useCopilotAction({ name, parameters: [...], handler, render })`.
- Backend/server-side tools live in the agent; you render them with `useRenderTool` (below), not `useFrontendTool`.

---

## 2. Tool-call rendering & the `ToolCallStatus` lifecycle

This is the backbone for the **Tool Call**, **Thinking**, **Generative UI**, **Web/Deep Research** and **Sub-agent** components.

- `useRenderTool` — register a renderer for a **named** tool (typed Zod `parameters`) or a wildcard `"*"` fallback. Rendering only — no handler. Use for backend tool calls.
- `useDefaultRenderTool` — the generic fallback card for any tool without a specific renderer.
- `useComponent` — convenience wrapper that renders a React component straight from tool args.
- `useRenderToolCall` — returns the renderer function; chat UIs call it internally. You rarely call it directly.

```tsx
import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

useRenderTool({
  name: "search_web",
  parameters: z.object({ query: z.string() }),
  render: ({ status, args, result }) => (
    <ToolCard status={status} title={`Searching “${args.query}”`} result={result} />
  ),
});
```

### `ToolCallStatus` (exported from `@copilotkit/react-core/v2`)

| Status | Meaning | `args` | `result` |
|---|---|---|---|
| `InProgress` (`"inProgress"`) | Arguments are still streaming; tool hasn't run | `Partial<T>` | `undefined` |
| `Executing` (`"executing"`) | Args resolved; tool running. For HITL, `respond` is available here | `T` | `undefined` |
| `Complete` (`"complete"`) | Finished; result available | `T` | `string` |

`render` receives one of: `{ status: "inProgress", args: Partial<T>, result: undefined }`, `{ status: "executing", args: T, result: undefined }`, `{ status: "complete", args: T, result: string }`. `name` is always present. This three-phase machine is what every tool-call card, streaming indicator, and "thinking" disclosure keys off.

---

## 3. Generative UI — the three types

CopilotKit frames generative UI on two axes — **freedom** (vocabulary of UI the agent can express) and **control** (app-defined vs. agent-defined). Three types ([docs](https://docs.copilotkit.ai/learn/generative-ui)):

| Type | Definition | Use it for | Ecosystem spec |
|---|---|---|---|
| **Static** | UI is chosen from a **fixed set of hand-built components**. The model picks which typed component to mount and fills its props. Maximum control, minimum freedom. | Production surfaces, brand-consistent widgets, the "controlled generative UI" most copilots ship. | — (native `useRenderTool` / `useComponent`) |
| **Declarative** | A **structured UI spec** (cards, lists, forms, widgets) is exchanged; the app validates and mounts it. Middle ground. | Agent-composed dashboards/forms where layout varies but vocabulary is bounded. | [A2UI](https://docs.copilotkit.ai/learn/generative-ui/specs/a2ui), [Open-JSON-UI](https://docs.copilotkit.ai/learn/generative-ui/specs/open-json-ui) (OpenAI), [MCP-Apps](https://mcpui.dev/) |
| **Open-Ended** | **Arbitrary UI** (HTML, iframes, free-form content) passed between agent and frontend. Max freedom, least control. | Sandboxed artifacts, model-authored HTML, "computer use" surfaces. | MCP-Apps, open HTML |

> The user's phrase **"static inline component (CopilotKit-controlled generative UI)"** maps precisely to **Static Generative UI** rendered via `useRenderTool` / `useComponent` in the chat thread.

---

## 4. Human-in-the-loop (HITL) — two distinct mechanisms

**(a) Tool-based — `useHumanInTheLoop`** (v2 recommended; v1 supported). The agent calls an interactive tool that **pauses execution** until the user responds via your UI. There is **no `handler`**; the render function receives a **`respond`** callback (available in the `Executing` state). The agent stays paused until `respond` is called — a true blocking interaction. Built on top of `useFrontendTool`.

```tsx
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

useHumanInTheLoop({
  name: "confirm_send",
  parameters: z.object({ to: z.string(), subject: z.string() }),
  render: ({ status, args, respond }) =>
    status === "executing" ? (
      <ApprovalCard {...args}
        onApprove={() => respond?.("approved")}
        onCancel={() => respond?.("rejected")} />
    ) : <ApprovalCard {...args} disabled />,
});
```
Signature: `useHumanInTheLoop<T>(tool: ReactHumanInTheLoop<T>, deps?)`.

**(b) Framework interrupt — `useInterrupt`**. For agents that emit native interrupts (LangGraph `interrupt()`, deepagents, etc.). Render the interrupt payload and call `resolve` to send the answer back.

```tsx
import { useInterrupt } from "@copilotkit/react-core";

useInterrupt({
  enabled: ({ eventValue }) => eventValue.type === "approval",
  render: ({ event, resolve }) => (
    <ApproveComponent content={event.value.content} onAnswer={(a) => resolve(a)} />
  ),
});
```

**Choosing:** use `useHumanInTheLoop` when *the agent decides* to ask (tool call); use `useInterrupt` when *the graph/framework* pauses itself mid-node. v1's `useCopilotAction({ renderAndWaitForResponse })` is the older inline equivalent of (a). HITL surfaces can render **inline in the thread** or as a **blocking modal** (the high-stakes pattern in the health/CEO demos).

---

## 5. Shared state (bidirectional agent ↔ UI)

CoAgents keep a **shared state** synced between the agent's run and your UI, built on AG-UI `STATE_SNAPSHOT` / `STATE_DELTA` (JSON-Patch) events.

```tsx
// v2
import { useAgent } from "@copilotkit/react-core/v2";
const { agent } = useAgent({ agentId: "research-agent" });
agent.state;            // read live agent state
agent.setState(next);   // write — reflected back to the agent

// v1 equivalent
import { useCoAgent } from "@copilotkit/react-core";
const { state, setState } = useCoAgent({ name: "research-agent", initialState });
```

Use for: live progress, intermediate results, an editable document the agent and user co-edit (the SOAP-note / board-deck pattern), and any "the canvas and the chat are the same state" surface.

---

## 6. Readable context, suggestions, chat state

- **`useCopilotReadable`** — push app state into the agent's context so answers are grounded ("the agent sees what the user sees"). Pair with `available` to scope it.
- **Suggestions** — v2 `useConfigureSuggestions({ instructions, minSuggestions, maxSuggestions })` + `useSuggestions`; v1 `useCopilotChatSuggestions`. Renders one-tap prompt starters / next-best-actions. Backbone for **Suggestions & capability surfacing**.
- **Headless chat** — v2 via `useAgent` + `useCopilotKit`; v1 `useCopilotChat` / `useCopilotChatHeadless_c` give `{ messages, sendMessage, isLoading, … }` for fully custom chat UIs.

---

## 7. Chat components & layout

| Component | Role | Notes |
|---|---|---|
| `CopilotChat` | The base chat surface (messages, input, suggestions, streaming) | v2 wraps everything; `CopilotChatView` is the layout, `CopilotChatToggleButton` the launcher |
| `CopilotSidebar` | Docked side panel; wraps `CopilotChat`; header + toggle | `defaultOpen`, fixed-position rail; `CopilotSidebarView` is its layout |
| `CopilotPopup` | Floating launcher → popover chat | Same chat logic, popup chrome |
| `CopilotTextarea` (v1) | AI-autocomplete textarea (not a chat) | For in-document ghost-text completion |
| Headless | Bring your own components | v2 built on `useAgent` + `useCopilotKit` |

These map directly to the **Layout** files (`side-panel`, `main-panel`, `tabs`, `canvas-workspace`).

---

## 8. Theming

CopilotKit exposes CSS custom properties on the `.copilotKit` root — override them to match any design system (see the health/CEO/design demo theming blocks for full examples):

```css
@import "@copilotkit/react-core/v2/styles.css"; /* v2 (or @copilotkit/react-ui/styles.css for v1) */
.copilotKit {
  --copilot-kit-primary-color: var(--brand-primary);
  --copilot-kit-background-color: var(--surface);
  --copilot-kit-separator-color: var(--border);
  --copilot-kit-muted-color: var(--text-muted);
  --copilot-kit-font-family: "Inter", system-ui, sans-serif;
}
```
Beyond CSS vars: **slot overrides** (swap subcomponents like the header, message bubble, input) and **fully headless** for total control.

---

## 9. Backend: runtime, MCP, A2A

- **`CopilotRuntime`** — the server piece, typically a Next.js route handler at `/api/copilotkit`; bridges the UI to your agent/framework and streams AG-UI events.
- **MCP connectors** — attach Model Context Protocol servers (Stripe, HubSpot, Linear, Figma, Slack, FHIR, …) so the agent gains tools/resources. Relevant to **Tool Call**, **Web Research**, **Sub-agents**.
- **A2A (Agent-to-Agent)** — orchestrate multiple agents / long-running background agents; backbone for the **Sub-agents** and **Deep Research** components.
- **Threads / persistence** — conversation history + immutable audit trail; backbone for **Threads / conversation history**.

---

## Component → primitive cheat-sheet

| Design-system component | Primary CopilotKit primitive(s) | AG-UI events |
|---|---|---|
| Chat message | `CopilotChat` / headless `useAgent`+`useCopilotKit` | `TEXT_MESSAGE_START/CONTENT/END`, `MESSAGES_SNAPSHOT` |
| Input / composer | `CopilotChat` input slot / `CopilotTextarea` (autocomplete) | `RUN_STARTED` |
| Thinking / reasoning | `useRenderTool` + reasoning stream | `THINKING_*`, `TEXT_MESSAGE_*` |
| Tool call | `useRenderTool` / `useDefaultRenderTool` + `ToolCallStatus` | `TOOL_CALL_START/ARGS/END`, `TOOL_CALL_RESULT` |
| Static (inline) generative UI | `useRenderTool` / `useComponent` (Static gen-UI) | `TOOL_CALL_*` |
| Human-in-the-loop | `useHumanInTheLoop` (tool) / `useInterrupt` (framework) | tool call + pause; interrupt events |
| Threads / history | Threads & persistence | `MESSAGES_SNAPSHOT` |
| Suggestions / capabilities | `useConfigureSuggestions` / `useSuggestions` | — |
| Sub-agents / multi-agent | A2A + `useAgent` per agent | `RUN_*`, `STATE_*` per agent |
| Web / deep research | backend tools rendered via `useRenderTool`; shared state for progress | `TOOL_CALL_*`, `STATE_SNAPSHOT/DELTA` |
| Voice / video / image | bring-your-own (Web Speech, OpenAI Realtime, MediaRecorder); render results via gen-UI | (transport-specific) |
| Layouts | `CopilotSidebar` / `CopilotPopup` / `CopilotChat` / headless | — |

---

## Authoritative sources

- CopilotKit docs — https://docs.copilotkit.ai
- Generative UI overview — https://docs.copilotkit.ai/learn/generative-ui
- `useFrontendTool` — https://docs.copilotkit.ai/reference/v2/hooks/useFrontendTool
- `useRenderTool` — https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- `useRenderToolCall` (ToolCallStatus) — https://docs.copilotkit.ai/reference/v2/hooks/useRenderToolCall
- `useHumanInTheLoop` — https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop
- Interrupts — https://docs.copilotkit.ai/integrations/langgraph/generative-ui/your-components/interrupt-based
- Shared state / `useAgent` — https://docs.copilotkit.ai/learn/whats-new/v1-50
- Chat suggestions — https://docs.copilotkit.ai/copilot-suggestions
- `CopilotSidebar` (v2) — https://docs.copilotkit.ai/reference/v2/components/CopilotSidebar
- Theming — https://docs.copilotkit.ai/custom-look-and-feel/customize-built-in-ui-components
- AG-UI protocol — https://docs.ag-ui.com
