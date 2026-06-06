import { useState } from "react";
import { Sparkles, Plus, RotateCcw, ChevronDown, Play } from "lucide-react";
import {
  Btn,
  Caret,
  Cite,
  CodeNote,
  Note,
  Showcase,
  Skeleton,
  SectionLabel,
  StatusDot,
  Tag,
  ToolFrame,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "grid-matrix",
  title: "Grid / Matrix (Cells as Agents)",
  category: "Layouts",
  blurb: "A spreadsheet whose cells/rows are autonomous agent queries — bulk structured research (Hebbia, Elicit).",
  copilotkit: "useAgent · useRenderTool",
  spec: "layouts/grid-matrix.md",
};

// ── Shared types & data ────────────────────────────────────────────────────────

type CellStatus = "idle" | "queued" | "streaming" | "filled" | "error" | "human-edited";

interface CellData {
  value: string | null;
  status: CellStatus;
  cite?: number;
}

const COLUMNS = [
  { id: "A", label: "Non-compete clause?", prompt: "Does this contract contain a non-compete clause? If so, what is the scope and duration?" },
  { id: "B", label: "Governing law", prompt: "Which governing law and jurisdiction applies to this contract?" },
  { id: "C", label: "Termination notice", prompt: "What is the required notice period for termination? Extract exact days." },
];

const ROWS = [
  { id: "r1", label: "Acme Corp — MSA 2024" },
  { id: "r2", label: "BrightPath Ltd — SaaS Agreement" },
  { id: "r3", label: "Contoso — NDA 2023" },
];

// ── Shared chrome helpers ──────────────────────────────────────────────────────

function GridShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${tok.grey300}`,
        borderRadius: 10,
        overflow: "hidden",
        background: tok.grey200,
      }}
    >
      {/* Toolbar strip */}
      <div
        className="flex items-center"
        style={{
          padding: "8px 12px",
          borderBottom: `1px solid ${tok.grey300}`,
          background: tok.container,
          gap: 8,
        }}
      >
        <Sparkles size={13} color={tok.indigo} />
        <span style={{ fontSize: 13, fontWeight: 600, color: tok.textPrimary, flex: 1 }}>
          Contract Research Grid
        </span>
        <Tag>3 documents</Tag>
        <Tag>3 columns</Tag>
      </div>
      {children}
    </div>
  );
}

function ColHeader({
  col,
  prompt,
  active,
}: {
  col: string;
  prompt?: string;
  active?: boolean;
}) {
  return (
    <th
      style={{
        padding: "8px 10px",
        textAlign: "left",
        background: active ? "var(--indigo-soft)" : tok.grey200,
        border: `1px solid ${tok.border}`,
        borderTop: "none",
        minWidth: 160,
        maxWidth: 200,
        verticalAlign: "top",
      }}
    >
      <div className="flex items-center" style={{ gap: 4 }}>
        <span style={{ fontFamily: tok.mono, fontSize: 10, color: tok.indigo, fontWeight: 600 }}>
          {col}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: tok.textPrimary, flex: 1 }}>
          {prompt}
        </span>
        <ChevronDown size={12} color={tok.textDisabled} />
      </div>
      {active && (
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            color: tok.indigo,
            background: "var(--indigo-soft)",
            borderRadius: 4,
            padding: "2px 6px",
            display: "inline-block",
          }}
        >
          edit prompt
        </div>
      )}
    </th>
  );
}

function RowLabel({ label }: { label: string }) {
  return (
    <td
      style={{
        padding: "8px 10px",
        background: tok.grey200,
        border: `1px solid ${tok.border}`,
        fontSize: 12,
        fontWeight: 500,
        color: tok.textSecondary,
        whiteSpace: "nowrap",
        maxWidth: 160,
        overflow: "hidden",
        textOverflow: "ellipsis",
        verticalAlign: "middle",
      }}
    >
      {label}
    </td>
  );
}

function GridCell({ cell }: { cell: CellData }) {
  const bgMap: Record<CellStatus, string> = {
    idle: tok.grey200,
    queued: "var(--warning-soft)",
    streaming: "var(--indigo-soft)",
    filled: tok.container,
    error: "var(--error-soft)",
    "human-edited": "var(--success-soft)",
  };
  const borderMap: Record<CellStatus, string> = {
    idle: tok.border,
    queued: `${tok.warning}55`,
    streaming: `${tok.indigo}55`,
    filled: tok.border,
    error: `${tok.error}55`,
    "human-edited": `${tok.success}55`,
  };

  return (
    <td
      style={{
        padding: "8px 10px",
        background: bgMap[cell.status],
        border: `1px solid ${borderMap[cell.status]}`,
        fontSize: 12.5,
        color: cell.status === "error" ? tok.error : tok.textPrimary,
        verticalAlign: "middle",
        minWidth: 160,
        maxWidth: 200,
        lineHeight: "18px",
        position: "relative",
      }}
    >
      {cell.status === "idle" && (
        <span style={{ color: tok.textDisabled }}>—</span>
      )}
      {cell.status === "queued" && (
        <span style={{ color: tok.warning, fontSize: 11 }}>queued…</span>
      )}
      {cell.status === "streaming" && (
        <>
          <Skeleton h={10} w="80%" style={{ marginBottom: 4 }} />
          <Skeleton h={10} w="55%" />
          <span style={{ display: "inline-block", marginTop: 4 }}>
            <Caret />
          </span>
        </>
      )}
      {cell.status === "filled" && (
        <span>
          {cell.value}
          {cell.cite !== undefined && <Cite n={cell.cite} />}
        </span>
      )}
      {cell.status === "error" && (
        <span style={{ fontFamily: tok.mono, fontSize: 11 }}>#ERROR</span>
      )}
      {cell.status === "human-edited" && (
        <span>
          {cell.value}
          <Tag selected={false}><span style={{ color: tok.success }}>edited</span></Tag>
        </span>
      )}
    </td>
  );
}

function AgenticTable({
  cells,
}: {
  cells: Record<string, Record<string, CellData>>;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th
              style={{
                padding: "8px 10px",
                background: tok.grey200,
                border: `1px solid ${tok.border}`,
                borderTop: "none",
                width: 160,
                fontSize: 11,
                color: tok.textDisabled,
                textAlign: "left",
              }}
            >
              Document
            </th>
            {COLUMNS.map((col) => (
              <ColHeader key={col.id} col={col.id} prompt={col.label} />
            ))}
            <th
              style={{
                padding: "8px 10px",
                background: tok.grey200,
                border: `1px solid ${tok.border}`,
                borderTop: "none",
                width: 100,
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: tok.indigo,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 4px",
                }}
              >
                <Plus size={11} /> Add column
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.id}>
              <RowLabel label={row.label} />
              {COLUMNS.map((col) => (
                <GridCell key={col.id} cell={cells[row.id]?.[col.id] ?? { value: null, status: "idle" }} />
              ))}
              <td style={{ background: tok.grey200, border: `1px solid ${tok.border}` }} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Variant 1 — Idle / empty ───────────────────────────────────────────────────

const emptyCells: Record<string, Record<string, CellData>> = {
  r1: { A: { value: null, status: "idle" }, B: { value: null, status: "idle" }, C: { value: null, status: "idle" } },
  r2: { A: { value: null, status: "idle" }, B: { value: null, status: "idle" }, C: { value: null, status: "idle" } },
  r3: { A: { value: null, status: "idle" }, B: { value: null, status: "idle" }, C: { value: null, status: "idle" } },
};

// ── Variant 2 — Fan-out streaming ─────────────────────────────────────────────

const streamingCells: Record<string, Record<string, CellData>> = {
  r1: {
    A: { value: "Yes — 24-month non-compete, US only", status: "filled", cite: 1 },
    B: { value: null, status: "streaming" },
    C: { value: null, status: "queued" },
  },
  r2: {
    A: { value: null, status: "streaming" },
    B: { value: null, status: "queued" },
    C: { value: null, status: "queued" },
  },
  r3: {
    A: { value: null, status: "queued" },
    B: { value: null, status: "queued" },
    C: { value: null, status: "queued" },
  },
};

// ── Variant 3 — Fully filled with citations ───────────────────────────────────

const filledCells: Record<string, Record<string, CellData>> = {
  r1: {
    A: { value: "Yes — 24-month non-compete, US only", status: "filled", cite: 1 },
    B: { value: "New York, USA", status: "filled", cite: 2 },
    C: { value: "30 days written notice", status: "filled", cite: 3 },
  },
  r2: {
    A: { value: "No non-compete found", status: "filled", cite: 4 },
    B: { value: "England & Wales", status: "filled", cite: 5 },
    C: { value: "90 days (§12.3)", status: "filled", cite: 6 },
  },
  r3: {
    A: { value: "Yes — 12-month, worldwide", status: "filled", cite: 7 },
    B: { value: "California, USA", status: "filled", cite: 8 },
    C: { value: "60 days (§8)", status: "filled", cite: 9 },
  },
};

// ── Variant 4 — Per-cell error + retry ────────────────────────────────────────

const errorCells: Record<string, Record<string, CellData>> = {
  r1: {
    A: { value: "Yes — 24-month non-compete, US only", status: "filled", cite: 1 },
    B: { value: "New York, USA", status: "filled", cite: 2 },
    C: { value: null, status: "error" },
  },
  r2: {
    A: { value: "No non-compete found", status: "filled", cite: 4 },
    B: { value: null, status: "error" },
    C: { value: "90 days (§12.3)", status: "filled", cite: 6 },
  },
  r3: {
    A: { value: "Yes — 12-month, worldwide", status: "filled", cite: 7 },
    B: { value: "California, USA", status: "filled", cite: 8 },
    C: { value: "60 days (§8)", status: "filled", cite: 9 },
  },
};

// ── Variant 5 — HITL column review ────────────────────────────────────────────

function HitlGridVariant() {
  const [responded, setResponded] = useState<"approved" | "rejected" | null>(null);
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      <GridShell>
        <AgenticTable cells={filledCells} />
        {/* Global progress bar */}
        <div
          className="flex items-center"
          style={{
            padding: "8px 12px",
            borderTop: `1px solid ${tok.border}`,
            background: tok.grey200,
            gap: 10,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 6,
              borderRadius: 9999,
              background: tok.border,
              overflow: "hidden",
            }}
          >
            <div
              style={{ width: "100%", height: "100%", background: tok.success, borderRadius: 9999 }}
            />
          </div>
          <span style={{ fontSize: 12, color: tok.textSecondary }}>9 / 9 cells filled</span>
          <StatusDot state="waiting" label="Awaiting column approval" />
        </div>
      </GridShell>

      {/* HITL card */}
      {!responded ? (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 10,
            border: `1px solid ${tok.warning}`,
            background: "var(--warning-soft)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            <StatusDot state="waiting" />
            <span style={{ fontSize: 13, fontWeight: 600, color: tok.warning }}>
              Review column A before committing
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: "18px", color: tok.textSecondary }}>
            Sample values: <em>"Yes — 24-month non-compete, US only"</em> · <em>"No non-compete found"</em> · <em>"Yes — 12-month, worldwide"</em>
          </p>
          <div className="flex" style={{ gap: 8 }}>
            <Btn variant="primary" onClick={() => setResponded("approved")}>Commit column</Btn>
            <Btn variant="ghost" onClick={() => setResponded("rejected")}>Discard</Btn>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${tok.border}`,
            background: tok.container,
            fontSize: 13,
            color: responded === "approved" ? tok.success : tok.textDisabled,
          }}
        >
          {responded === "approved"
            ? "Column A committed — cells frozen from overwrite."
            : "Column A discarded — cells cleared."}
        </div>
      )}
    </div>
  );
}

