# Thinking / Reasoning Display
> A collapsible surface that streams an agent's intermediate chain-of-thought in real time, then settles to a "Thought for Xs" summary — making latency visible and building trust without burying users in raw model internals.

**Category:** Component · **Cluster:** Agent reasoning & transparency · **Aliases:** Thinking panel, Reasoning display, Chain-of-thought (CoT) view, Reasoning trace, Extended thinking block, "Thought for X" disclosure, Reasoning summary, Thinking tokens panel

---

## Definition

A Thinking / Reasoning Display is a UI surface that exposes an agent's intermediate chain-of-thought — the model's step-by-step reasoning produced before (and between) its final answer. It renders as a collapsible panel that streams reasoning content live while the model works, then collapses to a one-line duration summary ("Thought for 12s") when complete. Because raw chain-of-thought can contain dead-ends, sensitive content, or confusing false starts, production implementations show a summarized or paraphrased version rather than verbatim reasoning tokens — this is the default behavior on Claude 4 models via the Messages API. The component solves the "dead-air" latency problem: showing active reasoning turns wait time into a transparency signal that increases user confidence.

---

## When to use / when not to

- **Use** when the model performs extended reasoning (reasoning-mode models, CoT-heavy prompts) and the wait exceeds ~3 seconds; visible progress reduces abandonment.
- **Use** when trust and explainability matter — regulated industries, high-stakes decisions, or any context where "why did it say that?" is a likely follow-up.
- **Use** for interleaved thinking between tool calls so users understand re-planning steps, not just the final answer.
- **Do not use** for standard fast-turn conversational replies where no extended reasoning occurs; an empty or near-instant panel adds noise without value.
- **Do not use** in contexts where surfacing any reasoning trace — even summarized — violates your compliance policy; use encrypted reasoning carry-over (opaque blob) instead and omit the panel entirely.

---

## Anatomy

```
┌─────────────────────────────────────────────────────────┐
│ ▶ Thought for 12s                          [toggle btn] │  ← Collapsed trigger
└─────────────────────────────────────────────────────────┘

When expanded:
┌─────────────────────────────────────────────────────────┐
│ ▼ Thought for 12s                          [toggle btn] │  ← Expanded trigger
├─────────────────────────────────────────────────────────┤
│  ● (pulse)  Thinking...                                 │  ← Live indicator (streaming only)
│                                                         │
│  [Summarized reasoning text streams here…               │  ← Reasoning content
│   The user is asking about X. I should first check Y,   │
│   then consider Z…]                                     │
└─────────────────────────────────────────────────────────┘
```

**Parts:**

- **Collapsible disclosure** — the expand/collapse control; default-closed, wraps the entire component. A `<button>` with `aria-expanded`.
- **Trigger line** — one-line summary shown in both collapsed and expanded states. Contains the "Thought for X seconds" duration label and the caret icon.
- **"Thought for X seconds" label** — duration of the reasoning phase; only shown after reasoning completes (not during streaming).
- **Live indicator** — a pulse animation or animated label shown while streaming; disappears when done.
- **Reasoning content** — the summarized/paraphrased chain-of-thought text; scrollable when tall. Keyed on the `reasoning` message role to keep it structurally separate from the assistant answer.
- **Reasoning role boundary** — visual (background, border, or indent) that marks this region as distinct from the final answer below it.

---

## States

| State | Trigger | UI treatment |
|---|---|---|
| **Idle / hidden** | No reasoning in this turn | Component not rendered |
| **Starting** | `REASONING_START` or `REASONING_MESSAGE_START` received | Panel mounts, opens, spinner/pulse appears; trigger reads "Thinking…" |
| **Streaming** | `REASONING_MESSAGE_CONTENT` deltas arriving | Content appends live; pulse active; `aria-busy="true"`; no duration shown yet |
| **Done — collapsed** | `REASONING_MESSAGE_END` / `REASONING_END` received | Panel auto-closes; trigger reads "Thought for Xs"; duration captured; pulse removed |
| **Expanded** | User clicks the toggle button | Full reasoning content visible; trigger shows caret-down; `aria-expanded="true"` |
| **Interleaved** | Reasoning resumes after a tool call result | Panel re-opens or appends a new reasoning block; streaming state restarts |
| **Omitted / encrypted** | Zero-data-retention or compliance context | No panel rendered; opaque `REASONING_ENCRYPTED_VALUE` blob retained by runtime for multi-turn continuity |
| **Error** | Reasoning stream interrupted (`RUN_ERROR`) | Brief error label in trigger ("Reasoning interrupted"); content area shows partial text if any |

---

## Vocabulary

