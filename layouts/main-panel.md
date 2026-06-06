# Main Panel / Full-Page Chat

> A full-window layout where the conversation is the application: a centered scrolling thread with a prominent composer flanked by a conversation-history rail and tool/mode entry points.

**Category:** Layout · **Cluster:** Layouts & workspaces · **Aliases:** full-page chat, conversational app, chat-first UI, centered thread, standalone chat surface, primary chat pane, ChatGPT-style layout

---

## Definition

Main Panel is a full-viewport shell where the agent interaction occupies the entire page rather than a side panel or popover. It solves the design challenge of presenting a high-bandwidth agent conversation — streaming text, tool calls, citations, generative UI, and reasoning traces — without being subordinate to another work surface. It appears in AI-native destination products (ChatGPT, Perplexity, Claude.ai) where the agent *is* the product, not an add-on to an existing application. The layout typically composes three zones: a left navigation rail for conversation history and spaces, a centered message thread column, and an anchored composer at the bottom.

---

## When to use / when not to

- **Use** when the agent interaction is the primary purpose of the page and there is no pre-existing host application to embed into.
- **Use** for products where users have long, multi-turn conversations that benefit from uninterrupted focus — research assistants, coding agents, document drafting.
- **Use** when conversation history, branching, and thread management are first-class features that deserve persistent left-rail real estate.
- **Avoid** when the agent is an enhancement to an existing UI (a spreadsheet, CRM, or code editor) — use a [Side Panel](./side-panel.md) or popup instead.
- **Avoid** for micro-interactions or brief question-and-answer flows that do not justify taking over the full page — a popup or inline input is less disruptive.

---

## Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│ Navigation Rail (left, fixed)                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Logo / workspace picker]                              │  │
│  │                                                        │  │
│  │  + New Chat                                            │  │
│  │                                                        │  │
│  │  ▼ Today                                               │  │
│  │    • Thread A                                          │  │
│  │    • Thread B                                          │  │
│  │  ▼ Yesterday                                           │  │
│  │    • Thread C                                          │  │
│  │                                                        │  │
│  │  [Spaces / Projects]                                   │  │
│  │  [Settings / Profile]                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Message Thread (centered, max-width column)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Empty state / landing prompt  (pre-conversation)       │  │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─     │  │
│  │ [User Turn]                                            │  │
│  │ [Assistant Turn]                                       │  │
│  │   └─ Reasoning / thinking trace (collapsible)         │  │
│  │   └─ Tool call cards (inline, with status)            │  │
│  │   └─ Streaming answer                                  │  │
│  │   └─ Sources panel / citations                        │  │
│  │   └─ Generative UI / cards                            │  │
│  │                                                        │  │
│  │                        ↓ Jump to latest               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Composer (pinned bottom, full column width)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Attach] [Voice] ......... input ......... [Send/Stop] │  │
│  │ [Model/Mode selector] [Tool toggles]                   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Structural parts:**
- **Conversation list / history rail** — collapsible left sidebar of prior threads grouped by date or project.
- **Message thread / transcript** — the vertical, time-ordered list of user and assistant turns within the centered column.
- **Turn** — one user message plus its assistant response; the unit of regenerate, edit, and branch operations.
- **Branch / edit-and-resubmit** — editing an earlier message to fork the conversation into an alternate path.
- **Reasoning / thinking trace** — optional collapsible block showing the model's intermediate reasoning.
- **Sources panel** — citations or retrieved documents rendered inline or in a secondary column.
- **Composer** — the central multiline input with attach, voice, model/mode selector, and tool toggles.
- **Empty state / landing prompt** — the pre-conversation screen with greeting and suggested prompts before any messages exist.

---

## States

