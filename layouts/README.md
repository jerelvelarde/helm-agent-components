# Layouts — Where AI Sits

> **Placement is not an aesthetic choice — it's a mental-model choice.** Where an AI capability physically lives in your product (a corner bubble, an inline overlay, a side rail, center stage, an infinite canvas, a research grid) sets its *discoverability*, its *interaction rhythm*, and the *role users believe it plays* — and therefore trust. As the framing article puts it: spatial layouts "aren't aesthetic choices; they define the mental model users form about the AI's role," and "how AI is surfaced will be just as critical as designing what it can do." (Sharang Sharma, [Where should AI sit in your UI?](https://uxdesign.cc/where-should-ai-sit-in-your-ui-1710a258390e), UX Collective.)

This folder documents **10 placement patterns**. This page is the decision layer: pick a placement by the *role* you want the AI to play, then open that pattern's doc.

---

## The decision in one line

> Decide **what users should believe the AI *is*** (a silent autocomplete? an on-call support agent? a consulted expert? a co-creator? the product itself?), then choose the layout that primes exactly that mental model — and grant only as much **agency** as the placement visibly accounts for.

---

## Three axes (evaluate every placement on these)

| Axis | Question | Trade-off |
|---|---|---|
| **Discoverability** | How visible / reachable is the AI? | Reach vs. intrusion. Center-stage and inline maximize discovery; a collapsed bubble hides AI behind a click. |
| **Interaction pattern** | Synchronous or async? Reactive (pull) or proactive (push)? Single-shot or multi-turn? | Flow-preservation vs. initiative. |
| **Perceived agent role** | What does the placement make users *expect* — autocomplete, support agent, expert, co-creator, the product? | "AI as helper" vs. "AI as the product." The placement must match the role you actually want. |

Two more cuts that matter: **ambient ↔ focal** (periphery vs. visual center) and **pull ↔ push** (user reaches for it vs. it surfaces itself).

---

## The agency spectrum (orthogonal to location)

Wherever the AI sits, decide how much it may *do* on its own. Borrowing Smashing Magazine's **Autonomy Dial**:

```
Observe & Suggest  →  Plan & Propose  →  Act with Confirmation  →  Act Autonomously
   (ghost text)        (intent preview)     (HITL approval)          (background agent)
        low ◀───────────────────  agency  ───────────────────▶ high
   more user control                                   more visible consent + undo required
```

**Rule:** the more proactive or autonomous the AI, the more it must surface intent previews, confidence signals, and an obvious **undo** — autonomy is a privilege the user grants, not a right the system seizes. Gate higher-agency actions with [Human-in-the-Loop](../components/human-in-the-loop.md).

---

## Choose your placement

From peripheral to dominant, plus the spatial and proactive specials. Each row links to its full doc.

| Placement | Perceived role | Choose it when | CopilotKit primitive |
|---|---|---|---|
| [Floating Widget / Launcher](./floating-widget.md) | Reactive **support agent** ("ask when stuck") | AI is secondary, episodic help layered over an existing app; lowest commitment, retrofit-friendly | `CopilotPopup` |
| [Inline / Contextual AI](./inline-contextual.md) | Precision **autocomplete / micro-assistant** | AI augments work the user is doing *in place* (writing, a cell, a code line); continuity matters | `CopilotTextarea` (v1) |
| [Command Palette / Cmd+K](./command-palette.md) | Ephemeral **command + ask** launcher | Keyboard-first power users; quick actions and one-shot asks without leaving the task | headless overlay + `useAgent` |
| [Side Panel / Sidebar Copilot](./side-panel.md) | On-demand **deep-context expert** | The user's primary task is the focus; AI is consulted while they stay in control (the IDE/copilot model) | `CopilotSidebar` (right) |
| [Split View — Chat Drives a Workspace](./split-view.md) | **Strategic partner / co-creator** | Iterative turn-by-turn co-creation of an artifact shown beside the chat (Lovable, Canvas) | `CopilotSidebar` (left) + `useAgent` |
| [Main Panel / Full-Page Chat](./main-panel.md) | **General assistant — the product** | The AI *is* the product; freeform exploration across domains (ChatGPT, Perplexity) | `CopilotChat` |
| [Canvas / Workspace & Artifacts](./canvas-workspace.md) | Spatial **creative collaborator** | Genuinely spatial/visual work; the agent manipulates objects and produces durable artifacts | headless + `useAgent` |
| [Grid / Matrix (Cells as Agents)](./grid-matrix.md) | A **fleet of async research agents** | Bulk, parallel, structured extraction — columns = questions, rows = entities (Hebbia, Elicit) | headless + `useAgent` per cell |
| [Ambient / Proactive AI](./ambient-proactive.md) | **Proactive teammate** | Async/background work and unprompted nudges; results land in an inbox, toast, or PR | `useAgent` (outside chat) + suggestions |
| [Tabs / Mode Switching](./tabs.md) | Orthogonal **organizer** | Many agent modes/surfaces coexist in one view and the user switches between them | `CopilotChatView` + tabs |

