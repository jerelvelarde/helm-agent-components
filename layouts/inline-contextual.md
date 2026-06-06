# Inline / Contextual AI

> AI assistance embedded directly at the cursor or selection, operating inside the content the user is already editing rather than in a separate chat surface.

**Category:** Layout · **Cluster:** Layouts & workspaces · **Aliases:** ghost text, inline suggestions, inline completions, AI autocomplete, autosuggest, in-place AI editing, Cmd+K inline edit, selection toolbar AI, in-document AI, AI writing assistant (inline), next edit suggestions (NES), Tab completion, diff-in-place

## Definition

Inline / Contextual AI embeds assistance physically inside the editable content region — woven into the editor canvas itself, not docked to an edge or floated as a separate window. It manifests as ghost-text autocomplete that appears at the cursor, a floating toolbar or Cmd+K prompt anchored to a text selection, an "Ask AI" affordance on an empty line, or a diff-in-place that rewrites the surrounding text. The AI operates on the exact spot the cursor or selection occupies; the user accepts, refines, or dismisses without ever leaving the document. The user perceives the agent as a deft autocomplete engine or surgical copy-editor — a faster keyboard, not a conversational partner — and remains firmly in the driver's seat throughout.

## When to use / when not to

- **Use** when the user's primary task is producing or editing content in place (prose, code, email, docs) and any context-switch to a panel would break flow — this is the highest-retention placement for writing-heavy and coding surfaces.
- **Use** for high-frequency, low-stakes micro-assistance: finishing a sentence, fixing a line, tightening a paragraph, generating boilerplate — actions invoked dozens of times per session where even a 2-second panel round-trip is too slow.
- **Use** ghost text specifically when the assist is predictive and continuous (you can infer the next tokens from local context) and latency can be kept low; use selection toolbar or Cmd+K when the assist is a discrete transformation of a known span.
- **Use** when the edit's target is unambiguous and local — the cursor position or selection already encodes the "where," so the user need not describe it.
- **Do not use** as the sole surface when the task requires multi-turn reasoning, cross-document synthesis, tool orchestration, or browsing the user's whole workspace — pair with a sidebar or full-page chat and provide an explicit escalation path (Cursor's Cmd+K → Cmd+L is the canonical pattern).
- **Do not use** when round-trip latency cannot be controlled (heavy server hop per keystroke), when the model is low-confidence and would interrupt constantly, or on small/touch viewports where an in-flow prompt bar and diff have nowhere to render comfortably.

## Anatomy

