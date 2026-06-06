# Threads / Conversation History
> Persistent, resumable conversation records surfaced as a navigable list so users can switch, search, and continue any past or live session. **Category:** Component · **Cluster:** Threads, history & capability surfacing · **Aliases:** thread list, conversation list, chat history sidebar, sessions sidebar, recents, ThreadList, chatSessions, Library, conversation threads

## Definition
Threads / Conversation History is the collection of a user's saved and active conversations with an agent, rendered as a navigable list (typically a left-hand sidebar) with controls to create, switch, rename, search, archive, and organize sessions. Each entry is a **thread** keyed by a stable `threadId` whose full event history is persisted server-side so users can resume across sessions and devices. In agentic apps, a thread is not merely a transcript — it is a **resumable run context**: reopening it replays historical events and, if a run is still active, reconnects to the live stream without losing tokens.

## When to use / when not to
- Use when the product expects users to return to prior sessions, compare results across runs, or continue long-horizon tasks (research, drafting, code generation) across multiple sittings.
- Use when multiple distinct conversation scopes exist and the user needs to switch between them without losing context — a sidebar thread list prevents context bleed and makes history discoverable.
- Use when compliance, auditing, or debugging requires a durable, inspectable record of every agent interaction.
- Do not use when the product is a one-shot ephemeral tool (e.g., a single-question lookup widget) — the overhead of thread management adds friction with no benefit.
- Do not use a thread list if the product deliberately enforces a single, continuous session without branches — a linear transcript is sufficient and a thread list implies choice that doesn't exist.

## Anatomy

```
┌──────────────────────────────────────────────┐
│ [+ New chat]                [Search 🔍]       │ ← new-chat button + search input
├──────────────────────────────────────────────┤
│ Today                                        │ ← date group heading
│  ▶ [●] Analyze Q3 financials           [···] │ ← active thread (live/streaming)
│      Draft investor memo                [···] │ ← selectable thread row
├──────────────────────────────────────────────┤
│ Yesterday                                    │
│      Due diligence on Acme Corp         [···] │
│      Compliance risk review             [···] │
├──────────────────────────────────────────────┤
│ Projects / Spaces                            │ ← optional workspace grouping
│  ▼ Q4 Deal Pipeline                          │
│       NDA review — Contoso               [···]│
│       Term sheet redline                 [···]│
└──────────────────────────────────────────────┘
  [···] context menu: Rename | Archive | Delete
```

**Parts:**
- **New-chat button** — creates a fresh thread with a clean context; always the primary affordance.
- **Search input** — filters by title and, for capable backends, message content.
- **Date group heading** — temporal bucketing (Today / Yesterday / Last 7 days / Older).
- **Thread row** — one entry per `threadId`; shows auto-generated or user-set title, optional timestamp, and a live indicator when a run is active.
- **Active indicator** — distinguishes a thread whose run is still streaming from idle threads.
- **Row action menu (`···`)** — contextual actions: Rename (inline edit), Archive, Delete (with undo), Share.
- **Workspace grouping** — higher-level container (Projects, Spaces) that bundles threads with shared context.
- **Branch picker** — appears inside an open thread when the user edits a prior message; shows `2 / 3` sibling branches with Previous / Next navigation.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Empty / no threads | First launch or all threads deleted | Zero-state illustration + prominent "New chat" CTA; no skeleton rows |
| Loading list | Initial fetch or route change | Skeleton rows (same height as thread rows) with shimmer animation |
| Idle list | Threads loaded, none selected | Scrollable rows grouped by date; hover reveals `···` menu |
| Active / selected | User clicks a row or returns to current thread | Row highlighted with `aria-current="page"`; bg tinted by brand color |
| New-chat draft | User clicks "New chat" | New row may appear at top in a pending state; message list is empty; auto-title pending |
| Resuming | User opens a past thread | Spinner or progress bar while historical events (`MESSAGES_SNAPSHOT`) replay |
| Reconnecting to live run | Thread is opened while a run is still streaming | Transparent reconnection; streaming resumes from last token; no duplicate messages |
| Renaming | User triggers inline rename (keyboard or click) | Row title becomes an `<input>` with commit-on-Enter / cancel-on-Escape |
| Archived view | User navigates to archive | Filtered list with unarchive action; visually distinct from default list |
| Deleting / deleted | User confirms delete | Row removed with animation; undo toast for ~5 s |
| Error loading or syncing | Network failure, auth expiry | Error state with retry button; no silent failure |

## Vocabulary

