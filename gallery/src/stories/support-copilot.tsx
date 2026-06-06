import { ChevronRight, Sparkles, X, MessageCircle, PackageCheck } from "lucide-react";
import {
  Avatar,
  Bubble,
  Btn,
  CodeNote,
  Composer,
  Composes,
  Note,
  SectionLabel,
  Showcase,
  StatusDot,
  Tag,
  ToolLine,
  WindowFrame,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "support-copilot",
  title: "Customer-Support Copilot",
  category: "Examples",
  blurb:
    "An Intercom-style support bubble layered over a storefront — prompt starters, an order lookup that renders a card, and a refund that pauses for approval.",
  copilotkit: "CopilotPopup · useFrontendTool · useRenderTool · useHumanInTheLoop",
  spec: "layouts/floating-widget.md",
};

// ── Host app (the storefront the widget sits over) ───────────────────────────

function Storefront({ dimmed }: { dimmed?: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        background: "var(--surface-main)",
        padding: "22px 26px",
        opacity: dimmed ? 0.55 : 1,
        filter: dimmed ? "saturate(0.9)" : "none",
        transition: "opacity .2s",
        overflow: "hidden",
      }}
    >
      <div className="flex items-center" style={{ gap: 8, marginBottom: 18 }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, background: tok.textPrimary }} />
        <span style={{ fontWeight: 700, fontSize: 15 }}>acme</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: tok.textDisabled }}>Orders</span>
        <span style={{ fontSize: 12, color: tok.textDisabled }}>Account</span>
      </div>

      <h3 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 2px" }}>Order #4821</h3>
      <p style={{ fontSize: 12, color: tok.textDisabled, margin: "0 0 18px" }}>Placed May 12, 2026 · Delivered May 16</p>

      <div style={{ border: `1px solid ${tok.grey300}`, borderRadius: 10, overflow: "hidden", maxWidth: 460 }}>
        <div className="flex items-center" style={{ gap: 12, padding: 14 }}>
          <span style={{ width: 52, height: 52, borderRadius: 8, background: "var(--fill-100)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Aeron Ergonomic Chair</div>
            <div style={{ fontSize: 12, color: tok.textDisabled }}>Graphite · Size B</div>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>$1,129.00</div>
        </div>
        <div style={{ borderTop: `1px solid ${tok.grey300}`, padding: "10px 14px", background: "var(--fill-100)" }}>
          <div className="flex items-center" style={{ fontSize: 12.5 }}>
            <span style={{ color: tok.textSecondary }}>Total</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontWeight: 600 }}>$1,129.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Generative-UI order card the agent renders in-thread ─────────────────────

function OrderCard() {
  return (
    <div style={{ border: `1px solid ${tok.grey300}`, borderRadius: 8, overflow: "hidden", background: tok.container, flexShrink: 0 }}>
      <div className="flex items-center" style={{ gap: 10, padding: "9px 11px" }}>
        <span style={{ width: 34, height: 34, borderRadius: 6, background: "var(--fill-100)", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Aeron Ergonomic Chair
          </div>
          <div style={{ fontSize: 11, color: tok.textDisabled }}>#4821 · $1,129.00</div>
        </div>
        <span
          className="flex items-center"
          style={{ gap: 3, fontSize: 10.5, fontWeight: 600, color: tok.success, background: "var(--success-soft)", borderRadius: 9999, padding: "2px 8px" }}
        >
          <PackageCheck size={11} /> delivered
        </span>
      </div>
      <div style={{ borderTop: `1px solid ${tok.grey300}`, padding: "7px 11px", fontSize: 11, color: tok.textDisabled, display: "flex", gap: 6, alignItems: "center" }}>
        <Tag mono>generative UI</Tag> within 30-day return window
      </div>
    </div>
  );
}

function RefundGate({ compact }: { compact?: boolean }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${tok.grey300}`,
        borderRight: `1px solid ${tok.grey300}`,
        borderBottom: `1px solid ${tok.grey300}`,
        borderLeft: `3px solid ${tok.indigo}`,
        borderRadius: 8,
        padding: compact ? 14 : 11,
        background: tok.container,
      }}
    >
      <div style={{ fontSize: compact ? 13.5 : 12.5, fontWeight: 600, marginBottom: 8 }}>
        Refund $1,129.00 to Visa ····4242?
      </div>
      <div className="flex items-center" style={{ gap: 8 }}>
        <Btn variant="ghost">Not now</Btn>
        <Btn>Confirm refund</Btn>
      </div>
    </div>
  );
}

function SuggestionPills() {
  return (
    <div className="flex flex-wrap" style={{ gap: 6 }}>
      {["Where’s my order?", "Start a return", "Talk to a human"].map((s) => (
        <span
          key={s}
          className="flex items-center"
          style={{
            gap: 4,
            fontSize: 11.5,
            padding: "5px 9px",
            borderRadius: 9999,
            border: `1px solid ${tok.border}`,
            background: tok.container,
            color: tok.textPrimary,
          }}
        >
          {s} <ChevronRight size={10} color={tok.textDisabled} />
        </span>
      ))}
    </div>
  );
}

// ── Floating widget ──────────────────────────────────────────────────────────

function Widget() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 18,
        right: 18,
        width: 340,
        maxHeight: 500,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-background)",
        border: `1px solid ${tok.grey300}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div
        className="flex items-center"
        style={{ gap: 8, padding: "10px 12px", borderBottom: `1px solid ${tok.grey300}`, background: tok.container }}
      >
        <Avatar role="assistant" size={24} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>Acme Support</div>
          <StatusDot state="done" label="online" />
        </div>
        <X size={15} color={tok.textDisabled} />
      </div>

      <div
        className="ck-scroll"
        style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 9 }}
      >
        <Bubble role="assistant">Hi! I can track orders, start returns, or hand you to a human.</Bubble>
        <SuggestionPills />
        <Bubble role="user">I’d like a refund for order #4821.</Bubble>
        <ToolLine name="lookup_order" status="complete" summary="found #4821" args={'orderId: "4821"'} />
        <OrderCard />
        <Bubble role="assistant" full>
          That order’s within the return window, so you’re eligible. I can refund the full $1,129.00 to your Visa
          ending 4242.
        </Bubble>
        <RefundGate />
        <div style={{ fontSize: 10.5, color: tok.textDisabled, fontFamily: tok.mono, padding: "0 2px" }}>
          checked: order status · refund policy · payment method
        </div>
      </div>

      <div style={{ padding: "9px 10px", borderTop: `1px solid ${tok.grey300}` }}>
        <Composer placeholder="Message Acme Support…" />
      </div>
    </div>
  );
}

