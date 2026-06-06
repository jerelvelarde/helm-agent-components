# Canvas / Workspace & Artifacts
> A dedicated, durable work surface — split pane, full immersive editor, or infinite spatial board — where the agent and user co-edit the actual deliverable, keeping it separate from the ephemeral chat transcript.

**Category:** Layout · **Cluster:** Layouts & workspaces · **Aliases:** artifacts pane, canvas, immersive / split-pane workspace, artifact panel, live preview pane, document/code workspace, research canvas, agent-native app surface

## Definition

A Canvas / Workspace is a persistent work surface mounted beside or in place of the chat panel that holds the durable artifact (document, code file, running app, diagram, dashboard, or freeform board) the agent and user iteratively co-edit. Unlike a chat message, the artifact outlives any single turn: it accumulates edits, carries version history, and is the deliverable rather than a by-product of conversation. The pattern solves the core problem of inline outputs — large content in the chat scrolls away, cannot be edited in place, and forces full regeneration for every small change. The canvas appears in two major forms: a split-pane layout (chat as control channel, artifact pane beside it) and an infinite spatial board (nodes arranged non-linearly, agent adds/rearranges). Both share the invariant that agent state and the work surface are synchronized as shared state.

## When to use / when not to

- **Use** when the output is substantial and reusable — a document, a code module, a React component, a dashboard — and the user will iterate on it across multiple turns rather than consume it once.
- **Use** when the agent must read the current state of the work surface (user edits, prior content) to produce its next action — shared state is the mechanism.
- **Use** for generated executable content (apps, HTML, interactive visualizations) that should run inside a sandboxed preview beside the conversation.
- **Do not use** for short, one-off answers (a fact, a short list, a single sentence) — opening a canvas pane for trivial output fragments attention across two surfaces unnecessarily.
- **Do not use** when the interaction is purely transactional (look up a record, send a message, run a calculation) and no persistent artifact emerges from it.

## Anatomy

```
┌─────────────────────────────────────────────────────────────────────┐
│  Canvas / Workspace Layout                                           │
│                                                                      │
│  ┌──────────────────────┐  │  ┌──────────────────────────────────┐  │
│  │   Chat panel         │  │  │   Artifact pane                  │  │
│  │   (control channel)  │  │  │                                  │  │
│  │                      │  │  │  ┌──────────────────────────┐    │  │
│  │  ● User message      │  │  │  │  Content surface          │    │  │
│  │  ● Assistant turn    │  │  │  │  (doc / code / live app)  │    │  │
│  │  ● Tool call card    │  │  │  └──────────────────────────┘    │  │
│  │  ● HITL prompt       │  │  │                                  │  │
│  │                      │  │  │  [Toolbar: diff / undo / export] │  │
│  │  [Input composer]    │  │  │  [Version badge]                 │  │
│  └──────────────────────┘  │  └──────────────────────────────────┘  │
│         control channel    │        artifact pane                    │
└────────────────────────────┴─────────────────────────────────────────┘
        split pane divider (resizable or fixed)
```

**Parts:**
- **Control channel** — the chat panel; user issues instructions, agent explains actions, HITL prompts surface here.
- **Artifact pane** — the right (or full-screen) surface that holds the live artifact.
- **Content surface** — the document editor, code editor, or live preview iframe inside the artifact pane.
- **Shared state** — the synchronized state layer both agent and UI read from and write to; changes propagate in both directions via AG-UI `STATE_SNAPSHOT` / `STATE_DELTA` events.
- **Inline targeted edit** — selecting a region of the artifact and asking the agent to modify only that part, without regenerating the whole.
- **Live preview** — a sandboxed runtime render of generated code or an app, updating as the artifact changes.
- **Version / diff toolbar** — shows artifact history, highlights additions/deletions, and enables revert.
- **Intermediate state streaming** — partial content filling into the pane while the agent works, giving progress visibility.

## States