// ── Wiring snippet ─────────────────────────────────────────────────────────────

const wiring = `import { useAgent } from "@copilotkit/react-core/v2";
import { useRenderTool, useCoAgentStateRender } from "@copilotkit/react-core/v2";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
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
  rows: string[];
  columns: Array<{ id: string; prompt: string; label: string }>;
  cells: Record<string, Record<string, CellState>>; // cells[rowId][colId]
  progress: { filled: number; total: number; cpm: number };
}

function AgenticGrid({ gridId }: { gridId: string }) {
  // Bidirectional shared state — agent fills cells; user edits flow back
  const { agent } = useAgent<GridState>({ agentId: gridId });

  // Render each per-cell agent run as it streams (TOOL_CALL_ARGS events)
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
      <div className={\`cell-run cell-run--\${status}\`}>
        {status === "inProgress" && <span className="cell-spinner" />}
        {status === "complete" && args.value}
      </div>
    ),
  });

  // Column-level progress from agent state between node transitions
  useCoAgentStateRender({
    agentId: gridId,
    render: ({ state }: { state: GridState }) =>
      state.progress ? (
        <div role="status" aria-live="polite" className="grid-progress">
          {state.progress.filled} / {state.progress.total} cells
          {state.progress.cpm > 0 && \` · ~\${state.progress.cpm} cells/min\`}
        </div>
      ) : null,
  });

  // HITL: pause and request approval before committing a column's cells
  useHumanInTheLoop({
    name: "review_column_before_commit",
    parameters: z.object({
      columnLabel: z.string(),
      sampleValues: z.array(z.string()),
    }),
    render: ({ status, args, respond }) =>
      status === "executing" ? (
        <div role="dialog" aria-modal="true">
          <p>Review column: <strong>{args.columnLabel}</strong></p>
          <ul>{args.sampleValues.map((v, i) => <li key={i}>{v}</li>)}</ul>
          <button onClick={() => respond?.("approved")}>Commit column</button>
          <button onClick={() => respond?.("rejected")}>Discard</button>
        </div>
      ) : <div className="review-card--settled" />,
  });

  return (
    <div className="grid-matrix-layout">
      <div role="grid" aria-label="Agentic research grid"
           aria-rowcount={agent.state?.rows.length ?? 0}
           aria-colcount={(agent.state?.columns.length ?? 0) + 1}>
        {/* Render column headers + cell body from agent.state.cells */}
        {/* Per-cell citation affordances: app-owned click-to-source UI */}
      </div>
      {/* Optional: whole-grid ask pane */}
      <CopilotSidebar defaultOpen={false} labels={{ title: "Ask about this grid" }} />
    </div>
  );
}

// AG-UI events in play:
// RUN_STARTED / RUN_FINISHED / RUN_ERROR  → column-level lifecycle
// TOOL_CALL_START/ARGS/END + TOOL_CALL_RESULT → per-cell InProgress→Executing→Complete
// STATE_SNAPSHOT  → initial grid hydration
// STATE_DELTA     → incremental cell fills and status updates
// MESSAGES_SNAPSHOT → audit trail`;

