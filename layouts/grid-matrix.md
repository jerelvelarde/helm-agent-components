# Grid / Matrix (Cells as Agents)

> A tabular surface where each cell is the cited output of an autonomous agent run, turning spreadsheet columns into fan-out research tasks that fill hundreds to thousands of rows in parallel.

**Category:** Layout · **Cluster:** Layouts & workspaces · **Aliases:** Agentic spreadsheet, AI spreadsheet, Matrix interface, cell-as-agent, agent-in-every-cell, self-filling spreadsheet, AI table / AI field / Field Agent, enrichment table, spreadsheet of agents, research grid, spreadsheet-native AI

## Definition

The grid/matrix pattern embeds AI inside the cells of a familiar 2-D spreadsheet: column headers act as the control surface where a practitioner authors a natural-language prompt, and rows represent the documents or entities being interrogated. Each cell is not typed or computed but is the output of an autonomous agent run — retrieve, reason, extract — that answers the column's question for that row. The defining interaction is **fan-out**: submitting a column prompt dispatches hundreds to thousands of parallel agent runs simultaneously, finishing in minutes what a junior analyst team would need days to complete. Every cell ships with per-cell citations so the grid is auditable rather than a black box; the human's role is corpus architect and reviewer, not researcher.

## When to use / when not to

- **Use** when the same question must be answered across many items — N documents × M questions, or a list of entities requiring structured enrichment — and a single chat reply would not scale.
- **Use** when outputs must be structured and comparable: one fact per cell, sortable and filterable columns (e.g., extracting deal terms across 10,000 contracts, enriching 5,000 leads from multiple databases).
- **Use** when per-cell auditability is non-negotiable: regulated finance, legal due-diligence, or compliance work where every value must click through to its exact source passage.
- **Use** when work is embarrassingly parallel and latency hides behind fan-out — thousands of independent agent runs that can execute concurrently.
- **Do not use** for a single conversational question, open-ended ideation, or a one-off answer — the grid's setup overhead and visual density are pure cost; a [side panel](./side-panel.md) or [main panel](./main-panel.md) wins there.
- **Do not use** for exact numerical computation or anything needing deterministic reproducibility — LLM cells drift on recalculation; Microsoft explicitly warns against `COPILOT()` for math and instructs users to paste-as-values to freeze outputs.

## Anatomy

```
┌─────────────┬─────────────────────┬─────────────────────┬────────────────────┐
│  Row label  │  Column A           │  Column B           │  Column C          │
│  (entity /  │  [Column prompt]    │  [Column prompt]    │  [+ Add column]    │
│   document) │  ▾ edit prompt      │  ▾ edit prompt      │                    │
├─────────────┼─────────────────────┼─────────────────────┼────────────────────┤
│  Row 1      │  Answer A1  [cite]  │  ⟳ generating…      │                    │
├─────────────┼─────────────────────┼─────────────────────┼────────────────────┤
│  Row 2      │  Answer A2  [cite]  │  Answer B2  [cite]  │                    │
├─────────────┼─────────────────────┼─────────────────────┼────────────────────┤
│  Row 3      │  #ERROR             │  Answer B3  [cite]  │                    │
├─────────────┼─────────────────────┼─────────────────────┼────────────────────┤
│  …          │  …                  │  …                  │                    │
└─────────────┴─────────────────────┴─────────────────────┴────────────────────┘
  ↑                  ↑                        ↑
Row corpus     Column header +           Per-cell citation
(docs /        column prompt             affordance (icon /
 entities)     (edit to re-run)          footnote)

Global progress bar: ████████░░  ~500 cells/min  |  Run all  |  Retry failed

Optional: reading/ask pane (right or bottom) for whole-grid questions
```

**Parts:**

