# Command Palette / Cmd+K

> A global, keyboard-invoked spotlight overlay that fuses fuzzy command matching and free-text AI into a single transactional surface, appearing on demand from anywhere in the app and dismissing cleanly once the job is done.

**Category:** Layout · **Cluster:** Layouts & workspaces · **Aliases:** Cmd+K menu, Superhuman Command, Quick Switcher (Slack), spotlight / launcher (Raycast), command bar, kbar / cmdk-style overlay, ask-AI bar, fuzzy launcher

## Definition

The command palette is an app-global modal overlay — typically rendered as a centered or top-center input box over a dimmed or blurred backdrop — that can be summoned via a single keyboard shortcut from any screen. It combines two interaction modes in one box: fuzzy-matched command and navigation lookup, and free-text natural-language AI. Users type a fragment, run a ranked command, or hand the same text to an AI that streams an answer or tool-calls the same action contracts the palette already knows about. The placement is deliberately transient: it owns the keyboard while open, sits in an elevated portal layer detached from any page chrome, and dismisses on Escape or selection — returning focus to exactly where the user was. The AI here is a fast, transactional "do-or-answer" surface, not a persistent conversation panel.

## When to use / when not to

- **Use** when your app already has a keyboard-first, power-user audience and a large catalog of discrete commands or objects to navigate — it doubles as a shortcut-teacher and an AI entry point in one box.
- **Use** for fast, transactional, one-shot AI: "ask a quick question", "summarize this", "jump / create / assign", "run this action by describing it" — interactions that should complete and dismiss, not start a thread.
- **Use** when AI should reuse the same action contracts as manual commands — define an action once and let both fuzzy search and the AI tool-call it, so the agent can only do what the app can already do.
- **Use** when screen real estate is precious or the UI is dense: the palette adds zero persistent chrome and overlays only on demand.
- **Do not use** as the home for multi-turn, exploratory, or long-running agent work — that wants a persistent sidebar or panel with history, memory, and streamed progress. Route users from the palette into a separate surface (Raycast pushes from Quick AI to AI Chat; Linear's agent chat lives at Cmd+J, separate from the Cmd+K action palette).
- **Do not use** for first-touch or non-technical audiences who won't discover a hidden shortcut, or for AI output that needs to be read alongside source content for a long time — an overlay that dims the page and steals focus fights that use case.

## Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│                    ░░ dimmed backdrop ░░                      │
│                                                               │
│              ┌──────────────────────────────┐                │
│              │ 🔍  Type a command or ask AI  │  ← input      │
│              ├──────────────────────────────┤                │
│              │  Create issue               ↵ │  ← match 1   │
│              │  Assign to …               ↵  │  ← match 2   │
│              │  Archive project            ↵ │  ← match 3   │
│              │  Open settings             ↵  │  ← match 4   │
│              │  Ask AI "…"               Tab │  ← AI pivot  │
│              └──────────────────────────────┘                │
│                                                               │
│                    ░░ dimmed backdrop ░░                      │
└──────────────────────────────────────────────────────────────┘

Streaming / AI mode (after Tab handoff or "Ask AI" row selected):
              ┌──────────────────────────────┐
              │ 🔍  Summarise open issues     │  ← same input
              ├──────────────────────────────┤
              │ ⟳  Thinking…                 │  ← loading slot
              │                               │
              │  Here are the 4 open issues… │  ← streamed answer
              │  ─────────────────────────── │
              │  [Copy]   [Open in chat ↗]   │  ← action strip
              └──────────────────────────────┘
```

**Parts:**

- **Shortcut hint / launcher chip** — a visible "⌘K" badge or button that teaches discoverability before the palette is opened.
- **Backdrop** — the dimmed or blurred overlay that signals modal ownership; click-outside closes the palette.
- **Input field** — always focused on open; accepts command fragments and free-text AI queries alike.
- **Filtered list** — live-reranked command/navigation items using fuzzy scoring; non-matches are hidden from view (but kept in the React tree for instant re-filtering).
- **Ask-AI row / mode pivot** — the affordance that routes the typed text to the AI instead of executing a command (Tab handoff, an explicit "Ask AI" result row, or a mode menu).
- **Loading / streaming slot** — a progress indicator and token-by-token answer area during AI runs.
- **HITL approval card** — an inline confirm/cancel block for consequential AI actions before they execute.
- **Action strip** — post-answer controls: copy result, paste into app, open in full chat, retry.
- **Pages / nested menus** — drilling from a command into a sub-list (e.g., "Assign to…" opens an assignee picker) without leaving the palette.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle / closed | App load; Escape or same-shortcut pressed | Not rendered; only a shortcut hint or launcher chip suggests it exists |
| Invoked / open (empty query) | Cmd/Ctrl+K captured at app root | Overlay + backdrop appear; input focused; recent/suggested commands shown before any typing |
| Filtering (command mode) | Keystroke in input | Each keystroke re-ranks; matches reorder/animate, non-matches hide; pure client-side, zero latency |
| No results / empty | Query matches nothing | `Command.Empty` slot shown; "Ask AI «query»" offered as the fallback action |
| Ask-AI armed / mode pivot | Tab pressed, "Ask AI" row selected, or query recognized as natural language | Mode indicator updates; input context switches to AI prompt; command list collapses |
| Streaming / thinking | Agent run started; `RUN_STARTED` + `TEXT_MESSAGE_CONTENT` | Loading indicator in the streaming slot; tokens render incrementally; stop affordance visible |
| Awaiting approval (HITL) | Agent pauses on a consequential action; `useHumanInTheLoop` fires | Inline confirm/cancel approval card; input locked until the user responds |
| Applied / executed | Command runs or AI action completes; `RUN_FINISHED` | Palette auto-dismisses; focus restores; toast + undo shown in host app as appropriate |
| Answered (stay-open) | Q&A turn completes; output is informational | Answer shown in-overlay with follow-up input and a handoff-to-full-chat control |
| Error | `RUN_ERROR` or tool failure | Inline error with retry; typed query preserved |
| Dismissed | Escape / same-shortcut / click-outside | Overlay unmounts; focus returns to previously active element |

## Vocabulary

| Term | Definition |
|---|---|
| Command palette | The keyboard-invoked overlay listing runnable commands and navigation, filtered live as you type. |
| Cmd+K / Ctrl+K | The de-facto global shortcut to summon the palette; pressing it again or Escape dismisses and restores focus. |
| Fuzzy matching / command-score | Sub-string-tolerant ranking that scores each item 0–1 against the query (Superhuman open-sourced command-score; cmdk uses it by default). |
| Aliases / keywords | Alternate phrasings attached to a command so it surfaces under terms the label doesn't literally contain. |
| Default score / scale / follow | Superhuman's ranking levers — a baseline default score per command, a scale multiplier to boost or dampen it, and a rule that pins some items to rank under others regardless of match. |
| Ask-AI mode / Quick AI | The free-text branch where the typed query goes to the model instead of (or after) command matching; Raycast triggers it from Root Search via the Tab key. |
| Mode pivot / Tab handoff | An in-palette switch between command and AI modes — Tab to send to AI, an explicit "Ask AI" row, or a mode menu. |
| Spotlight overlay / ephemeral surface | The centered-over-dimmed-backdrop modal styling; it is transient, owns the keyboard while open, and leaves no persistent chrome. |
| Pages / nested menus | Drilling from a command into a sub-list without leaving the palette (e.g., "Assign to…" opening an assignee picker). |
| Empty / loading slots | Dedicated states for "no matches" and "fetching/streaming" (cmdk's `Command.Empty` and `Command.Loading` with a progress value). |

## Real-world examples

- **Raycast (Quick AI & AI Chat)** — From Root Search you start typing a question and press Tab; Raycast hands the text to Quick AI and answers in the same window — a chat-style surface with follow-ups, context attachments, and a one-keystroke handoff to full AI Chat. Quick AI is "the fastest way to ask a one-off question from Raycast, without leaving your flow." Multi-turn work (history, Agents, memory, tools) deliberately lives in the separate AI Chat surface, reachable via Cmd+J. [Source](https://manual.raycast.com/ai/chat)
- **Superhuman Command (Cmd+K)** — Bound at the app's top level via the Mousetrap library and reachable everywhere; pressing it again dismisses and restores focus. Ranking uses their open-sourced command-score (0–1, with a threshold of 0.0015) plus aliases, a per-command default score, a scale multiplier, and a follow rule. The palette displays about five commands with the last intentionally cut off to imply more below the fold — a textbook keyboard-first command palette. [Source](https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/)
- **Linear (⌘K palette + Cmd+J agent chat)** — ⌘K opens the command menu for actions and navigation; for example, searching "Assign to…" delegates an issue to an AI agent via keyboard (agents are not traditional assignees — the human teammate remains responsible while the agent acts as a delegate). The conversational AI is a distinct surface: Linear's agent chat opens via Cmd+J, takes natural-language requests, and lets you start or return to recent conversations. This cleanly separates the fast action palette from the multi-turn agent. [Source](https://linear.app/changelog/2026-03-24-introducing-linear-agent)
- **Slack (Quick Switcher + Slack AI search)** — Cmd/Ctrl+K opens the Quick Switcher to jump to any channel or DM by fuzzy name — described as the single shortcut that saves the most time daily. Slack AI layers natural-language search on top: "ask questions in your own words and get answers based on knowledge already in Slack" — the same keyboard-first bar evolving from navigation into ask-AI. [Source](https://slack.engineering/a-faster-smarter-quick-switcher/)

## CopilotKit & AG-UI mapping

**Primitives:** `useFrontendTool` (register action contracts for both palette and AI), `useHumanInTheLoop` (approval gate), `useConfigureSuggestions` (idle/recent suggestions), `useAgent` + `useCopilotKit` (headless AI branch), `useRenderTool` (inline tool-call progress).

CopilotKit does not ship a spotlight palette component, so the overlay shell is built by hand — a React portal with a dialog element bound to Cmd/Ctrl+K at the app root, backed by a fuzzy command library such as [cmdk](https://github.com/pacocoursey/cmdk). The AI branch is driven by CopilotKit's headless primitives. From `useAgent`, `agent.addMessage({ role: "user", content })` enqueues the typed text as a user message; calling `copilotkit.runAgent({ agent })` (exposed via `useCopilotKit`) triggers execution — the same path the built-in chat uses internally. For the "define once, reuse everywhere" pattern, each app action is registered with `useFrontendTool`: the AI can tool-call the same commands the palette runs manually, so the agent's vocabulary is never wider than the app's. Gate consequential actions with `useHumanInTheLoop` for the awaiting-approval state. Seed the empty/idle state with `useConfigureSuggestions`. Render streaming tool progress inline with `useRenderTool`. AG-UI events map directly onto palette states: `RUN_STARTED` → streaming slot shows; `TEXT_MESSAGE_CONTENT` → token-by-token render; `TOOL_CALL_START/ARGS/END` + `TOOL_CALL_RESULT` → inline tool card at `InProgress → Executing → Complete`; `RUN_FINISHED/ERROR` → applied/dismissed or error.

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Command } from "cmdk";
import {
  useFrontendTool,
  useCopilotReadable,
  useConfigureSuggestions,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { z } from "zod";

// v1 equivalents: useCopilotAction({ name, parameters, handler }), useCoAgent, useCopilotChat

function AppCommandPalette({ appContext, onNavigate, onCreateIssue }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // -- Global Cmd/Ctrl+K binding --
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Reset state on close
  useEffect(() => {
    if (!open) { setQuery(""); setAiMode(false); }
  }, [open]);

  // -- Inject app context so the AI knows what the user sees --
  useCopilotReadable({
    description: "Current application context",
    value: appContext,
  });

  // -- Seed the empty / recent state with context-aware suggestions --
  useConfigureSuggestions({
    instructions: "Suggest 3 quick actions the user can take right now.",
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  // -- Register action: available to both fuzzy palette and AI tool-calling --
  useFrontendTool({
    name: "createIssue",
    description: "Create a new issue with a title and optional assignee",
    parameters: z.object({
      title: z.string(),
      assignee: z.string().optional(),
    }),
    handler: async ({ title, assignee }) => {
      await onCreateIssue({ title, assignee });
      setOpen(false);
    },
    render: ({ status, args }) => (
      <div className="tool-badge">
        {status === "complete"
          ? `Created: ${args.title}`
          : `Creating "${args.title}"…`}
      </div>
    ),
  });

  // -- Gate destructive actions with HITL approval --
  useHumanInTheLoop({
    name: "deleteProject",
    parameters: z.object({ projectId: z.string(), name: z.string() }),
    render: ({ status, args, respond }) =>
      status === "executing" ? (
        <div className="hitl-card">
          <p>Delete project <strong>{args.name}</strong>? This cannot be undone.</p>
          <button onClick={() => respond?.("confirmed")}>Delete</button>
          <button onClick={() => respond?.("cancelled")}>Cancel</button>
        </div>
      ) : (
        <div className="hitl-card hitl-card--disabled">Awaiting confirmation…</div>
      ),
  });

  // -- Headless AI branch --
  const { agent } = useAgent({ agentId: "app-agent" });
  const copilotkit = useCopilotKit();

  const runAI = useCallback(async () => {
    if (!query.trim()) return;
    agent.addMessage({ role: "user", content: query });
    await copilotkit.runAgent({ agent });
    // RUN_STARTED → streaming slot shows; TEXT_MESSAGE_CONTENT streams tokens;
    // TOOL_CALL_* renders inline cards; RUN_FINISHED settles state
  }, [query, agent, copilotkit]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      // cmdk renders a <div role="dialog" aria-modal aria-label> — add focus trap via portal
    >
      <Command.Input
        ref={inputRef}
        value={query}
        onValueChange={setQuery}
        placeholder="Type a command or ask AI…"
        onKeyDown={(e) => {
          if (e.key === "Tab") { e.preventDefault(); setAiMode(true); }
          if (e.key === "Escape") setOpen(false);
        }}
      />

      {!aiMode ? (
        <Command.List>
          <Command.Empty>
            <button onClick={() => setAiMode(true)}>
              Ask AI "{query}"
            </button>
          </Command.Empty>

          <Command.Group heading="Actions">
            <Command.Item onSelect={() => onNavigate("/settings")}>
              Open settings
            </Command.Item>
            {/* additional static commands … */}
          </Command.Group>

          {query && (
            <Command.Item onSelect={() => setAiMode(true)}>
              Ask AI "{query}" — Tab
            </Command.Item>
          )}
        </Command.List>
      ) : (
        <div className="palette-ai-surface" aria-live="polite" aria-label="AI answer">
          {agent.isRunning ? (
            <Command.Loading>Thinking…</Command.Loading>
          ) : (
            agent.messages
              .filter((m) => m.role === "assistant")
              .map((m) => <p key={m.id}>{m.content}</p>)
          )}
          <button onClick={runAI} disabled={agent.isRunning || !query.trim()}>
            {agent.isRunning ? "Working…" : "Ask"}
          </button>
          <button onClick={() => setAiMode(false)}>Back to commands</button>
        </div>
      )}
    </Command.Dialog>
  );
}
```

> AG-UI events in play: `RUN_STARTED` (show loading slot, disable input), `TEXT_MESSAGE_CONTENT` (stream tokens into answer area), `TOOL_CALL_START/ARGS/END` + `TOOL_CALL_RESULT` (inline tool-call card lifecycle via `useFrontendTool` render), `RUN_FINISHED/ERROR` (settle or show inline error with retry).

## Best practices

- Bind one global, predictable shortcut (Cmd/Ctrl+K) captured at the app root; make it toggle (re-press or Esc closes); always restore focus to the previously active element on dismiss.
- Make discovery explicit: show a visible "⌘K" hint or button in the UI, and surface recent/suggested commands on open so the empty state is never a blank box — offer "Ask AI «query»" as the no-results fallback so the palette is always useful.
- Keep command-mode latency invisible: filter and re-rank on the client per keystroke (keep items mounted in the React tree, hide via DOM), and rank with fuzzy scoring plus aliases and per-command importance so the right action is reachable from a fragment.
- Make the command/AI boundary obvious and reversible: a clear mode pivot (Tab handoff, an explicit Ask-AI row, or a mode menu) so users never wonder whether pressing Enter runs a command or sends a message to the model.
- Stream AI output immediately with a distinct loading/thinking state and partial tokens — never freeze the overlay while the model works; preserve the typed query and provide an inline retry on error.
- Gate consequential AI actions behind explicit approval (`useHumanInTheLoop`), and prefer reversible actions with a toast + undo in the host app; never let a fuzzy-matched or AI-inferred destructive action fire on a single Enter.
- For anything beyond a one-shot interaction, hand off to a persistent surface (sidebar/chat) rather than overloading the ephemeral overlay with long transcripts — keep the palette transactional.
- Treat command registration as the AI's action vocabulary: `useFrontendTool` actions are both palette commands and AI tool-calls; the agent can never do more than the app already exposes, which bounds risk and keeps the palette and the AI in sync.

## Anti-patterns

- **Undiscoverable secret shortcut** — hiding the whole capability behind Cmd+K with no on-screen hint; power users find it, everyone else never learns it exists.
- **Ambiguous mode-mixing** — silently routing a typed command to the AI, or vice versa, making "ask AI" indistinguishable from "run command" so users can't predict what Enter will do.
- **Unfenced destructive actions** — firing high-stakes actions (delete, send, assign) on a single fuzzy match or AI inference with no confirmation, no preview, and no undo; a typo becomes data loss.
- **Multi-turn conversation in the overlay** — cramming a long conversation into the ephemeral palette; it dims the page, steals focus, has no durable history, and everything is lost on dismiss.
- **Janky ranking and opaque latency** — server round-trips per keystroke, no recent/suggested defaults on open, a dead "no results" state with no AI fallback, or a frozen overlay with no streaming/loading feedback while the model thinks.

## Accessibility

- Render the overlay as `<dialog>` (or `role="dialog"` with `aria-modal="true"`) and give it a descriptive `aria-label` (e.g., "Command palette") so screen-reader users know where they are and can navigate to it by landmark type.
- Apply a **focus trap** while the palette is open: Tab and Shift+Tab cycle through palette controls only; Escape closes the palette and returns focus to the element that had focus before it opened — this is a hard requirement for modal overlays.
- Implement **`aria-activedescendant`** on the input pointing to the currently highlighted item in the list; update it on arrow-key navigation so screen readers announce the focused command without moving DOM focus out of the input.
- Set `aria-live="polite"` on the AI answer region so screen readers announce the completed response after streaming ends — `aria-live="assertive"` would read every streaming token, producing unusable speech.
- Announce the mode pivot to screen readers: when switching from command mode to AI mode, update an `aria-live="polite"` region with "Switched to AI mode" so the change is not invisible.
- Respect `prefers-reduced-motion`: suppress the backdrop fade, list-item reorder animations, and streaming token flicker; show state changes immediately without motion cues for users who have requested reduced motion.

## Related

- [Side Panel / Sidebar Copilot](./side-panel.md) — the persistent docked alternative for multi-turn conversation and long-running agent work
- [Main Panel / Full-Page Chat](./main-panel.md) — the full-page chat surface that command palettes hand off to for deeper sessions
- [Floating Widget](./floating-widget.md) — a lighter-weight persistent launcher / popover that complements the palette for quick one-off queries
- [Ambient / Proactive](./ambient-proactive.md) — proactive suggestions surfaced before the user opens the palette
- [Inline Contextual](./inline-contextual.md) — per-object AI (e.g., CopilotTextarea's Cmd+K rewrite popup) that lives inside a single field rather than as an app-global overlay
- [Suggestions & Capability Surfacing](../components/suggestions-capabilities.md) — the suggestion items shown in the palette's idle / empty state
- [Human-in-the-Loop Prompt](../components/human-in-the-loop.md) — the approval card rendered in the awaiting-approval state
- [Tool Call](../components/tool-call.md) — inline tool-call cards rendered during AI runs inside the palette
- [Generative UI Inline](../components/generative-ui-inline.md) — rendering tool results as structured UI within the palette's streaming slot
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary / glossary](../reference/glossary.md)
- [Layouts README — Where AI Sits](./README.md)

## Sources

- https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/
- https://github.com/superhuman/command-score
- https://github.com/pacocoursey/cmdk
- https://github.com/pacocoursey/cmdk/blob/main/ARCHITECTURE.md
- https://manual.raycast.com/ai/chat
- https://manual.raycast.com/ai
- https://linear.app/changelog/2026-03-24-introducing-linear-agent
- https://linear.app/docs/agents-in-linear
- https://slack.engineering/a-faster-smarter-quick-switcher/
- https://slack.com/help/articles/202528808-Search-in-Slack
- https://better-cmdk.com/
- https://docs.copilotkit.ai/reference/v2/hooks/useFrontendTool
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderToolCall
- https://docs.copilotkit.ai/reference/v2/hooks/useConfigureSuggestions
- https://docs.copilotkit.ai/integrations/langgraph/custom-look-and-feel/headless-ui
- https://docs.copilotkit.ai/reference/v1/components/CopilotTextarea
- https://docs.copilotkit.ai/reference/v2/components/CopilotChatInput
- https://docs.ag-ui.com/sdk/js/core/events
