# Chat Message

> The atomic unit of a conversational transcript: a single turn rendered as a styled block attributed to a role.

**Category:** Component · **Cluster:** Conversational core · **Aliases:** message bubble, chat bubble, turn, message row, assistant/user message, speech bubble, message part(s)

## Definition

A chat message is one complete turn in a conversation, attributed to a role (user, assistant, system, or tool) and rendered as a styled block. It solves the problem of presenting AI-generated content—which arrives as a stream of tokens, may contain structured markup, and must carry citations and actions—in a way that's legible, verifiable, and interactive. Modern implementations treat a message as an ordered list of typed **parts** (text, reasoning, tool-call, file, source) rather than a flat string, so a single row can interleave prose, inline generative-UI widgets, and tool results. Messages appear in every conversational surface: full-page chat, side panel, popup, and embedded threads.

## When to use / when not to

- Use chat message any time you need to display a streaming or completed AI turn attributed to a specific role—this is the primary rendering target for assistant output.
- Use when the content is conversational: a question answered, a task described, or a result narrated. Even heavy outputs (code, tables, citations) still live inside a message.
- Use the part-based model (`text | reasoning | tool-call | file | source`) when a single turn will mix prose with tool results or generative-UI widgets—rendering them as one row preserves conversational context.
- Do not use a chat message to display a tool-call card in isolation; the tool-call part belongs _inside_ a message row, rendered via the [Tool Call](./tool-call.md) component.
- Do not use when the interface is document-centric rather than conversational—a co-edited canvas or live artifact panel is a better host for long-form generated output (see [Canvas / Workspace & Artifacts](../layouts/canvas-workspace.md)).

## Anatomy

```
┌─────────────────────────────────────────────────────────────────┐
│  [Avatar/Role label]                                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Message body (streamed or complete)                      │  │
│  │  ┌───────────┐  ┌──────────────────────────────────────┐  │  │
│  │  │ Text part │  │ Code block (syntax-highlight + copy) │  │  │
│  │  └───────────┘  └──────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ Inline citation  [1] … [2]   ←→  Sources strip      │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────┐                                      │  │
│  │  │ Tool-call part / │  (rendered by Tool Call component)   │  │
│  │  │ Generative-UI    │                                      │  │
│  │  └──────────────────┘                                      │  │
│  │  [cursor ▍ while streaming]                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Action bar: Copy | Regen | Edit | 👍 👎 | Read-aloud | Share] │
│  [Branch nav: < 2 / 3 >  (only when branches > 1)]             │
└─────────────────────────────────────────────────────────────────┘
```

**Parts:**
- **Role** — author identity (user / assistant / system / tool); drives alignment, color, and avatar.
- **Message body** — the primary content area; a sequence of typed **message parts**.
- **Text part** — prose rendered as Markdown (GFM: tables, lists, math via KaTeX, Mermaid).
- **Code block w/ copy** — syntax-highlighted fenced block with a persistent copy button in its header.
- **Inline citation** — numbered superscript ([1]) or chip embedded in prose that links to a cited source.
- **Sources strip** — row of source cards (favicon + domain + excerpt) shown alongside an answer.
- **Tool-call part** — progress/result widget rendered by the [Tool Call](./tool-call.md) component inside the row.
- **Cursor / caret** — blinking block or shimmer after the last token, signaling in-progress generation.
- **Action bar / message toolbar** — per-message controls: Copy, Regenerate, Edit, thumbs up/down, Read-aloud, Share.
- **Branch / variant navigation** — `< n / m >` control that pages between alternative responses from edit or regenerate.

## States

| State | Trigger | UI treatment |
|---|---|---|
| **Empty** | No messages yet / session start | Welcome screen, suggestions, empty-state prompt |
| **Pending / submitted** | Request sent; no tokens yet | Spinner or pulsing avatar; input disabled; action bar absent |
| **Streaming** | `TEXT_MESSAGE_CONTENT` deltas arriving | Cursor visible after last token; partial Markdown rendered cleanly; action bar hidden or disabled |
| **Done / complete** | `TEXT_MESSAGE_END` received | Cursor removed; full Markdown rendered; action bar enabled |
| **Tool-running** | `TOOL_CALL_START` inside the message | Tool-call part renders as `InProgress` within the message body |
| **Regenerating** | User triggers regenerate; new branch streaming | New response streams; branch counter increments; prior response preserved |
| **Edited** | User edits a user-turn and resubmits | Edited badge on the user message; assistant produces a new branch |
| **Stopped / cancelled** | User interrupts mid-stream | Partial text kept; cursor removed; stopped badge; Retry affordance |
| **Error** | `RUN_ERROR` or generation failure | Error message with Retry button in place of the incomplete bubble |

## Vocabulary

