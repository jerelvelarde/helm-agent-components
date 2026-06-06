import { useState } from "react";
import { Sparkles, Wand2, Check, X, ChevronRight, Command } from "lucide-react";
import {
  Btn,
  Caret,
  CodeNote,
  Note,
  Showcase,
  Skeleton,
  StatusDot,
  Tag,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "inline-contextual",
  title: "Inline / Contextual AI",
  category: "Layouts",
  blurb: "AI embedded in the content itself: ghost-text autocomplete, a selection → AI toolbar, an inline Cmd+K edit.",
  copilotkit: "CopilotTextarea (v1)",
  spec: "layouts/inline-contextual.md",
};

// ── Shared editor chrome ────────────────────────────────────────────────────

function EditorShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface-container)",
        border: `1px solid ${tok.grey300}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center"
        style={{
          gap: 8,
          padding: "8px 14px",
          borderBottom: `1px solid ${tok.grey300}`,
          background: tok.grey200,
        }}
      >
        <span style={{ fontSize: 12, color: tok.textDisabled }}>B</span>
        <span style={{ fontSize: 12, color: tok.textDisabled, fontStyle: "italic" }}>I</span>
        <span style={{ fontSize: 12, color: tok.textDisabled, textDecoration: "underline" }}>U</span>
        <div style={{ width: 1, height: 14, background: tok.border, margin: "0 4px" }} />
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 11,
            color: tok.indigo,
            background: "var(--indigo-soft)",
            borderRadius: 5,
            padding: "2px 8px",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Sparkles size={11} /> AI active
        </span>
      </div>
      {/* Editor body */}
      <div style={{ padding: "18px 20px", minHeight: 200, position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

// Inline text block helper
function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 14,
        lineHeight: "24px",
        color: tok.textPrimary,
        margin: "0 0 10px 0",
      }}
    >
      {children}
    </p>
  );
}

// ── Variant 1 — Ghost text (suggested / preview state) ───────────────────────

function GhostTextDemo() {
  const [accepted, setAccepted] = useState(false);
  return (
    <EditorShell>
      <Prose>
        The quarterly revenue report shows strong performance across all regions. Net margin improved
        by 12% year-over-year, driven by operational efficiency
        {!accepted ? (
          <>
            {" "}
            <span
              style={{
                color: tok.textDisabled,
                fontStyle: "italic",
                borderLeft: `2px solid ${tok.indigo}`,
                paddingLeft: 2,
              }}
            >
              gains and a disciplined approach to headcount management.
            </span>
          </>
        ) : (
          <span> gains and a disciplined approach to headcount management.</span>
        )}
      </Prose>
      {!accepted && (
        <div
          className="flex items-center"
          style={{
            gap: 8,
            marginTop: 4,
            padding: "5px 10px",
            background: tok.grey200,
            borderRadius: 7,
            display: "inline-flex",
          }}
        >
          <StatusDot state="idle" />
          <span style={{ fontSize: 12, color: tok.textSecondary }}>AI suggestion</span>
          <div style={{ width: 1, height: 12, background: tok.border }} />
          <button
            onClick={() => setAccepted(true)}
            style={{
              fontSize: 12,
              color: tok.indigo,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: 0,
            }}
          >
            <Check size={12} /> Tab to accept
          </button>
          <span style={{ fontSize: 12, color: tok.textDisabled }}>·</span>
          <span style={{ fontSize: 12, color: tok.textDisabled }}>Esc to dismiss</span>
        </div>
      )}
      {accepted && (
        <div style={{ fontSize: 12, color: tok.success, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
          <Check size={12} /> Suggestion accepted — normal document text.
        </div>
      )}
    </EditorShell>
  );
}

// ── Variant 2 — Selection toolbar (invoked state) ────────────────────────────

function SelectionToolbarDemo() {
  const [action, setAction] = useState<string | null>(null);
  return (
    <EditorShell>
      <Prose>
        Our go-to-market strategy relies on a multi-channel approach encompassing direct sales,
        partner networks, and digital marketing. We anticipate significant growth in the enterprise
        segment over the next two quarters.
      </Prose>
      {/* Simulated selection highlight */}
      <div style={{ position: "relative", display: "inline" }}>
        <span
          style={{
            background: "var(--indigo-soft)",
            borderRadius: 3,
            padding: "1px 0",
            fontSize: 14,
            lineHeight: "24px",
            color: tok.textPrimary,
          }}
        >
          multi-channel approach encompassing direct sales, partner networks, and digital marketing
        </span>
        {/* Floating toolbar anchored above selection */}
        <div
          style={{
            position: "absolute",
            top: -42,
            left: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            background: tok.textPrimary,
            borderRadius: 8,
            padding: "5px 8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {["Rephrase", "Shorten", "Tone", "Ask AI"].map((label) => (
            <button
              key={label}
              onClick={() => setAction(label)}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: action === label ? tok.indigo : tok.textInvert,
                background: action === label ? "var(--indigo-soft)" : "transparent",
                border: "none",
                borderRadius: 5,
                padding: "3px 8px",
                cursor: "pointer",
              }}
            >
              {label === "Tone" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                  {label} <ChevronRight size={11} />
                </span>
              ) : (
                label
              )}
            </button>
          ))}
        </div>
      </div>
      {action && (
        <div style={{ marginTop: 14, fontSize: 13, color: tok.textSecondary }}>
          <Tag>
            <Sparkles size={11} style={{ display: "inline", marginRight: 3 }} />
            {action} applied
          </Tag>{" "}
          — result would replace the selected span.{" "}
          <button
            onClick={() => setAction(null)}
            style={{ color: tok.indigo, background: "transparent", border: "none", cursor: "pointer", fontSize: 13 }}
          >
            Reset
          </button>
        </div>
      )}
    </EditorShell>
  );
}

// ── Variant 3 — Cmd+K inline prompt bar (streaming) ─────────────────────────

function CmdKStreamingDemo() {
  const [step, setStep] = useState<"prompt" | "streaming" | "diff">("prompt");
  return (
    <EditorShell>
      <Prose>
        Customer retention is a key pillar of our long-term growth strategy. We have implemented
        several initiatives to improve NPS and reduce churn across all product tiers.
      </Prose>
      {/* Inline prompt bar */}
      {step === "prompt" && (
        <div
          style={{
            margin: "8px 0",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: tok.grey200,
            border: `1px solid ${tok.indigo}`,
            borderRadius: 8,
            padding: "8px 12px",
            boxShadow: "0 2px 8px rgba(99,102,241,0.12)",
          }}
        >
          <Command size={14} color={tok.indigo} />
          <span style={{ fontSize: 13, color: tok.textPrimary, flex: 1 }}>
            Make this more concise and action-oriented
            <Caret />
          </span>
          <Btn variant="primary" onClick={() => setStep("streaming")}>
            Run
          </Btn>
          <button
            onClick={() => {}}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: tok.textDisabled }}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {step === "streaming" && (
        <div style={{ margin: "8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <StatusDot state="running" label="Generating…" />
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setStep("diff")}
              style={{
                fontSize: 12,
                color: tok.textSecondary,
                background: tok.container,
                border: `1px solid ${tok.border}`,
                borderRadius: 6,
                padding: "3px 8px",
                cursor: "pointer",
              }}
            >
              Stop
            </button>
          </div>
          <div
            style={{
              fontSize: 14,
              lineHeight: "24px",
              color: tok.textDisabled,
              fontStyle: "italic",
              padding: "6px 10px",
              background: "var(--indigo-soft)",
              borderRadius: 6,
              borderLeft: `3px solid ${tok.indigo}`,
            }}
          >
            Retaining customers is central to growth. Our NPS and anti-churn initiatives span{" "}
            <Caret />
            <Skeleton h={12} w="40%" style={{ display: "inline-block", marginLeft: 4, verticalAlign: "middle" }} />
          </div>
        </div>
      )}
      {step === "diff" && (
        <div style={{ margin: "8px 0" }}>
          <div
            style={{
              fontFamily: tok.mono,
              fontSize: 12.5,
              borderRadius: 7,
              overflow: "hidden",
              border: `1px solid ${tok.grey300}`,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                background: "var(--error-soft)",
                color: tok.error,
                padding: "4px 10px",
                lineHeight: "20px",
                textDecoration: "line-through",
              }}
            >
              − Customer retention is a key pillar of our long-term growth strategy. We have implemented
              several initiatives to improve NPS and reduce churn across all product tiers.
            </div>
            <div
              style={{
                background: "var(--success-soft)",
                color: tok.success,
                padding: "4px 10px",
                lineHeight: "20px",
              }}
            >
              + Retaining customers drives long-term growth. Our NPS and anti-churn programs span all
              product tiers.
            </div>
          </div>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Btn variant="primary" onClick={() => setStep("prompt")}>
              <Check size={13} style={{ display: "inline", marginRight: 4 }} />
              Accept
            </Btn>
            <Btn variant="ghost" onClick={() => setStep("prompt")}>
              Revert
            </Btn>
            <Btn variant="ghost" onClick={() => setStep("prompt")}>
              Try again
            </Btn>
          </div>
        </div>
      )}
    </EditorShell>
  );
}

// ── Variant 4 — Empty-line affordance + error state ─────────────────────────

function EmptyLineDemo() {
  const [showBar, setShowBar] = useState(false);
  return (
    <EditorShell>
      <Prose>The executive summary covers our FY2025 strategy and targets.</Prose>
      <Prose>Key initiatives span infrastructure modernisation, talent acquisition, and market expansion.</Prose>
      {/* Empty line with AI affordance */}
      <div
        onClick={() => setShowBar(true)}
        style={{
          fontSize: 14,
          lineHeight: "24px",
          color: tok.textDisabled,
          cursor: "text",
          padding: "2px 0",
          display: "flex",
          alignItems: "center",
          gap: 8,
          minHeight: 28,
        }}
      >
        {!showBar && (
          <>
            <span>|</span>
            <span
              style={{
                fontSize: 12,
                color: tok.indigo,
                background: "var(--indigo-soft)",
                borderRadius: 5,
                padding: "1px 7px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                opacity: 0.8,
              }}
            >
              <Wand2 size={11} /> Ask AI or type /
            </span>
          </>
        )}
        {showBar && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: tok.grey200,
              border: `1px solid ${tok.indigo}`,
              borderRadius: 8,
              padding: "6px 12px",
            }}
          >
            <Wand2 size={13} color={tok.indigo} />
            <span style={{ flex: 1, fontSize: 13, color: tok.textDisabled }}>
              What would you like to write?<Caret />
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowBar(false); }}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: tok.textDisabled }}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <Note>
        Empty-line affordance (Space or /) surfaces on-demand without cluttering every line.
        Click the hint to see the Cmd+K bar open at cursor.
      </Note>
    </EditorShell>
  );
}

// ── Variant 5 — Error / unavailable state ───────────────────────────────────

function ErrorStateDemo() {
  return (
    <EditorShell>
      <Prose>
        Strategic priorities for the next fiscal year include expanding into three new geographic
        markets, improving gross margin by 8 points, and investing in AI-driven product features.
      </Prose>
      {/* Inline error label near where the prompt bar would be */}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 12px",
          background: "var(--error-soft)",
          border: `1px solid ${tok.error}33`,
          borderRadius: 8,
          fontSize: 13,
        }}
      >
        <StatusDot state="error" />
        <span style={{ color: tok.error, flex: 1 }}>
          AI suggestions unavailable — rate limit reached.
        </span>
        <button
          style={{
            fontSize: 12,
            color: tok.error,
            background: "transparent",
            border: `1px solid ${tok.error}55`,
            borderRadius: 6,
            padding: "2px 8px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: tok.textDisabled }}>
        Editor remains fully typeable — AI is the only disabled surface.
      </div>
    </EditorShell>
  );
}

// ── Wiring snippet ──────────────────────────────────────────────────────────

const wiring = `import { CopilotTextarea } from "@copilotkit/react-textarea";
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
            stop: ["\\n\\n"],
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

