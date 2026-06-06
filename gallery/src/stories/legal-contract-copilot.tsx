import { useState } from "react";
import { Sparkles, ShieldAlert, ChevronRight, FileText, Lock } from "lucide-react";
import {
  Avatar,
  Bubble,
  Btn,
  Cite,
  CodeNote,
  Composer,
  Composes,
  Note,
  SectionLabel,
  Showcase,
  SourceCard,
  StatusDot,
  Tag,
  ToolLine,
  WindowFrame,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "legal-contract-copilot",
  title: "Legal Contract Copilot",
  category: "Examples",
  blurb:
    "A Harvey-style contract-review copilot docked beside an MSA — every claim cites its clause, and edits to executed terms gate on human sign-off.",
  copilotkit: "CopilotSidebar · useCopilotReadable · useRenderTool · useHumanInTheLoop",
  spec: "layouts/side-panel.md",
};

// ── Document work surface ────────────────────────────────────────────────────

function Clause({ n, title, children, risk }: { n: string; title: string; children: React.ReactNode; risk?: boolean }) {
  return (
    <div
      style={{
        borderLeft: risk ? `3px solid ${tok.warning}` : `3px solid transparent`,
        background: risk ? "var(--warning-soft)" : "transparent",
        borderRadius: risk ? 6 : 0,
        padding: risk ? "8px 12px" : "8px 0 8px 3px",
      }}
    >
      <div className="flex items-center" style={{ gap: 6, marginBottom: 4 }}>
        <span style={{ fontFamily: tok.mono, fontSize: 11, color: tok.textDisabled }}>{n}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: tok.textPrimary }}>{title}</span>
        {risk && (
          <span
            className="flex items-center"
            style={{ gap: 3, marginLeft: "auto", fontSize: 10.5, color: tok.warning, fontWeight: 600 }}
          >
            <ShieldAlert size={11} /> flagged
          </span>
        )}
      </div>
      <p style={{ fontSize: 12, lineHeight: "18px", color: tok.textSecondary, margin: 0 }}>{children}</p>
    </div>
  );
}

function DocumentSurface() {
  return (
    <div style={{ flex: 1, minWidth: 0, background: "var(--surface-main)", padding: "20px 22px", overflowY: "auto" }}>
      <div className="flex items-center" style={{ gap: 8, marginBottom: 4 }}>
        <FileText size={14} color={tok.textDisabled} />
        <span style={{ fontFamily: tok.mono, fontSize: 11, color: tok.textDisabled }}>Acme–Globex_MSA_v3.docx</span>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", margin: "6px 0 2px" }}>
        Master Services Agreement
      </h3>
      <p style={{ fontSize: 11.5, color: tok.textDisabled, margin: "0 0 16px" }}>
        Between Acme Corp. (“Provider”) and Globex Inc. (“Client”) · Effective Jan 1, 2026
      </p>

      <div className="flex flex-col" style={{ gap: 10 }}>
        <Clause n="§5.1" title="Fees & Payment">
          Client shall pay all undisputed invoices within thirty (30) days of receipt.
        </Clause>
        <Clause n="§7.2" title="Limitation of Liability" risk>
          Neither party’s aggregate liability shall exceed the total fees paid in the twelve (12) months preceding the
          claim.
        </Clause>
        <Clause n="§9.1" title="Indemnification" risk>
          Provider shall indemnify Client against any and all losses arising from the Services, without limitation.
        </Clause>
        <Clause n="§12.3" title="Governing Law">
          This Agreement is governed by the laws of the State of Delaware.
        </Clause>
      </div>

      <div
        className="flex items-center"
        style={{
          marginTop: 16,
          fontSize: 11,
          color: tok.indigo,
          background: "var(--indigo-soft)",
          borderRadius: 6,
          padding: "4px 8px",
          gap: 4,
          alignSelf: "flex-start",
          width: "fit-content",
        }}
      >
        <Sparkles size={11} /> Agent sees: this document
      </div>
    </div>
  );
}

// ── Copilot panel pieces ─────────────────────────────────────────────────────

function ThinkingLine() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: tok.container, border: `1px solid ${tok.grey300}`, borderRadius: 8, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          padding: "8px 10px",
          cursor: "pointer",
          fontFamily: tok.mono,
          fontSize: 11.5,
          color: tok.textSecondary,
        }}
      >
        <ChevronRight size={13} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
        Reviewed 14 clauses · flagged 3 conflicts · 4.2s
      </button>
      {open && (
        <div
          style={{
            fontSize: 11.5,
            lineHeight: "17px",
            color: tok.textDisabled,
            borderTop: `1px solid ${tok.grey300}`,
            padding: "8px 12px",
          }}
        >
          The §7.2 liability cap is mutual, but §9.1 grants Client an uncapped indemnity — so Provider’s exposure is
          effectively unlimited despite the cap. I’ll surface the conflict and propose aligning §9.1 to the §7.2 cap.
        </div>
      )}
    </div>
  );
}

