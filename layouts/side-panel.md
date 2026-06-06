# Side Panel / Sidebar Copilot

> A persistent vertical panel docked to one edge of an application that hosts a conversational agent alongside the user's primary work surface.

**Category:** Layout · **Cluster:** Layouts & workspaces · **Aliases:** docked sidebar assistant, copilot sidebar, side pane chat, assistant rail, docked assistant, co-pilot rail

## Definition

The side panel is a fixed vertical region — typically right-docked — that embeds a conversational agent without replacing the host application's primary UI. It solves the retrofit problem: products that already have their own layout can add AI capabilities without redesigning their core surface. The panel reads page context, responds to user queries, and can take actions in the underlying app. A collapsed variant (floating launcher / chat bubble) expands into the full panel on demand.

## When to use / when not to

- **Use** when the primary work surface must remain visible while the user queries the agent — document editors, dashboards, CRMs, data grids.
- **Use** when retrofitting AI into an existing product where a full-page chat would require a disruptive re-architecture.
- **Use** when the agent's job is to assist with content already on screen: answering questions about it, summarizing it, or editing it directly.
- **Do not use** when the agent interaction *is* the primary task — prefer [Main Panel / Full-Page Chat](./main-panel.md) for dedicated chat-first products.
- **Do not use** on mobile viewports below ~600px as a persistent rail; collapse to a full-height drawer or bottom sheet instead.

## Anatomy

```
┌──────────────────────────────┬──────────────────┐
│                              │  ┌────────────┐  │
│      Host Application        │  │  Header    │  │  ← title, close (×) button
│      (primary work surface)  │  ├────────────┤  │
│                              │  │  Message   │  │
│   ┌────────────────────────┐ │  │  list      │  │  ← scroll view; thread
│   │ [page context visible  │ │  │  (thread)  │  │
│   │  to both user & agent] │ │  ├────────────┤  │
│   └────────────────────────┘ │  │ Suggestion │  │  ← suggestion pills
│                              │  │   pills    │  │
│                              │  ├────────────┤  │
│                              │  │  Composer  │  │  ← pinned input row
│                              │  └────────────┘  │
└──────────────────────────────┴──────────────────┘
                                      ↑
                               Resize handle (draggable divider)

Collapsed state:
┌──────────────────────────────────────────────────┐
│      Host Application                            │
│                                     ╭──────────╮ │  ← Launcher / toggle button
│                                     │  AI Chat │ │    (bottom-right, floating)
│                                     ╰──────────╯ │
└──────────────────────────────────────────────────┘
```

**Parts:**

- **Launcher / toggle button** — floating affordance that opens and closes the panel; `CopilotChatToggleButton` in CopilotKit.
- **Header** — panel title, optional thread-switcher, close button.
- **Scroll view / thread** — the scrollable message list; a single conversation thread. Auto-scrolls to bottom; pauses when user scrolls up.
- **Suggestion pills** — tappable prompt starters or follow-ups, rendered on empty state or above the composer.
- **Composer** — pinned input area with send, attach, voice, and tool controls.
- **Resize handle** — draggable divider allowing the user to widen or narrow the panel against the work surface.
- **Page context / readable state** — the current app data injected into the agent's context; may be surfaced visually so the user knows what the agent can see.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Collapsed | Panel closed; launcher button visible | Floating toggle button only; zero panel width |
| Empty / welcome | Panel opened, no messages yet | Welcome screen with suggestion pills, no message list |
| Idle | Open, messages present, agent not running | Message list visible; composer enabled; cursor in input |
| Submitting / pending | User sends a message; `RUN_STARTED` | Composer disabled or shows spinner; "working" indicator shown |
| Streaming | `TEXT_MESSAGE_CONTENT` events arrive | Token-by-token message bubble renders; stop-generating button visible |
| Tool-call / generative-UI render | `TOOL_CALL_START/ARGS/END` sequence | Inline tool-call card in thread at `InProgress → Executing → Complete` |
| Awaiting human input (HITL) | Agent pauses via `useHumanInTheLoop` or `useInterrupt` | Blocking approval/confirmation card in thread; composer blocked |
| Done | `RUN_FINISHED` | Final message settled; composer re-enabled |
| Error / retry | `RUN_ERROR` | Error card in thread; retry affordance in composer area |
| Offline / rate-limited | Network failure or 429 | Inline banner; composer disabled with explanatory copy |

## Vocabulary