| Term | Definition |
|---|---|
| thread / session | A single ordered conversation identified by a stable `threadId`; the unit that appears as one row in the sidebar. |
| threadId | Stable identifier passed to the runtime to load, persist, and resume a specific conversation. |
| run / runId | One execution turn within a thread; AG-UI emits `RUN_STARTED` / `RUN_FINISHED` around it; a thread contains many runs. |
| new chat | Action that creates a fresh empty thread with a clean context; typically labeled "New chat" and bound to a keyboard shortcut. |
| branching / forking | Creating an alternative path from an existing point — editing a prior message or regenerating spawns a sibling branch; AG-UI models this via `parentRunId` on `RUN_STARTED`. |
| archive | Soft-removal that hides a thread from the default list without destroying it; recoverable via an `includeArchived` filter or a dedicated Archived view. |
| auto-title / rename | Thread label, frequently LLM-generated from the first message, always inline-editable. |
| persistence / resume | Server- or client-side storage of the event/message history so a thread survives reload, browser close, and device switch. |
| history recall / memory | Cross-thread retrieval where the agent proactively references older conversations vs. the per-thread context. |
| incognito / temporary chat | A conversation deliberately excluded from saved history; never stored, never recalled cross-thread. |
| workspace grouping | Higher-level containers that bundle related threads with shared instructions — Claude Projects, Perplexity Spaces, Harvey Vaults. |

## Real-world examples

