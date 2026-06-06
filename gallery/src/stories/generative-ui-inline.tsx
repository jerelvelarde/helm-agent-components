import { useState } from "react";
import { ChevronDown, ChevronRight, Check, Sparkles } from "lucide-react";
import {
  Avatar,
  Btn,
  Bubble,
  Caret,
  Cite,
  CodeNote,
  Note,
  Showcase,
  Skeleton,
  SourceCard,
  StatusDot,
  Tag,
  ToolFrame,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "generative-ui-inline",
  title: "Inline Generative UI (Static / Controlled)",
  category: "Generative UI",
  blurb:
    "Agent-rendered interactive components inside the thread — the Static / Declarative / Open-Ended generative-UI spectrum.",
  copilotkit: "useRenderTool · useComponent",
  spec: "components/generative-ui-inline.md",
};

// ── Reusable card chrome ─────────────────────────────────────────────────────

function CardShell({
  title,
  badge,
  busy,
  children,
  footer,
}: {
  title: string;
  badge?: string;
  busy?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: tok.container,
        border: `1px solid ${tok.grey300}`,
        borderRadius: 10,
        overflow: "hidden",
        maxWidth: 420,
      }}
    >
      <div
        className="flex items-center"
        style={{
          gap: 8,
          padding: "10px 14px",
          borderBottom: `1px solid ${tok.grey300}`,
          background: tok.grey200,
        }}
      >
        <Sparkles size={13} color={tok.indigo} />
        <span style={{ fontSize: 13, fontWeight: 600, color: tok.textPrimary, flex: 1 }}>
          {title}
        </span>
        {badge && (
          <Tag selected={badge === "complete"} mono>
            {badge}
          </Tag>
        )}
        {busy && <StatusDot state="running" />}
      </div>
      <div style={{ padding: "12px 14px" }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: "8px 14px",
            borderTop: `1px solid ${tok.grey300}`,
            background: tok.grey200,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

// ── Variant 1 — InProgress (skeleton) ───────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      <Bubble role="user">Pull up the latest stock quote for NVDA.</Bubble>
      <div className="flex" style={{ gap: 10 }}>
        <Avatar role="agent" />
        <CardShell title="get_quote" badge="inProgress" busy>
          <div className="flex flex-col" style={{ gap: 8 }}>
            <Skeleton w="40%" h={28} />
            <Skeleton w="60%" h={12} />
            <div className="flex" style={{ gap: 8, marginTop: 4 }}>
              <Skeleton w="30%" h={12} />
              <Skeleton w="25%" h={12} />
            </div>
          </div>
        </CardShell>
      </div>
    </div>
  );
}

// ── Variant 2 — Executing (args resolved, tool running) ─────────────────────

function ExecutingCard() {
  return (
    <div className="flex" style={{ gap: 10 }}>
      <Avatar role="agent" />
      <CardShell title="get_quote" badge="executing" busy>
        <div className="flex flex-col" style={{ gap: 10 }}>
          <div className="flex items-baseline" style={{ gap: 8 }}>
            <span
              style={{
                fontFamily: tok.mono,
                fontSize: 13,
                fontWeight: 600,
                color: tok.textSecondary,
              }}
            >
              NVDA
            </span>
            <Skeleton w={72} h={24} />
          </div>
          <Skeleton w="50%" h={12} />
        </div>
      </CardShell>
    </div>
  );
}

// ── Variant 3 — Complete (result bound) ─────────────────────────────────────

