import { useState } from "react";
import { Check, X, ChevronDown, ChevronRight, AlertTriangle, RotateCcw } from "lucide-react";
import {
  Avatar,
  Btn,
  CodeNote,
  Field,
  Note,
  Showcase,
  Skeleton,
  StatusDot,
  Tag,
  ToolFrame,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "human-in-the-loop",
  title: "Human-in-the-Loop Prompt",
  category: "Human control",
  blurb:
    "Pause-for-human prompts — approval (yes/no), option selection, multi-step forms, and interrupt gating, calibrated to stakes.",
  copilotkit: "useHumanInTheLoop · useInterrupt",
  spec: "components/human-in-the-loop.md",
};

// ── Shared prompt shell ─────────────────────────────────────────────────────
function PromptShell({
  question,
  preview,
  children,
  badge,
}: {
  question: string;
  preview: React.ReactNode;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderTop: `1px solid ${tok.grey300}`,
        borderRight: `1px solid ${tok.grey300}`,
        borderBottom: `1px solid ${tok.grey300}`,
        borderLeft: `3px solid ${tok.indigo}`,
        borderRadius: 8,
        overflow: "hidden",
        background: tok.container,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center"
        style={{ gap: 10, padding: "10px 14px", borderBottom: `1px solid ${tok.grey300}` }}
      >
        <Avatar role="agent" size={24} />
        <span style={{ fontSize: 13, fontWeight: 500, color: tok.textPrimary, flex: 1 }}>
          {question}
        </span>
        {badge}
      </div>
      {/* Preview pane */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: `1px solid ${tok.grey300}`,
          background: tok.grey200,
          fontSize: 13,
          color: tok.textSecondary,
          lineHeight: "20px",
        }}
      >
        {preview}
      </div>
      {/* Input surface */}
      <div style={{ padding: "12px 14px" }}>{children}</div>
    </div>
  );
}

// ── Wiring snippet ──────────────────────────────────────────────────────────
const wiring = `import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { useInterrupt } from "@copilotkit/react-core";
import { z } from "zod";

// Variant 1 — Approval gate
useHumanInTheLoop({
  name: "confirm_destructive_action",
  parameters: z.object({
    action: z.string().describe("Plain-language description"),
    targetResource: z.string(),
    irreversible: z.boolean(),
  }),
  render: ({ status, args, respond }) => {
    if (status !== "executing" || !respond) return <ApprovalCard {...args} disabled />;
    return (
      <ApprovalCard
        {...args}
        onApprove={() => respond({ approved: true })}
        onReject={(reason) => respond({ approved: false, reason })}
      />
    );
  },
});

// Variant 2 — Option selection
useHumanInTheLoop({
  name: "clarify_audience",
  parameters: z.object({
    question: z.string(),
    options: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
  render: ({ status, args, respond }) =>
    status === "executing" && respond ? (
      <OptionChips
        question={args.question}
        options={args.options}
        onSelect={(value) => respond({ selected: value })}
      />
    ) : null,
});

// Variant 4 — Framework interrupt (LangGraph interrupt() node)
useInterrupt({
  enabled: ({ eventValue }) =>
    eventValue.type === "approval" || eventValue.type === "input_required",
  render: ({ event, resolve }) => (
    <ApproveComponent
      content={event.value.content}
      schema={event.value.responseSchema}
      onAnswer={(answer) => resolve(answer)}
    />
  ),
});

// v1 equivalent: useCopilotAction({ name, parameters: [...], renderAndWaitForResponse })`;

