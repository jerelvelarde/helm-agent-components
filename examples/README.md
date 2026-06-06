# Helm — Examples

Where the [components](../components) and [layouts](../layouts) stop being a catalogue and become a **product**. Each example is an end-to-end agentic app screen that **composes a layout + several components** into something recognizable — so you can see how the building blocks fit together, not just what each one is.

These are **runnable**. They live as composed stories in the [gallery](../gallery) under the **Examples** category — fully presentational, mock-data only, no API keys — and each ships the assembled **CopilotKit wiring** as a copy-pasteable snippet.

```bash
cd gallery
npm install
npm run dev      # → open the printed URL → "Examples" in the top nav
```

---

## The five examples

| Example | Layout | The business it models |
|---|---|---|
| [Legal Contract Copilot](#1--legal-contract-copilot) | [Side Panel](../layouts/side-panel.md) | A Harvey/Hebbia-style legal vertical — contract review with cited findings and gated edits. |
| [Customer-Support Copilot](#2--customer-support-copilot) | [Floating Widget](../layouts/floating-widget.md) | An Intercom-style support bubble layered over a storefront. |
| [Deep-Research Workspace](#3--deep-research-workspace) | [Main Panel](../layouts/main-panel.md) | A Perplexity/Deep-Research-style full-page research agent. |
| [Coding Agent Panel](#4--coding-agent-panel) | [Side Panel](../layouts/side-panel.md) | A Cursor/Devin-style IDE coding agent. |
| [Canvas / Artifact Builder](#5--canvas--artifact-builder) | [Split View](../layouts/split-view.md) | A Lovable-style chat-driven artifact studio. |

---

### 1 · Legal Contract Copilot

> A contract-review copilot docked beside a Master Services Agreement. Every claim cites its clause or precedent, and edits to executed terms gate on human sign-off.

**Runnable story:** [`gallery/src/stories/legal-contract-copilot.tsx`](../gallery/src/stories/legal-contract-copilot.tsx)

**Composes**

| Component | Role in this product |
|---|---|
| [Side Panel](../layouts/side-panel.md) | Docked copilot rail beside the document work surface. |
| [Thinking / Reasoning](../components/thinking-reasoning.md) | Collapsible trace of the cross-clause analysis. |
| [Chat Message](../components/chat-message.md) | The reviewer ↔ agent transcript with inline citations. |
| [Tool Call](../components/tool-call.md) | `search_case_law` rendered as a glanceable, expandable line. |
| [Web Research / citations](../components/web-research.md) | Source cards link each claim to its clause or precedent. |
| [Inline Generative UI](../components/generative-ui-inline.md) | The redline diff card the agent renders in-thread. |
| [Human-in-the-Loop](../components/human-in-the-loop.md) | High-stakes approval gate before any contract edit. |
| [Activity & Traceability](../components/agent-activity-traceability.md) | Provenance count + audit-logged decisions. |

**Why it's a good reference** — high-stakes verticals live or die on **provenance** (every assertion traceable) and **calibrated control** (the agent never silently rewrites an executed term). Same `useHumanInTheLoop` primitive as a throwaway confirmation, dialled all the way up.

---

### 2 · Customer-Support Copilot

> A support bubble layered over an e-commerce storefront — prompt starters, an order lookup that renders a card, and a refund that pauses for confirmation.

**Runnable story:** [`gallery/src/stories/support-copilot.tsx`](../gallery/src/stories/support-copilot.tsx)

**Composes**

| Component | Role in this product |
|---|---|
| [Floating Widget](../layouts/floating-widget.md) | Bottom-right launcher → popup, layered over the storefront. |
| [Suggestions](../components/suggestions-capabilities.md) | Prompt starters that surface what the agent can do. |
| [Chat Message](../components/chat-message.md) | The customer ↔ support transcript. |
| [Input / Composer](../components/input-composer.md) | Send + mic (voice) entry at the foot of the widget. |
| [Tool Call](../components/tool-call.md) | `lookup_order` shown as a compact, glanceable line. |
| [Inline Generative UI](../components/generative-ui-inline.md) | The order-summary card the agent renders. |
| [Human-in-the-Loop](../components/human-in-the-loop.md) | Refund confirmation before money moves. |
| [Activity & Traceability](../components/agent-activity-traceability.md) | The "checked…" trail of what the agent consulted. |

**Why it's a good reference** — the peripheral, task-bounded pattern: AI that **augments an existing app** without owning the screen. Read-only actions run friction-free; side effects (a refund) pause for a human; a "talk to a human" escape hatch is always one tap away.

---

### 3 · Deep-Research Workspace

> A full-page research agent: a live plan, parallel sub-agents, a streaming cited report, and a generative comparison table.

**Runnable story:** [`gallery/src/stories/research-workspace.tsx`](../gallery/src/stories/research-workspace.tsx)

**Composes**

| Component | Role in this product |
|---|---|
| [Main Panel](../layouts/main-panel.md) | Full-page surface where the agent *is* the whole app. |
| [Deep Research](../components/deep-research.md) | The live plan + step progress for a long-running run. |
| [Sub-Agents](../components/sub-agents.md) | Parallel workers, one per research question, with status. |
| [Thinking / Reasoning](../components/thinking-reasoning.md) | Collapsible trace of how findings are weighted. |
| [Web Research](../components/web-research.md) | Source cards + inline citations behind every claim. |
| [Inline Generative UI](../components/generative-ui-inline.md) | The synthesized competitor comparison table. |
| [Activity & Traceability](../components/agent-activity-traceability.md) | Sources / agents / elapsed-time provenance bar. |
| [Chat Message](../components/chat-message.md) | The follow-up composer to interrogate the report. |

**Why it's a good reference** — when the AI *is* the product, the whole run has to be legible: a **plan** that ticks through its steps, **sub-agents** fanned out per question, and a **streaming report** where every claim carries a citation. Plan and workers are driven from **shared agent state**, so the screen and the run never drift apart.

---

### 4 · Coding Agent Panel

> A Cursor/Devin-style coding agent docked beside the editor. It plans, edits files as reviewable diffs, and pauses before it runs a command.

**Runnable story:** [`gallery/src/stories/coding-agent.tsx`](../gallery/src/stories/coding-agent.tsx)

**Composes**

| Component | Role in this product |
|---|---|
| [Side Panel](../layouts/side-panel.md) | Agent rail docked beside the code editor. |
| [Threads / History](../components/threads-history.md) | Resumable debugging sessions per task. |
| [Thinking / Reasoning](../components/thinking-reasoning.md) | The plan the agent commits to before editing. |
| [Tool Call](../components/tool-call.md) | `edit_file` and `run_command` as inspectable cards. |
| [Inline Generative UI](../components/generative-ui-inline.md) | The +/− diff card rendered from an edit. |
| [Human-in-the-Loop](../components/human-in-the-loop.md) | Approval before any command runs in your shell. |
| [Chat Message](../components/chat-message.md) | The developer ↔ agent transcript. |
| [Activity & Traceability](../components/agent-activity-traceability.md) | Files changed + pending-action count. |

**Why it's a good reference** — the IDE-copilot model lives on **trust through transparency**: the agent shares the workspace state, **plans before it acts**, shows every edit as a reviewable **diff** (never an opaque "done"), and gates **side-effecting commands** behind approval. Reading a file is free; running `npm test` is not.

---

### 5 · Canvas / Artifact Builder

> A Lovable-style split view: chat on the left co-creates a live artifact on the right, kept in lockstep through shared state.

**Runnable story:** [`gallery/src/stories/canvas-builder.tsx`](../gallery/src/stories/canvas-builder.tsx)

**Composes**

| Component | Role in this product |
|---|---|
| [Split View](../layouts/split-view.md) | Chat pane co-creating the artifact shown beside it. |
| [Canvas / Artifacts](../layouts/canvas-workspace.md) | The durable artifact surface the agent builds. |
| [Chat Message](../components/chat-message.md) | The conversation that drives every change. |
| [Inline Generative UI](../components/generative-ui-inline.md) | The live-rendered pricing component itself. |
| [Tool Call](../components/tool-call.md) | `generate` → writes/patches the artifact. |
| [Suggestions](../components/suggestions-capabilities.md) | Next-edit nudges based on the current artifact. |
| [Activity & Traceability](../components/agent-activity-traceability.md) | "Updating" + shared-state provenance on the canvas. |
| [Input / Composer](../components/input-composer.md) | Where you describe the next change. |

**Why it's a good reference** — co-creation only works when the chat and the artifact can't disagree. Both panes read and write one **shared state**, so a described change streams **live** into the canvas; the chat *is* the editing surface, not just a description of the result.

---

## Adding your own

Examples self-register exactly like component stories — drop a `gallery/src/stories/<slug>.tsx` that exports a `meta` with `category: "Examples"` and a default component, and it appears under the Examples tab automatically. Reuse the shared primitives in [`gallery/src/ui/kit.tsx`](../gallery/src/ui/kit.tsx) (`WindowFrame`, `Composes`, `Bubble`, `ToolFrame`, `SourceCard`, `Composer`, …) so it matches the house style. See the [gallery README](../gallery/README.md) for the full contract.