| Term | Definition |
|---|---|
| Chain-of-thought (CoT) | The model's intermediate step-by-step reasoning produced before the final answer. |
| Reasoning tokens | Tokens the model spends thinking; billed and counted separately from visible answer tokens and often hidden by default. |
| Summarized thinking | A model- or system-generated paraphrase of the full reasoning shown to the user instead of raw CoT; the default on Claude 4 models via the Messages API. |
| Interleaved thinking | Reasoning emitted between tool calls so the model can re-plan after seeing tool results. |
| Collapsible disclosure | The expand/collapse control that hides reasoning behind a summary line by default (progressive disclosure). |
| "Thought for X seconds" | A duration label on the collapsed trigger indicating how long the model reasoned. |
| Reasoning effort / thinking budget | A user- or developer-set level (e.g., Auto / Fast / Thinking, or a token budget) controlling how much the model reasons before answering. |
| Encrypted reasoning item | An opaque reasoning blob persisted across turns for continuity without exposing plaintext CoT; used under zero-data-retention. |
| Reasoning role / ReasoningMessage | A distinct message role (`"reasoning"`) that keeps thinking visually and structurally separate from the assistant's answer in message history. |

---

## Real-world examples

- **Claude (Anthropic) — claude.ai + Messages API** — Shows a collapsible "Thinking" block above the response that streams in real time, closed by default. The Messages API returns a summary of the full thinking process (not verbatim CoT) on Claude 4 models, and supports interleaved thinking between tool calls via the `interleaved-thinking-2025-05-14` beta header. Billing covers the full thinking tokens generated, not the visible summary. [Source](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)

