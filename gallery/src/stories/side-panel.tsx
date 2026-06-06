import { useState } from "react";
import { X, Sparkles, ChevronRight, Play, Square } from "lucide-react";
import {
  Avatar,
  Bubble,
  Btn,
  Caret,
  CodeNote,
  Composer,
  Note,
  Showcase,
  StatusDot,
  Tag,
  ToolFrame,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "side-panel",
  title: "Side Panel / Sidebar Copilot",
  category: "Layouts",
  blurb: "The docked sidebar copilot rail alongside the work surface.",
  copilotkit: "CopilotSidebar",
  spec: "layouts/side-panel.md",
};

// ── Shared chrome ──────────────────────────────────────────────────────────────

function PanelHeader({ title, onClose }: { title: string; onClose?: () => void }) {
  return (
    <div
      className="flex items-center"
      style={{
        padding: "10px 14px",
        borderBottom: `1px solid ${tok.grey300}`,
        background: tok.container,
      }}
    >
      <Sparkles size={14} color={tok.indigo} />
      <span
        style={{
          flex: 1,
          marginLeft: 8,
          fontSize: 13,
          fontWeight: 600,
          color: tok.textPrimary,
        }}
      >
        {title}
      </span>
      <StatusDot state="idle" />
      {onClose && (
        <button
          aria-label="Close panel"
          onClick={onClose}
          style={{
            marginLeft: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: tok.textDisabled,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

function PanelShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        border: `1px solid ${tok.grey300}`,
        borderRadius: 10,
        overflow: "hidden",
        background: tok.grey200,
        minHeight: 360,
      }}
    >
      {/* Mock work surface */}
      <div
        style={{
          flex: 1,
          background: "var(--fill-100)",
          borderRight: `2px solid ${tok.bg}`,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: tok.textDisabled,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Work Surface
        </div>
        <div style={{ height: 10, borderRadius: 4, background: tok.grey300, width: "80%" }} />
        <div style={{ height: 10, borderRadius: 4, background: tok.grey300, width: "60%" }} />
        <div style={{ height: 10, borderRadius: 4, background: tok.grey300, width: "90%" }} />
        <div style={{ height: 10, borderRadius: 4, background: tok.grey300, width: "70%" }} />
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: tok.indigo,
            background: "var(--indigo-soft)",
            borderRadius: 6,
            padding: "4px 8px",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            alignSelf: "flex-start",
          }}
        >
          <Sparkles size={11} /> Agent sees: this document
        </div>
      </div>

      {/* Panel rail */}
      <div
        style={{
          width: 280,
          minWidth: 280,
          display: "flex",
          flexDirection: "column",
          background: tok.container,
        }}
      >
        <PanelHeader title={title} />
        <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${tok.grey300}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Suggestion pill row ────────────────────────────────────────────────────────

function SuggestionPills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap" style={{ gap: 6 }}>
      {items.map((s) => (
        <button
          key={s}
          style={{
            fontSize: 12,
            padding: "5px 10px",
            borderRadius: 9999,
            border: `1px solid ${tok.border}`,
            background: tok.container,
            color: tok.textPrimary,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {s} <ChevronRight size={11} color={tok.textDisabled} />
        </button>
      ))}
    </div>
  );
}

// ── Wiring snippet ─────────────────────────────────────────────────────────────

const wiring = `import {
  CopilotSidebar,
  CopilotSidebarView,
} from "@copilotkit/react-ui";
import {
  useCopilotReadable,
  useFrontendTool,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

// v1 equivalents: useCopilotAction, useCopilotChatSuggestions

function DocumentEditor({ doc, onApplyEdit }) {
  // Ground the agent in what the user sees
  useCopilotReadable({
    description: "The document the user is editing",
    value: doc,
  });

  // Agent tool that mutates the host UI
  useFrontendTool({
    name: "applyEdit",
    description: "Apply a targeted edit to the document",
    parameters: z.object({
      section: z.string(),
      replacement: z.string(),
    }),
    handler: async ({ section, replacement }) => {
      onApplyEdit(section, replacement);
    },
  });

  // Context-aware suggestion pills
  useConfigureSuggestions({
    instructions: "Suggest 3 short editing actions based on the document.",
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  return (
    <div style={{ display: "flex" }}>
      <main style={{ flex: 1 }}>{/* primary work surface */}</main>
      <CopilotSidebar
        defaultOpen={false}
        labels={{ title: "Document Copilot" }}
        // Slot overrides: header, messageView, scrollView,
        // input, suggestionView, welcomeScreen
      />
    </div>
  );
}

// AG-UI events in play:
// RUN_STARTED       → disable composer
// TEXT_MESSAGE_*    → stream tokens into thread
// TOOL_CALL_*       → applyEdit card lifecycle
// RUN_FINISHED/ERROR → settle or error state`;

// ── Story ──────────────────────────────────────────────────────────────────────

export default function Story() {
  const [open, setOpen] = useState(false);

  return (
    <Showcase>
      {/* 1. Collapsed */}
      <Variant label="collapsed" hint="launcher button only; zero panel width">
        <div
          style={{
            position: "relative",
            minHeight: 180,
            background: "var(--fill-100)",
            border: `1px solid ${tok.grey300}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 20 }}>
            <div style={{ height: 10, borderRadius: 4, background: tok.grey300, width: "70%", marginBottom: 10 }} />
            <div style={{ height: 10, borderRadius: 4, background: tok.grey300, width: "50%" }} />
          </div>
          {/* Floating launcher */}
          <button
            onClick={() => setOpen(!open)}
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: tok.textPrimary,
              color: tok.textInvert,
              border: "none",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            }}
          >
            <Sparkles size={14} /> AI Chat
          </button>
        </div>
        <Note>
          The{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>CopilotChatToggleButton</code> launches
          the panel. Keyboard shortcut (Cmd/Ctrl+J) must also be discoverable.
        </Note>
      </Variant>

      {/* 2. Empty / welcome */}
      <Variant label="empty · welcome" hint="opened, no messages; suggestion pills; no thread">
        <PanelShell
          title="Document Copilot"
          footer={<Composer placeholder="Ask about this document…" />}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: "24px 0",
            }}
          >
            <Avatar role="assistant" size={40} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: tok.textPrimary, marginBottom: 4 }}>
                Document Copilot
              </div>
              <div style={{ fontSize: 12, color: tok.textSecondary }}>
                Ask me anything about this document.
              </div>
            </div>
            <SuggestionPills
              items={["Summarize this section", "Fix the intro", "Add a conclusion"]}
            />
          </div>
        </PanelShell>
      </Variant>

      {/* 3. Idle — thread with messages */}
      <Variant label="idle" hint="open with thread; composer enabled; agent not running">
        <PanelShell
          title="Document Copilot"
          footer={<Composer placeholder="Ask a follow-up…" />}
        >
          <Bubble role="user">Summarize the key findings in section 3.</Bubble>
          <Bubble role="assistant">
            Section 3 covers three main findings: improved latency (~40%), reduced error rate, and a
            2× throughput gain under peak load conditions.
          </Bubble>
          <SuggestionPills items={["Expand on latency", "Show error stats"]} />
        </PanelShell>
        <Note>
          Auto-scroll to bottom; pause when user scrolls up into history — never yank them back.
          Page context tag ("<code style={{ fontFamily: tok.mono, fontSize: 12 }}>Agent sees</code>
          ") builds trust.
        </Note>
      </Variant>

      {/* 4. Streaming */}
      <Variant label="streaming" hint="TEXT_MESSAGE_CONTENT events; blinking caret; stop button visible">
        <PanelShell
          title="Document Copilot"
          footer={<Composer placeholder="Generating…" streaming />}
        >
          <Bubble role="user">What are the accessibility recommendations?</Bubble>
          <Bubble role="assistant">
            The report recommends using <code style={{ fontFamily: tok.mono, fontSize: 12 }}>aria-live="polite"</code>{" "}
            on streaming output, providing keyboard shortcuts, and ensuring the panel can always be
            dismissed with Escape <Caret />
          </Bubble>
          <div className="flex items-center" style={{ gap: 6, marginLeft: 36 }}>
            <StatusDot state="running" label="Generating…" />
            <span style={{ flex: 1 }} />
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: tok.textSecondary,
                border: `1px solid ${tok.border}`,
                background: tok.container,
                borderRadius: 6,
                padding: "3px 8px",
                cursor: "pointer",
              }}
            >
              <Square size={11} /> Stop
            </button>
          </div>
        </PanelShell>
      </Variant>

      {/* 5. Tool call in thread */}
      <Variant label="tool call" hint="applyEdit card at Executing → Complete inline in thread">
        <PanelShell
          title="Document Copilot"
          footer={<Composer placeholder="Ask a follow-up…" />}
        >
          <Bubble role="user">Fix the awkward phrasing in the introduction.</Bubble>
          <Bubble role="assistant">Sure — applying the edit now.</Bubble>
          <ToolFrame
            name="applyEdit"
            status="executing"
            args={'section: "introduction", replacement: "…"'}
          />
          <ToolFrame
            name="applyEdit"
            status="complete"
            args={'section: "introduction"'}
          >
            <div className="flex items-center" style={{ gap: 8 }}>
              <span style={{ color: tok.success }}>Edit applied to introduction.</span>
              <span style={{ flex: 1 }} />
              <Tag>Undo</Tag>
            </div>
          </ToolFrame>
        </PanelShell>
        <Note>
          Show what changed and offer Undo — side-panel mutations are easy to miss against the work
          surface.
        </Note>
      </Variant>

      {/* 6. Error / offline */}
      <Variant label="error · offline" hint="RUN_ERROR or network failure; inline banner; composer disabled">
        <PanelShell
          title="Document Copilot"
          footer={
            <div
              style={{
                background: "var(--fill-100)",
                border: `1px solid ${tok.grey300}`,
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 13,
                color: tok.textDisabled,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ flex: 1 }}>Ask about this document…</span>
            </div>
          }
        >
          <Bubble role="user">Summarize the executive summary.</Bubble>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--error-soft)",
              border: `1px solid ${tok.error}22`,
            }}
          >
            <span style={{ fontSize: 13, color: tok.error, flex: 1 }}>
              Connection lost. Check your network.
            </span>
            <Btn variant="ghost" onClick={() => {}}>
              Retry
            </Btn>
          </div>
          <div
            style={{
              fontSize: 12,
              color: tok.textDisabled,
              textAlign: "center",
              padding: "4px 0",
            }}
          >
            Composer disabled until reconnected.
          </div>
        </PanelShell>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