| State | Trigger | UI treatment |
|---|---|---|
| Empty / landing | Thread has no messages | Greeting + 3–6 suggested-prompt chips; composer is active and focused |
| Composing | User typing in composer | Character count, attachment indicators, send button activates |
| Submitting | User sends message (`RUN_STARTED`) | User bubble appends to thread; composer clears but stays enabled |
| Thinking / reasoning | Model reasoning before first token (`THINKING_*`) | Collapsible "Thinking…" trace with pulsing indicator in the thread |
| Streaming answer | `TEXT_MESSAGE_CONTENT` events flowing | Token-by-token text render in assistant bubble; stop button visible |
| Tool running | `TOOL_CALL_START/ARGS/END` mid-turn | Tool-call card with `InProgress → Executing` status inline in thread |
| Rendering citations / generative UI | `TOOL_CALL_RESULT` or structured content | Sources list, citation superscripts, or embedded UI widget in thread |
| Complete | `RUN_FINISHED` | Stop button disappears; regenerate/copy actions appear on assistant turn |
| Regenerating / branching | User edits earlier turn or clicks regenerate | Downstream turns replaced with new streaming response; branch indicator shown |
| Error / retry | `RUN_ERROR` | Error card inline with retry affordance; composer re-enabled |
| Stopped by user | User presses stop during streaming | Generation truncated; partial answer remains; composer re-enabled |

---

## Vocabulary

| Term | Definition |
|---|---|
| Conversation list / history rail | The left sidebar of prior threads, often grouped by date or organized into projects/spaces. |
| Composer | The central multiline input, typically with attach, voice, model/mode selector, and tool toggles pinned to the page bottom. |
| Message thread / transcript | The vertical, time-ordered list of user and assistant turns that scrolls within the centered column. |
| Empty state / landing prompt | The pre-conversation screen shown before any messages, typically with a greeting and suggested prompts. |
| Turn | One user message plus its assistant response; the atomic unit of regenerate, edit, and branch operations. |
| Branch / edit-and-resubmit | Editing an earlier message to fork the conversation into an alternate path, replacing downstream turns. |
| Reasoning / thinking trace | An optional collapsible block surfacing the model's intermediate chain-of-thought before the final answer. |
| Sources panel | Citations or retrieved documents shown inline with claim superscripts or in a secondary column, enabling answer verification. |

---

## Real-world examples

