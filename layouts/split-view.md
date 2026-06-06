# Split View — Chat Drives a Workspace

> A persistent conversation pane beside a live output/preview/document workspace pane, where every chat instruction mutates the same artifact in place rather than spawning a new reply.

**Category:** Layout · **Cluster:** Layouts & workspaces · **Aliases:** Side-by-side chat + artifact, Dual-pane / two-pane chat, Chat + Canvas, Chat + Artifact panel, Left-panel strategic partner, Conversation-driven workspace, Split-screen co-creation, Chat + live preview, Prompt pane + output pane

## Definition

Two adjacent panes fill the primary working surface: a persistent chat/prompt pane (typically left, one-third to one-half the width) and a workspace pane that renders the live artifact — a UI preview, code editor, document, or embedded IDE — in the remaining space. The two halves are bound around a single evolving object: chat is the control surface, the workspace is the deliverable. The pattern is encountered structurally — users land in a workspace that is already split (Bolt, Lovable, Devin) — or auto-triggers when the AI produces something substantial enough to warrant a dedicated surface (Claude opens an Artifact at ~15 lines; ChatGPT Canvas opens when it detects a writing or coding task). The AI is perceived as a collaborator co-owning the deliverable in the workspace while the human owns intent in chat, iterating on the same object turn by turn. This is the dominant layout for AI app builders, document/code co-creation, and autonomous coding agents in 2025–2026.

## When to use / when not to

- **Use** when the work has a single, structured, persistent output — a UI, an app, a document, a chart, a schema — that the user needs to see and refine while they converse. Chat alone is the wrong container for an artifact.
- **Use** when iteration is tight and incremental: the value is the feedback loop of "describe → see it change → describe again" against the same object, with the previous state still visible.
- **Use** when the artifact benefits from a dedicated, full-height surface (live preview, code editor, rich text) that a narrow popup or inline chat bubble cannot host.
- **Use** when you want the AI perceived as a partner co-owning a deliverable and you can give that deliverable real estate.
- **Do not use** for one-off Q&A, retrieval, or transient answers — there is no durable artifact to anchor the second pane, and an empty workspace looks broken.
- **Do not use** when the user is working in a pre-existing app the AI did not author and just needs occasional help — use a docked [Side Panel](./side-panel.md) assistant instead.
- **Do not use** when the work is inherently many parallel objects, branches, and spatial relationships (mood boards, node graphs, design exploration) — that calls for an [infinite canvas](./canvas-workspace.md), not a rigid left-chat/right-artifact frame.

## Anatomy

```
┌──────────────────────┬───────────────────────────────────────┐
│  ┌────────────────┐  │  ┌───────────────────────────────────┐ │
│  │  Header / title│  │  │  Workspace toolbar                │ │  ← Preview | Code toggle, version selector
│  ├────────────────┤  │  ├───────────────────────────────────┤ │
│  │                │  │  │                                   │ │
│  │  Message list  │  │  │  Artifact / workspace pane        │ │  ← rendered preview, code editor,
│  │  (chat thread) │  │  │  (live, streaming, interactive)   │ │    document, or embedded IDE
│  │                │  │  │                                   │ │
│  ├────────────────┤  │  │                                   │ │
│  │  Suggestion    │  │  │  [Streaming / building state:     │ │
│  │  pills         │  │  │   incremental rendering in place] │ │
│  ├────────────────┤  │  └───────────────────────────────────┘ │
│  │  Composer      │  │  ↕ version selector / back button      │
│  └────────────────┘  │                                        │
│  ← Chat pane (~⅓) →  │  ←──────── Workspace pane (~⅔) ──────→ │
└──────────────────────┴───────────────────────────────────────┘
              ↑
      Resize handle (draggable divider)
```

**Parts:**