- **Row corpus** — the uploaded or connected dataset; each row is a document, entity, or record. The unit of work for each agent run.
- **Column header / column prompt** — the control surface. A natural-language instruction (beyond the column title) that governs every cell beneath it. Editing and re-running the prompt re-fills the entire column.
- **Cell-as-agent** — a single cell whose value is produced by an autonomous agent run, not typed or computed by formula. May stream tokens as it assembles.
- **Per-cell citation affordance** — an icon, footnote marker, or highlight that opens the exact source passage/PDF or web link backing that cell's value; the primary trust signal.
- **Global progress indicator** — a counter or progress bar showing cells filling in parallel (e.g., "~500 cells/min") so partial results are visible immediately.
- **Column run controls** — "Run all cells," "Run this cell," "Retry failed," and "Freeze/paste-as-values" actions per column or per selection.
- **Cell state badge** — visible status for each cell: pending, generating, filled, error — so reviewers can triage at a glance.
- **Reading / ask pane (optional)** — a side or bottom panel for whole-grid conversational questions, complementing the structured grid surface.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle / empty cell | Column defined but not yet run | Placeholder shows the pending question; cell visually distinct from filled cells |
| Invoked / queued | User submits column prompt or clicks "Run agent" | Cells enter pending/queued state; global fan-out begins; progress counter starts |
| Streaming / generating | Agent run is active for this cell | Per-cell spinner or "generating" label; may stream tokens token-by-token; global cells/min counter live |
| Filled / applied | Agent answer lands in cell | Answer text committed as cell value; citation affordance (icon/footnote) attached; cell visually settled |
| Inspected / cited | User clicks cell or citation affordance | Popover/drawer shows exact source passage, web link, rationale, and confidence score |
| Edited / overridden | Human types into or corrects the cell | Cell marked "human-edited" (distinct from "agent-generated"); protected from silent overwrite on recalc |
| Stale / recalculating | Source data changed or column re-run | Cell re-enters streaming state; previously frozen cells remain stable if paste-as-values was applied |
| Error | Per-cell agent failure (rate limit, bad prompt, missing license, timeout) | Typed error surfaced inline (e.g., `#CONNECT`, `#VALUE`, `#BLOCKED`); retry affordance on the cell; other cells unaffected |

## Vocabulary

| Term | Definition |
|---|---|
| Cell-as-agent | A single grid cell whose value is produced by an autonomous agent run (retrieve, reason, extract), not typed or computed by a formula. |
| Column prompt | The natural-language instruction attached to a column header that governs every cell beneath it; in Paradigm a literal "Column Prompt" field in the column-header menu that adds detail beyond the column title. |
| Fan-out | Dispatching one column/prompt across all rows so hundreds-to-thousands of agent runs execute in parallel to fill the grid. |
| Field token / cell reference | A placeholder like `{customer_feedback}` or `A2:A20` that injects another column's value into the prompt so each row's agent gets row-specific context. |
| Per-cell citation | Source attribution scoped to one cell — a click-through to the exact passage/PDF or web source that produced that answer. |
| Verifiable Fact Layer | Hebbia's term for its citation-first layer that links every cell's statement to a direct citation in the source material, making the grid auditable rather than opaque. |
| Confidence score | A per-cell signal of how reliable the answer is, surfaced alongside multiple sources to calibrate trust and direct spot-checking. |
| Orchestrator / subagent | A hierarchical pattern (Hebbia Matrix Agent 2.0) where an orchestrator decomposes a task into a text "detailed objective" and routes it to specialized subagents (e.g., a ReadAgent for retrieval/analysis, an OutputAgent for synthesis). |
| Spill | Excel dynamic-array behavior where a `COPILOT()` cell outputs many results that overflow ("spill") into adjacent cells. |

## Real-world examples