| State | Trigger | UI treatment |
|---|---|---|
| **Empty** | No artifact has been created yet; workspace just opened | Placeholder / welcome message in the artifact pane; chat panel is the focus |
| **Opening / pane-expanding** | Agent or auto-open heuristic decides output qualifies as an artifact | Pane slides or expands in; skeleton or spinner occupies the content surface |
| **Agent generating (streaming)** | Agent is writing the artifact; `STATE_DELTA` events arriving | Content builds incrementally in the pane; streaming cursor visible; stop/cancel control enabled |
| **Rendering / preview building** | Generated code compiling in the sandbox runtime | Spinner over the live preview area; "Building preview…" label |
| **Editable** | Agent generation complete; user can directly edit the artifact | No streaming indicator; content surface accepts keyboard and pointer input; toolbar shows version badge |
| **Agent-editing a targeted region** | User selected a region and issued an instruction | Selected region highlighted; surrounding content grayed; streaming cursor inside the selection |
| **Running / executing** | Code artifact is actively executing in the sandbox | Execution indicator; console output visible; Stop button active |
| **Syncing shared state** | User or agent wrote to shared state; propagation in flight | Subtle sync indicator; optimistic update visible |
| **Diff / compare** | User triggered "show changes" or navigated version history | Additions highlighted green, deletions red/struck; revert button available |
| **Awaiting approval (HITL)** | Agent wants to apply a consequential or irreversible change | Change preview surfaced in chat panel; Accept / Reject controls block agent until user responds |
| **Error (build / render failure)** | Sandbox compile error or runtime exception | Error banner in the artifact pane; error details (console output); "Fix bug" or retry affordance |
| **Shared / published** | User exported or published the artifact | Share link badge in toolbar; artifact marked as published |

## Vocabulary

| Term | Definition |
|---|---|
| **Artifact** | A self-contained, durable output (doc, code, page, chart) rendered in its own pane for iterative refinement — Anthropic's term for substantial, standalone content (roughly 15+ lines). |
| **Split pane** | Two synchronized panes — chat on one side, the artifact/editor on the other — that update in lockstep. |
| **Shared state** | A synchronized state layer both agent and UI read from and write to in real time, keeping the canvas and agent mutually aware of each other's changes. |
| **Inline targeted edit** | Selecting a region of the artifact and asking the agent to modify only that region, not the whole artifact. |
| **Live preview** | A sandboxed running render of generated code or an app that updates as the artifact changes. |
| **Infinite canvas** | A pan/zoom spatial board where nodes (notes, sources, generated blocks) are arranged non-linearly and the agent can add or rearrange them. |
| **Node / block** | A discrete unit on an infinite canvas (a card, a research source, a generated snippet) that can be created, connected, or edited independently. |
| **Intermediate state streaming** | Showing the agent's in-progress partial output in the canvas while it works, making long generations feel like observable progress rather than a black box. |
| **Sandbox / sandboxed iframe** | A locked-down browser context (CSP headers + iframe `sandbox` attribute) in which executable artifacts run, restricting network, storage, and host-page access. |
| **Versioning / diff view** | Snapshots of the artifact across edits with a visual diff of additions and deletions, enabling comparison and revert. |
| **Open / auto-open heuristic** | The model's rule for deciding when output is substantial and self-contained enough to promote to a canvas pane vs. leaving it inline in chat. |
| **Live Artifact** | Claude's Cowork feature (Apr 2026): artifacts that remain connected to external data sources via MCP and refresh with current data when reopened. |
| **Remix / publish / share** | Distributing an artifact via a shareable link so others can view, use, and fork it into their own session. |
| **Control channel** | The chat panel in a split-pane layout — user instructions and agent explanations flow through it while the artifact pane holds the work output. |

## Real-world examples