- **Chat pane** — the persistent conversation surface (message list, composer, suggestion pills); hosts `CopilotChat` or `CopilotSidebar`.
- **Message list / thread** — scrollable turn-by-turn conversation including tool-call cards and HITL prompts.
- **Composer** — pinned input row with send, stop-generation, attach, and mode controls.
- **Workspace pane** — the output half; a rendered preview, code/file editor, rich-text document, or embedded IDE+terminal+browser. Rendered as ordinary app UI — not inside the chat transcript.
- **Workspace toolbar** — Preview / Code toggle, version selector / back button, download, copy, fullscreen, and (in agentic products) Stop.
- **Preview / Code toggle** — internal switch between the rendered running result and its underlying source.
- **Version selector** — control to browse and restore prior artifact states without losing work.
- **Design Mode / Visual Edits** — direct point-and-click manipulation of the rendered artifact that writes back to source, bypassing chat for fine adjustments.
- **Inline shortcuts** — affordances inside the artifact itself (highlight text or an element and apply contextual actions).
- **Resize handle** — draggable divider between the two panes.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle / empty | Workspace shows a placeholder; chat awaits the first prompt | Welcome screen with suggestion pills; empty workspace surface with call-to-action copy |
| Invoked / planning | User submits intent; `RUN_STARTED` fires | Chat acknowledges; agentic products show a task plan or scope confirmation before building; composer may disable |
| Streaming / building | Agent produces output; `TEXT_MESSAGE_CONTENT` + `STATE_DELTA` events arrive | Artifact renders incrementally in the workspace (text streams, components build progressively, terminal output scrolls); Stop button visible; chat shows a parallel streaming message |
| Applied / settled | `RUN_FINISHED`; new artifact version is complete | Workspace shows the settled artifact; chat message confirms what changed; previous version reachable via version selector; composer re-enabled |
| Direct-edit | User selects an element, highlights text, or edits a file in the workspace | Workspace reflects the change in place; change syncs back to the underlying source and to agent context; no chat turn required |
| Take-over (agentic) | User pauses the agent and acts in the embedded IDE/terminal/browser | Agent paused; workspace fully editable; a "Resume" / "Hand back" control signals re-delegation |
| Diff / review (HITL) | Agent calls `useHumanInTheLoop` before applying a consequential change | Approve/reject card rendered in chat thread; workspace may show a diff overlay; composer blocked until resolved |
| Dismissed / collapsed | User closes one pane via the toggle or keyboard shortcut | Surviving pane expands to full width; split can be restored; on narrow viewports, falls back to a tab toggle |
| Error / interrupted | Generation fails mid-stream; `RUN_ERROR` | Partial artifact stays visible; error card in chat with retry/continue affordance; workspace does not blank |

## Vocabulary