```
┌──────────────────────────────────────────────────────────┐
│  Editor / document canvas                                 │
│                                                           │
│  The quick brown fox▌jumped over the lazy dog            │  ← ghost text (dimmed)
│                      └─────────────────────────────────  │    after caret
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │  ✦  Rephrase  ·  Shorten  ·  Tone ▾  ·  Ask AI  │    │  ← selection toolbar
│  └──────────────────────────────────────────────────┘    │    (floating, above selection)
│                                                           │
│  ┌──────────────────────────────────────────────┐        │
│  │  Make this more concise ▋                    │  ×     │  ← Cmd+K inline prompt bar
│  └──────────────────────────────────────────────┘        │    (anchored at cursor)
│                                                           │
│  ~~The quick brown fox~~ The swift brown fox              │  ← diff-in-place
│  jumped over the lazy dog                                 │    (green add / red delete)
│  [Accept]  [Revert]  [Try again]                         │    with action controls
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**Parts:**

- **Ghost text** — dimmed inline preview of the suggested completion rendered after the caret; Tab accepts, Cmd/Ctrl+→ accepts word-by-word, Escape or continued typing discards.
- **Selection toolbar** — a floating menu (pencil / lightbulb / sparkle icon + preset actions) that appears adjacent to highlighted text; offers Rephrase, Shorten, Elaborate, tone controls, and a free-text prompt field.
- **Cmd+K / inline prompt bar** — a keyboard-summoned mini prompt strip anchored at the insertion point or over the selection; the user types an instruction, the result is applied in place.
- **Diff-in-place** — the proposed change rendered as a color-coded inline diff (green additions, red deletions) over the affected lines; Accept / Revert / Try again controls render below.
- **Action controls** — Accept (commit), Revert/Dismiss (restore original), and Try again / Refine (iterate with a follow-up instruction) rendered near the proposed diff.
- **Empty-line affordance** — a subtle "Ask AI" hint or "/" slash trigger on an empty paragraph line, prompting first-time and on-demand use without cluttering all lines.
- **Stop affordance** — a visible "Stop" control during streaming generation, keyboard-reachable without tabbing through partial output.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle | Cursor in editor, no suggestion active | Normal editor appearance; affordance is latent (shortcut hint in status bar, or nothing) |
| Debouncing | User paused typing; request being prepared | No visible change, or a faint inline spinner at caret; avoids distracting mid-word |
| Suggested / preview | Ghost text ready after debounce | Dimmed completion text rendered after caret; Tab / Cmd+→ accept labels shown in hint |
| Invoked | Cmd+K shortcut or selection toolbar opened | Inline prompt bar or selection menu rendered at cursor/selection coordinate; awaiting user instruction |
| Streaming | Generated text arriving token-by-token | Ghost text or diff preview writes in; Stop affordance visible; no commit yet |
| Applied / accepted | User presses Tab, Enter, or "Accept" | Ghost styling resolves to normal document text; action controls disappear |
| Refining | User issues follow-up instruction on just-generated span | Prompt bar re-opens at same location; previous output stays visible until replaced |
| Dismissed | Escape pressed, user continues typing, or click outside | Suggestion vanishes; original document unchanged; zero keystrokes wasted |
| Error / unavailable | Request failed, rate-limited, or offline | Quiet inline error label near prompt bar; editor remains fully typeable |
| Disabled | Sensitive field, ignored path, or extension conflict | No suggestion affordances rendered; feature silently absent for this scope |

## Vocabulary

| Term | Definition |
|---|---|
| Ghost text | A dimmed, inline preview of suggested completion rendered after the caret; not yet committed to the document until accepted. |
| Accept (Tab) | The single keystroke (conventionally Tab) that commits a ghost-text suggestion; Cmd/Ctrl+→ accepts the next word (partial accept). |
| Debounce | The idle delay after the last keystroke before a suggestion is requested (typically ~500ms–1s), trading latency against API churn and visual noise. |
| Cmd+K / inline prompt bar | A keyboard-summoned mini prompt anchored at the cursor or over a selection; the user types an instruction and the result is applied in place. |
| Selection toolbar | A floating menu (pencil/lightbulb + actions) that appears adjacent to highlighted text offering rewrite, tone, shorten, elaborate, and a custom-prompt field. |
| Diff-in-place | Rendering the proposed change as a color-coded inline diff (green additions, red deletions) over the affected lines, so the user reviews before accepting or reverting. |
| Next Edit Suggestion (NES) / jump | Beyond completing at the cursor, predicting the location and content of the user's next edit and letting them Tab to jump there (GitHub Copilot NES, Cursor Tab jumps). |
| textareaPurpose | In CopilotKit's `CopilotTextarea`, a plain-text description of what the field is for (set via `autosuggestionsConfig.textareaPurpose`), steering the autosuggestion model's completions. |
| Suggestions vs insertion API config | `CopilotTextarea`'s two pipelines, configured under `chatApiConfigs`: `suggestionsApiConfig` drives ghost-text autocomplete; `insertionApiConfig` drives the Cmd+K action popup that rewrites/inserts text. At least one must be provided. |

## Real-world examples

- **GitHub Copilot (in VS Code)** — Ghost text appears as dimmed inline suggestions at the cursor after a typing pause, derived from the active file plus code snippets from neighboring open tabs. Tab accepts the full suggestion; Cmd/Ctrl+→ accepts word-by-word; hovering reveals alternatives. Next Edit Suggestions (NES) extend this by predicting the *location and content* of the user's next edit — a gutter arrow appears and Tab jumps to and applies it. [Source](https://code.visualstudio.com/docs/editing/ai-powered-suggestions)
- **Cursor** — Two distinct inline mechanisms. Tab completion (Fusion model) predicts multi-line edits around the cursor and "jumps" to the next edit location on repeated Tab presses; Cmd/Ctrl+→ accepts word-by-word. Inline Edit (Cmd/Ctrl+K) opens a prompt bar in place: with a selection it rewrites that span, with no selection it generates new code; the result is shown as a color-coded diff with Accept/Reject; follow-up instructions refine in place; Cmd/Ctrl+L escalates the selection to the full Agent. [Source](https://cursor.com/docs/inline-edit/overview)
- **Notion AI** — Three in-document entry points: highlight text to open the "Ask AI" floating menu (Improve writing, Rephrase, Make shorter/longer, Change tone, Continue writing, Summarize, or a custom prompt); press Space on an empty line; type `/ai` to open the AI menu. Generated output offers Replace, Insert below, Continue, Try again, or Discard. [Source](https://www.notion.com/help/guides/notion-ai-for-docs)
- **Google Docs "Help me write" (Gemini)** — Highlight a phrase, sentence, or paragraph and click the floating "Help me write" pencil icon; a menu offers Rephrase, Shorten, Elaborate, Summarize, Bulletize, and tone changes (More formal / More casual), plus a custom-prompt field. The suggested text is previewed and then either Replaces the selection or Inserts below it on apply. [Source](https://support.google.com/docs/answer/13951448?hl=en)
- **Grammarly** — Correctness issues surface as inline underlines; clicking opens a suggestion card with Accept (applies in place) or Dismiss. For generative rewrites, selecting text reveals a pencil or lightbulb adjacent to the selection with auto-suggested improvements; the user can prompt the AI to "change the text in any way you prefer," replacing the selected span on accept. [Source](https://support.grammarly.com/hc/en-us/articles/14528857014285-Introducing-generative-AI-assistance)
- **CopilotKit CopilotTextarea** — A drop-in `<textarea>` replacement (`@copilotkit/react-textarea`, v1) giving context-aware ghost-text autocompletion driven by `autosuggestionsConfig.textareaPurpose` and `useCopilotReadable` context. A hovering editor window — opened by default with Cmd-k (Mac) / Ctrl-k (Windows), configurable via the `shortcut` prop — lets the user instruct edits in place; the suggestion and insertion behaviors are wired through `chatApiConfigs.suggestionsApiConfig` and `insertionApiConfig`. [Source](https://docs.copilotkit.ai/reference/v1/components/CopilotTextarea)

## CopilotKit & AG-UI mapping

**Primitives:** `CopilotTextarea` (v1, `@copilotkit/react-textarea` — ghost-text + Cmd+K popup), `useCopilotReadable` (context grounding), `useFrontendTool` / `useHumanInTheLoop` (headless inline apply+confirm), `useConfigureSuggestions` (empty-line starter chips).

The closest first-party primitive is **`CopilotTextarea`** (`@copilotkit/react-textarea`, v1 — no v2 equivalent; remains available in v1). It is a drop-in `<textarea>` replacement delivering this exact pattern: context-aware ghost-text autocomplete via `chatApiConfigs.suggestionsApiConfig`, plus a hovering Cmd-k / Ctrl-k action popup for in-place rephrase/insert via `insertionApiConfig`. Set `autosuggestionsConfig.textareaPurpose` to steer completions toward the field's domain; feed document/app context with `useCopilotReadable`.

For a custom editor (Slate / ProseMirror / TipTap / CodeMirror) where the `<textarea>` model does not fit, go headless: build the ghost-text overlay and inline prompt bar yourself, and back them with CopilotKit's runtime. Use `useFrontendTool` (v2; v1: `useCopilotAction`) to expose in-place mutations that your editor executes against the exact range; gate destructive rewrites with `useHumanInTheLoop` — the agent calls an interactive tool that pauses execution until the user responds via your Accept/Reject render. Drive completion streaming through AG-UI events: `TEXT_MESSAGE_CONTENT` streams tokens into the ghost-text or diff preview; `RUN_STARTED` / `RUN_FINISHED` / `RUN_ERROR` drive the debounce → streaming → applied → error state machine; `TOOL_CALL_START` / `TOOL_CALL_ARGS` / `TOOL_CALL_END` + `TOOL_CALL_RESULT` cover the apply-edit lifecycle. `useConfigureSuggestions` can power inline next-best-action chips on an empty line.

```tsx
import { CopilotTextarea } from "@copilotkit/react-textarea";
import { useCopilotReadable } from "@copilotkit/react-core";

