# Input Box / Composer
> The control surface where a user authors, assembles context, and submits a turn to the agent. **Category:** Component · **Cluster:** Conversational core · **Aliases:** composer, prompt input, chat input, message box, input bar, prompt bar, text entry

## Definition

The Input Box / Composer is the interactive zone at the bottom of a chat or agent UI through which the user authors and dispatches a message turn. It owns draft state, submission semantics (Enter-to-send vs. Shift+Enter-for-newline), file attachment and paste handling, and the send↔stop toggle that lets users interrupt an in-flight generation. In modern agentic applications it doubles as a **context-assembly surface**: users attach files, pick tools, invoke slash commands, and add @-mentions to construct a rich prompt, not just a plain text string.

## When to use / when not to

- Use whenever the primary interaction mode is freeform user-to-agent text: chat assistants, coding copilots, research agents, side-panel copilots, and full-page chat layouts.
- Use as the starting point for human-in-the-loop reply surfaces where the agent pauses and waits for a user-authored response (vs. a structured approval button).
- Use a full-featured composer (with slash commands, @-mentions, attachments) when the domain benefits from context assembly—coding, document editing, research—not just simple question-answer chat.
- **Do not use** as a replacement for a structured form when the required inputs are bounded and known in advance; a HITL prompt card or a modal form is more trustworthy for high-stakes inputs.
- **Do not use** a plain `<input type="text">` for any agent chat surface; an auto-growing textarea with proper keyboard semantics and a stop button is the minimum viable composer.

## Anatomy

```
┌──────────────────────────────────────────────────────┐
│  [Attachment chips row — optional, appears on attach] │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Textarea (auto-grow, up to max rows, then scrolls)   │
│  Placeholder: "Ask anything…"                         │
│                                                       │
├──────────────────────────────────────────────────────┤
│  [Tools menu / model picker]      [Send / Stop btn]   │
├──────────────────────────────────────────────────────┤
│  Disclaimer / affordance footer (token count, hint)   │
└──────────────────────────────────────────────────────┘
```

**Parts:**
- **Auto-grow textarea** — grows with content to a configurable max (default 5 rows), then becomes internally scrollable; switches to stacked layout when multiline so toolbar controls don't crowd the text.
- **Send / submit button** — dispatches the draft; disabled until `canSend` is true (non-empty, non-whitespace content).
- **Stop button** — the square/abort control the send button morphs into while the agent is running; interrupts the AG-UI run stream.
- **Tools menu / model picker** — toolbar affordances for selecting tools, modes, or the active model; rendered only when configured.
- **Attachment / dropzone** — accepts files via picker, drag-and-drop, or paste; previewed as removable chips above the textarea.
- **Slash command overlay** — triggered by `/`; overlaid typeahead menu of available actions.
- **@-mention / #-context picker** — triggered by `@` or `#`; opens a searchable picker for files, symbols, participants, or workspace context.
- **Dictation / transcribe slot** — voice-input state that replaces the textarea with an audio recorder/waveform and transcribes to text.
- **Disclaimer / affordance footer** — low-key helper text for shortcut hints, token counters, or AI-accuracy notices.

## States

| State | Trigger | UI treatment |
|---|---|---|
| **Idle / empty** | Page load; after send clears | Placeholder text shown; send button disabled |
| **Focused** | User clicks or tabs into textarea | Border/ring highlight; shortcut hints may appear in footer |
| **Typing** | User keystroke adds non-empty content | Auto-grow activates; send button enabled; char/token counter updates |
| **Command / mention open** | User types `/`, `@`, or `#` | Overlaid dropdown menu; textarea input filters the menu; Escape closes |
| **Attaching** | File picker opened or drag enters dropzone | Dropzone overlay visible; upload-in-progress chips show spinner |
| **Submitting** | Send activated (click or Enter) | Draft dispatched; textarea may clear or lock briefly; `RUN_STARTED` emitted |
| **Running / streaming** | `RUN_STARTED` received from agent | Send button replaced by Stop button; textarea optionally locked |
| **Transcribe / dictation** | User activates voice mode | Textarea replaced by audio recorder/waveform; cancel and finish-transcribe buttons shown |
| **Disabled** | Offline, rate-limited, or awaiting required input | Textarea and buttons visually muted; reason surfaced in footer |
| **Error** | Attachment too large, unsupported type, or send failure | Inline error message adjacent to affected chip or below textarea; send remains available if recoverable |

## Vocabulary