| Term | Definition |
|---|---|
| Artifact / Canvas | The durable, editable object rendered in the workspace pane (document, app, component, diagram) that the conversation co-creates and mutates in place. |
| Workspace pane | The output half of the split — a preview, code/file editor, document, or embedded IDE — that the chat drives. |
| Preview / Code toggle | An internal switch in the workspace pane between the rendered running result and its underlying source (Bolt's `<>` Code Preview icon). |
| Design Mode / Visual Edits | Direct point-and-click manipulation of the rendered artifact (select an element, change color/spacing/typography) that writes back to code, bypassing chat for fine adjustments. |
| Inline shortcuts | Affordances inside the artifact itself — highlight text or code and apply actions such as "suggest edits," "adjust length," "change reading level" (ChatGPT Canvas). |
| Version selector | Control to browse and restore prior states of the artifact without losing work, since the single object is rewritten on each turn. |
| Streaming / generative UI | Incremental rendering of the artifact as the model produces it (token-by-token text, progressively-building components), so the workspace fills in live rather than blanking until done. |
| Take-over / hand-off | The user stepping into the workspace to directly run a command or edit a file, then handing control back to the agent — central to autonomous coders (Devin, Replit Agent). |
| Receding chat | The pattern where, as the agent grows more capable, the chat pane shrinks or collapses by default and the workspace dominates the screen. |

## Real-world examples

- **ChatGPT Canvas (OpenAI)** — Splits the screen with conversation on the left and a document/code Canvas on the right. Opens automatically on writing or coding tasks (output over ~10 lines) or on the phrase "use canvas." The user directs edits via chat or acts directly on the artifact: type into the document, highlight a section and use inline writing shortcuts (suggest edits, adjust length from Shortest to Longest, change reading level from Kindergarten to Graduate School, add final polish, add emojis), with inline suggestions to accept or reject and version-history arrows to restore previous states. [Source](https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt-and-how-do-i-use-it)
- **Claude Artifacts (Anthropic)** — When Claude produces substantial, self-contained content (typically over 15 lines — documents, code, single-page HTML, SVG, diagrams, or interactive React components) it renders it in a dedicated window to the right of the chat; the conversation stays left. Users ask Claude to modify the artifact in place, switch between iterations with a version selector, edit a prior chat message to fork a new version, and use lower-right buttons to view code, copy, or download. [Source](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
- **Bolt.new (StackBlitz)** — Chat alongside a live preview by default; a Code Preview icon (`<>`) toggles the right pane between the running preview and a full Code view with a file tree. Users can highlight code and click "Ask Bolt" to drive changes conversationally, and a Visual Inspector lets them click an element to change its text or styling, with Bolt updating the underlying code automatically. [Source](https://support.bolt.new/building/using-bolt/code-view)
- **Devin (Cognition)** — A conversational interface on one side paired with an embedded workspace: a shell/terminal, a full IDE/code editor, and an interactive browser. Interactive Planning has Devin present a detailed task plan — with code citations — that the user confirms or modifies before execution. Everything streams in real time so the user can supervise, jump in to run commands, or make direct edits, then hand control back — "like watching a remote pair-programming session." [Source](https://docs.devin.ai/get-started/devin-intro)

## CopilotKit & AG-UI mapping

**Primitives:** `CopilotChat` / `CopilotSidebar` (chat pane), `useAgent` (shared agent state), `useFrontendTool` (chat-drives-workspace coupling), `useRenderTool` / `useComponent` (generative UI), `useHumanInTheLoop` (gated diffs), `useConfigureSuggestions` (idle-state seeds).

Build the chat half with `CopilotChat` (full-height, no toggle) or `CopilotSidebar` (collapsible, supports the receding-chat pattern). `CopilotPopup` is wrong here — it is a floating bubble, not a persistent half-screen pane. Render the artifact in your own right-hand pane as ordinary React app UI — **not** inside the chat transcript. Drive it through shared agent state: call `useAgent({ agentId })` to read reactive `agent.state` and render the live document/preview/editor outside the chat; the agent streams `STATE_SNAPSHOT` for initial hydration then incremental `STATE_DELTA` (JSON Patch, RFC 6902) events so the workspace updates in place turn by turn, alongside `TEXT_MESSAGE_*` events for the chat side. Expose `useFrontendTool` actions (Zod params + handler) that mutate artifact state — e.g. `updateDocument`, `setComponentProps` — so the model edits the right pane by calling tools. Use `useRenderTool` (or `useComponent`) for generative UI: render custom React keyed on `ToolCallStatus` `"inProgress"` → `"executing"` → `"complete"` so the workspace shows streaming/building states. Gate consequential edits with `useHumanInTheLoop` to show an approve/reject step before changes land in the artifact. Seed the idle/empty state with `useConfigureSuggestions`.

Note: `CopilotTextarea` (v1-only) can serve as the document surface for text-artifact authoring with AI autocomplete; it has no direct v2 equivalent.

```tsx
import { CopilotSidebar } from "@copilotkit/react-ui";
import {
  useAgent,
  useFrontendTool,
  useRenderTool,
  useHumanInTheLoop,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

// v1 equivalents: useCoAgent, useCopilotAction, useCopilotChatSuggestions

interface DocState {
  title: string;
  body: string;
  version: number;
}

function DocumentWorkspace() {
  // Bidirectional shared state — driven by STATE_SNAPSHOT + STATE_DELTA events
  const { agent } = useAgent<DocState>({ agentId: "doc-agent" });
  const doc = agent.state; // live artifact; update renders instantly in the right pane

  // Tool the agent calls to rewrite the document — mutates the right pane, not the chat
  useFrontendTool({
    name: "updateDocument",
    description: "Replace the document body with revised content",
    parameters: z.object({
      body: z.string(),
      changeSummary: z.string(),
    }),
    handler: async ({ body }) => {
      agent.setState((prev) => ({ ...prev, body, version: prev.version + 1 }));
    },
    render: ({ status, args }) => (
      <div className="tool-badge">
        {status === "complete"
          ? `Applied: ${args.changeSummary}`
          : `Rewriting document…`}
      </div>
    ),
  });

  // Gate destructive rewrites with an approve/reject step before they land
  useHumanInTheLoop({
    name: "confirmMajorRewrite",
    parameters: z.object({ preview: z.string(), reason: z.string() }),
    render: ({ status, args, respond }) =>
      status === "executing" ? (
        <div className="hitl-card">
          <p>{args.reason}</p>
          <pre>{args.preview}</pre>
          <button onClick={() => respond?.("approved")}>Apply</button>
          <button onClick={() => respond?.("rejected")}>Discard</button>
        </div>
      ) : (
        <div className="hitl-card hitl-card--settled">Review complete</div>
      ),
  });

  // Render backend tool calls (e.g. web search) with live status in chat
  useRenderTool({
    name: "search_web",
    parameters: z.object({ query: z.string() }),
    render: ({ status, args, result }) => (
      <div className="tool-card">
        {status === "complete"
          ? `Found: ${result}`
          : `Searching "${args.query}"…`}
      </div>
    ),
  });

  // Seed the empty/idle workspace with context-aware starter prompts
  useConfigureSuggestions({
    instructions: "Suggest 3 short document-editing actions based on current content.",
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left — chat pane; CopilotSidebar is collapsible (receding-chat pattern) */}
      <CopilotSidebar
        defaultOpen={true}
        labels={{ title: "Document Co-author" }}
      />

      {/* Right — artifact/workspace pane; plain React, not inside the chat transcript */}
      <main style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
        <h1>{doc?.title}</h1>
        <article>{doc?.body}</article>
      </main>
    </div>
  );
}
```

> AG-UI events in play: `RUN_STARTED` (disable composer, show planning state), `TEXT_MESSAGE_CONTENT` (stream chat tokens), `STATE_SNAPSHOT` (initial artifact hydration), `STATE_DELTA` (incremental workspace updates, JSON Patch), `TOOL_CALL_START/ARGS/END` + `TOOL_CALL_RESULT` (updateDocument / confirmMajorRewrite / search_web card lifecycle), `RUN_FINISHED/ERROR` (settle or error state).

## Best practices

- **Keep one artifact, mutate in place.** Chat instructions rewrite the same object in the workspace — never spawn new copies or push the artifact into the chat transcript where it gets buried under new messages.
- **Stream the workspace; never blank it.** Render the artifact incrementally (token-by-token text, progressively-building components, live terminal output) so the user sees motion within ~500ms of the first token. Do not replace a working artifact with an empty pane during regeneration.
- **Always offer Stop and retry-from-partial.** Show a Stop Generation control during streaming; on error keep the partial artifact visible with a retry/continue option rather than discarding what the user already reviewed.
- **Version everything and make rollback one click.** Because each turn overwrites the artifact, provide a visible version selector or back button so users can compare and restore previous states — never lose prior versions silently.
- **Provide a direct-manipulation escape hatch for fine edits.** Pixel-level or word-level tweaks are painful to dictate in prose; let users select an element, highlight text, or edit a file directly and write it back to source (Canvas inline shortcuts, Bolt Code view).
- **Stabilize layout against streaming reflow.** Reserve height for the workspace pane, scroll the pane (not the page), and defer rendering of incomplete structures so growing content does not cause the workspace to jump while the user reads.
- **Make panes resizable, collapsible, and responsive.** Let power users widen the workspace or collapse the chat (the receding-chat trend); on narrow or mobile viewports, fall back to a tab toggle between chat and workspace rather than cramming both side by side.
- **Gate consequential or destructive changes with human-in-the-loop.** Show a diff or proposed-action card for approve/reject before changes land in the artifact; keep keyboard focus order and ARIA roles correct across the pane boundary so screen-reader users can move between conversation and workspace.

## Anti-patterns

- **Using the split for transient Q&A with no durable artifact** — the workspace sits empty or shows throwaway content, making the layout feel broken and wasting half the screen.
- **Dumping the artifact into the chat stream and a pane simultaneously, or regenerating it as a fresh block each turn** — the user loses the single source of truth, prior versions get buried under new messages, and scroll fatigue defeats the purpose of the split.
- **Chat-only control with no direct manipulation** — forcing users to describe in prose what a single click or text-highlight could do for a color, spacing adjustment, or one-word fix.
- **Blanking or hard-reflowing the workspace on every edit** — clearing the pane to a spinner, or letting streamed content shove the layout around, so users cannot keep reading or trust the result.
- **Confusing the pattern with its neighbors** — bolting a fixed two-pane split onto a pre-existing app where a docked [Side Panel](./side-panel.md) belongs, or forcing inherently spatial and branching many-object work (design exploration, node graphs, mood boards) into a rigid left-chat/right-artifact frame instead of an [infinite canvas](./canvas-workspace.md).

## Accessibility

- Assign distinct landmark roles to each pane: the chat pane as `<aside role="complementary" aria-label="Chat">` (or equivalent) and the workspace pane as `<main aria-label="Document workspace">`; screen-reader users should be able to navigate directly to either landmark.
- Apply `aria-live="polite"` to the workspace pane's content region so screen readers announce artifact updates after streaming completes — **not** `aria-live="assertive"`, which would read every partial token and produce an unusable torrent of speech.
- Keep keyboard focus coherent across the pane boundary: Tab and Shift+Tab must cycle through both panes in document order, and Escape in the chat composer should not trap focus in the chat indefinitely. Provide a visible **"Skip to workspace"** / **"Skip to chat"** bypass link for keyboard users who want to jump across panes.
- The **Stop Generation** control must be keyboard-reachable during streaming without tabbing through every partially-rendered token in the workspace. Assign a discoverable keyboard shortcut (e.g., Escape or a dedicated binding) and announce it in the button's `aria-describedby`.
- For the **resize handle**, expose it as `role="separator"` with `aria-orientation="vertical"`, `aria-valuenow` / `aria-valuemin` / `aria-valuemax` for the current split ratio, and support arrow-key resizing in addition to drag.
- Respect `prefers-reduced-motion`: suppress or dramatically slow streaming reflow animations, progressive-build transitions, and scroll-snap effects in the workspace pane when the user has requested reduced motion.

## Related

- [Side Panel / Sidebar Copilot](./side-panel.md) — the right alternative when the AI assists a pre-existing app rather than co-authoring an artifact
- [Main Panel / Full-Page Chat](./main-panel.md) — full-page chat without a persistent workspace pane
- [Canvas / Workspace & Artifacts](./canvas-workspace.md) — infinite-canvas layout for spatial, multi-object, and branching creative work
- [Tabs](./tabs.md) — tab-toggle alternative for narrow viewports where side-by-side is not viable
- [Floating Widget](./floating-widget.md) — the lightweight sibling when a persistent half-screen pane is too heavy
- [Inline Contextual](./inline-contextual.md) — AI inline inside the artifact surface itself
- [Command Palette](./command-palette.md) — ephemeral command layer that can trigger workspace mutations
- [Grid / Matrix](./grid-matrix.md) — multi-artifact layouts where many objects are managed in parallel
- [Ambient / Proactive](./ambient-proactive.md) — unsolicited agent suggestions surfaced inside or around the workspace
- [Layouts README](./README.md) — "Where AI Sits" placement decision framework and index
- [Generative UI Inline](../components/generative-ui-inline.md) — static and declarative generative UI rendered in the chat thread
- [Tool Call](../components/tool-call.md) — tool-call cards rendered during agent runs
- [Human-in-the-Loop Prompt](../components/human-in-the-loop.md) — approve/reject cards gating artifact mutations
- [Agent Activity & Traceability](../components/agent-activity-traceability.md) — step-by-step run visibility for agentic workspace builds
- [Sub-agents](../components/sub-agents.md) — multi-agent orchestration for complex workspace tasks
- [Threads / Conversation History](../components/threads-history.md) — multi-session chat history alongside the workspace
- [Suggestions & Capability Surfacing](../components/suggestions-capabilities.md) — suggestion pills in the chat idle state
- [Input Composer](../components/input-composer.md) — the composer embedded in the chat pane
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary / glossary](../reference/glossary.md)

## Sources

- https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt-and-how-do-i-use-it
- https://openai.com/index/introducing-canvas/
- https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
- https://support.bolt.new/building/using-bolt/code-view
- https://bolt.new/blog/inside-bolt-v2-hidden-power-features
- https://lovable.dev/blog/introducing-visual-edits
- https://docs.lovable.dev/features/design
- https://blog.replit.com/introducing-agent-3-our-most-autonomous-agent-yet
- https://docs.devin.ai/get-started/devin-intro
- https://docs.devin.ai/work-with-devin/interactive-planning
- https://cognition.ai/blog/devin-2
- https://www.lukew.com/ff/entry.asp?2105=
- https://thefrontkit.com/blogs/what-is-streaming-ui-in-ai-applications
- https://docs.copilotkit.ai/reference/v2/components/CopilotSidebar
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- https://docs.copilotkit.ai/reference/v2/hooks/useFrontendTool
- https://docs.copilotkit.ai/reference/v2/hooks/useAgent
- https://docs.copilotkit.ai/reference/v2/hooks/useConfigureSuggestions
- https://docs.copilotkit.ai/reference/v1/components/CopilotTextarea
- https://docs.ag-ui.com/concepts/events
