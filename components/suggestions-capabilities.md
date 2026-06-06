# Suggestions & Capability Surfacing

> Surfaces what an agent can do and guides the user's next move — from the pre-conversation zero state through follow-up chips and a slash-command palette during active conversation. **Category:** Component · **Cluster:** Threads, history & capability surfacing · **Aliases:** suggestion chips, follow-up suggestions, prompt starters, conversation starters, slash commands, command palette, tools menu, capability cards, zero state, empty state, prompt library, onboarding

## Definition

Suggestions & Capability Surfacing is the full set of affordances that tell a user what an agent can do and how to invoke it. It covers two related but distinct surfaces: (1) the **empty/zero state** — the pre-conversation screen that displays a greeting, capability cards, and clickable starter prompts before any message is sent; and (2) **in-conversation affordances** — follow-up suggestion chips after assistant turns and a keyboard-driven command palette (slash commands, @-mentions, tools menu) that surfaces actions inline as the user types. Together they solve two problems: the blank-textbox cold-start problem (users don't know what to ask) and continuous discoverability (users forget or never learn what verbs the agent knows). Both surfaces appear wherever an agent chat panel is rendered — sidebars, full-page panels, embedded composers.

## When to use / when not to

- **Use the zero state** whenever a new conversation starts and the agent has a meaningful, bounded set of capabilities — even one well-chosen starter outperforms a blank input.
- **Use follow-up chips** after assistant turns that naturally lead to predictable next actions; cap the set at 2–4 so they assist rather than overwhelm.
- **Use a slash/command palette** when the agent exposes a non-trivial catalog of named actions, templates, or tools that users cannot enumerate from memory.
- **Do not show starters** that your agent cannot actually fulfil — vague or over-promising prompts erode trust on the first interaction and are worse than no starters at all.
- **Do not leave all capability behind a slash trigger** with no other affordance; users who don't know to type `/` will never discover what the agent can do.

## Anatomy

```
┌────────────────────────────────────────────────────┐
│  ZERO / EMPTY STATE                                │
│  ┌──────────────────────────────────────────────┐  │
│  │ greeting / welcome message                   │  │  ← greeting
│  └──────────────────────────────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │capability│ │capability│ │capability│  …         │  ← capability cards
│  │  card    │ │  card    │ │  card    │            │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────────────────────────────────────────┐  │
│  │ [prompt starter] [prompt starter] [more ▾]   │  │  ← conversation starters
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ [ Input composer …                      Send ]│  │  ← composer
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘

 IN-CONVERSATION: after assistant turn
  ┌─────────────────────────────────────────────┐
  │ [follow-up chip A]  [follow-up chip B]  [×] │  ← suggestion chips + dismiss
  └─────────────────────────────────────────────┘

 IN-CONVERSATION: user types "/" in composer
  ┌─────────────────────────────────────────────┐
  │ /sum▌                                        │
  │ ┌─────────────────────────────────────────┐ │
  │ │ TOOLS                                   │ │
  │ │  /summarize  Summarize the document     │ │  ← command palette
  │ │  /suggest    Suggest next steps         │ │    (typeahead filtered)
  │ │ PROMPTS                                 │ │
  │ │  /review     Run a quality review       │ │
  │ └─────────────────────────────────────────┘ │
  └─────────────────────────────────────────────┘
```

**Parts:**
- **greeting / welcome message** — short, configurable copy that names the agent and frames its purpose.
- **capability card** — a tile describing one thing the agent can do; may be clickable to prefill a prompt or start a workflow.
- **conversation starters / starter prompts** — configured example prompts rendered as chips or buttons above the composer on the zero state.
- **suggestion chips** — pill-shaped buttons after an assistant turn proposing the likely next question or action.
- **command palette / command menu** — a keyboard-first popover (cmdk pattern) listing slash commands with fuzzy typeahead, groups, and an empty-result state.
- **tools menu / action menu** — explicit mouse-friendly menu attached to the input for users who don't know the trigger character.
- **scope / limits disclosure** — optional statement of what data the agent can see and what it cannot do, placed near the greeting or in a tooltip.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Empty / zero state | Thread has no messages | Greeting, capability cards, and starter chips are fully visible; composer is focused |
| Loading suggestions | Dynamic suggestion generation begins | Skeleton chip placeholders (shimmer) replace chips; input remains enabled |
| Suggestions ready | Generation complete | Clickable chips appear; static starters show immediately without skeleton |
| Starter / chip selected | User clicks a chip | Prompt prefills composer (editable) or sends directly; chips collapse or dismiss |
| Contextual refresh | App state / document changes (e.g. new file opened) | Chip set regenerates to reflect current context; transient skeleton shown |
| Collapsed post-conversation | First user message sent | Zero-state starters hide; conversation messages take over the surface |
| Palette opening | User types `/` (or `@`) in composer | Popover opens immediately; shows full unfiltered list or context-aware list |
| Palette typeahead active | User continues typing after trigger | Items filter in real time (debounced); active descendant tracked; empty-result state shown if nothing matches |
| Command selected | User presses Enter or clicks item | Palette closes; prompt prefilled or action dispatched; focus returns to composer |
| Disabled during streaming | Agent is streaming a response | Chips hidden or visually disabled; palette trigger suppressed to prevent double-sends |
| Error / no suggestions | Generation error or no matches | Fallback empty state shown with retry affordance; static starters remain available |

## Vocabulary

| Term | Definition |
|---|---|
| zero / empty state | The pre-conversation screen with greeting and suggestions shown when a thread has no messages |
| conversation starters | Configured example prompts shown as clickable chips on the welcome screen (OpenAI GPTs: up to four) |
| starter prompts | ChatKit / Copilot Studio term for suggested openers, each with a name, prompt text, and optional icon |
| capability card | A tile describing one thing the agent can do, often clickable to prefill a prompt or open a workflow |
| suggestion chip | A small, pill-shaped clickable button carrying a suggested message or action that sends or prefills on click |
| follow-up suggestion | A chip generated after an assistant turn proposing the likely next question or action |
| prompt library | A browsable, often shareable catalog of reusable prompts or templates |
| slash command | A command invoked by typing `/` followed by a name, opening a filterable menu of actions |
| command palette / command menu | A keyboard-first popover listing commands with fuzzy search, groups, and keyboard navigation (cmdk pattern) |
| @-mention | A trigger (`@`) for referencing entities — files, people, GPTs, data sources — inline within the prompt |
| tools menu / action menu | An explicit, clickable menu of agent tools or actions attached to the input composer |
| typeahead / autocomplete | Live filtering of palette items as the user types after the trigger character |
| active descendant / highlighted option | The currently keyboard-focused item in the open list, tracked with `aria-activedescendant` while DOM focus stays on the input |
| empty result state | The "no matching commands" state of an open palette |
| workflow suggestion | A contextual recommendation of a multi-step action relevant to the current document or state |
| greeting / welcome message | Short configurable copy that frames the agent's purpose and persona at the top of the empty state |
| scope / limits disclosure | Explicit statement of what the agent can and cannot do and what data it can access, for calibrated trust |
| prompt template / saved prompt | A reusable parametrised prompt invoked through the palette (e.g. Cursor `.cursor/commands/*.md`, GitHub Copilot prompt files) |

## Real-world examples

- **OpenAI GPTs / ChatGPT** — A custom GPT's profile shows a description plus up to four configured "conversation starters" as clickable chips above the composer on the welcome screen; on paid plans, typing `@` mid-conversation surfaces another GPT with full conversation context. [Source](https://help.openai.com/en/articles/8554407-gpts-faq)
- **OpenAI ChatKit (AgentKit)** — The embeddable ChatKit component exposes a declarative `StartScreenOption` with greeting text and a list of "starter prompts" shown above the composer in the new-thread view; it also handles thread history and chain-of-thought visualizations. [Source](https://developers.openai.com/api/docs/guides/chatkit)
- **Google Gemini (Gems)** — Opening a Gem shows four suggested prompts in a horizontally scrollable row; custom and premade Gems are listed in the left panel and managed via the Gem manager, making specialized agents and their starters discoverable. [Source](https://www.computerworld.com/article/4054876/a-beginners-guide-to-google-gemini-gems.html)
- **Glean** — Ships a browsable, shareable AI Prompt Library mapped to real enterprise workflows (using the CARE framework: context, ask, rules, examples); search results and document suggestions also surface contextually as the user types in the chat bar. [Source](https://www.glean.com/prompt-library)
- **Cursor** — Custom slash commands (Cursor 1.6+) are saved as Markdown files in `.cursor/commands/` and invoked by typing `/` in chat; the filename becomes the command name. Cursor 1.7 added Agent autocomplete, surfacing prompt/command suggestions as the user types. [Source](https://cursor.com/changelog/1-6)
- **GitHub Copilot Chat** — Typing `/` in chat opens built-in slash commands filtered to the current environment; custom `*.prompt.md` files in `.github/prompts/` appear at the top with a bookmark icon as custom slash commands. `#`/`@` attach additional context. [Source](https://docs.github.com/en/copilot/reference/chat-cheat-sheet)
- **Notion AI** — Typing `/ai` inside a page surfaces AI actions (in purple) within the slash menu; "Draft with AI" lists ready-made starters (`Brainstorm ideas…`, `Outline…`, `Press release…`) that open a prompt window with the start of the prompt pre-filled and editable. [Source](https://zapier.com/blog/how-to-use-notion-ai/)

## CopilotKit & AG-UI mapping

**Primitives:**

- **`useConfigureSuggestions`** (v2, `@copilotkit/react-core/v2`) — generates context-aware suggestion chips from an `instructions` string; accepts `minSuggestions`, `maxSuggestions`; the `available` field controls when chips appear (`"before-first-message"` for zero-state starters, `"after-first-message"` for follow-ups, or `"always"`). v1 equivalent: `useCopilotChatSuggestions`.
- **`useSuggestions`** (v2) — companion hook to read and set the active suggestion list in headless flows.
- **`useCopilotReadable`** — pushes the current document or app state into the agent's context, so dynamically generated suggestions stay grounded in what the user is looking at.
- **`CopilotChat` `toolsMenu` prop** — declarative command-palette surface: an array of `{ label, action }` items (with `"-"` separator entries and nested `items` for sub-menus); the natural home for slash-style commands without a custom cmdk implementation.
- **`useFrontendTool`** — every registered tool is a surfaceable capability; the tool's `name` and `description` are what a prompt-library or command-palette entry should reflect.
- **`useAgent`** (v2) / `useCoAgent` (v1) — reading live agent state lets contextual workflow suggestions update when the document or pipeline state changes.

AG-UI: Suggestions are a UI-layer concern not tied to a specific AG-UI event — they are generated client-side or by a separate inference call, not emitted by the agent run itself. The underlying run that generates dynamic suggestions does emit `RUN_STARTED` / `RUN_FINISHED`, which should suppress the input and hide chips during streaming.

```tsx
import { useConfigureSuggestions, useCopilotReadable } from "@copilotkit/react-core/v2";
import { CopilotSidebar } from "@copilotkit/react-ui";

function DocumentCopilot({ documentTitle }: { documentTitle: string }) {
  // Push the current document into the agent's context window
  useCopilotReadable({
    description: "The document currently open in the editor",
    value: documentTitle,
  });

  // Generate context-aware chips; show starters before first message,
  // follow-ups after each assistant turn
  useConfigureSuggestions({
    instructions: `Suggest 3 specific, action-oriented next steps for working on "${documentTitle}". 
      Focus on tasks the agent can actually perform: summarizing, editing, finding references, creating outlines.`,
    minSuggestions: 2,
    maxSuggestions: 4,
    available: "always",
  });

  return (
    <CopilotSidebar
      defaultOpen
      labels={{ title: "Document Assistant", initial: `I can help you work on "${documentTitle}". What would you like to do?` }}
    />
  );
}

// v1 equivalent: useCopilotChatSuggestions({ instructions, minSuggestions, maxSuggestions })
```

## Best practices

- **Lead the zero state with 3–6 concrete, action-oriented starters** that reflect real supported capabilities — "Summarize the key risks in this contract" beats "Ask me anything." Each starter should produce a high-quality result to teach scope on the first click.
- **Be honest about limits:** include a brief scope/limits disclosure near the greeting (e.g., "I can see documents in this project but not external web pages"). Calibrated transparency on the first screen prevents misuse and builds durable trust.
- **Treat starters as curatable configuration, not decoration:** they should be configurable by the app or admin, updatable without a code deploy, and personalised from recent activity or memory when possible — but disclose when personalisation is driving them.
- **Surface contextual workflow suggestions**, not abstract ones: use `useCopilotReadable` to feed the current document or state into suggestion generation so chips reflect what the user is actually doing right now.
- **Keep latency invisible:** render static starters immediately (zero round-trip); use skeleton chips only for dynamically generated ones; debounce palette typeahead; never block the input waiting for suggestion generation to complete.
- **Disable / hide chips while streaming** to prevent double-sends; re-enable immediately when `RUN_FINISHED` arrives.
- **Pair the slash palette with a visible tools/action menu** (`toolsMenu` prop or an explicit button) so capabilities are reachable without knowing the trigger character — progressive disclosure for novices and power users alike.
- **Cap follow-up chips at 2–4** and allow dismissal; more than four suggestions shifts cognitive load from the agent back to the user.
- **Provide a path beyond starters** — a "see more" / prompt library link and a clearly focusable text input — so the zero state guides without trapping the user in the curated set.

## Anti-patterns

- **The blank textbox** — no greeting, no starters, no visible tools — leaves users unsure what the agent can do and forces trial-and-error discovery. Even one well-chosen starter is meaningfully better.
- **Over-promising starters** — vague, aspirational prompts ("Help me solve any problem") that trigger out-of-scope failures damage trust on the first interaction and are harder to recover from than simply providing no starters at all.
- **Static, context-blind suggestions** — a fixed list that never updates when the user opens a different document, switches roles, or changes app state. These become noise users learn to ignore.
- **Chips and palette that are mouse-only** — no arrow-key navigation, no `Escape` to close with focus return, no ARIA roles — locks out keyboard and screen-reader users and fails WCAG 2.1 AA.
- **Hiding all capabilities behind a `/` trigger** with no other affordance — users who don't know the convention (often non-technical users in enterprise deployments) never discover what verbs the agent knows.

## Accessibility

- **Zero-state starter buttons:** render as real `<button>` elements (not `<div>`) in a `<nav>` or `<section>` with `aria-label="Suggested prompts"`. Ensure the greeting heading is in the DOM so screen readers announce it on focus.
- **Suggestion chips:** each chip needs a descriptive accessible name (full prompt text, not just an icon). Announce chip appearance with a polite `aria-live` region: "3 suggestions available" — but do not re-announce on every keystroke update.
- **Command palette — combobox pattern:** the composer input gets `role="combobox"`, `aria-expanded`, `aria-controls` (pointing to the listbox id), and `aria-activedescendant` (the focused option's id). The popup gets `role="listbox"`; each entry gets `role="option"` and `aria-selected` on the highlighted item. DOM focus stays on the input — keyboard arrows move `aria-activedescendant`, not `document.activeElement`.
- **Keyboard contract:** `↓`/`↑` to move through palette items, `Home`/`End` to jump, `Enter` to select, `Escape` to close and return focus to the input cursor position (not just the input element).
- **Reduced motion:** skeleton shimmer animations and chip entrance transitions should respect `prefers-reduced-motion: reduce` — replace animated skeletons with static placeholder rectangles.
- **Focus management after selection:** after a starter or command is selected and the composer is populated, move focus explicitly to the composer so the user can immediately edit or submit without an extra Tab.

## Related

- [Input Box / Composer](./input-composer.md) — the composer that hosts the palette trigger, chips row, and tools menu
- [Chat Message](./chat-message.md) — the assistant turn after which follow-up chips appear
- [Threads / Conversation History](./threads-history.md) — the thread surface where the zero state is shown for new threads
- [Tool Call](./tool-call.md) — the invocable capabilities exposed to users through the palette and capability cards
- [Human-in-the-Loop Prompt](./human-in-the-loop.md) — commands invoked through the palette that pause for user approval
- [Agent Status, Activity & Traceability](./agent-activity-traceability.md) — the run state (`RUN_STARTED/FINISHED`) that drives chip enable/disable
- [Inline Generative UI (Static / Controlled)](./generative-ui-inline.md) — capability cards that render as inline components rather than plain text chips
- [Side Panel / Sidebar Copilot](../layouts/side-panel.md) — the primary layout for the zero state in embedded copilots
- [Main Panel / Full-Page Chat](../layouts/main-panel.md) — full-page layout where the zero state occupies the viewport center
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary / glossary](../reference/glossary.md)

## Sources

- https://help.openai.com/en/articles/8554407-gpts-faq
- https://developers.openai.com/api/docs/guides/chatkit
- https://www.computerworld.com/article/4054876/a-beginners-guide-to-google-gemini-gems.html
- https://www.glean.com/prompt-library
- https://cursor.com/changelog/1-6
- https://docs.github.com/en/copilot/reference/chat-cheat-sheet
- https://zapier.com/blog/how-to-use-notion-ai/
- https://docs.copilotkit.ai/copilot-suggestions
- https://docs.ag-ui.com/concepts/events
