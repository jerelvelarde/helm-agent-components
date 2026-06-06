import { useState } from "react";
import { X, Sparkles, ChevronRight, MessageSquare, Bell } from "lucide-react";
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
  slug: "floating-widget",
  title: "Floating Widget / Launcher",
  category: "Layouts",
  blurb: "A bottom-right bubble that expands into a popup — reactive, task-bounded help layered over an existing app.",
  copilotkit: "CopilotPopup",
  spec: "layouts/floating-widget.md",
};

// ── Shared chrome ──────────────────────────────────────────────────────────────

function PopupHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div
      className="flex items-center"
      style={{
        padding: "10px 14px",
        borderBottom: `1px solid ${tok.grey300}`,
        background: tok.container,
        flexShrink: 0,
      }}
    >
      <Avatar role="assistant" size={24} />
      <span
        style={{
          flex: 1,
          marginLeft: 8,
          fontSize: 13,
          fontWeight: 600,
          color: tok.textPrimary,
        }}
      >
        Support
      </span>
      <StatusDot state="idle" />
      {onClose && (
        <button
          aria-label="Close chat"
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

/** The host-app backdrop that all popup variants overlay. */
function HostApp({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        minHeight: 320,
        borderRadius: 10,
        border: `1px solid ${tok.grey300}`,
        background: "var(--fill-100)",
        overflow: "hidden",
      }}
    >
      {/* Faux page content */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: tok.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Host Application
        </div>
        <div style={{ height: 10, borderRadius: 4, background: tok.grey300, width: "72%", marginBottom: 8 }} />
        <div style={{ height: 10, borderRadius: 4, background: tok.grey300, width: "55%", marginBottom: 8 }} />
        <div style={{ height: 10, borderRadius: 4, background: tok.grey300, width: "88%", marginBottom: 8 }} />
        <div style={{ height: 10, borderRadius: 4, background: tok.grey300, width: "63%" }} />
      </div>
      {children}
    </div>
  );
}

/** The floating popup panel, anchored bottom-right inside HostApp. */
function PopupPanel({
  children,
  footer,
  onClose,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        right: 16,
        width: 300,
        maxHeight: 280,
        display: "flex",
        flexDirection: "column",
        borderRadius: 12,
        border: `1px solid ${tok.grey300}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        background: tok.container,
        overflow: "hidden",
      }}
    >
      <PopupHeader onClose={onClose} />
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {children}
      </div>
      {footer && (
        <div style={{ padding: "8px 10px", borderTop: `1px solid ${tok.grey300}` }}>
          {footer}
        </div>
      )}
    </div>
  );
}

/** The circular launcher button pinned bottom-right. */
function Launcher({
  badge,
  onClick,
  open,
}: {
  badge?: number;
  onClick?: () => void;
  open?: boolean;
}) {
  return (
    <button
      aria-label={open ? "Close chat" : "Open support chat"}
      onClick={onClick}
      style={{
        position: "absolute",
        bottom: 14,
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 9999,
        background: tok.textPrimary,
        color: tok.textInvert,
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
      }}
    >
      {open ? <X size={18} /> : <MessageSquare size={18} />}
      {badge && !open ? (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 18,
            height: 18,
            borderRadius: 9999,
            background: tok.error,
            color: "var(--surface-container)",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${tok.container}`,
          }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function SuggestionPills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap" style={{ gap: 6 }}>
      {items.map((s) => (
        <button
          key={s}
          style={{
            fontSize: 11,
            padding: "4px 9px",
            borderRadius: 9999,
            border: `1px solid ${tok.border}`,
            background: tok.container,
            color: tok.textPrimary,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {s} <ChevronRight size={10} color={tok.textDisabled} />
        </button>
      ))}
    </div>
  );
}

// ── Wiring snippet ─────────────────────────────────────────────────────────────

const wiring = `import { CopilotPopup } from "@copilotkit/react-ui";
import {
  useFrontendTool,
  useConfigureSuggestions,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

// v1 equivalents: useCopilotAction, useCopilotChatSuggestions

function SupportWidget() {
  // Pre-populate the welcome screen with domain-relevant starters
  useConfigureSuggestions({
    instructions: "Suggest 3 short help questions a customer might ask.",
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  // Client-side action the agent can invoke (e.g., open a returns form)
  useFrontendTool({
    name: "openReturnsForm",
    description: "Open the returns request form for the user",
    parameters: z.object({ orderId: z.string() }),
    handler: async ({ orderId }) => {
      window.location.href = \`/returns?order=\${orderId}\`;
    },
    render: ({ status, args }) => (
      <div className="tool-badge">
        {status === "complete"
          ? "Returns form opened"
          : \`Opening returns for order \${args.orderId}…\`}
      </div>
    ),
  });

  // Gate escalation behind an explicit user confirmation
  useHumanInTheLoop({
    name: "confirmEscalate",
    parameters: z.object({ reason: z.string() }),
    render: ({ status, args, respond }) =>
      status === "executing" ? (
        <div className="escalation-card">
          <p>Connect you to a human agent? ({args.reason})</p>
          <button onClick={() => respond?.("yes")}>Yes, connect me</button>
          <button onClick={() => respond?.("no")}>No, keep chatting</button>
        </div>
      ) : (
        <div className="escalation-card escalation-card--settled">
          Escalation request sent.
        </div>
      ),
  });

  return (
    <CopilotPopup
      defaultOpen={false}
      clickOutsideToClose={true}
      labels={{
        title: "Support",
        initial:
          "Hi! I can help with order status, returns, or sizing. What do you need?",
      }}
      // Slot overrides: Button, Window, Header — customize chrome to match brand
    />
  );
}

// AG-UI events in play:
// RUN_STARTED              → disable composer
// TEXT_MESSAGE_CONTENT     → stream tokens into bubble
// TOOL_CALL_START/ARGS/END → inline card lifecycle (openReturnsForm, confirmEscalate)
// RUN_FINISHED/ERROR       → settle or error state`;

// ── Story ──────────────────────────────────────────────────────────────────────

export default function Story() {
  const [open, setOpen] = useState(false);
  const [escalated, setEscalated] = useState<"yes" | "no" | null>(null);

  return (
    <Showcase>

      {/* 1. Idle / collapsed — launcher only */}
      <Variant label="idle · collapsed" hint="launcher bubble only; host app unobstructed; page badge when unread">
        <HostApp>
          {/* Nudge teaser tooltip */}
          <div
            style={{
              position: "absolute",
              bottom: 66,
              right: 68,
              background: tok.textPrimary,
              color: tok.textInvert,
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              whiteSpace: "nowrap",
            }}
          >
            Need help? Ask me anything →
          </div>
          <Launcher badge={2} />
        </HostApp>
        <Note>
          The launcher renders as a{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>&lt;button&gt;</code> with{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>aria-label="Open support chat"</code>. The
          unread badge should reflect a <em>real</em> waiting message — never manufactured urgency.
        </Note>
      </Variant>

      {/* 2. Welcome / empty — panel open, no messages */}
      <Variant label="welcome · empty" hint="panel open; greeting + starters; no thread yet">
        <HostApp>
          <PopupPanel footer={<Composer placeholder="Hi! What can I help you with?" />}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "12px 0 4px",
              }}
            >
              <Avatar role="assistant" size={36} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: tok.textPrimary, marginBottom: 2 }}>
                  Support
                </div>
                <div style={{ fontSize: 11, color: tok.textSecondary }}>
                  Help with orders, returns &amp; sizing.
                </div>
              </div>
              <SuggestionPills items={["Track my order", "Start a return", "Size guide"]} />
            </div>
          </PopupPanel>
          <Launcher open />
        </HostApp>
        <Note>
          The welcome screen earns the open: greeting, a one-line capability statement, and 2–3 tappable
          conversation starters. Industry benchmarks put unprompted opens near ~2% — the first interaction
          must pay off.
        </Note>
      </Variant>

      {/* 3. Streaming — agent responding */}
      <Variant label="streaming" hint="TEXT_MESSAGE_CONTENT events; blinking caret; stop visible">
        <HostApp>
          <PopupPanel
            footer={<Composer placeholder="Generating…" streaming />}
          >
            <Bubble role="user">Where is my order #4821?</Bubble>
            <Bubble role="assistant">
              Your order #4821 shipped on June 3rd via UPS Ground. Estimated delivery is{" "}
              <strong>June 7th</strong>. Tracking number: <code style={{ fontFamily: tok.mono, fontSize: 12 }}>1Z999AA…</code>{" "}
              <Caret />
            </Bubble>
            <div className="flex items-center" style={{ gap: 6 }}>
              <StatusDot state="running" label="Generating…" />
            </div>
          </PopupPanel>
          <Launcher open />
        </HostApp>
      </Variant>

      {/* 4. Tool call — inline card in thread */}
      <Variant label="tool call" hint="openReturnsForm card: inProgress → complete inline in popup thread">
        <HostApp>
          <PopupPanel footer={<Composer placeholder="Ask a follow-up…" />}>
            <Bubble role="user">I want to return order #4821.</Bubble>
            <Bubble role="assistant">Opening the returns form for you now.</Bubble>
            <ToolFrame name="openReturnsForm" status="executing" args={'orderId: "4821"'} />
            <ToolFrame name="openReturnsForm" status="complete" args={'orderId: "4821"'}>
              <div className="flex items-center" style={{ gap: 8 }}>
                <span style={{ color: tok.success }}>Returns form opened for order #4821.</span>
                <span style={{ flex: 1 }} />
                <Tag>Done</Tag>
              </div>
            </ToolFrame>
          </PopupPanel>
          <Launcher open />
        </HostApp>
        <Note>
          Inline tool cards cycle through{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>inProgress → executing → complete</code>{" "}
          driven by <code style={{ fontFamily: tok.mono, fontSize: 12 }}>TOOL_CALL_START/ARGS/END</code> +{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>TOOL_CALL_RESULT</code> events.
        </Note>
      </Variant>

      {/* 5. Handoff / escalation — HITL confirm gate */}
      <Variant label="handoff · escalation" hint="useHumanInTheLoop blocks the agent; user picks yes / no">
        <HostApp>
          <PopupPanel footer={<Composer placeholder="Waiting for your response…" />}>
            <Bubble role="user">I've been waiting 3 weeks — I need to speak to someone.</Bubble>
            <Bubble role="assistant">
              I understand your frustration. Let me connect you with a teammate who can resolve this.
            </Bubble>
            {escalated === null && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "var(--warning-soft)",
                  border: `1px solid ${tok.warning}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div className="flex items-center" style={{ gap: 8 }}>
                  <StatusDot state="waiting" />
                  <span style={{ fontSize: 12, fontWeight: 500, color: tok.warning }}>
                    Connecting you to a teammate…
                  </span>
                </div>
                <div style={{ fontSize: 12, color: tok.textSecondary, lineHeight: "18px" }}>
                  Connect you to a human support agent? (order delay)
                </div>
                <div className="flex" style={{ gap: 8 }}>
                  <Btn variant="primary" onClick={() => setEscalated("yes")}>
                    Yes, connect me
                  </Btn>
                  <Btn variant="ghost" onClick={() => setEscalated("no")}>
                    No, keep chatting
                  </Btn>
                </div>
              </div>
            )}
            {escalated === "yes" && (
              <div className="flex items-center" style={{ gap: 8 }}>
                <Bell size={13} color={tok.success} />
                <span style={{ fontSize: 13, color: tok.success }}>
                  A teammate will join shortly.
                </span>
              </div>
            )}
            {escalated === "no" && (
              <div style={{ fontSize: 13, color: tok.textDisabled }}>
                Staying in chat — let me know how I can help.
              </div>
            )}
          </PopupPanel>
          <Launcher open />
        </HostApp>
        <Note>
          Make escalation first-class: clearly label who is answering (AI vs. human) and offer a visible
          path to a person when the agent cannot resolve the issue.{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>useHumanInTheLoop</code> blocks the run
          until the user responds.
        </Note>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