// ── Story ───────────────────────────────────────────────────────────────────
export default function Story() {
  // Variant 1 — approval interactive state
  const [approvalState, setApprovalState] = useState<"awaiting" | "approved" | "rejected">(
    "awaiting"
  );

  // Variant 2 — option selection state
  const [selected, setSelected] = useState<string | null>(null);

  // Variant 3 — wizard step state
  const [step, setStep] = useState(0);
  const [formVals, setFormVals] = useState({ recipient: "", amount: "", memo: "" });

  return (
    <Showcase>
      {/* ── Variant 1: Awaiting-decision — Approval gate ── */}
      <Variant
        label="approval — awaiting-decision"
        hint="agent paused; default focus on the safer choice"
      >
        <PromptShell
          question="Send this email to 1,842 subscribers?"
          preview={
            <div className="flex flex-col" style={{ gap: 4 }}>
              <div>
                <span style={{ color: tok.textDisabled }}>To: </span>segment:active-users (1,842)
              </div>
              <div>
                <span style={{ color: tok.textDisabled }}>Subject: </span>
                "Q2 Product Update — What's new in June"
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <AlertTriangle size={13} color={tok.warning} />
                <span style={{ fontSize: 12, color: tok.warning }}>
                  Cannot be unsent after delivery
                </span>
              </div>
            </div>
          }
          badge={
            approvalState === "awaiting" ? (
              <StatusDot state="waiting" label="awaiting decision" />
            ) : approvalState === "approved" ? (
              <StatusDot state="done" label="approved" />
            ) : (
              <StatusDot state="error" label="rejected" />
            )
          }
        >
          {approvalState === "awaiting" ? (
            <div className="flex items-center" style={{ gap: 8 }}>
              {/* Reject is default-focus (safer) */}
              <Btn variant="ghost" onClick={() => setApprovalState("rejected")}>
                <span className="flex items-center" style={{ gap: 5 }}>
                  <X size={13} /> Reject
                </span>
              </Btn>
              <Btn variant="primary" onClick={() => setApprovalState("approved")}>
                <span className="flex items-center" style={{ gap: 5 }}>
                  <Check size={13} /> Approve
                </span>
              </Btn>
              <button
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: tok.textDisabled,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                Always allow <ChevronDown size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center" style={{ gap: 8 }}>
              <span
                style={{
                  fontSize: 13,
                  color: approvalState === "approved" ? tok.success : tok.error,
                  fontWeight: 500,
                }}
              >
                {approvalState === "approved"
                  ? "Approved — agent resuming…"
                  : "Rejected — agent will replan"}
              </span>
              <button
                onClick={() => setApprovalState("awaiting")}
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: tok.textDisabled,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <RotateCcw size={12} /> Reset demo
              </button>
            </div>
          )}
        </PromptShell>
      </Variant>

      {/* ── Variant 2: Option selection ── */}
      <Variant label="option selection" hint="single-select chips; commits on tap">
        <PromptShell
          question="Which audience should I target for the campaign?"
          preview={
            <span>
              The agent needs to know which segment to address before writing copy. Select one to
              proceed.
            </span>
          }
          badge={
            selected ? (
              <StatusDot state="done" label="selected" />
            ) : (
              <StatusDot state="waiting" label="awaiting decision" />
            )
          }
        >
          <div className="flex flex-col" style={{ gap: 10 }}>
            <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
              {["Enterprise (500+)", "Mid-market (50–500)", "SMB (<50)", "All segments"].map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelected(opt)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 20,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      border: `1px solid ${selected === opt ? tok.indigo : tok.border}`,
                      background: selected === opt ? "var(--indigo-soft)" : tok.container,
                      color: selected === opt ? tok.indigo : tok.textPrimary,
                      fontWeight: selected === opt ? 500 : 400,
                    }}
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
            {selected ? (
              <div
                className="flex items-center"
                style={{ gap: 6, fontSize: 12, color: tok.success }}
              >
                <Check size={12} />
                <span>
                  "{selected}" sent to agent — run resuming
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: tok.textDisabled }}>
                Or type a custom segment…
              </span>
            )}
          </div>
        </PromptShell>
      </Variant>

      {/* ── Variant 3: Multi-step form / wizard ── */}
      <Variant label="multi-step form" hint="progressive disclosure; review before submit">
        <PromptShell
          question={`Enter wire transfer details — Step ${step + 1}/3`}
          preview={
            <div className="flex items-center" style={{ gap: 8 }}>
              {["Recipient", "Amount", "Review"].map((s, i) => (
                <div key={s} className="flex items-center" style={{ gap: 6 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 9999,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      background: i < step ? tok.success : i === step ? tok.indigo : tok.bg,
                      color: i <= step ? "var(--surface-container)" : tok.textDisabled,
                    }}
                  >
                    {i < step ? <Check size={11} /> : i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: i === step ? tok.textPrimary : tok.textDisabled,
                    }}
                  >
                    {s}
                  </span>
                  {i < 2 && <ChevronRight size={12} color={tok.textDisabled} />}
                </div>
              ))}
            </div>
          }
          badge={<StatusDot state="waiting" label="collecting input" />}
        >
          {step === 0 && (
            <div className="flex flex-col" style={{ gap: 12 }}>
              <Field
                label="Recipient account"
                value={formVals.recipient}
                placeholder="e.g. ACME Corp — ****4821"
              />
              <div className="flex" style={{ gap: 8, justifyContent: "flex-end" }}>
                <Btn
                  variant="primary"
                  onClick={() => {
                    setFormVals((v) => ({ ...v, recipient: "ACME Corp — ****4821" }));
                    setStep(1);
                  }}
                >
                  Next
                </Btn>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="flex flex-col" style={{ gap: 12 }}>
              <Field label="Amount (USD)" value={formVals.amount} placeholder="e.g. 25,000.00" />
              <Field label="Memo" value={formVals.memo} placeholder="Invoice #2940" />
              <div className="flex" style={{ gap: 8, justifyContent: "flex-end" }}>
                <Btn variant="ghost" onClick={() => setStep(0)}>
                  Back
                </Btn>
                <Btn
                  variant="primary"
                  onClick={() => {
                    setFormVals((v) => ({ ...v, amount: "25,000.00", memo: "Invoice #2940" }));
                    setStep(2);
                  }}
                >
                  Next
                </Btn>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col" style={{ gap: 12 }}>
              <div
                style={{
                  background: tok.grey200,
                  borderRadius: 6,
                  padding: "10px 12px",
                  fontSize: 13,
                  lineHeight: "22px",
                }}
              >
                <div>
                  <span style={{ color: tok.textDisabled }}>To: </span>
                  {formVals.recipient || "ACME Corp — ****4821"}
                </div>
                <div>
                  <span style={{ color: tok.textDisabled }}>Amount: </span>
                  ${formVals.amount || "25,000.00"} USD
                </div>
                <div>
                  <span style={{ color: tok.textDisabled }}>Memo: </span>
                  {formVals.memo || "Invoice #2940"}
                </div>
              </div>
              <div
                className="flex items-center"
                style={{ gap: 5, fontSize: 12, color: tok.warning }}
              >
                <AlertTriangle size={12} />
                Wire transfers cannot be reversed once initiated.
              </div>
              <div className="flex" style={{ gap: 8, justifyContent: "flex-end" }}>
                <Btn variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => {
                    setStep(0);
                    setFormVals({ recipient: "", amount: "", memo: "" });
                  }}
                >
                  Confirm transfer
                </Btn>
              </div>
            </div>
          )}
        </PromptShell>
      </Variant>

      {/* ── Variant 4: Streaming / inProgress — args still arriving ── */}
      <Variant
        label="streaming — args arriving"
        hint="controls disabled while the agent fills the proposal"
      >
        <ToolFrame name="confirm_destructive_action" status="inProgress" args="action: ▍">
          <div className="flex flex-col" style={{ gap: 10 }}>
            <Skeleton w="70%" h={13} />
            <Skeleton w="50%" h={13} />
            <div className="flex" style={{ gap: 8, marginTop: 4 }}>
              <Tag>Reject</Tag>
              <Tag>Approve</Tag>
            </div>
            <span style={{ fontSize: 12, color: tok.textDisabled }}>
              Waiting for agent to finish describing the action…
            </span>
          </div>
        </ToolFrame>
      </Variant>

      {/* ── Variant 5: Expired ── */}
      <Variant label="expired" hint="TTL passed — re-run affordance">
        <div
          style={{
            borderTop: `1px solid ${tok.grey300}`,
            borderRight: `1px solid ${tok.grey300}`,
            borderBottom: `1px solid ${tok.grey300}`,
            borderLeft: `3px solid ${tok.textDisabled}`,
            borderRadius: 8,
            padding: "14px 16px",
            background: tok.container,
          }}
        >
          <div className="flex items-center" style={{ gap: 10 }}>
            <Avatar role="agent" size={24} />
            <div className="flex flex-col" style={{ flex: 1, gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: tok.textPrimary }}>
                Send email to 1,842 subscribers?
              </span>
              <span style={{ fontSize: 12, color: tok.textDisabled }}>
                This request expired — the agent's approval window closed 2 h ago.
              </span>
            </div>
            <StatusDot state="idle" label="expired" />
          </div>
          <div style={{ marginTop: 12 }}>
            <Btn variant="ghost">
              <span className="flex items-center" style={{ gap: 5 }}>
                <RotateCcw size={13} /> Re-run agent
              </span>
            </Btn>
          </div>
        </div>
      </Variant>

      <Note>
        Calibrate friction to stakes: one-click for reversible actions, typed confirmation for
        destructive ones. Always show the exact target resource and consequence before the buttons
        appear — a vague "Proceed?" prompt trains users to approve blindly.
      </Note>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