// ── Wiring ───────────────────────────────────────────────────────────────────

const wiring = `import { CopilotPopup } from "@copilotkit/react-ui";
import {
  useFrontendTool,
  useRenderTool,
  useHumanInTheLoop,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

function SupportWidget() {
  // Prompt starters for the empty state — what can this agent actually do?
  useConfigureSuggestions({
    instructions: "Offer 3 common support actions: track order, start return, reach a human.",
    maxSuggestions: 3,
  });

  // A read-only lookup runs without friction, and renders as a card.
  useRenderTool({
    name: "lookup_order",
    parameters: z.object({ orderId: z.string() }),
    render: ({ status, result }) => <OrderCard status={status} order={result} />,
  });

  // Moving money is a side effect → pause for explicit confirmation.
  useHumanInTheLoop({
    name: "issueRefund",
    parameters: z.object({ orderId: z.string(), amount: z.number() }),
    render: ({ args, respond }) => (
      <RefundGate
        amount={args.amount}
        onConfirm={() => respond?.("confirmed")}
        onCancel={() => respond?.("cancelled")}
      />
    ),
  });

  // One escape hatch the agent can always reach for.
  useFrontendTool({
    name: "escalateToHuman",
    description: "Hand the conversation to a human agent",
    handler: async () => openLiveChat(),
  });

  // Layered over the existing app — never takes the whole screen.
  return <CopilotPopup defaultOpen labels={{ title: "Acme Support" }} />;
}`;

// ── Story ────────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      <SectionLabel>Live screen · support bubble open over the storefront</SectionLabel>
      <WindowFrame title="shop.acme.com — Order #4821">
        <div style={{ position: "relative", height: 560, overflow: "hidden" }}>
          <Storefront dimmed />
          <Widget />
        </div>
      </WindowFrame>
      <Note>
        The peripheral, task-bounded pattern: AI <strong>layered over an existing app</strong>, never owning the screen.
        It opens with <strong>prompt starters</strong> (so capability is discoverable), turns a read-only{" "}
        <code style={{ fontFamily: tok.mono, fontSize: 12 }}>lookup_order</code> into an inline card, and — because a
        refund moves money — <strong>pauses for confirmation</strong> rather than acting silently. A standing
        “talk to a human” path is always one tap away.
      </Note>

      <SectionLabel>Collapsed · the launcher the widget lives behind</SectionLabel>
      <WindowFrame title="shop.acme.com">
        <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
          <Storefront />
          <button
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 16px",
              background: tok.textPrimary,
              color: tok.textInvert,
              border: "none",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
            }}
          >
            <MessageCircle size={15} /> Support
          </button>
        </div>
      </WindowFrame>

      <SectionLabel>Composes</SectionLabel>
      <Composes
        items={[
          { slug: "floating-widget", label: "Floating Widget", role: "Bottom-right launcher → popup, layered over the storefront." },
          { slug: "suggestions-capabilities", label: "Suggestions", role: "Prompt starters that surface what the agent can do." },
          { slug: "chat-message", label: "Chat Message", role: "The customer ↔ support transcript." },
          { slug: "input-composer", label: "Input / Composer", role: "Send + mic (voice) entry at the foot of the widget." },
          { slug: "tool-call", label: "Tool Call", role: "lookup_order shown as a compact, glanceable line." },
          { slug: "generative-ui-inline", label: "Inline Generative UI", role: "The order summary card the agent renders." },
          { slug: "human-in-the-loop", label: "Human-in-the-Loop", role: "Refund confirmation before money moves." },
          { slug: "agent-activity-traceability", label: "Activity & Traceability", role: "“Checked…” trail of what the agent consulted." },
        ]}
      />

      <CodeNote title="CopilotKit wiring · the assembled widget" code={wiring} />
    </Showcase>
  );
}