| Term | Definition |
|---|---|
| Auto-grow / autosize textarea | The input expands with content up to a max number of rows, then becomes internally scrollable. |
| Send / submit button | Primary action dispatching the draft; commonly disabled until there is non-empty content (`canSend`). |
| Stop button | The square/abort control the send button morphs into while the agent is running; used to abort the stream. |
| Slash command | Typing `/` opens a command menu (e.g. `/fix`, `/tests`) to invoke an action without writing a full prompt. |
| @-mention / #-context variable | Typing `@` or `#` opens a picker to attach context (files, symbols, participants, docs) into the prompt. |
| Submit mode | Configurable Enter behavior: `'enter'` (Enter sends, Shift+Enter newline) vs. `'ctrlEnter'` (Cmd/Ctrl+Enter sends). |
| Attachment / dropzone | File/image attach via picker, drag-and-drop, or paste; previewed as removable chips above the textarea. |
| Disclaimer / affordance footer | Small helper text below the input (e.g. "AI can make mistakes", token/char counters, shortcut hints). |
| Tools menu / model picker | Toolbar controls beside the textarea for choosing tools, modes, or the model/persona for the next turn. |
| Dictation / transcribe mode | Voice-input state that swaps the textarea for an audio recorder/waveform and transcribes to text. |
| canSend | Boolean derived from draft content; gates the send button so empty/whitespace-only submissions are blocked. |

## Real-world examples