function RedlineCard() {
  return (
    <div style={{ border: `1px solid ${tok.grey300}`, borderRadius: 8, overflow: "hidden", background: tok.container, flexShrink: 0 }}>
      <div
        className="flex items-center"
        style={{ gap: 6, padding: "7px 10px", borderBottom: `1px solid ${tok.grey300}`, background: "var(--fill-100)" }}
      >
        <span style={{ fontSize: 11.5, fontWeight: 600 }}>Suggested redline</span>
        <span style={{ fontFamily: tok.mono, fontSize: 10.5, color: tok.textDisabled }}>§9.1 Indemnification</span>
        <Tag mono>generative UI</Tag>
      </div>
      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6, fontSize: 12, lineHeight: "17px" }}>
        <span
          style={{
            background: "var(--error-soft)",
            color: tok.textSecondary,
            textDecoration: "line-through",
            borderRadius: 4,
            padding: "3px 6px",
          }}
        >
          …losses arising from the Services, without limitation.
        </span>
        <span style={{ background: "var(--success-soft)", borderRadius: 4, padding: "3px 6px" }}>
          …losses arising from the Services,{" "}
          <strong>subject to the limitation of liability in §7.2.</strong>
        </span>
        <span style={{ fontSize: 10.5, color: tok.textDisabled }}>
          Basis: aligns indemnity to the negotiated liability cap · 3 precedents
        </span>
      </div>
    </div>
  );
}

function ApprovalGate({ compact }: { compact?: boolean }) {
  return (
    <div
      style={{
        borderTop: `1px solid ${tok.grey300}`,
        borderRight: `1px solid ${tok.grey300}`,
        borderBottom: `1px solid ${tok.grey300}`,
        borderLeft: `3px solid ${tok.warning}`,
        borderRadius: 8,
        padding: compact ? 14 : 11,
        background: tok.container,
      }}
    >
      <div className="flex items-center" style={{ gap: 7, marginBottom: 6 }}>
        <Lock size={compact ? 15 : 13} color={tok.warning} />
        <span style={{ fontSize: compact ? 13.5 : 12.5, fontWeight: 600 }}>Apply redline to §9.1?</span>
      </div>
      <p style={{ fontSize: compact ? 12.5 : 11.5, lineHeight: "17px", color: tok.textSecondary, margin: "0 0 10px" }}>
        This edits an executed liability term. Changes to the contract require your sign-off before they’re written
        back.
      </p>
      <div className="flex items-center" style={{ gap: 8 }}>
        <Btn variant="ghost">Reject</Btn>
        <Btn>Approve & apply</Btn>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10.5, color: tok.textDisabled, fontFamily: tok.mono }}>logged to audit trail</span>
      </div>
    </div>
  );
}