> **Don't default to "a chat panel bolted onto the side."** It's the most common placement and often the wrong one (LukeW). AI also belongs woven into onboarding, search, and forms — challenge the side-panel default, don't assume it.

---

## Cross-cutting principles (apply at every placement)

- **Beat the blank-canvas dilemma.** An empty prompt field hides capability. Seed every entry point with Wayfinders / suggested prompts / templates (Shape of AI, LukeW). In CopilotKit: `useConfigureSuggestions` with `available: "before-first-message"`. See [Suggestions & Capability Surfacing](../components/suggestions-capabilities.md).
- **Mark the surface as AI, and make it explainable.** Use an explicit AI label + a first-layer explainability affordance (IBM Carbon for AI), and expose citations/cost/disclosure (Shape of AI "Trust Builders") so users can calibrate trust. See [Agent Status, Activity & Traceability](../components/agent-activity-traceability.md).
- **Design for how people actually iterate.** Users do *accordion editing* (expand/shrink outputs) and *apple-picking* (reference parts of a prior answer into the next prompt) — NN/g. Favor placements that allow in-place editing and point-to-select over an endless linear scroll.
- **Match agency to visibility.** Proactive/autonomous behavior demands intent previews, confidence signals, and undo (Smashing's agentic patterns; Google PAIR mental-models guidance).
- **Stream and show progress; never block silently.** Reveal thinking, tool calls, and partial output; for slow autonomous work move to async grid/agent placements with clear running → awaiting → applied → error states.

---

## How this maps to CopilotKit

The placement decision maps almost one-to-one onto components — you're choosing a component, not rebuilding a layout: `CopilotPopup` (widget), `CopilotSidebar` (left/right panel & split view), `CopilotChat` (center stage), `CopilotTextarea` (inline, v1 — `@copilotkit/react-textarea`), and **headless** (`useAgent` + the render hooks) for canvas, grid, and ambient surfaces. Agency and legibility come from `useFrontendTool`, `useRenderTool`, `useHumanInTheLoop` (the approval gate), and `useConfigureSuggestions`, all riding the [AG-UI event protocol](../reference/copilotkit-primitives.md). Confirm exact import paths and the v1-vs-v2 surface in the [primitive reference](../reference/copilotkit-primitives.md).

---

## Sources

- Sharang Sharma — [Where should AI sit in your UI?](https://uxdesign.cc/where-should-ai-sit-in-your-ui-1710a258390e) (UX Collective) — the 7 placements + 3 axes
- [Shape of AI](https://www.shapeof.ai/) — Wayfinders, Governors, Trust Builders, Identifiers
- NN/g — [Accordion Editing and Apple Picking](https://www.nngroup.com/articles/accordion-editing-apple-picking/)
- IBM — [Carbon for AI](https://carbondesignsystem.com/guidelines/carbon-for-ai/) (AI label + explainability)
- Luke Wroblewski — [Tackling Common UX Hurdles with AI](https://www.lukew.com/ff/entry.asp?2132)
- Smashing Magazine — [Designing for Agentic AI: Control, Consent, and Accountability](https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/) (the Autonomy Dial)
- Google PAIR — [Mental Models](https://pair.withgoogle.com/chapter/mental-models/)