- **ChatGPT (OpenAI)** — Left sidebar lists recent chats; hover reveals an ellipsis for rename, share, archive, or delete. A search box at the top filters by title and content. In January 2026 OpenAI extended full chat-history recall to Plus/Pro users: the model can reference any past thread autonomously and surface clickable source-thread references; archived chats are managed under Settings > Data controls. [Source](https://help.openai.com/en/articles/10056348-how-do-i-search-my-chat-history-in-chatgpt)
- **Claude (Anthropic)** — Minimalist left sidebar with a "New chat" button, a search input, a flat "Chats" section, and a "Projects" section for workspace-grouped conversations. The opt-in "Search and reference chats" feature (Aug 2025) lets Claude pull excerpts from prior sessions on user request. A ghost-icon button in the header starts an incognito chat that is never saved and excluded from cross-chat search. [Source](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
- **Perplexity** — Threads auto-save to a "Library" for signed-in users indefinitely; hovering a thread reveals an inline ellipsis for rename or delete. Threads can be grouped into Spaces (renamed from Collections) with shared instructions and reference files. Anonymous (signed-out) threads persist for 14 days, then are permanently deleted unless saved. [Source](https://www.perplexity.ai/help-center/en/articles/10354775-technical-capabilities-of-threads)
- **assistant-ui** — Exposes first-class `ThreadListPrimitive.Root / .New / .Items` and `ThreadListItemPrimitive.Root / .Trigger / .Title / .Archive / .Unarchive / .Delete`. The `useRemoteThreadListRuntime` hook plugs in a custom thread database for persistence, archiving, and metadata. `BranchPickerPrimitive.Previous / .Next / .Number / .Count` handles branch navigation. [Source](https://www.assistant-ui.com/docs/ui/thread-list)

## CopilotKit & AG-UI mapping

CopilotKit v2 (≥ v1.50) ships threads as a first-class primitive. `CopilotChat` rendered **without** an explicit `threadId` implicitly creates a new thread; rendering it **with** a `threadId` loads and resumes that conversation. Under the hood, the runtime replays `MESSAGES_SNAPSHOT` events to rehydrate the message list, then transparently reconnects to a live stream if a run is still active.

For sidebar management (list, rename, archive, delete, realtime sync), use the thread-management APIs exposed via `useCopilotKit` from `@copilotkit/react-core`. Thread storage is pluggable: in-memory/SQLite for development, Copilot Cloud (managed) or Copilot Enterprise (self-hosted) for production persistence and stream reconnection across devices.

AG-UI events that drive the thread surface:
- `RUN_STARTED` — carries `threadId`, `runId`, and an optional `parentRunId` that enables git-like branching / time-travel
- `RUN_FINISHED` / `RUN_ERROR` — settle the active-indicator state on the thread row
- `MESSAGES_SNAPSHOT` — the full serialized event history replayed on resume

```tsx
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-core/v2/styles.css";

// A minimal custom thread-switcher sidebar
function ThreadSidebar() {
  // useCopilotKit gives access to thread metadata when using a persistence-enabled runtime.
  // See https://docs.copilotkit.ai/learn/whats-new/v1-50 for thread management APIs.
  const { threadId, setThreadId } = useCopilotKit();

  const threads = useMyThreadStore(); // your persistence layer

  return (
    <nav role="navigation" aria-label="Conversation history">
      <button onClick={() => setThreadId(undefined)}>+ New chat</button>
      <ul role="listbox" aria-label="Past conversations">
        {threads.map((t) => (
          <li
            key={t.id}
            role="option"
            aria-selected={t.id === threadId}
            aria-current={t.id === threadId ? "page" : undefined}
          >
            <button onClick={() => setThreadId(t.id)}>{t.title}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// CopilotChat resumes the thread when threadId is supplied;
// omit threadId (or pass undefined) to start a new conversation.
export function App({ selectedThreadId }: { selectedThreadId?: string }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div style={{ display: "flex" }}>
        <ThreadSidebar />
        <CopilotChat threadId={selectedThreadId} />
      </div>
    </CopilotKit>
  );
}
```

> **v1 equivalent:** `CopilotSidebar` and `CopilotPopup` use the same `threadId` prop for resume. Full thread CRUD (create/rename/archive/delete) requires the v2 persistence runtime; see [v1.50 release notes](https://docs.copilotkit.ai/learn/whats-new/v1-50).

## Best practices

- **Auto-title from the first turn, but make it editable.** A bare "New chat" label or a raw timestamp makes a list of 20 threads unscannable. Generate a short, meaningful title immediately after the first user message, and expose an inline rename path.
- **Resume is a contract, not a courtesy.** Persist by `threadId` server-side and replay `MESSAGES_SNAPSHOT` on open; if a run is still live, reconnect transparently so a mid-generation reload loses nothing. Invisible resume is the success case.
- **Provide search over content, not just titles.** Users remember what they asked, not what they titled a chat. Full-text search across message content is the difference between a usable history and an archaeological dig.
- **Group by recency and workspace, not flat chronology.** Today / Yesterday / Last 7 days / Projects section prevents the list from becoming a featureless scroll of dates.
- **Soft-delete with undo, not hard delete.** Archive keeps the data recoverable; undo a delete for ~5 seconds prevents accidental loss. Permanent deletion should require explicit confirmation with clear data-loss language.
- **Sync thread metadata in real time across tabs and devices.** A WebSocket subscription on creates, renames, and archives keeps the list consistent without a manual refresh — the same user opening two tabs should see one coherent list.
- **Preserve branches immutably and make them discoverable.** When a user edits a prior message and regenerates, keep the original path intact and surface a branch picker (`2 / 3`) so they can compare without fear of overwriting work. AG-UI's `parentRunId` on `RUN_STARTED` is the wire-level hook for this.
- **Be explicit about persistence scope.** Clearly label which threads are saved vs. incognito/temporary, whether cross-thread recall is active, and where users go to export or delete their data — this is a trust surface, not just UX.

## Anti-patterns

- **Window-only or local-only history.** Any history that evaporates on cache clear, browser switch, or reload is a broken promise. If persistence is scoped to local storage, warn the user explicitly and offer export.
- **Icon-only row actions with no keyboard path.** A rename or delete that lives behind an icon-only hover button is inaccessible. Every row action needs a visible label or a disclosed menu with labeled items, and full keyboard access.
- **Silent permanent deletion and no archive.** Auto-discarding anonymous or old threads without visible notice — or offering only destructive delete with no undo — erodes trust. Provide archive + a time-bounded undo.
- **Mandatory branching on every regenerate.** Auto-creating a branch on each retry without an opt-out clutters the list and forces users to manage lineage they didn't ask for. Branch explicitly, on user action.
- **Burying search and rename in settings.** History management belongs on the sidebar where the threads live — not buried three levels deep in a settings drawer.

## Accessibility

- Render the thread list as `role="listbox"` (or `role="navigation"` for landmark purposes) with individual rows as `role="option"` or `<li>` inside a `<ul>`. Keyboard users must be able to move between rows with `ArrowUp` / `ArrowDown` and activate with `Enter` or `Space`.
- Mark the currently open thread with `aria-selected="true"` on the row and `aria-current="page"` on the link/button to give screen-reader users a clear "you are here" signal.
- Every row action (rename, archive, delete) must have a discrete, descriptive `aria-label` — for example `aria-label="Archive 'Analyze Q3 financials'"` — rather than a bare icon with no text alternative.
- When a rename `<input>` appears inline, move focus to it immediately and announce the mode change. `Escape` should cancel and return focus to the row; `Enter` should commit and return focus. Do not trap focus in the input after cancel.
- The undo toast after a delete should be announced via an `aria-live="polite"` region so screen-reader users know they can recover.
- For users with `prefers-reduced-motion`, suppress shimmer skeleton animation and row-removal slide transitions in favor of an immediate visual change.

## Related

- [Chat Message](./chat-message.md) — the message bubble component rendered inside an open thread
- [Input Box / Composer](./input-composer.md) — the input surface at the bottom of the active thread
- [Human-in-the-Loop Prompt](./human-in-the-loop.md) — blocking interaction inside a thread that must be resolved before the run continues
- [Agent Status, Activity & Traceability](./agent-activity-traceability.md) — the per-run activity indicators that appear on the active thread row
- [Suggestions & Capability Surfacing](./suggestions-capabilities.md) — prompt starters shown in the empty new-thread state
- [Sub-Agents / Multi-Agent Orchestration](./sub-agents.md) — multi-run threads where sub-agent runs each carry their own `RUN_STARTED` / `RUN_FINISHED`
- [Side Panel / Sidebar Copilot](../layouts/side-panel.md) — the layout shell that typically houses the thread list
- [Main Panel / Full-Page Chat](../layouts/main-panel.md) — full-page layout where the thread list is a left column
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary](../reference/glossary.md)

## Sources

- https://help.openai.com/en/articles/10056348-how-do-i-search-my-chat-history-in-chatgpt
- https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context
- https://www.perplexity.ai/help-center/en/articles/10354775-technical-capabilities-of-threads
- https://www.assistant-ui.com/docs/ui/thread-list
- https://docs.copilotkit.ai/learn/whats-new/v1-50
- https://docs.ag-ui.com/concepts/events
- https://docs.copilotkit.ai