// AG-UI events in play:
// RUN_STARTED            → debounce → in-flight (suppress next suggestion)
// TEXT_MESSAGE_CONTENT   → stream ghost-text tokens into inline preview
// RUN_FINISHED / RUN_ERROR → settle (resolve ghost styling) or inline error label
// TOOL_CALL_START/ARGS/END + TOOL_CALL_RESULT → apply-edit lifecycle (headless mode)`;

// ── Story ───────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      {/* 1. Ghost text — suggested / preview */}
      <Variant
        label="ghost text · suggested"
        hint="dimmed completion after caret; Tab accepts, Esc dismisses — zero keystrokes wasted"
      >
        <GhostTextDemo />
      </Variant>

      {/* 2. Selection toolbar — invoked */}
      <Variant
        label="selection toolbar · invoked"
        hint="floating menu anchored to highlighted span; preset actions + free-text prompt"
      >
        <SelectionToolbarDemo />
      </Variant>

      {/* 3. Cmd+K prompt bar — streaming → diff-in-place */}
      <Variant
        label="cmd+k · streaming → diff"
        hint="inline prompt bar → token stream → color-coded diff with Accept / Revert / Try again"
      >
        <CmdKStreamingDemo />
        <Note>
          Click <strong>Run</strong> to simulate streaming, then <strong>Stop</strong> (or wait) to
          see the diff-in-place. Accept commits; Revert restores the original span.
        </Note>
      </Variant>

      {/* 4. Empty-line affordance */}
      <Variant
        label="empty-line affordance"
        hint="latent 'Ask AI' hint on blank paragraph; click to summon the prompt bar at cursor"
      >
        <EmptyLineDemo />
      </Variant>

      {/* 5. Error / unavailable */}
      <Variant
        label="error · unavailable"
        hint="RUN_ERROR or rate-limit; quiet inline label; editor remains fully typeable"
      >
        <ErrorStateDemo />
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