- **Claude Artifacts (Anthropic)** — Renders self-contained code, HTML, SVG, Mermaid, Markdown, and full React apps in a live preview side panel that opens to the right of chat and updates in real time. Interactive artifacts run in a strictly sandboxed iframe (CSP + `sandbox` attribute, with process isolation) that restricts `fetch` and `localStorage`; artifacts can call `window.claude.complete(prompt)` to run their own Claude completions (billed to the viewing user). Supports versioning, persistent sidebar, publish/remix sharing, and Live Artifacts (Cowork, Apr 2026) that reconnect to MCP data sources on reopen. [Source](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
- **ChatGPT Canvas (OpenAI)** — Opens a split-screen editable panel (auto-opens for long content or on explicit request); users edit directly like a word processor; selection raises an inline toolbar with actions: adjust length, change reading level (Kindergarten to Graduate), add final polish, suggest edits. Code mode adds add logs / add comments / fix bugs and an Execute button that runs Python in-browser; "Show changes" diffs both docs and code across versions; targeted region editing lets users highlight a section and request changes scoped to that passage only. [Source](https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt-and-how-do-i-use-it)
- **Replit Agent 4** — Agent-first workspace where chat and a live web preview of the built app sit side by side; its Design Canvas (an infinite board replacing the earlier Design Mode) shows artifact previews and design mockups spatially, supporting multi-select, hover/active-state editing, and "Generate variants" for exploring design directions. [Source](https://blog.replit.com/whats-changed-agent3-to-agent4)
- **Cursor / Replit Agent / Devin (IDE-as-canvas)** — Agentic coding tools treating the entire editor/workspace as the persistent artifact: the agent panel drives file-level changes while a diff view, file tree, and live run pane track the evolving project — the same control-channel-plus-artifact split applied to whole codebases. [Source](https://www.cursor.com/)

## CopilotKit & AG-UI mapping

The canvas / workspace is CopilotKit's CoAgents sweet spot. The work surface and the agent share bidirectional state via `useAgent` (v2); the agent writes to the document and the UI re-renders on those writes, while user edits are reflected back to the agent.

**AG-UI events that drive the canvas:**
- `STATE_SNAPSHOT` — initial hydration of the shared artifact state when the canvas opens
- `STATE_DELTA` (JSON Patch / RFC 6902) — incremental updates as the agent edits; enables low-bandwidth real-time sync without full snapshots
- `TOOL_CALL_START/ARGS/END` + `TOOL_CALL_RESULT` — drive tool-call cards in the chat control channel and agent-applied actions on the artifact
- `RUN_STARTED/FINISHED/ERROR` — control the global "agent is working" state and the streaming cursor visibility in the pane

**CopilotKit primitives:**

| Primitive | Role in canvas |
|---|---|
| `useAgent` (v2) | Bidirectional shared state: `agent.state` reads the live artifact, `agent.setState(next)` writes back; v1: `useCoAgent` |
| `useCopilotReadable` | Pushes additional app context (current cursor position, selection, UI state) into the agent's context |
| `useHumanInTheLoop` | Gates consequential edits behind explicit user approval before the agent applies them |
| `useFrontendTool` | Registers browser-side tools the agent can call to mutate the canvas (e.g., scroll to a region, apply a highlight) |
| `useRenderTool` | Renders agent-driven tool calls (e.g., "inserting section", "applying format") as progress cards in the chat panel |
| `CopilotSidebar` / `CopilotChat` | The chat control channel mounted beside your canvas component |

```tsx
import { useAgent } from "@copilotkit/react-core/v2";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { z } from "zod";

// v1 equivalent: useCoAgent({ name: "doc-agent", initialState })
const { agent } = useAgent({ agentId: "doc-agent" });

// Gate irreversible agent edits behind explicit user approval
useHumanInTheLoop({
  name: "apply_structural_change",
  description: "Agent wants to restructure a document section",
  parameters: z.object({
    sectionId: z.string(),
    summary: z.string(),
    newContent: z.string(),
  }),
  render: ({ status, args, respond }) =>
    status === "executing" ? (
      <ApprovalCard
        title={`Restructure "${args.sectionId}"?`}
        description={args.summary}
        preview={args.newContent}
        onApprove={() => respond?.("approved")}
        onReject={() => respond?.("rejected")}
      />
    ) : (
      <ApprovalCard title={`Restructure "${args.sectionId}"?`} disabled />
    ),
});

export function DocumentWorkspace() {
  // agent.state is the live artifact, re-renders on STATE_SNAPSHOT / STATE_DELTA
  const content = agent.state?.documentContent ?? "";

  return (
    <div className="canvas-workspace">
      {/* Chat control channel — receives TEXT_MESSAGE_*, TOOL_CALL_*, HITL */}
      <CopilotSidebar defaultOpen>
        {/* CopilotSidebar wraps CopilotChat with a docked rail */}
      </CopilotSidebar>

      {/* Artifact pane — directly editable, synced with agent via shared state */}
      <DocumentEditor
        value={content}
        onChange={(next) => agent.setState({ ...agent.state, documentContent: next })}
      />
    </div>
  );
}
```

> v1 equivalent for shared state: `const { state, setState } = useCoAgent({ name: "doc-agent", initialState: { documentContent: "" } })`.

CopilotKit does not ship a hosted sandboxed-iframe artifact runtime (you bring your own preview component); it wires the agent to whatever canvas surface your app already owns.

For declarative or open-ended artifacts, CopilotKit supports A2UI (Google), Open-JSON-UI (OpenAI), and MCP Apps — see [Generative UI overview](https://docs.copilotkit.ai/learn/generative-ui).

## Best practices

- **Promote only qualifying output.** Reserve the canvas for content that is genuinely substantial, self-contained, and iterable. A short paragraph or a factual answer belongs inline. Thrashing the pane open and closed for small outputs trains users to ignore it.
- **Support targeted region edits.** Let users select a passage or element and instruct the agent to change only that region. Full regeneration for a one-sentence tweak discards user edits, burns latency and tokens, and breaks the iterative co-editing model.
- **Stream intermediate state visibly.** Pipe the agent's partial output into the canvas as it arrives (`STATE_DELTA` events). A 30-second generation that fills in progressively reads as work in progress; the same duration as a blank pane reads as a hang.
- **Make the user a true co-author.** The agent must read user edits, not just overwrite them. Write user changes back to shared state immediately so the agent's next action operates on the actual current document, not a stale snapshot.
- **Version every agent-made change and offer undo.** Show a diff before applying structural rewrites and keep a revert path. Silent overwrites with no history destroy trust, especially when the user has made manual edits the agent doesn't know about.
- **Gate consequential edits with HITL.** Use `useHumanInTheLoop` for actions that are large, irreversible, or affect content the user has touched. The render callback receives `respond` in the `Executing` state, blocking the agent until the user approves or rejects.
- **Sandbox all executable content.** Run generated code and interactive apps in an iframe with `sandbox` attribute and a strict Content Security Policy (restrict `fetch`, `localStorage`, and parent-page access). Never execute agent-generated code in the same browsing context as the host app.
- **Collapse to single-column on narrow viewports.** A split pane at 375 px is unusable. Render the artifact as a collapsible drawer or full-screen sheet on mobile; let the user toggle between chat and canvas views.
- **Make infinite canvases linearly traversable.** Pan/zoom spatial UIs are inaccessible without a keyboard and screen-reader path through the nodes. Provide a document-order traversal, announce newly added nodes, and support arrow-key navigation between blocks.

## Anti-patterns

- **Dumping large artifacts inline in the chat.** They scroll away, cannot be edited, and force full regeneration on every follow-up — the problem the canvas pattern exists to solve.
- **Full regeneration for every incremental change.** Regenerating the entire artifact for a one-sentence edit discards all user-made changes and burns unnecessary latency. Implement targeted / patch-level edits from the start.
- **Silent overwrites with no diff, version history, or undo.** An agent that rewrites the document without showing what changed destroys trust and makes user edits feel irreversible — especially dangerous when the agent operates on content the user has hand-edited.
- **Executing generated code without a real sandbox.** Running model-generated JavaScript in the same context as the host app creates serious security risks: XSS, data exfiltration, storage access. A sandboxed iframe with a strict CSP is the minimum viable isolation.
- **Chat and artifact state drifting out of sync.** If the agent references "the document" in chat but the artifact pane shows a different version (or nothing), users lose confidence in both surfaces. `STATE_SNAPSHOT` / `STATE_DELTA` should be the single source of truth.

## Accessibility

- **Landmark role for the artifact pane.** Wrap the pane in a `<section aria-label="Document workspace">` or `<aside aria-label="Artifact">` so screen readers announce it as a distinct region. The control channel (chat) should have its own landmark.
- **Focus management on pane open.** When the canvas opens (either auto-triggered or user-triggered), move focus predictably — to the artifact pane's heading or its first editable region. Do not leave focus stranded in the chat panel with no indication that a new surface appeared.
- **Keyboard dismissal.** The canvas pane must be closable without a pointer: `Escape` or a visible close button reachable by `Tab` should collapse it back to single-column.
- **Live region for agent edits.** When the agent applies a change to the artifact, announce a brief summary via an `aria-live="polite"` region: "Agent applied: restructured introduction." This prevents sighted users and screen-reader users from having different awareness of what just changed.
- **Editable surface semantics.** A rich-text or code editor surface needs proper `role="textbox"` (or editor-framework semantics) and `aria-multiline="true"`. Avoid contenteditable divs without ARIA; use a framework that manages semantics correctly (CodeMirror, ProseMirror, Monaco).
- **Reduced motion for streaming / pane transitions.** Respect `prefers-reduced-motion`: skip pane slide-in animations, reduce or eliminate the streaming cursor blink, and avoid continuous reflow animations while content streams in.

## Related

- [../components/generative-ui-inline.md](../components/generative-ui-inline.md) — Inline Generative UI (Static / Controlled): agent-driven UI rendered inside the chat thread rather than promoted to a canvas pane.
- [../components/human-in-the-loop.md](../components/human-in-the-loop.md) — Human-in-the-Loop Prompt: the approval / rejection gate for consequential canvas edits.
- [../components/tool-call.md](../components/tool-call.md) — Tool Call: how agent actions that mutate the canvas surface as progress cards in the chat.
- [../components/thinking-reasoning.md](../components/thinking-reasoning.md) — Thinking / Reasoning Display: agent chain-of-thought visible in the control channel while it drafts the artifact.
- [../components/agent-activity-traceability.md](../components/agent-activity-traceability.md) — Agent Status, Activity & Traceability: the run-level progress and error surface that frames the streaming state.
- [./side-panel.md](./side-panel.md) — Side Panel / Sidebar Copilot: the simpler layout where the agent panel is an overlay or rail, with no co-edited artifact surface.
- [./main-panel.md](./main-panel.md) — Main Panel / Full-Page Chat: full-page chat layout, no persistent artifact pane.
- [./tabs.md](./tabs.md) — Tabs / Mode Switching: an alternative to split pane for toggling between chat and canvas on constrained viewports.
- [../reference/copilotkit-primitives.md](../reference/copilotkit-primitives.md) — CopilotKit primitive reference.
- [../reference/ag-ui-protocol.md](../reference/ag-ui-protocol.md) — AG-UI protocol reference.
- [../reference/glossary.md](../reference/glossary.md) — Master vocabulary.

## Sources

- https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
- https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt-and-how-do-i-use-it
- https://openai.com/index/introducing-canvas/
- https://blog.replit.com/whats-changed-agent3-to-agent4
- https://www.cursor.com/
- https://docs.copilotkit.ai/learn/generative-ui
- https://docs.ag-ui.com/concepts/events
- https://docs.copilotkit.ai/learn/whats-new/v1-50