- **ChatGPT / OpenAI (GPT-5 / o-series)** — Exposes Auto / Fast / Thinking reasoning modes via a dropdown in the prompt composer; the choice persists across chats. While reasoning, a concise live thinking stream is shown that collapses on completion. The o3/o4-mini models can fold images directly into their chain of thought ("thinking with images"). [Source](https://openai.com/index/introducing-gpt-5/)

- **Perplexity Pro Search** — Renders the agent's plan as expandable steps; users click an individual step to see its search details and hover citations to preview snippets. Built on the research finding that users are more willing to wait when intermediate progress is visible; progressive disclosure prevents information overload. [Source](https://www.langchain.com/breakoutagents/perplexity)

---

## CopilotKit & AG-UI mapping

The Thinking / Reasoning Display is driven by AG-UI's reasoning event family, consumed by CopilotKit's chat runtime:

| AG-UI Event | Role |
|---|---|
| `REASONING_START` | Reasoning phase begins; mount and open the panel |
| `REASONING_MESSAGE_START` | A reasoning message block begins within the phase |
| `REASONING_MESSAGE_CONTENT` | Delta chunks — append to reasoning content |
| `REASONING_MESSAGE_END` | Block complete; capture duration |
| `REASONING_END` | Phase complete; auto-collapse, display "Thought for Xs" |
| `REASONING_MESSAGE_CHUNK` | Convenience event combining start/content/end lifecycle |
| `REASONING_ENCRYPTED_VALUE` | Opaque carry-over blob; no visible panel rendered |

These events create persistent messages with role `"reasoning"` (the AG-UI `ReasoningMessage` type) in message history, keeping thinking structurally separate from the assistant's answer.

**CopilotKit prebuilt chat** renders reasoning via a `reasoningMessage` slot inside the message view, with `header`, `contentView`, and `toggle` sub-slots for customization. For full headless control, read messages from `useAgent` + `useCopilotKit` and render your own panel keyed on reasoning-role messages.

The example below uses `useRenderTool` to surface a custom thinking card when a backend tool emits a reasoning-tagged step — applicable when an agent wraps its CoT as a tool output before the final answer:

```tsx
import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Renders a custom collapsible thinking panel for a "reasoning_step" tool
// the agent emits before its final response.
function ThinkingPanel() {
  useRenderTool({
    name: "reasoning_step",
    parameters: z.object({
      summary: z.string(),
      durationMs: z.number().optional(),
    }),
    render: ({ status, args }) => {
      const isStreaming = status === "inProgress";
      const label = isStreaming
        ? "Thinking…"
        : `Thought for ${Math.round((args.durationMs ?? 0) / 1000)}s`;

      return (
        <details open={isStreaming}>
          <summary
            aria-expanded={isStreaming}
            aria-busy={isStreaming}
            style={{ cursor: "pointer", fontStyle: "italic", opacity: 0.75 }}
          >
            {isStreaming && <span aria-hidden="true" className="pulse-dot" />}
            {label}
          </summary>
          <div
            role="region"
            aria-live="polite"
            aria-label="Agent reasoning"
            style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
          >
            {args.summary}
          </div>
        </details>
      );
    },
  });

  return null;
}
```

> v1 equivalent: `useCopilotAction({ name: "reasoning_step", parameters: [...], render })` from `@copilotkit/react-core`.

For AG-UI reasoning events handled natively by CopilotKit's runtime, customize the panel via the `reasoningMessage` slot in `CopilotChat` rather than re-implementing from scratch. See the [CopilotKit docs](https://docs.copilotkit.ai) and [AG-UI events reference](https://docs.ag-ui.com/concepts/events) for the full event contract.

---

## Best practices

- **Default to collapsed.** Always open with the summary line visible and the content hidden. Respect the user's cognitive focus — they came for the answer, not the thinking. Reserve expanded-by-default only for the first message in a debugging or transparency-focused context.
- **Show summarized reasoning, not raw CoT.** Verbatim chain-of-thought is noisy, potentially sensitive, and harder to read than a paraphrase. Claude 4's Messages API surfaces a summary by default — match this behavior in your UI layer.
- **Capture and display the duration.** "Thought for 12s" transforms dead wait time into an informative signal. Do not emit "Thought for 0s" — gate the label on a nonzero measured duration.
- **Stream with a live affordance.** A pulsing dot or animated label during the streaming state makes the wait feel productive. Research consistently shows users tolerate latency better when active progress is visible.
- **Separate reasoning from the answer visually and structurally.** Use the `reasoning` message role to keep CoT out of the main message flow. Apply a distinct background or indent so users cannot mistake thinking for a final statement.
- **Support interleaved thinking.** When reasoning resumes after tool calls, append a new reasoning block rather than merging into the prior one — each reasoning phase maps to its own `REASONING_MESSAGE_START … END` envelope.
- **Handle encrypted carry-over.** In zero-data-retention or compliance deployments, pass the `REASONING_ENCRYPTED_VALUE` blob back to the agent each turn rather than storing plaintext CoT client-side. Render nothing in the UI for encrypted items.
- **Let users control thinking depth.** Expose an effort selector (Auto / Fast / Thinking or a budget slider) where your use case warrants it, and persist the choice. Auto-escalate to extended thinking only when task complexity justifies the cost.

---

## Anti-patterns

- **Raw, unfiltered CoT verbatim** — exposing every token the model generates confuses users with dead-ends and self-corrections, and can surface sensitive intermediate content. Always show a summary or paraphrase.
- **Auto-expanding all prior reasoning blocks** on each new turn — this fills the transcript with open panels and overwhelms users scrolling back. Newly completed blocks should collapse; prior blocks stay in their last user-set state.
- **"Thought for 0s" / stuck "Thinking…" label** — a panel that never resolves or shows a zero-duration signals a broken state. Gate the duration label on `durationMs > 0` and ensure the `REASONING_END` event always transitions the state machine.
- **Blocking the answer behind all reasoning** — the answer should begin streaming as soon as the model produces it, not wait until reasoning is fully collapsed. Reasoning and answer streams can proceed concurrently in the UI.
- **Flooding screen readers with streaming deltas** — announcing every partial reasoning chunk produces an unusable torrent of speech. Buffer updates and announce only the final summary (or coarse-grained progress) to `aria-live` regions.

---

## Accessibility

- **`aria-live="polite"` on the content region** — screen readers receive reasoning updates without interrupting the user's current focus. Never use `aria-live="assertive"` here; reasoning is ambient context, not urgent.
- **`aria-busy="true"` while streaming** — set on the disclosure container during the streaming state so assistive technology knows content is still arriving; remove it on `REASONING_END`.
- **`aria-expanded` on the toggle button** — the collapse/expand control must be a real `<button>` (not a `<div>`) with `aria-expanded="true|false"` reflecting current state and a visible focus ring.
- **Keyboard access** — the toggle button must be reachable via Tab and activatable with Enter/Space. The logical tab order should flow: agent answer → reasoning toggle → next interactive element. Do not trap focus inside the reasoning panel.
- **Screen-reader label** — give the content region an `aria-label` like "Agent reasoning" so users arriving via shortcut understand the region without reading its contents.
- **Reduced motion** — the pulse animation and collapse transition should respect `prefers-reduced-motion: reduce`; swap animated indicators for a static icon or text label.

---

## Related

- [./agent-activity-traceability.md](./agent-activity-traceability.md) — Agent Status, Activity & Traceability: run-level status signals that bracket the turn containing a reasoning display
- [./tool-call.md](./tool-call.md) — Tool Call: the `TOOL_CALL_*` events that interleave with reasoning blocks when the agent re-plans after tool results
- [./chat-message.md](./chat-message.md) — Chat Message: the assistant answer that follows the reasoning panel in the message flow
- [./human-in-the-loop.md](./human-in-the-loop.md) — Human-in-the-Loop Prompt: confirmation surfaces that may follow a visible reasoning trace
- [./deep-research.md](./deep-research.md) — Deep Research: multi-step research agents that produce the heaviest reasoning / interleaved thinking traces
- [../reference/ag-ui-protocol.md](../reference/ag-ui-protocol.md) — AG-UI protocol reference: full event taxonomy for reasoning events
- [../reference/copilotkit-primitives.md](../reference/copilotkit-primitives.md) — CopilotKit primitive reference: `useRenderTool`, `ToolCallStatus`, and chat slot overrides
- [../reference/glossary.md](../reference/glossary.md) — Master vocabulary

---

## Sources

- https://platform.claude.com/docs/en/build-with-claude/extended-thinking
- https://openai.com/index/introducing-gpt-5/
- https://www.langchain.com/breakoutagents/perplexity
- https://docs.ag-ui.com/concepts/events
- https://docs.copilotkit.ai