function CopilotPanel() {
  return (
    <div
      style={{
        width: 360,
        minWidth: 360,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface-background)",
        borderLeft: `1px solid ${tok.grey300}`,
      }}
    >
      {/* header */}
      <div
        className="flex items-center"
        style={{ gap: 8, padding: "10px 14px", borderBottom: `1px solid ${tok.grey300}`, background: tok.container }}
      >
        <Sparkles size={14} color={tok.indigo} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Contract Copilot</span>
        <span
          className="flex items-center"
          style={{
            gap: 3,
            fontSize: 10.5,
            fontWeight: 600,
            color: tok.warning,
            background: "var(--warning-soft)",
            borderRadius: 9999,
            padding: "2px 8px",
          }}
        >
          <ShieldAlert size={11} /> 3 risks
        </span>
        <StatusDot state="done" />
      </div>

      {/* thread */}
      <div
        className="ck-scroll"
        style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}
      >
        <ThinkingLine />

        <Bubble role="user">Review this MSA for liability risk.</Bubble>

        <Bubble role="assistant" full>
          The §7.2 cap limits liability to one year of fees, but §9.1 grants an <strong>uncapped</strong> indemnity
          <Cite n={1} /> — the two conflict, so Provider’s exposure is effectively unlimited.<Cite n={2} /> I’d align the
          indemnity to the §7.2 cap.
        </Bubble>

        <ToolLine name="search_case_law" status="complete" summary="3 precedents" args={'query: "uncapped indemnity vs liability cap conflict"'}>
          <span>
            Top match: <span style={{ color: tok.indigo }}>Globex v. Initech (Del. Ch. 2023)</span> — uncapped indemnity
            held to override a mutual cap.
          </span>
        </ToolLine>

        <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
          <SourceCard n={1} domain="Acme–Globex MSA" title="§9.1 Indemnification — “without limitation”" />
          <SourceCard n={2} domain="casetext.com" title="Globex v. Initech — indemnity overrides liability cap" />
        </div>

        <RedlineCard />

        <ApprovalGate />

        <div
          className="flex items-center"
          style={{ gap: 6, fontSize: 10.5, color: tok.textDisabled, fontFamily: tok.mono, padding: "0 2px" }}
        >
          provenance: 1 clause · 2 sources · every claim traceable
        </div>
      </div>

      {/* composer */}
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${tok.grey300}` }}>
        <Composer placeholder="Ask about a clause…" />
      </div>
    </div>
  );
}

// ── Wiring ───────────────────────────────────────────────────────────────────

const wiring = `import { CopilotSidebar } from "@copilotkit/react-ui";
import {
  useCopilotReadable,
  useRenderTool,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

function ContractReview({ contract, onApplyRedline }) {
  // 1. Ground the agent in exactly what the reviewer sees.
  useCopilotReadable({
    description: "The contract under review, by clause",
    value: contract.clauses,
  });

  // 2. Render tool calls as cited, inspectable cards (provenance is non-negotiable in legal).
  useRenderTool({
    name: "search_case_law",
    parameters: z.object({ query: z.string() }),
    render: ({ status, args, result }) => (
      <ToolLine name="search_case_law" status={status} summary={result?.count + " precedents"}>
        {result?.cases.map((c) => <Cite key={c.id} source={c} />)}
      </ToolLine>
    ),
  });

  // 3. HITL gate — editing an executed term is high-stakes & hard to reverse,
  //    so the agent PAUSES for explicit sign-off (LangGraph interrupt under the hood).
  useHumanInTheLoop({
    name: "applyRedline",
    parameters: z.object({ clause: z.string(), replacement: z.string() }),
    render: ({ args, respond }) => (
      <ApprovalGate
        clause={args.clause}
        onApprove={() => { onApplyRedline(args); respond?.("approved"); }}
        onReject={() => respond?.("rejected")}
      />
    ),
  });

  return (
    <div style={{ display: "flex" }}>
      <DocumentSurface contract={contract} />
      <CopilotSidebar defaultOpen labels={{ title: "Contract Copilot" }} />
    </div>
  );
}

// AG-UI events in play:
// STATE_SNAPSHOT/DELTA → contract stays in sync as clauses change
// TOOL_CALL_*          → search_case_law card lifecycle
// CUSTOM (interrupt)   → applyRedline approval gate → resolve(approved|rejected)
// RUN_FINISHED         → settle; write the redline + audit entry`;

// ── Story ────────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      <SectionLabel>Live screen · Contract Copilot reviewing a Master Services Agreement</SectionLabel>
      <WindowFrame title="acme.legal — Contract Workspace">
        <div style={{ display: "flex", height: 560 }}>
          <DocumentSurface />
          <CopilotPanel />
        </div>
      </WindowFrame>
      <Note>
        A high-stakes vertical copilot. The agent is <strong>grounded</strong> in the open contract, reasons across
        clauses, and renders <strong>every claim with a citation</strong> back to the source clause or precedent — the
        defining trait of legal AI (Harvey, Hebbia). Because a contract edit is hard to reverse, the redline does not
        apply itself: it routes through a <strong>human-in-the-loop gate</strong> calibrated to the stakes, and the
        decision is written to an audit trail.
      </Note>

      <SectionLabel>High-stakes gate · calibrated to the irreversibility of the edit</SectionLabel>
      <div style={{ maxWidth: 440 }}>
        <ApprovalGate compact />
      </div>
      <Note>
        Stakes drive the affordance. A throwaway search needs no confirmation; rewriting an executed liability term
        demands an explicit, logged sign-off. Same component (<code style={{ fontFamily: tok.mono, fontSize: 12 }}>
        useHumanInTheLoop</code>), dialled up.
      </Note>

      <SectionLabel>Composes</SectionLabel>
      <Composes
        items={[
          { slug: "side-panel", label: "Side Panel", role: "Docked copilot rail beside the document work surface." },
          { slug: "thinking-reasoning", label: "Thinking / Reasoning", role: "Collapsible trace of the cross-clause analysis." },
          { slug: "chat-message", label: "Chat Message", role: "The reviewer ↔ agent transcript with inline citations." },
          { slug: "tool-call", label: "Tool Call", role: "search_case_law rendered as a glanceable, expandable line." },
          { slug: "web-research", label: "Citations / Provenance", role: "Source cards link each claim to its clause or precedent." },
          { slug: "generative-ui-inline", label: "Inline Generative UI", role: "The redline diff card the agent renders in-thread." },
          { slug: "human-in-the-loop", label: "Human-in-the-Loop", role: "High-stakes approval gate before any contract edit." },
          { slug: "agent-activity-traceability", label: "Activity & Traceability", role: "Provenance count + audit-logged decisions." },
        ]}
      />

      <CodeNote title="CopilotKit wiring · the assembled copilot" code={wiring} />
    </Showcase>
  );
}