| Term | Definition |
|---|---|
| Dock | Pinning the panel to a viewport edge so it pushes or overlays page content rather than floating freely. |
| Push vs. overlay | Whether opening the panel reflows page content (push — preserves work surface) or covers it (overlay — reclaims horizontal space on narrow viewports). |
| Launcher / toggle button | The floating affordance, typically bottom-right, that opens and closes the panel. In CopilotKit: `CopilotChatToggleButton`. |
| Page context / readable state | The current application data fed to the agent via `useCopilotReadable`, grounding answers in what the user is looking at. |
| Composer | The pinned input area at the panel bottom, with send, voice, attach, and tool/mode controls. |
| Thread | The single scrollable conversation inside the panel; some products expose a thread list for multiple sessions. |
| Suggestion pills | Tappable prompt starters or follow-up actions, rendered on the welcome screen or above the composer. |
| Resize handle | Draggable divider between the host app and panel that lets users widen or narrow the panel. |

## Real-world examples

- **Microsoft 365 Copilot (Word/Excel/PowerPoint)** — Copilot Chat docks as a right-side pane reading the open file plus web knowledge; it can suggest and directly apply edits. After backlash over a floating "Dynamic Action Button" (2025), Microsoft added a right-click option to dock it to the side or return it to the ribbon, with the docked state persisting for the session. [Source](https://www.windowslatest.com/2026/05/22/microsoft-admits-the-floating-copilot-button-in-word-excel-and-powerpoint-was-a-mistake-lets-you-hide-it-after-backlash/)
- **Glean Assistant** — Browser extension and desktop app marketed as "one sidebar for everything," using the current page plus a company Knowledge Graph. Opens with Cmd+J / Alt+J (browser) or Cmd+Shift+J (desktop); also surfaces as a persistent sidebar inside Slack's AI app surface. [Source](https://www.glean.com/browser-extension)
- **CopilotKit CopilotSidebar** — Ships a fixed sidebar panel wrapping `CopilotChat` with a `CopilotChatToggleButton`, header with title/close, and `CopilotSidebarView` layout (suggestions top, welcome middle, input pinned bottom). `CopilotPopup` is the floating sibling that closes on click-outside (`clickOutsideToClose` defaults to `true`). [Source](https://docs.copilotkit.ai/reference/v2/components/CopilotSidebar)
- **Notion AI** — Opened from the left sidebar Home tab or via Shift+Cmd+J; an inline AI prompt can be "popped into the sidebar" to persist while the user navigates other pages. Notion Agents can render a live grid view directly inside the chat panel. [Source](https://www.notion.com/help/guides/everything-you-can-do-with-notion-ai)

## CopilotKit & AG-UI mapping

**Primitives:** `CopilotSidebar` (docked panel), `CopilotPopup` (floating launcher), `CopilotChat` / `CopilotChatView` (base chat surface), `CopilotChatToggleButton` (launcher button), `CopilotSidebarView` (layout slots).

Feed page context with `useCopilotReadable`. Expose agent actions with `useFrontendTool` (v2) or `useCopilotAction` (v1). Render inline tool output with `useRenderTool`. Stream and run state flow from AG-UI `RUN_STARTED/FINISHED/ERROR` and `TEXT_MESSAGE_*` events surfaced through `useAgent` (v2) / `useCoAgent` (v1).

```tsx
import {
  CopilotSidebar,
  CopilotSidebarView,
} from "@copilotkit/react-ui";
import { useCopilotReadable, useFrontendTool } from "@copilotkit/react-core/v2";
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { z } from "zod";

// v1 equivalents: useCopilotAction({ name, parameters, handler }), useCopilotChatSuggestions

function DocumentEditor({ doc, onApplyEdit }) {
  // Inject the visible document as agent-readable context
  useCopilotReadable({
    description: "The document the user is editing",
    value: doc,
  });

  // Give the agent a tool to apply edits back into the host UI
  useFrontendTool({
    name: "applyEdit",
    description: "Apply a targeted edit to the document",
    parameters: z.object({
      section: z.string(),
      replacement: z.string(),
    }),
    handler: async ({ section, replacement }) => {
      onApplyEdit(section, replacement);
    },
    render: ({ status, args }) => (
      <div className="tool-badge">
        {status === "complete" ? "Edit applied" : `Editing "${args.section}"…`}
      </div>
    ),
  });

  // Generate context-aware suggestion pills
  useConfigureSuggestions({
    instructions: "Suggest 3 short editing actions based on the current document.",
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  return (
    <div style={{ display: "flex" }}>
      <main style={{ flex: 1 }}>
        {/* primary work surface */}
      </main>

      <CopilotSidebar
        defaultOpen={false}
        labels={{ title: "Document Copilot" }}
        // Slot overrides: header, messageView, scrollView, input, suggestionView, welcomeScreen
      />
    </div>
  );
}
```

> AG-UI events in play: `RUN_STARTED` (disable composer), `TEXT_MESSAGE_CONTENT` (stream tokens), `TOOL_CALL_START/ARGS/END` + `TOOL_CALL_RESULT` (applyEdit card lifecycle), `RUN_FINISHED/ERROR` (settle or error state).

## Best practices

- Default to **push layout** on wide viewports (≥1024px) so the work surface stays visible; switch to overlay only when horizontal space is insufficient — never permanently narrow a laptop-sized content area.
- Always surface **what context the agent can see** — a subtle "Agent sees: this document" label builds trust and helps users phrase better questions.
- **Persist panel state** (open/closed, width, thread history) per user across navigation and page reloads; reopening should resume context, not reset it.
- **Pin the composer** to the bottom and auto-scroll the message list, but pause auto-scroll when the user scrolls up into history — do not yank them back while they're reading.
- When the agent mutates the host document or app, **show what changed and offer undo** — side-panel actions are easy to miss against the work surface.
- **Stream tokens** (`TEXT_MESSAGE_CONTENT`) rather than waiting for a complete response; show a stop-generating button during streaming so users can interrupt long runs.
- On **mobile** (< 600px), collapse to a full-height drawer or bottom sheet with a large close target; do not render a cramped fixed rail.
- **Never make the panel unhideable** — the user must be able to dismiss it with a keyboard shortcut (Cmd/Ctrl+J style), a close button, or Escape; the Microsoft floating-button backlash illustrates the cost of ignoring this.

## Anti-patterns

- **Unhideable permanent rail** — forcing the panel open at all times or providing no close affordance narrows the work area and erodes trust (the Microsoft Dynamic Action Button is the canonical cautionary example).
- **Overlaying the content being discussed** — placing the panel on top of exactly the region the user is asking about so they cannot see it while reading the response.
- **Resetting the conversation on close or navigate** — destroying the thread context every time the panel is toggled or the user moves to another page.
- **`aria-live="assertive"` on streaming output** — this causes a screen reader to announce every partial token, producing an unusable torrent of speech; use `aria-live="polite"` instead.
- **Launcher obscuring primary controls** — a bottom-right chat bubble that covers a Save, Submit, or other critical action in the host application.

## Accessibility

- Wrap the panel in a `<aside>` or `role="complementary"` landmark with an accessible name (`aria-label="Document Copilot"`) so screen-reader users can navigate to it directly.
- Apply **focus trapping** when the panel is open: Tab and Shift+Tab cycle through panel controls; Escape closes the panel and returns focus to the launcher button.
- Expose a discoverable **keyboard shortcut** (e.g., Cmd/Ctrl+J) to toggle the panel; announce it in the launcher button's tooltip and in an `aria-describedby`.
- Set `aria-live="polite"` on the message list region so screen readers announce completed messages after streaming ends — not `assertive`, which would read every streaming chunk.
- Provide a visible **stop-generating** button during streaming; it must be keyboard-reachable without tabbing through the growing message content.
- For the resize handle, expose it as a `role="separator"` with `aria-orientation="vertical"` and support arrow-key resizing in addition to drag.

## Related

- [Input Box / Composer](../components/input-composer.md) — the composer embedded at the panel bottom
- [Chat Message](../components/chat-message.md) — individual messages in the panel thread
- [Suggestions & Capability Surfacing](../components/suggestions-capabilities.md) — suggestion pills in the welcome state
- [Human-in-the-Loop Prompt](../components/human-in-the-loop.md) — blocking HITL cards rendered inside the panel thread
- [Tool Call](../components/tool-call.md) — inline tool-call cards rendered during agent runs
- [Threads / Conversation History](../components/threads-history.md) — multi-thread management within the panel
- [Main Panel / Full-Page Chat](./main-panel.md) — the full-page alternative when AI is the primary surface
- [Canvas / Workspace & Artifacts](./canvas-workspace.md) — a complementary layout when the agent produces editable artifacts
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary / glossary](../reference/glossary.md)

## Sources

- https://www.windowslatest.com/2026/05/22/microsoft-admits-the-floating-copilot-button-in-word-excel-and-powerpoint-was-a-mistake-lets-you-hide-it-after-backlash/
- https://www.glean.com/browser-extension
- https://docs.copilotkit.ai/reference/v2/components/CopilotSidebar
- https://www.notion.com/help/guides/everything-you-can-do-with-notion-ai
- https://docs.copilotkit.ai/learn/generative-ui
- https://docs.ag-ui.com/concepts/events
