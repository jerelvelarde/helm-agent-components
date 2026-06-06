import { useState } from "react";
import { ChevronRight, ChevronDown, Sparkles } from "lucide-react";
import { Avatar, Bubble, Caret, CodeNote, Note, Showcase, Skeleton, StatusDot, Variant, tok } from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "thinking-reasoning",
  title: "Thinking / Reasoning Display",
  category: "Agent transparency",
  blurb: "The disclosure that surfaces the agent's chain-of-thought / reasoning stream and live status.",
  copilotkit: "useRenderTool · AG-UI reasoning events",
  spec: "components/thinking-reasoning.md",
};

// ── Shared primitives ──────────────────────────────────────────────────

const reasoningBg = "var(--fill-100)";
const reasoningBorder = "var(--indigo-soft)";

/** Inner container that gives reasoning content its distinct visual region. */
function ReasoningRegion({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="region"
      aria-label="Agent reasoning"
      style={{
        background: reasoningBg,
        border: `1px solid ${reasoningBorder}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        lineHeight: "20px",
        color: tok.textSecondary,
        fontStyle: "italic",
      }}
    >
      {children}
    </div>
  );
}

/** The collapsible disclosure trigger row. */
function ThinkingTrigger({
  open,
  label,
  streaming,
  onClick,
}: {
  open: boolean;
  label: string;
  streaming?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      aria-busy={streaming}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "4px 0",
        fontSize: 13,
        color: tok.textSecondary,
        fontStyle: "italic",
        fontFamily: "inherit",
      }}
    >
      {streaming ? (
        <StatusDot state="running" />
      ) : open ? (
        <ChevronDown size={14} color={tok.textSecondary} />
      ) : (
        <ChevronRight size={14} color={tok.textSecondary} />
      )}
      <span>{label}</span>
    </button>
  );
}

// ── Variant 1: Starting — panel mounts, opens, pulse visible ──────────

function StartingVariant() {
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <div className="flex items-center" style={{ gap: 10 }}>
        <Avatar role="agent" size={26} />
        <ThinkingTrigger open streaming label="Thinking…" onClick={() => {}} />
      </div>
      <div style={{ paddingLeft: 36 }}>
        <ReasoningRegion>
          <Skeleton w="72%" h={11} />
        </ReasoningRegion>
      </div>
    </div>
  );
}

// ── Variant 2: Streaming — content appends, pulse active ─────────────

function StreamingVariant() {
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <div className="flex items-center" style={{ gap: 10 }}>
        <Avatar role="agent" size={26} />
        <ThinkingTrigger open streaming label="Thinking…" onClick={() => {}} />
      </div>
      <div style={{ paddingLeft: 36 }}>
        <ReasoningRegion>
          <span>
            The user is asking about Q3 financial projections. I should first verify which data
            sources are most current, then cross-reference the revenue figures against the cost
            forecasts before drawing any conclusions. The margin compression in the prior quarter
            is relevant here — I need to factor that in before surfacing a final estimate.
            <Caret />
          </span>
        </ReasoningRegion>
      </div>
    </div>
  );
}

// ── Variant 3: Done — collapsed, duration label shown ─────────────────

function DoneCollapsedVariant() {
  const [open, setOpen] = useState(false);
  const text =
    "The user is asking about Q3 financial projections. I verified the most current data sources and cross-referenced revenue figures against cost forecasts, factoring in the margin compression from Q2. The 12% decline reflects a one-time inventory write-down — not a structural trend.";

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <div className="flex items-center" style={{ gap: 10 }}>
        <Avatar role="agent" size={26} />
        <ThinkingTrigger
          open={open}
          label="Thought for 12s"
          onClick={() => setOpen((v) => !v)}
        />
      </div>
      {open && (
        <div style={{ paddingLeft: 36 }}>
          <ReasoningRegion>{text}</ReasoningRegion>
        </div>
      )}
      {!open && (
        <div style={{ paddingLeft: 36 }}>
          <Bubble role="assistant">
            Q3 revenue is down 12% quarter-over-quarter, but the decline is driven by a one-time
            inventory write-down rather than a structural change in demand. Underlying run-rate
            margins are stable at 34%.
          </Bubble>
        </div>
      )}
    </div>
  );
}

// ── Variant 4: Interleaved — reasoning resumes after a tool call ──────

function InterleavedVariant() {
  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      {/* First reasoning block — done */}
      <div className="flex items-center" style={{ gap: 10 }}>
        <Avatar role="agent" size={26} />
        <ThinkingTrigger open={false} label="Thought for 8s" onClick={() => {}} />
      </div>
      {/* Tool call result */}
      <div
        style={{
          marginLeft: 36,
          borderTop: `1px solid ${tok.grey300}`,
          borderRight: `1px solid ${tok.grey300}`,
          borderBottom: `1px solid ${tok.grey300}`,
          borderLeft: `3px solid ${tok.teal}`,
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 12.5,
          fontFamily: tok.mono,
          color: tok.textSecondary,
          background: tok.container,
        }}
      >
        <span style={{ color: tok.teal }}>query_financials</span>
        <span style={{ color: tok.textDisabled }}> · complete</span>
        <div style={{ marginTop: 4, color: tok.textPrimary }}>
          Q3 revenue: $4.2M · margin: 34% · write-down: $610K
        </div>
      </div>
      {/* Second reasoning block — streaming */}
      <div className="flex items-center" style={{ gap: 10 }}>
        <Avatar role="agent" size={26} />
        <ThinkingTrigger open streaming label="Thinking…" onClick={() => {}} />
      </div>
      <div style={{ paddingLeft: 36 }}>
        <ReasoningRegion>
          Now that I have the actual numbers, I can confirm the write-down hypothesis. The
          underlying margin held steady — I should frame this as a healthy signal to the
          user. <Caret />
        </ReasoningRegion>
      </div>
    </div>
  );
}

// ── Variant 5: Error — reasoning interrupted ──────────────────────────

function ErrorVariant() {
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <div className="flex items-center" style={{ gap: 10 }}>
        <Avatar role="agent" size={26} />
        <button
          aria-expanded={false}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            fontSize: 13,
            color: tok.error,
            fontStyle: "italic",
            fontFamily: "inherit",
          }}
        >
          <StatusDot state="error" />
          <span>Reasoning interrupted</span>
        </button>
      </div>
      <div style={{ paddingLeft: 36 }}>
        <ReasoningRegion>
          <span style={{ color: tok.error, fontStyle: "normal" }}>
            The reasoning stream was cut off — the model hit its context limit mid-thought.
          </span>
          <span style={{ color: tok.textDisabled }}> Partial reasoning shown above.</span>
        </ReasoningRegion>
      </div>
    </div>
  );
}

// ── Wiring snippet ────────────────────────────────────────────────────

const wiring = `import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Render a collapsible thinking panel for a "reasoning_step" tool
// the agent emits before its final answer.
function ThinkingPanel() {
  useRenderTool({
    name: "reasoning_step",
    parameters: z.object({
      summary: z.string(),
      durationMs: z.number().optional(),
    }),
    render: ({ status, args }) => {
      const isStreaming = status === "inProgress";
      const durationSec = Math.round((args.durationMs ?? 0) / 1000);
      const label = isStreaming
        ? "Thinking…"
        : durationSec > 0
          ? \`Thought for \${durationSec}s\`
          : "Thought";

      return (
        <details open={isStreaming}>
          <summary
            aria-expanded={isStreaming}
            aria-busy={isStreaming}
            style={{ cursor: "pointer", fontStyle: "italic", color: "var(--ck-text-secondary)" }}
          >
            {isStreaming && <span className="ck-pulse-dot" aria-hidden="true" />}
            {label}
          </summary>
          <div
            role="region"
            aria-label="Agent reasoning"
            aria-live="polite"
            style={{ padding: "8px 14px", fontSize: "0.875rem" }}
          >
            {args.summary}
          </div>
        </details>
      );
    },
  });
  return null;
}

// v1 equivalent:
// useCopilotAction({ name: "reasoning_step", parameters: [...], render })
//
// For AG-UI native reasoning events (REASONING_START / REASONING_MESSAGE_CONTENT /
// REASONING_END), customize via the reasoningMessage slot in <CopilotChat>
// rather than re-implementing from scratch.`;

// ── Story export ──────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      <Variant label="starting" hint="REASONING_START received — panel mounts, pulse appears">
        <StartingVariant />
      </Variant>

      <Variant label="streaming" hint="REASONING_MESSAGE_CONTENT deltas; aria-busy=true, no duration yet">
        <StreamingVariant />
      </Variant>

      <Variant
        label="done — collapsed"
        hint="REASONING_END fired; trigger reads 'Thought for Xs'; click to expand"
      >
        <DoneCollapsedVariant />
      </Variant>

      <Variant
        label="interleaved"
        hint="reasoning resumes after a tool call; second REASONING_MESSAGE_START block"
      >
        <InterleavedVariant />
      </Variant>

      <Variant label="error" hint="RUN_ERROR mid-stream; trigger surfaces 'Reasoning interrupted'">
        <ErrorVariant />
      </Variant>

      <Note>
        Always default to collapsed; show "Thought for Xs" only when{" "}
        <code style={{ fontFamily: tok.mono, fontSize: 12 }}>durationMs &gt; 0</code>. Use the{" "}
        <code style={{ fontFamily: tok.mono, fontSize: 12 }}>reasoning</code> message role to keep
        chain-of-thought structurally separate from the assistant's final answer.
      </Note>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