function QuoteCard() {
  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      <div className="flex" style={{ gap: 10 }}>
        <Avatar role="agent" />
        <CardShell
          title="get_quote"
          badge="complete"
          footer={
            <div className="flex items-center" style={{ gap: 8 }}>
              <SourceCard n={1} domain="finance.yahoo.com" title="NVDA — NVIDIA Corporation" />
            </div>
          }
        >
          <div className="flex flex-col" style={{ gap: 6 }}>
            <div className="flex items-baseline" style={{ gap: 8 }}>
              <span style={{ fontFamily: tok.mono, fontSize: 13, color: tok.textSecondary }}>
                NVDA
              </span>
              <span
                style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: tok.textPrimary }}
              >
                $924.10
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: tok.success,
                  background: "var(--success-soft)",
                  borderRadius: 6,
                  padding: "2px 7px",
                }}
              >
                +2.74%
              </span>
            </div>
            <div className="flex" style={{ gap: 12, marginTop: 4 }}>
              {[
                ["Open", "901.22"],
                ["High", "928.50"],
                ["Vol", "48.2M"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col" style={{ gap: 2 }}>
                  <span style={{ fontSize: 10, color: tok.textDisabled }}>{k}</span>
                  <span style={{ fontFamily: tok.mono, fontSize: 12, color: tok.textPrimary }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardShell>
      </div>
      <Bubble role="assistant">
        NVIDIA is up 2.74 % today, trading at $924.10.
        <Cite n={1} /> The volume of 48 M shares is above the 30-day average.
      </Bubble>
    </div>
  );
}

// ── Variant 4 — Interactive / HITL (confirm_send) ───────────────────────────

function HitlCard() {
  const [state, setState] = useState<"idle" | "approved" | "rejected">("idle");
  return (
    <div className="flex" style={{ gap: 10 }}>
      <Avatar role="agent" />
      <CardShell
        title="confirm_send"
        badge={state === "idle" ? "executing" : "complete"}
        busy={state === "idle"}
      >
        <div className="flex flex-col" style={{ gap: 10 }}>
          <div style={{ fontSize: 13, color: tok.textPrimary, lineHeight: "20px" }}>
            Send the quarterly report to{" "}
            <strong>finance@acme.com</strong>?
          </div>
          <div className="flex" style={{ gap: 6, flexWrap: "wrap" as const }}>
            {[
              ["To", "finance@acme.com"],
              ["Subject", "Q2 2026 Board Report"],
              ["Attachment", "board-deck.pdf"],
            ].map(([label, val]) => (
              <div
                key={label}
                className="flex"
                style={{
                  gap: 5,
                  background: tok.grey200,
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 12,
                }}
              >
                <span style={{ color: tok.textDisabled }}>{label}:</span>
                <span style={{ color: tok.textPrimary, fontFamily: tok.mono }}>{val}</span>
              </div>
            ))}
          </div>
          {state === "idle" ? (
            <div className="flex" style={{ gap: 8, marginTop: 4 }}>
              <Btn onClick={() => setState("approved")}>Approve &amp; Send</Btn>
              <Btn variant="ghost" onClick={() => setState("rejected")}>
                Cancel
              </Btn>
            </div>
          ) : (
            <div
              className="flex items-center"
              style={{
                gap: 6,
                fontSize: 13,
                color: state === "approved" ? tok.success : tok.textSecondary,
              }}
            >
              <Check size={14} />
              {state === "approved" ? "Email sent — agent unblocked." : "Cancelled."}
            </div>
          )}
        </div>
      </CardShell>
    </div>
  );
}

// ── Variant 5 — Collapsed / Expanded ────────────────────────────────────────

function CollapseCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex" style={{ gap: 10 }}>
      <Avatar role="agent" />
      <div
        style={{
          background: tok.container,
          border: `1px solid ${tok.grey300}`,
          borderRadius: 10,
          overflow: "hidden",
          maxWidth: 420,
        }}
      >
        <button
          aria-expanded={open}
          aria-label="Toggle flight itinerary details"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center"
          style={{
            gap: 8,
            padding: "10px 14px",
            width: "100%",
            background: tok.grey200,
            border: "none",
            cursor: "pointer",
            textAlign: "left" as const,
          }}
        >
          <Sparkles size={13} color={tok.indigo} />
          <span style={{ fontSize: 13, fontWeight: 600, color: tok.textPrimary, flex: 1 }}>
            Flight Itinerary · SFO → JFK
          </span>
          <Tag>complete</Tag>
          {open ? (
            <ChevronDown size={14} color={tok.textDisabled} />
          ) : (
            <ChevronRight size={14} color={tok.textDisabled} />
          )}
        </button>
        {!open ? (
          <div className="flex items-center" style={{ gap: 10, padding: "10px 14px" }}>
            <StatusDot state="done" />
            <span style={{ fontSize: 13, color: tok.textSecondary }}>
              UA 2419 · Departs 07:45 · Economy · $342
            </span>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: 8, padding: "12px 14px" }}>
            {[
              ["Flight", "UA 2419"],
              ["Departs", "07:45 SFO"],
              ["Arrives", "16:10 JFK"],
              ["Class", "Economy"],
              ["Price", "$342 USD"],
              ["Seats left", "4"],
            ].map(([k, v]) => (
              <div key={k} className="flex" style={{ gap: 12 }}>
                <span style={{ fontSize: 12, color: tok.textDisabled, minWidth: 72 }}>{k}</span>
                <span style={{ fontFamily: tok.mono, fontSize: 12, color: tok.textPrimary }}>
                  {v}
                </span>
              </div>
            ))}
            <div className="flex" style={{ gap: 8, marginTop: 6 }}>
              <Btn>Book Now</Btn>
              <Btn variant="ghost">View alternatives</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Wiring snippet ───────────────────────────────────────────────────────────

const wiring = `import { useRenderTool, useComponent, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

// --- Static display-only card (get_quote) ---
useRenderTool({
  name: "get_quote",
  parameters: z.object({
    ticker: z.string(),
    price: z.number().optional(),
    change: z.number().optional(),
  }),
  render: ({ status, args, result }) => {
    if (status === "inProgress") return <QuoteCardSkeleton ticker={args.ticker} />;
    if (status === "executing")  return <QuoteCard ticker={args.ticker} loading />;
    const data = result ? JSON.parse(result) : args;
    return <QuoteCard ticker={data.ticker} price={data.price} change={data.change} />;
  },
});

// --- Convenience wrapper via useComponent ---
useComponent({
  name: "show_flight",
  component: FlightCard,   // receives args as props; no handler needed
});

// --- Interactive HITL (confirm_send) — agent pauses until respond() is called ---
useHumanInTheLoop({
  name: "confirm_send",
  parameters: z.object({ to: z.string(), subject: z.string() }),
  render: ({ status, args, respond }) =>
    status === "executing" ? (
      <ApprovalCard
        {...args}
        onApprove={() => respond?.("approved")}
        onCancel={() => respond?.("rejected")}
      />
    ) : (
      <ApprovalCard {...args} disabled />
    ),
});

// --- Wildcard fallback — prevents raw JSON from ever appearing ---
// useDefaultRenderTool(); // zero-config generic card

// v1 equivalent: useCopilotAction({ name: "get_quote", parameters: [...], render: ... })`;

// ── Story ────────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      <Variant
        label="inProgress"
        hint="TOOL_CALL_ARGS streaming — shape-matched skeleton prevents layout shift"
      >
        <SkeletonCard />
      </Variant>

      <Variant
        label="executing"
        hint="args fully resolved; tool running — spinner, partial data visible"
      >
        <ExecutingCard />
      </Variant>

      <Variant label="complete" hint="result bound, provenance chip, prose follow-up">
        <QuoteCard />
      </Variant>

      <Variant
        label="interactive / HITL"
        hint="useHumanInTheLoop — agent paused until respond() fires"
      >
        <HitlCard />
      </Variant>

      <Variant
        label="collapsed / expanded"
        hint="toggle with aria-expanded; compact summary vs. full payload"
      >
        <CollapseCard />
      </Variant>

      <Note>
        Register a wildcard renderer (<code style={{ fontFamily: tok.mono }}>name: "*"</code>) or
        call <code style={{ fontFamily: tok.mono }}>useDefaultRenderTool()</code> so unmatched tool
        calls never fall back to raw JSON in the thread.
      </Note>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