// ── Story ──────────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      {/* 1. Idle / column-defined, not yet run */}
      <Variant
        label="idle · columns defined"
        hint="column prompts authored; cells pending — corpus loaded, agent not yet dispatched"
      >
        <GridShell>
          <AgenticTable cells={emptyCells} />
          <div
            className="flex items-center"
            style={{
              padding: "8px 12px",
              borderTop: `1px solid ${tok.border}`,
              background: tok.grey200,
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: tok.textDisabled, flex: 1 }}>
              9 cells pending · 3 columns · 3 rows
            </span>
            <Btn variant="primary">
              <Play size={12} style={{ display: "inline", marginRight: 4 }} />
              Run all columns
            </Btn>
          </div>
        </GridShell>
        <Note>
          Column headers carry the natural-language prompt. Cells show a dash until the agent runs.
          "Run all columns" fans out one agent call per cell.
        </Note>
      </Variant>

      {/* 2. Fan-out streaming — cells filling in parallel */}
      <Variant
        label="fan-out · streaming"
        hint="TOOL_CALL_ARGS events; per-cell spinners + global cells/min counter"
      >
        <GridShell>
          <AgenticTable cells={streamingCells} />
          {/* Global progress strip */}
          <div
            className="flex items-center"
            style={{
              padding: "8px 12px",
              borderTop: `1px solid ${tok.border}`,
              background: tok.grey200,
              gap: 10,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 9999,
                background: tok.border,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "22%",
                  height: "100%",
                  background: tok.indigo,
                  borderRadius: 9999,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <StatusDot state="running" label="~500 cells/min" />
            <span style={{ fontSize: 12, color: tok.textSecondary }}>2 / 9 filled</span>
            <button
              style={{
                fontSize: 12,
                color: tok.textDisabled,
                border: `1px solid ${tok.border}`,
                background: tok.container,
                borderRadius: 6,
                padding: "3px 8px",
                cursor: "pointer",
              }}
            >
              Stop
            </button>
          </div>
        </GridShell>
        <Note>
          Cells stream token-by-token (TOOL_CALL_ARGS). Completed cells show a citation badge
          immediately — partial results are reviewable before the full column finishes.
        </Note>
      </Variant>

      {/* 3. Fully filled — citations & inspect */}
      <Variant
        label="filled · cited"
        hint="all cells complete; each value carries a per-cell citation affordance (Cite badge)"
      >
        <GridShell>
          <AgenticTable cells={filledCells} />
          <div
            className="flex items-center"
            style={{
              padding: "8px 12px",
              borderTop: `1px solid ${tok.border}`,
              background: tok.grey200,
              gap: 10,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 9999,
                background: tok.border,
                overflow: "hidden",
              }}
            >
              <div style={{ width: "100%", height: "100%", background: tok.success, borderRadius: 9999 }} />
            </div>
            <StatusDot state="done" label="9 / 9 cells" />
            <Btn variant="ghost">
              <RotateCcw size={12} style={{ display: "inline", marginRight: 4 }} />
              Freeze values
            </Btn>
          </div>
        </GridShell>
        <Note>
          Superscript citation badges are click-to-source affordances linking to exact source passages.
          "Freeze values" snapshots the grid to prevent silent overwrite on re-run.
        </Note>
      </Variant>

      {/* 4. Per-cell errors — isolated failure, retry available */}
      <Variant
        label="error · isolated cells"
        hint="#ERROR cells do not block sibling cells; inline retry per cell"
      >
        <div className="flex flex-col" style={{ gap: 10 }}>
          <GridShell>
            <AgenticTable cells={errorCells} />
            <div
              className="flex items-center"
              style={{
                padding: "8px 12px",
                borderTop: `1px solid ${tok.border}`,
                background: tok.grey200,
                gap: 8,
              }}
            >
              <StatusDot state="error" label="2 cells failed" />
              <span style={{ flex: 1 }} />
              <Btn variant="ghost">Retry failed cells</Btn>
            </div>
          </GridShell>
          <ToolFrame name="fill_cell" status="error" args={'rowId: "r1", colId: "C" → timeout'}>
            <span style={{ color: tok.error, fontSize: 12.5 }}>
              #ERROR — Rate limit / timeout. Other cells unaffected.
            </span>
          </ToolFrame>
        </div>
        <Note>
          Each cell's agent run is isolated. One failure never blocks the column — use typed errors
          (#ERROR, #CONNECT, #BLOCKED) and expose per-cell retry without redoing the full column.
        </Note>
      </Variant>

      {/* 5. HITL review gate before committing a column */}
      <Variant
        label="HITL · column review"
        hint="useHumanInTheLoop pauses commit; user approves or discards before cells are frozen"
      >
        <HitlGridVariant />
        <Note>
          useHumanInTheLoop surfaces a sample of agent-filled values before they are committed,
          giving reviewers a final gate in regulated or high-stakes diligence workflows.
        </Note>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