// v1 — drop-in textarea with ghost-text + Cmd+K popup
// (CopilotTextarea has no v2 equivalent; use @copilotkit/react-textarea)

function EmailComposer({ documentContext, value, onChange }) {
  // Ground completions in surrounding document state
  useCopilotReadable({
    description: "Current document context for the email being composed",
    value: documentContext,
  });

  return (
    <CopilotTextarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start typing your email…"
      autosuggestionsConfig={{
        // Plain-text description steering the ghost-text model
        textareaPurpose:
          "A professional email body. Suggest concise, polished continuations.",
        chatApiConfigs: {
          // Ghost-text autocomplete pipeline (at least one of the two must be provided)
          suggestionsApiConfig: {
            maxTokens: 64,
            stop: ["\n\n"],
          },
          // Cmd+K / Ctrl+K rewrite / insert-below pipeline
          insertionApiConfig: {},
        },
      }}
      // Override the Cmd+K shortcut (default: "Cmd-k" on Mac, "Ctrl-k" on Windows)
      // shortcut="Ctrl-space"
      className="email-body-field"
      rows={12}
    />
  );
}
```

> AG-UI events in play: `RUN_STARTED` (debounce → in-flight), `TEXT_MESSAGE_CONTENT` (stream ghost-text tokens into preview), `RUN_FINISHED` / `RUN_ERROR` (settle or inline error), `TOOL_CALL_START/ARGS/END` + `TOOL_CALL_RESULT` (apply-edit lifecycle in headless mode).

## Best practices

- **Keep it ignorable by default:** ambient ghost text must never steal focus, move the caret, or block typing — continuing to type should silently discard the suggestion. The cost of a wrong suggestion must be zero keystrokes.
- **Honor the universal keymap:** Tab to accept, Cmd/Ctrl+→ to accept word-by-word (partial accept), Escape to dismiss. Audit for Tab collisions with snippet expansion, indentation, and existing autocomplete menus; offer a remap or Alt-based alternative when conflicts are likely.
- **Tune debounce to the surface:** ~500ms–1s of idle before requesting a completion balances responsiveness against cost and flicker; clamp very low values to avoid request storms. Completion-as-you-type demands lower latency than chat — use a fast/lightweight model and stream tokens.
- **Show, don't surprise:** for any destructive transform (rewrite, refactor, replace selection) render a diff-in-place or preview with explicit Accept/Revert before mutating the document; let users iterate with a follow-up instruction without re-summoning the prompt bar.
- **Make AI state legible without clutter:** keep the generated span visually distinct (dimmed ghost styling, diff colors) until committed, then resolve to normal text on accept so the document never looks half-AI.
- **Ground completions in real context:** feed the surrounding document, selection, and app state (`useCopilotReadable` + `textareaPurpose`; Copilot's open-tab snippets) so suggestions are relevant, not generic — relevance is what earns the Tab.
- **Provide a clear off switch and scope controls:** per-field, per-file, or per-context disabling (sensitive inputs, secrets, ignored paths), and a way to escalate from inline to a sidebar or agent when the task outgrows a single span (surface a "Chat about this" or "Open Agent" escape hatch).
- **Expose a stop affordance during streaming:** it must be keyboard-reachable without tabbing through the growing partial output so users can interrupt long generations immediately.

## Anti-patterns

- **Aggressive, undismissable suggestions:** ghost text that reappears instantly on every keystroke, fights the user's own typing, or auto-commits without an explicit Tab — turning a helper into an adversary.
- **Hijacking Tab/Enter/Escape without fallback:** stomping on indentation, snippet expansion, or existing autocomplete menus so core editing breaks and users blame the wrong tool.
- **Silent destructive replacement:** rewriting or replacing selected text with no inline diff, no preview, and no one-step undo — the user can't see what changed or trust the result.
- **Per-keystroke cloud round-trips with no debounce or local model:** visible lag and flicker on every character, plus runaway API cost, making the feature feel broken even when correct.
- **Forcing chat for spatial tasks:** opening a side panel and requiring the user to *describe* where to edit ("in the second paragraph, change…") when the cursor or selection already pins the exact location — the inverse of what this placement is designed for.

## Accessibility

- Announce suggestions via the editor's accessibility tree: expose ghost text with `aria-live="polite"` so screen readers announce "AI suggestion available, press Tab to accept" after the suggestion settles — never `aria-live="assertive"`, which would read every streaming token and produce an unusable speech torrent.
- Ensure every mouse affordance has a full keyboard path: the selection toolbar and Cmd+K prompt bar must be reachable and operable without a pointer device; publish the keyboard shortcut in a discoverable tooltip or status-bar hint.
- The Cmd+K / inline prompt bar must trap focus while open: Tab and Shift+Tab cycle within the prompt controls; Escape closes and returns focus to the editor at the original caret position.
- Accept, Revert, and Try Again action controls rendered below a diff-in-place must be reachable by Tab without forcing the user to navigate through the generated diff content first; consider rendering them in a small floating toolbar anchored above or below the diff block.
- For users with reduced-motion preferences (`prefers-reduced-motion: reduce`), suppress the token-streaming animation and render the completed suggestion immediately rather than fading it in character-by-character.
- Ghost text must pass a minimum contrast ratio against the editor background in its dimmed state (WCAG AA 4.5:1 for text); a common failure is dimming so aggressively that low-vision users cannot read the suggestion at all.

## Related

- [Side Panel / Sidebar Copilot](./side-panel.md) — the escalation target when the task outgrows a single span
- [Main Panel / Full-Page Chat](./main-panel.md) — full-page alternative for open-ended, multi-turn work
- [Command Palette](./command-palette.md) — modal command surface that can share a Cmd+K shortcut space; coordinate trigger keys to avoid conflicts
- [Floating Widget](./floating-widget.md) — a lighter persistent surface if you want a persistent launcher alongside inline editing
- [Canvas / Workspace & Artifacts](./canvas-workspace.md) — complementary layout when the agent produces a structured artifact alongside editable content
- [Ambient / Proactive AI](./ambient-proactive.md) — the zero-invocation cousin; AI surfaces itself without any user trigger
- [Human-in-the-Loop Prompt](../components/human-in-the-loop.md) — blocking approve/reject gates for destructive in-place rewrites
- [Generative UI Inline](../components/generative-ui-inline.md) — rendering agent-generated components inline in a document or stream
- [Suggestions & Capability Surfacing](../components/suggestions-capabilities.md) — empty-line "Ask AI" starter chips and next-best-action affordances
- [Input Composer](../components/input-composer.md) — the composer pattern shared with the Cmd+K prompt bar
- [Tool Call](../components/tool-call.md) — tool-call card lifecycle underpinning the headless apply-edit pipeline
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary / glossary](../reference/glossary.md)
- [Layouts README — "Where AI Sits" placement framework](./README.md)

## Sources

- https://code.visualstudio.com/docs/editing/ai-powered-suggestions
- https://docs.github.com/en/copilot/concepts/completions/code-suggestions
- https://docs.github.com/en/copilot/responsible-use/copilot-code-completion
- https://code.visualstudio.com/blogs/2025/02/12/next-edit-suggestions
- https://cursor.com/docs/inline-edit/overview
- https://cursor.com/help/ai-features/tab
- https://cursor.com/blog/tab-update
- https://www.notion.com/help/guides/notion-ai-for-docs
- https://www.notion.com/help/writing-and-editing-basics
- https://support.google.com/docs/answer/13951448?hl=en
- https://workspace.google.com/products/docs/ai/
- https://support.grammarly.com/hc/en-us/articles/14528857014285-Introducing-generative-AI-assistance
- https://support.grammarly.com/hc/en-us/articles/38552281546765-Docs-Grammarly-s-new-AI-writing-surface-user-guide
- https://help.superhuman.com/hc/en-us/articles/38456855116307-Write-with-AI
- https://docs.copilotkit.ai/reference/v1/components/CopilotTextarea
- https://docs.copilotkit.ai/integrations/built-in-agent/tutorials/ai-powered-textarea/overview
- https://docs.copilotkit.ai/reference/v2/hooks/useConfigureSuggestions
- https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop
- https://docs.copilotkit.ai/reference/v2/hooks/useFrontendTool
- https://docs.ag-ui.com/sdk/js/core/events