- **Hebbia Matrix** — A spreadsheet-native grid where rows are documents (e.g., 10,000 contracts) and columns are questions ("Does this contain a non-compete?"). Matrix Agent 2.0 uses a hierarchical orchestrator that passes a "detailed objective" to specialized subagents (ReadAgent for retrieval/analysis, OutputAgent for synthesis) — the orchestrator never calls tools directly — running many in parallel. A citation-first "Verifiable Fact Layer" links every cell to a direct source citation. [Source](https://www.hebbia.com/blog/divide-and-conquer-hebbias-multi-agent-redesign)
- **Paradigm** — An agentic spreadsheet with "an AI agent in every cell" (5,000+ agents). Users assign prompts via a "Column Prompt" field in the column-header menu; agents search the web plus public/private databases (Google, Crunchbase, Apollo, Hunter.io) and fill rows at roughly 500 cells per minute. Every data point ships with citations and visible rationale; the system is multi-model (Anthropic, OpenAI, Gemini) so users can trade reasoning depth against cost. [Source](https://techcrunch.com/2025/08/18/why-paradigm-built-a-spreadsheet-with-an-ai-agent-in-every-cell/)
- **Clay (Claygent)** — Claygent is an AI research agent added as a column to a Clay table. Column prompts use natural language; for each row the agent uses "Navigator" to visit sites, fill forms, click, and scrape, returning structured data into the cell with source attribution. Supports retrying failed rows; the "Sculptor" AI copilot turns a plain-English description into a production-ready agent prompt. [Source](https://www.clay.com/claygent)
- **Microsoft Copilot in Excel — `COPILOT()` function + Agent Mode** — The `=COPILOT(prompt, [context], …)` function puts an LLM in the cell: e.g. `=COPILOT("Summarize this feedback", A2:A20)`. It composes prompt text with referenced ranges, spills multi-row results across the grid, and recalculates when source data changes. Typed errors (`#CONNECT` for rate limits/timeout, `#VALUE` for unevaluable/oversized prompt, `#BLOCKED` for missing license) and explicit warnings against numeric calculation. Agent Mode adds an autonomous multi-step planner with cited web data. [Source](https://support.microsoft.com/en-us/office/copilot-function-5849821b-755d-4030-a38b-9e20be0cbf62)
- **Airtable AI — Field Agents** — An AI field column type that runs a prompt per record. Authors reference other fields with `{field}` tokens for row-specific context; output types include long text, single/multi-select, number/currency, and AI-suggested linked records. "Run agent" executes one cell; bulk options cover "All cells in the view" or only "Cells modified by agent." Cells show a "generating" state; when internet search is enabled, sources are included in output. [Source](https://support.airtable.com/docs/using-airtable-ai-in-fields)

## CopilotKit & AG-UI mapping

**Primitives:** `useAgent` (v2) / `useCoAgent` (v1) for shared grid state, `useRenderTool` for per-cell rendering, `useFrontendTool` for client-side cell actions, `useHumanInTheLoop` for review gates, `useCoAgentStateRender` for column-level progress, `CopilotSidebar` / `CopilotChat` for the optional ask pane, `useConfigureSuggestions` for column-prompt assistance, `useCopilotReadable` for grid context.

Model the grid as a piece of shared agent state. Hold the table — rows, columns, and per-cell `{ value, status, citations, confidence }` — in `useAgent`'s shared state so agent writes flow into the grid and user edits flow back. For fan-out, the agent emits one tool call per cell (or per column) that `useRenderTool` renders; the `ToolCallStatus` lifecycle (`InProgress → Executing → Complete`) maps cleanly to cell states (queued → streaming → filled). Partial streaming args let a cell assemble token-by-token via `TOOL_CALL_ARGS` events. Use `useCoAgentStateRender` between node transitions to render whole-grid progress (cells/min, pending rows) from agent state fed by `STATE_DELTA` events. For human-in-the-loop review before committing agent-filled cells, `useHumanInTheLoop` pauses the run and surfaces an approval card. Put the optional reading/ask pane in `CopilotSidebar` or `CopilotPopup`. Author column prompts with `CopilotTextarea` for AI-assisted prompt editing.

> AG-UI events in play: `RUN_STARTED` / `RUN_FINISHED` / `RUN_ERROR` (column-level lifecycle), `TOOL_CALL_START/ARGS/END` + `TOOL_CALL_RESULT` (per-cell agent run → `InProgress → Executing → Complete`), `STATE_SNAPSHOT` (initial grid hydration), `STATE_DELTA` (incremental cell fills and status updates), `MESSAGES_SNAPSHOT` (audit trail).

```tsx
import { useAgent } from "@copilotkit/react-core/v2";
import { useRenderTool, useCoAgentStateRender } from "@copilotkit/react-core/v2";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { z } from "zod";

// v1 equivalents: useCoAgent({ name, initialState }), useCopilotAction({ render })

interface CellState {
  value: string | null;
  status: "idle" | "queued" | "streaming" | "filled" | "error";
  citations: Array<{ text: string; url: string }>;
  confidence: number | null;
  humanEdited: boolean;
}

interface GridState {
  rows: string[];         // entity IDs / document refs
  columns: Array<{ id: string; prompt: string; label: string }>;
  cells: Record<string, Record<string, CellState>>; // cells[rowId][colId]
  progress: { filled: number; total: number; cpm: number };
}

function AgenticGrid({ gridId }: { gridId: string }) {
  // Bidirectional shared state: agent fills cells; user edits flow back
  const { agent } = useAgent<GridState>({ agentId: gridId });
  // v1: const { state: gridState, setState: setGridState } = useCoAgent({ name: gridId, initialState: ... })

  // Render each cell's agent run (backend tool) as it streams
  useRenderTool({
    name: "fill_cell",
    parameters: z.object({
      rowId: z.string(),
      colId: z.string(),
      value: z.string(),
      citations: z.array(z.object({ text: z.string(), url: z.string() })),
      confidence: z.number().optional(),
    }),
    render: ({ status, args }) => (
      <div
        className={`cell-agent-run cell-run--${status}`}
        aria-label={`Filling cell: ${args.colId} for ${args.rowId}`}
      >
        {status === "inProgress" && <span className="cell-spinner" aria-hidden="true" />}
        {status === "complete" && args.value}
      </div>
    ),
  });

  // Show global column progress from agent state between node transitions
  useCoAgentStateRender({
    agentId: gridId,
    render: ({ state }: { state: GridState }) =>
      state.progress ? (
        <div role="status" aria-live="polite" className="grid-progress-bar">
          {state.progress.filled} / {state.progress.total} cells
          {state.progress.cpm > 0 && ` · ~${state.progress.cpm} cells/min`}
        </div>
      ) : null,
  });

  // HITL: pause run and request human approval before committing a column's cells
  useHumanInTheLoop({
    name: "review_column_before_commit",
    parameters: z.object({ columnLabel: z.string(), sampleValues: z.array(z.string()) }),
    render: ({ status, args, respond }) =>
      status === "executing" ? (
        <div role="dialog" aria-modal="true" aria-label="Review column before committing">
          <p>Review sample values for <strong>{args.columnLabel}</strong></p>
          <ul>{args.sampleValues.map((v, i) => <li key={i}>{v}</li>)}</ul>
          <button onClick={() => respond?.("approved")}>Commit column</button>
          <button onClick={() => respond?.("rejected")}>Discard</button>
        </div>
      ) : <div className="review-card--settled" />,
  });

  // AI-assisted column prompt authoring
  useConfigureSuggestions({
    instructions: "Suggest 3 concise column prompt improvements for this research grid.",
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  const gridState = agent.state;

  return (
    <div className="grid-matrix-layout">
      {/* Primary surface: the agentic grid */}
      <div
        className="grid-matrix"
        role="grid"
        aria-label="Agentic research grid"
        aria-rowcount={gridState?.rows.length ?? 0}
        aria-colcount={(gridState?.columns.length ?? 0) + 1}
      >
        {/* Render column headers and cell body from gridState */}
        {/* Per-cell citation affordances are app-owned UI built from cell.citations */}
        {/* CopilotKit streams the data; the click-to-source component is yours */}
      </div>

      {/* Optional: ask-about-the-whole-grid reading pane */}
      <CopilotSidebar
        defaultOpen={false}
        labels={{ title: "Ask about this grid" }}
      />
    </div>
  );
}
```

## Best practices

- **Make the column prompt the unit of authorship and reuse** — edit the prompt once and re-run the entire column; support `{field}` / cell references for row-specific context; let users test a column on a small sample (10–20 rows) before fanning out to thousands.
- **Cite every cell, click-to-source by default** — each value must link to the exact passage, PDF page, or web source that produced it (Hebbia's Verifiable Fact Layer, Paradigm's per-cell citation + rationale). In regulated/diligence contexts, treat an uncited cell as incomplete rather than acceptable.
- **Surface uncertainty per cell** — show confidence scores and multiple sources so reviewers can triage which cells to spot-check rather than auditing a deceptively uniform-looking grid.
- **Stream fan-out progress, not a frozen screen** — fill cells as they complete with per-cell spinners plus a global counter ("~500 cells/min"); partial results must be readable immediately so a 10,000-row run feels alive and reviewable from the start.
- **Make per-cell failure isolated and retryable** — one row erroring must never block the column; use typed, actionable errors and expose one-click re-run for just the failed cells without redoing the whole column.
- **Preserve human edits and provenance** — mark agent-generated cells differently from human-overridden ones (Airtable's "modified by agent" filter) and never silently overwrite a human correction on recalculation.
- **Address volatility explicitly** — LLM cells drift on re-run; offer a "freeze / paste-as-values" action to snapshot a reviewed grid, and clearly distinguish live cells from frozen ones.
- **Keep grid keyboard semantics intact** — arrow-key navigation, row/column selection, sortable/filterable columns must still work; the AI layer must not break the spreadsheet affordances users rely on.

## Anti-patterns

- **Uncited or black-box cells** — displaying a confident value with no click-through to source destroys trust in exactly the high-stakes diligence work this pattern targets; at scale, the grid becomes a hallucination amplifier.
- **LLM cells for math or deterministic computation** — agentic cells drift between recalculations; Microsoft explicitly warns against `COPILOT()` for numeric calculation. Treating a fan-out grid as a deterministic spreadsheet model produces silently wrong totals.
- **All-or-nothing batch runs** — blocking the entire column on a single slow or failed row, or forcing users to re-run all 10,000 cells to fix three; fan-out must be per-cell isolated, resumable, and retryable.
- **Silent overwrite on recalculation** — re-running a column and clobbering human-reviewed corrections, or quietly changing values when source data shifts; this erases the audit trail and the reviewer's work.
- **Frozen UI during fan-out** — a single spinner with no per-cell progress or partial results during a multi-minute parallel run, leaving users unable to tell whether 5 or 5,000 agents are working or begin verifying early completions.

## Accessibility

- Use `role="grid"` on the table element with `aria-rowcount` and `aria-colcount`; each cell is `role="gridcell"`, each header is `role="columnheader"`. This preserves native screen-reader grid navigation (arrow keys, row/cell announcement).
- Apply `aria-live="polite"` to the global progress region (cells/min counter) so screen readers announce updates at a natural pause rather than interrupting on every streaming token; never use `aria-live="assertive"` for streaming output.
- Each cell's status (generating, filled, error) must be communicated to assistive technology — include it in the cell's accessible name or via a visually hidden `<span>` so `VoiceOver`/`NVDA` announces "Column A, Row 2: generating" rather than just blank.
- Citation affordances must be keyboard-reachable (Tab or arrow-key navigation within the cell) and have a descriptive `aria-label` (e.g., "View source for this cell") — not just an icon with no text alternative.
- Column prompt editing controls (the "edit prompt" dropdown or inline field) must be reachable without a pointer; expose them via a keyboard-accessible button in the column header, focused naturally in tab order.
- For users with `prefers-reduced-motion`, replace animated per-cell spinners with a static "…" or abbreviated status text; the global progress counter (numeric) remains fine for all motion preferences.

## Related

- [Side Panel / Sidebar Copilot](./side-panel.md) — the complement for asking conversational questions about the whole grid; also the fallback for single-question use cases
- [Main Panel / Full-Page Chat](./main-panel.md) — full-page alternative when the task is conversational rather than tabular
- [Split View](./split-view.md) — a related layout for pairing the grid with a document viewer or reading pane
- [Ambient / Proactive](./ambient-proactive.md) — proactive cell-filling and stale-cell notifications without explicit user triggers
- [Tool Call](../components/tool-call.md) — the per-cell agent run card and `ToolCallStatus` lifecycle underpinning each cell
- [Human-in-the-Loop Prompt](../components/human-in-the-loop.md) — approval gates before committing columns of agent-filled cells
- [Agent Activity & Traceability](../components/agent-activity-traceability.md) — per-cell rationale, citation, and confidence signals
- [Sub-agents](../components/sub-agents.md) — orchestrator/subagent hierarchies (Hebbia's ReadAgent / OutputAgent pattern)
- [Deep Research](../components/deep-research.md) — multi-source agent research that backs each cell's value
- [Web Research](../components/web-research.md) — web-search tool calls that populate cells with sourced web data
- [Generative UI (Inline)](../components/generative-ui-inline.md) — static generative UI rendered within cells via `useRenderTool`
- [Threads / Conversation History](../components/threads-history.md) — audit trail and conversation history for whole-grid ask sessions
- [Suggestions & Capability Surfacing](../components/suggestions-capabilities.md) — AI-assisted column prompt authoring suggestions
- [Where AI Sits — placement framework](./README.md)
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary / glossary](../reference/glossary.md)

## Sources

- https://www.hebbia.com/blog/introducing-matrix-the-interface-to-agi
- https://www.hebbia.com/blog/divide-and-conquer-hebbias-multi-agent-redesign
- https://medium.com/@takafumi.endo/hebbias-edge-building-a-system-of-record-for-enterprise-reasoning-1264ab76ec6b
- https://skywork.ai/skypage/en/hebbia-ai-deep-dive-guide/1976843429248823296
- https://techcrunch.com/2025/08/18/why-paradigm-built-a-spreadsheet-with-an-ai-agent-in-every-cell/
- https://venturebeat.com/ai/paradigm-launches-to-reinvent-the-spreadsheet-with-generative-ai-filling-in-500-cells-per-minute
- https://docs.paradigmai.com/columns/column-prompt
- https://www.paradigmai.com/
- https://www.clay.com/claygent
- https://www.clay.com/sculptor
- https://support.microsoft.com/en-us/office/copilot-function-5849821b-755d-4030-a38b-9e20be0cbf62
- https://techcommunity.microsoft.com/blog/microsoft365insiderblog/bring-ai-to-your-formulas-with-the-copilot-function-in-excel/4443487
- https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/29/vibe-working-introducing-agent-mode-and-office-agent-in-microsoft-365-copilot/
- https://techcommunity.microsoft.com/blog/excelblog/agent-mode-in-excel-is-now-generally-available-on-excel-for-web/4476092
- https://support.airtable.com/docs/using-airtable-ai-in-fields
- https://matrices.app/
- https://equals.com/
- https://docs.copilotkit.ai/reference/hooks/useFrontendTool
- https://docs.copilotkit.ai/reference/hooks/useAgent
- https://docs.copilotkit.ai/reference/hooks/useCoAgent
- https://docs.copilotkit.ai/reference/hooks/useCoAgentStateRender
- https://www.marktechpost.com/2025/12/11/copilotkit-v1-50-brings-ag-ui-agents-directly-into-your-app-with-the-new-useagent-hook/