- **ChatGPT (OpenAI)** — A centered auto-growing composer with a tools/attachment menu; Enter sends and Shift+Enter inserts a newline. While generating, the send button becomes a stop control to halt streaming. [Source](https://www.trupeer.ai/tutorials/how-to-enter-new-line-in-chatgpt-without-sending-prompt)
- **GitHub Copilot Chat** — The composer is a context-assembly surface: typing `/` lists slash commands (`/fix`, `/tests`, `/explain`); `@` adds chat participants (`@workspace`, `@terminal`) in VS Code; `#` adds context variables (`#file`, `#selection`, `#function`) directly into the prompt. [Source](https://docs.github.com/en/copilot/reference/chat-cheat-sheet)
- **assistant-ui ComposerPrimitive** — Unstyled primitives: `Composer.Root` (form), `Composer.Input` (textarea with `submitMode` `'enter'` | `'ctrlEnter'` | `'none'` and `cancelOnEscape` defaulting to `true`), `Composer.Send`, `Composer.Cancel`, `Composer.AddAttachment`, `Composer.Attachments`, `Composer.AttachmentDropzone`, `Composer.Dictate` / `Composer.StopDictation` / `Composer.DictationTranscript`; the same primitives drive both new-message and inline-edit composers. [Source](https://www.assistant-ui.com/docs/primitives/composer)

## CopilotKit & AG-UI mapping

`CopilotChat` (v2, `@copilotkit/react-ui`) is the primary shell component; it includes the built-in composer. The composer textarea auto-grows to a configurable max, switches inline→stacked layout on multiline content, and fires the AG-UI `RUN_STARTED` event when the user submits. While the run is in flight, the send button becomes a Stop control that aborts the stream.

For a headless / custom composer, use `useAgent` + `useCopilotKit` (v2) to get `sendMessage` / `isLoading` and compose your own input UI.

For human-in-the-loop mid-run inputs (the agent pauses and waits for a user reply), use `useHumanInTheLoop` (v2): the agent calls an interactive tool, execution pauses, and your render function receives a `respond` callback. The composer is a natural host for this pattern — render a custom input form in the tool's render slot, then call `respond(value)` to resume the agent.

**AG-UI events driven by the composer:**
- `RUN_STARTED` — emitted when the user submits a turn; signals the UI to switch send→stop.
- `RUN_FINISHED` / `RUN_ERROR` — settle the stop→send transition when the run ends or fails.

```tsx
import { CopilotChat } from "@copilotkit/react-ui";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Standard composer — CopilotChat includes the built-in composer,
// RUN_STARTED / RUN_FINISHED drive the send↔stop toggle automatically.
function AgentChat() {
  return (
    <CopilotChat
      instructions="You are a helpful assistant."
      labels={{ placeholder: "Ask anything or type / for commands…" }}
    />
  );
}

// HITL: agent pauses mid-run and waits for user clarification.
// The composer hosts the clarification UI inline in the thread.
function useClarificationHook() {
  useHumanInTheLoop({
    name: "clarify_intent",
    parameters: z.object({ question: z.string() }),
    render: ({ status, args, respond }) =>
      status === "executing" ? (
        <div className="hitl-prompt">
          <p>{args.question}</p>
          <input
            autoFocus
            placeholder="Your answer…"
            onKeyDown={(e) => {
              if (e.key === "Enter") respond?.((e.target as HTMLInputElement).value);
            }}
          />
        </div>
      ) : (
        <p className="hitl-resolved">Answered</p>
      ),
  });
}
// v1 equivalent: useCopilotAction({ name, parameters, renderAndWaitForResponse })
```

See [`../reference/copilotkit-primitives.md`](../reference/copilotkit-primitives.md) for the full `useHumanInTheLoop` signature and [`../reference/ag-ui-protocol.md`](../reference/ag-ui-protocol.md) for `RUN_*` event details.

## Best practices

- **Auto-grow with a ceiling.** Grow the textarea to ~5 rows then scroll internally; avoid unbounded growth that pushes the conversation off-screen. Switch from an inline to a stacked toolbar layout when the draft is multiline so controls don't crowd the text.
- **Make submit mode explicit and configurable.** Shipping Enter-to-send as a hidden default is a top user complaint. Show the active shortcut in the footer ("Enter to send · Shift+Enter for newline"), and where the product audience warrants it (power users, technical users), expose a submit-mode toggle.
- **Always provide a keyboard-accessible Stop button.** Replace the send button with a Stop control the moment `RUN_STARTED` is received, and ensure it is focusable and labelled. Users must be able to abort a runaway generation without reloading.
- **Gate send on `canSend`.** Disable the send button for empty or whitespace-only drafts. Reflect offline / rate-limited states as a clearly labelled disabled composer, not a silent no-op.
- **Announce attachment errors inline and immediately.** Validate file type and size client-side before upload; show a dismissible inline error adjacent to the rejected chip rather than surfacing it after a failed server round-trip.
- **Support paste-to-attach and drag-and-drop.** Users expect to paste a screenshot directly into the composer. Show a visible dropzone on drag-enter and preview attachments as removable chips.
- **Keep slash/@ menus forgiving.** Fuzzy-match the user's input, make the menu keyboard-navigable (arrow keys, Enter to select, Escape to dismiss), and show an inline message when a command name is unrecognized rather than silently ignoring it.
- **Surface transparency affordances without nagging.** A low-key footer with "AI can make mistakes" and an optional token/character count communicates honest limitations without interrupting the authoring flow.
- **Return focus to the textarea after send.** After a message is dispatched, keep keyboard focus in the composer so the user can begin the next turn without a click.

## Anti-patterns

- A fixed-height single-line `<input>` that hides multiline drafts, or an unconstrained textarea that grows without limit and forces the conversation history off-screen.
- No Stop button — requiring users to wait out, reload, or kill the page to interrupt an incorrect or runaway generation.
- Ambiguous Enter behavior that sends half-written prompts (e.g., Enter inserts a newline in one context and submits in another with no indication of which mode is active).
- Slash or @-mention menus that require exact, case-sensitive syntax, are not keyboard-navigable, and give no feedback when a command is invalid or unrecognized.
- Silently dropping pasted images or oversized attachments with no chip preview, no validation message, and no error state — the user never learns why their content wasn't included.

## Accessibility

- Give the textarea an accessible name via `aria-label` (e.g., `"Message the assistant"`) or a visually hidden `<label>`. Do not rely on placeholder text alone — it disappears on input and is not reliably announced.
- Label the send button and stop button with `aria-label` (e.g., `"Send message"` / `"Stop generation"`); when the button's icon morphs between states, update the label accordingly so screen-reader users know what action the button currently performs.
- Maintain focus in the textarea after message submission. Do not move focus to the message list on send; users expect to start the next turn immediately.
- Use `aria-live="polite"` on the disclaimer/affordance footer to announce dynamic updates (token count changes, inline errors) without interrupting the user mid-keystroke; use `aria-live="assertive"` only for hard errors (send failure, attachment rejected).
- Slash command and @-mention overlays should be implemented as `role="listbox"` / `role="option"` menus with `aria-activedescendant` tracking the focused item, and Escape must close the overlay and return focus to the textarea.
- For the dictation/transcribe state, include a visible and screen-reader-announced status change (e.g., `aria-label="Recording — press Escape to cancel"`) and honor `prefers-reduced-motion` by skipping waveform animations.

## Related

- [Chat Message](./chat-message.md) — the message bubble that the composer's submitted turns produce.
- [Human-in-the-Loop Prompt](./human-in-the-loop.md) — mid-run interruption pattern that can host a custom input form where the composer normally sits.
- [Suggestions & Capability Surfacing](./suggestions-capabilities.md) — one-tap prompt starters that populate the composer draft.
- [Voice Input / Dictation](./voice-input.md) — the dictation/transcribe slot activated from within the composer.
- [Threads / Conversation History](./threads-history.md) — conversation history that the composer's submissions append to.
- [Side Panel / Sidebar Copilot](../layouts/side-panel.md) — layout that hosts the composer in a docked panel.
- [Main Panel / Full-Page Chat](../layouts/main-panel.md) — layout that hosts the composer as the primary page surface.
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md) — verified hook and component API.
- [AG-UI protocol reference](../reference/ag-ui-protocol.md) — `RUN_STARTED/FINISHED/ERROR` and the full event taxonomy.

## Sources

- https://www.trupeer.ai/tutorials/how-to-enter-new-line-in-chatgpt-without-sending-prompt
- https://docs.github.com/en/copilot/reference/chat-cheat-sheet
- https://www.assistant-ui.com/docs/primitives/composer
- https://docs.copilotkit.ai
- https://docs.ag-ui.com/concepts/events