| Term | Definition |
|---|---|
| Role | The author of the turn (user / assistant / system / tool); drives alignment, color, and avatar treatment |
| Message part | A typed segment within one message (text, reasoning, tool-call, file, source-url); the model that replaces a flat string |
| Streaming / token streaming | Progressively appending text deltas to the bubble as the model generates |
| Typewriter / smooth streaming | Animating streamed text so partial Markdown renders cleanly mid-stream without flicker |
| Action bar / message toolbar | Row of per-message buttons: copy, regenerate, edit, thumbs up/down, read-aloud, share |
| Branch / variant navigation | The `< n / m >` control that pages between alternative responses from edit or regenerate |
| Inline citation | Numbered superscript ([1]) or chip in the text that links to a cited source |
| Code block w/ copy | Syntax-highlighted fenced block with a hover/persistent copy button |
| Cursor / caret | Blinking block or shimmer appended after the last streamed token |
| Markdown rendering | Parsing assistant text as GFM (tables, lists, math via KaTeX, Mermaid) rather than plain text |

## Real-world examples

- **ChatGPT (OpenAI)** — User turns are right-aligned bubbles with a hover Edit pencil; assistant turns are full-width, left-aligned, streaming Markdown with code blocks carrying a copy button. An action bar below each assistant turn exposes Copy, thumbs up/down, Read-aloud, Share, and Regenerate; editing a user turn or regenerating creates a navigable response branch (`< n / m >`). [Source](https://community.openai.com/t/ui-update-makes-regenerating-responses-impossible/1254797)
- **Claude (Anthropic)** — Prose streams in the main column; substantial code/doc output is split into a side Artifacts panel with its own copy, download, and Publish controls. When an artifact errors, a "Try fixing with Claude" button copies the error details into a new message. [Source](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
- **Perplexity** — Answers render in a constrained reading column with inline numbered citations ([1], [2]) as superscripts that link to a strip of source cards (favicon + domain + excerpt). Each answer typically carries 5–10 inline citations, making provenance the central visual element. [Source](https://www.unusual.ai/blog/perplexity-platform-guide-design-for-citation-forward-answers)
## CopilotKit & AG-UI mapping

**Drop-in components:** `CopilotChat`, `CopilotSidebar`, `CopilotPopup` (all from `@copilotkit/react-ui`) ship complete chat UIs including message rendering. In v2, the message row is split into `CopilotChatUserMessage` (right-aligned, `white-space: pre-wrap`, edit button when `onEditMessage` is provided, branch navigation when `numberOfBranches > 1`) and `CopilotChatAssistantMessage` (GFM Markdown via remark-gfm + remark-math + rehype-pretty-code + KaTeX, toolbar with copy / thumbs up-down / read-aloud / regenerate, where each non-copy button renders only when its callback prop is supplied). Both are composed by `CopilotChatMessageView`.

**Headless:** access raw messages and run control via `useAgent` + `useCopilotKit` (v2); v1 equivalent: `useCopilotChat`.

**AG-UI events:** streaming is driven by `TEXT_MESSAGE_START` → `TEXT_MESSAGE_CONTENT` (delta) → `TEXT_MESSAGE_END`. Thread rehydration uses `MESSAGES_SNAPSHOT`. Tool-call parts inside a message come from `TOOL_CALL_*` events handled by `useRenderTool`.

```tsx
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";

// Headless custom message list — renders messages from the live agent state
function CustomMessageList() {
  const { agent } = useAgent({ agentId: "my-agent" });
  const copilotKit = useCopilotKit();

  return (
    <div role="log" aria-live="polite" aria-label="Conversation">
      {agent.messages.map((msg) => (
        <div
          key={msg.id}
          className={msg.role === "user" ? "msg-user" : "msg-assistant"}
          aria-label={`${msg.role} message`}
        >
          {/* Text parts — render Markdown with your library of choice */}
          {msg.content}

          {/* Action bar — only show when message is complete */}
          {msg.role === "assistant" && !agent.isRunning && (
            <div className="action-bar" role="toolbar" aria-label="Message actions">
              <button onClick={() => navigator.clipboard.writeText(msg.content)}>
                Copy
              </button>
              <button onClick={() => copilotKit.runAgent({ agentId: "my-agent" })}>
                Regenerate
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Streaming cursor */}
      {agent.isRunning && <span className="cursor" aria-hidden="true" />}
    </div>
  );
}
```

> v1 equivalent: `const { messages, isLoading } = useCopilotChat()` from `@copilotkit/react-core`.

For slot-based overrides in the built-in `CopilotChat`, pass a replacement component via the `assistantMessage` or `userMessage` slot props — no need to go fully headless for targeted customization. Docs: [docs.copilotkit.ai/custom-look-and-feel/customize-built-in-ui-components](https://docs.copilotkit.ai/custom-look-and-feel/customize-built-in-ui-components).

## Best practices

- **Distinguish roles beyond color.** Combine alignment (user right, assistant left), an avatar or role label, and ARIA so the distinction survives color-blindness and screen readers. Never rely on hue alone.
- **Stream tokens and handle partial Markdown gracefully.** Style unterminated code fences and links during streaming and avoid re-parsing the entire accumulated string on each delta—this causes flicker and jank on long responses.
- **Offer copy at every granularity.** Provide a whole-message copy button on the action bar _and_ a copy button on every code block. Confirm with a transient "Copied" label and preserve original whitespace (`white-space: pre-wrap`) so pasted code is intact.
- **Make every claim verifiable.** Render inline citations for retrieved facts and label tool-call result parts so users can trace which action produced a given statement. Decorative, non-clickable citation numbers erode trust.
- **Never destroy previous answers.** Regenerate and edit should create a new branch, not overwrite. Keep the `< n / m >` navigation accessible so users can compare or recover a prior response.
- **Keep the action bar keyboard-reachable.** Use a `role="toolbar"` with arrow-key navigation; never make the bar hover-only. Announce state changes (streaming → done, copied, error) via `aria-live` without stealing focus.
- **Surface a recoverable error state.** On `RUN_ERROR`, show a clear error message with a Retry button inside the message row—not a silent dead bubble. On user-cancelled streaming, keep the partial text and mark it stopped.
- **Group same-role consecutive turns** and render timestamps sparingly (hover or screen-reader label, not always visible) to keep the transcript scannable at a glance.
- **Respect `prefers-reduced-motion`.** Disable the typewriter animation and cursor shimmer when the user has opted out; deliver the completed text immediately.

## Anti-patterns

- **No streaming.** Showing nothing until the full response arrives makes the assistant feel frozen on long answers. Every text response should stream token-by-token from `TEXT_MESSAGE_CONTENT` deltas.
- **Raw Markdown or over-sanitized output.** Rendering `##` heading markers as literal characters is unacceptable; so is sanitizing so aggressively that code blocks break and can't be copied cleanly. Both destroy readability.
- **Hover-only or keyboard-inaccessible action bar.** Edit and copy controls that are invisible to keyboard and touch users, and that go unannounced to screen readers, create a permanent second-class experience for those users.
- **Decorative citations.** Citation numbers that are not clickable, or that don't map to specific claims, signal fabricated provenance. Never render citations that don't resolve to a real source.
- **Destroying branch history on regenerate.** Overwriting the prior answer with no `< n / m >` navigation means users can't compare responses or recover a better earlier reply. Branch state must be preserved.

## Accessibility

- **`aria-live="polite"` on the message list.** Wrap the conversation in a live region so screen readers announce new and streamed content without pulling focus away from the input. Use `polite` (not `assertive`) to avoid interrupting the user.
- **`role="log"` on the conversation container.** This semantics tells assistive technology the element is a live log of messages and implies `aria-live="polite"` by default, reinforcing streaming announcements.
- **`aria-label` per message.** Each message element should carry `aria-label="assistant message"` or `aria-label="user message"` (or the user's display name) so role is communicated without relying on visual styling.
- **`role="toolbar"` and arrow-key navigation on the action bar.** Make Copy, Regenerate, Edit, and feedback buttons reachable with Tab to reach the toolbar and arrow keys to move within it. Never leave the bar accessible only on hover.
- **Announce transient state changes.** "Copied", "Regenerating", and "Stopped" confirmations should be surfaced in a `role="status"` region so screen-reader users hear the result without visual inspection.
- **`prefers-reduced-motion` support.** Disable the typewriter/shimmer animation and cursor blink for users who have reduced-motion enabled; show completed text immediately instead.

## Related

- [Input Box / Composer](./input-composer.md) — the paired input surface that produces user-turn messages
- [Thinking / Reasoning Display](./thinking-reasoning.md) — reasoning parts that appear inline within assistant messages
- [Tool Call](./tool-call.md) — the tool-call part rendered inside a message row
- [Inline Generative UI (Static / Controlled)](./generative-ui-inline.md) — generative-UI widgets mounted as message parts
- [Human-in-the-Loop Prompt](./human-in-the-loop.md) — blocking approval cards that can appear inside a message row
- [Threads / Conversation History](./threads-history.md) — the list of prior messages restored via `MESSAGES_SNAPSHOT`
- [Suggestions & Capability Surfacing](./suggestions-capabilities.md) — prompt starters shown in the empty message state
- [Side Panel / Sidebar Copilot](../layouts/side-panel.md) — layout that hosts chat messages in a docked panel
- [Main Panel / Full-Page Chat](../layouts/main-panel.md) — layout that gives chat messages the full viewport
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary / glossary](../reference/glossary.md)

## Sources

- https://community.openai.com/t/ui-update-makes-regenerating-responses-impossible/1254797
- https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
- https://www.unusual.ai/blog/perplexity-platform-guide-design-for-citation-forward-answers
- https://docs.copilotkit.ai/custom-look-and-feel/customize-built-in-ui-components
- https://docs.ag-ui.com/concepts/events