- **ChatGPT (OpenAI)** — Centered thread with a left conversation-history rail and a composer carrying a model/mode picker. The Auto/Fast/Thinking router persists across model generations; the system decides at runtime whether to route to a fast model or a deeper reasoning model. Deep Research and other tools launch directly from the composer. [Source](https://help.openai.com/en/articles/11909943-gpt-5-in-chatgpt)

- **Perplexity** — Answer-first full-page layout: synthesized answer at top with inline numbered citations, a sources list of cited URLs, and suggested follow-ups below. Left sidebar holds search history, Spaces, and a Discover feed. Search / Research / Labs modes change answer depth and output type (Labs can produce dashboards and apps). [Source](https://www.perplexity.ai/hub/getting-started)

- **OpenAI ChatKit** — An embeddable, themeable full-page chat surface (composer, thread, file attachments, chain-of-thought visualization, tool/action triggers, and a widget system of cards/lists/forms/buttons) backed by Agent Builder or a custom server via the ChatKit SDK. [Source](https://platform.openai.com/docs/guides/custom-chatkit)

- **assistant-ui** — Open-source React primitives (`ThreadPrimitive.Root > Viewport > Messages/Composer`, plus `ThreadList` and `ActionBar`) that compose into a full-page chat; an `AssistantRuntimeProvider` binds them to a runtime (LangGraph or a custom runtime), with `Viewport` anchoring scroll to the newest message. [Source](https://www.assistant-ui.com/docs/ui/primitives/Thread)

---

## CopilotKit & AG-UI mapping

**Primary primitive:** `CopilotChat` (`@copilotkit/react-ui`) — the non-docked, full-panel component that composes the thread, streaming, tool-call rendering, suggestions, and composer into a single mountable surface. For a custom shell, use `CopilotChatView` (the layout) and override its slots, or go fully headless with `useAgent` + `useCopilotKit` (v2) to drive your own components.

**AG-UI events driving the state machine:**
- `RUN_STARTED / RUN_FINISHED / RUN_ERROR` — global run lifecycle; enable/disable stop button.
- `TEXT_MESSAGE_START / TEXT_MESSAGE_CONTENT / TEXT_MESSAGE_END` — stream the assistant bubble token-by-token.
- `TOOL_CALL_START / TOOL_CALL_ARGS / TOOL_CALL_END / TOOL_CALL_RESULT` — inline tool-call cards via `useRenderTool`.
- `STATE_SNAPSHOT / STATE_DELTA` — sync shared agent state (e.g., research progress) to a co-rendered panel.
- `MESSAGES_SNAPSHOT` — rehydrate thread on load or thread switch.

**Minimal wiring example:**

```tsx
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useRenderTool } from "@copilotkit/react-core/v2";
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { useCopilotReadable } from "@copilotkit/react-core";
import { z } from "zod";
import "@copilotkit/react-core/v2/styles.css";

function MainPanelApp() {
  // Ground the agent with page-level context
  useCopilotReadable({ description: "Current user", value: { role: "analyst" } });

  // Configure landing-state suggestions
  useConfigureSuggestions({
    instructions: "Suggest research, analysis, and drafting tasks relevant to the user's role.",
    minSuggestions: 3,
    maxSuggestions: 5,
  });

  // Render a backend tool call inline in the thread
  useRenderTool({
    name: "web_search",
    parameters: z.object({ query: z.string() }),
    render: ({ status, args, result }) => (
      <div className="tool-card" data-status={status}>
        <span>Search: {args.query ?? "…"}</span>
        {status === "complete" && <pre>{result}</pre>}
      </div>
    ),
  });

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      {/* CopilotChat renders the full-page thread + composer */}
      <CopilotChat
        labels={{ title: "Research Assistant", initial: "What would you like to explore?" }}
        className="main-panel"
      />
    </CopilotKit>
  );
}
```

> **v1 equivalent:** Replace `useRenderTool` with `useCopilotAction({ name, parameters, render })` and `useConfigureSuggestions` with `useCopilotChatSuggestions`. The `CopilotChat` component is available in both v1 and v2. Import styles from `@copilotkit/react-ui/styles.css` for v1.

**Theming the full-page surface:**

```css
@import "@copilotkit/react-core/v2/styles.css";
.copilotKit.main-panel {
  --copilot-kit-primary-color: var(--brand-primary);
  --copilot-kit-background-color: var(--surface-base);
  --copilot-kit-font-family: "Inter", system-ui, sans-serif;
}
```

---

## Best practices

- **Constrain line length.** Limit the thread column to 640–768 px (readable measure) with `max-width` and `margin: 0 auto`, even on ultra-wide monitors. Full-bleed prose is unreadable at 1440 px.
- **Auto-scroll with an escape hatch.** Scroll the thread to the latest token during generation, but cancel auto-scroll the instant the user scrolls up. Surface a "Jump to latest" button; remove it when the user is already at the bottom.
- **Keep the composer live during streaming.** Users should be able to type a follow-up or press stop while the agent is responding. Disabling the input during generation trains users to stare passively at a screen.
- **Surface stop and progress together.** A visible stop button paired with a streaming indicator (thinking trace or tool-running status) transforms a 30-second deep research run from "frozen screen" to "transparent progress."
- **Make reasoning and tool steps collapsible.** Show a one-line summary ("Searched 14 sources") by default; expand on click. Power users can audit; casual users are not overwhelmed.
- **Ground citations near their claims.** Superscript numbers adjacent to sentences, not just a footnote list at the end. Make each citation a clickable link to the source URL so answers are verifiable.
- **Preserve state across thread switches.** Restore scroll position and unsent composer draft when re-entering a thread. Losing a half-composed message on navigation is a sharp UX regression.
- **Announce new assistant messages.** Wrap the thread in an ARIA live region so screen readers announce new content without requiring the user to navigate to the thread manually.

---

## Anti-patterns

- **Disabling the composer while streaming.** Users cannot queue a follow-up, stop generation, or feel in control. Always keep the composer interactive; just change the send button to a stop button.
- **Full-viewport-width thread with no max measure.** Lines stretching across a 1440 px screen produce unreadable text walls. Always constrain the thread column.
- **Hiding all reasoning and tool activity.** A blank screen for 30 seconds during deep research or a complex tool chain destroys trust. Even a minimal "Searching…" indicator with tool names is substantially better than silence.
- **Losing conversation history or draft text on refresh.** Threads and in-progress drafts must be persisted (`MESSAGES_SNAPSHOT` on load) and restored on navigation. Silent data loss is a trust killer.
- **Synthesized answers with no inspectable citations.** Search-style products that present authoritative-sounding answers without sourcing erode user confidence over time. Citations are a trust primitive, not a nice-to-have.

---

## Accessibility

- **ARIA live region on the message thread.** Set `aria-live="polite"` on the thread container so assistive technology announces new assistant messages as they complete. Avoid `aria-live="assertive"` during streaming — it produces interrupt floods; announce only on `TEXT_MESSAGE_END`.
- **Role landmarks.** Mark the navigation rail as `<nav aria-label="Conversation history">`, the thread as `<main>` or `role="log"` with `aria-label="Chat transcript"`, and the composer as `<form>` with an accessible label.
- **Keyboard navigation.** The composer must receive focus on page load. Arrow-key navigation through past messages should be possible for users who cannot use a mouse; each message bubble should be focusable.
- **Stop button accessible.** The stop/cancel button must have a visible focus ring and an `aria-label="Stop generating"` since it often has no text label.
- **Reduced motion.** Streaming cursor animations and thinking-indicator pulses must respect `prefers-reduced-motion: reduce` — drop the animation entirely rather than slowing it (the motion is not load-bearing).
- **Collapsible reasoning traces.** Use `<details>/<summary>` or `aria-expanded` + `aria-controls` on the toggle so screen readers can announce and interact with the expand/collapse affordance correctly.

---

## Related

- [../components/chat-message.md](../components/chat-message.md) — Chat Message (the individual turn bubbles rendered inside the thread)
- [../components/input-composer.md](../components/input-composer.md) — Input Box / Composer (the bottom-anchored input with tool toggles)
- [../components/thinking-reasoning.md](../components/thinking-reasoning.md) — Thinking / Reasoning Display (the collapsible chain-of-thought trace)
- [../components/tool-call.md](../components/tool-call.md) — Tool Call (inline tool-running status cards)
- [../components/agent-activity-traceability.md](../components/agent-activity-traceability.md) — Agent Status, Activity & Traceability
- [../components/threads-history.md](../components/threads-history.md) — Threads / Conversation History (the left-rail history list)
- [../components/suggestions-capabilities.md](../components/suggestions-capabilities.md) — Suggestions & Capability Surfacing (landing-state prompt chips)
- [../components/human-in-the-loop.md](../components/human-in-the-loop.md) — Human-in-the-Loop Prompt (blocking approval surfaces rendered in the thread)
- [./side-panel.md](./side-panel.md) — Side Panel / Sidebar Copilot (the embedded-in-host-app alternative layout)
- [./canvas-workspace.md](./canvas-workspace.md) — Canvas / Workspace & Artifacts (right-column artifact surface paired with chat)
- [../reference/copilotkit-primitives.md](../reference/copilotkit-primitives.md) — CopilotKit primitive reference
- [../reference/ag-ui-protocol.md](../reference/ag-ui-protocol.md) — AG-UI protocol reference

---

## Sources

- https://help.openai.com/en/articles/11909943-gpt-5-in-chatgpt
- https://www.perplexity.ai/hub/getting-started
- https://platform.openai.com/docs/guides/custom-chatkit
- https://www.assistant-ui.com/docs/ui/primitives/Thread
- https://docs.copilotkit.ai
- https://docs.copilotkit.ai/learn/generative-ui
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- https://docs.copilotkit.ai/copilot-suggestions
- https://docs.copilotkit.ai/custom-look-and-feel/customize-built-in-ui-components
- https://docs.ag-ui.com/concepts/events
