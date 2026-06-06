import { useState } from "react";
import { Check, ChevronRight, Circle, Globe, Sparkles } from "lucide-react";
import {
  Avatar,
  Caret,
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
  WindowFrame,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "research-workspace",
  title: "Deep-Research Workspace",
  category: "Examples",
  blurb:
    "A Perplexity/Deep-Research-style full-page agent: a live plan, parallel sub-agents, a streaming cited report, and a generative comparison table.",
  copilotkit: "useAgent · useCoAgentStateRender · useRenderTool",
  spec: "layouts/main-panel.md",
};

// ── Plan + sub-agents ────────────────────────────────────────────────────────

type StepState = "done" | "running" | "queued";

function PlanStep({ state, label }: { state: StepState; label: string }) {
  const icon =
    state === "done" ? (
      <Check size={13} color={tok.success} strokeWidth={2.5} />
    ) : state === "running" ? (
      <span className="ck-pulse" style={{ width: 9, height: 9, borderRadius: 9999, background: tok.indigo, display: "inline-block" }} />
    ) : (
      <Circle size={12} color={tok.textDisabled} />
    );
  return (
    <div className="flex items-center" style={{ gap: 9, padding: "5px 0" }}>
      <span style={{ width: 14, display: "inline-flex", justifyContent: "center", flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          fontSize: 12.5,
          color: state === "queued" ? tok.textDisabled : tok.textPrimary,
          textDecoration: state === "done" ? "none" : "none",
        }}
      >
        {label}
      </span>
      {state === "running" && (
        <span style={{ marginLeft: "auto", fontSize: 10.5, color: tok.indigo, fontFamily: tok.mono }}>working…</span>
      )}
    </div>
  );
}

function ResearchPlan() {
  return (
    <div style={{ border: `1px solid ${tok.grey300}`, borderRadius: 10, overflow: "hidden", background: tok.container }}>
      <div
        className="flex items-center"
        style={{ gap: 7, padding: "9px 12px", borderBottom: `1px solid ${tok.grey300}`, background: "var(--fill-100)" }}
      >
        <Sparkles size={13} color={tok.indigo} />
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>Research plan</span>
        <span style={{ marginLeft: "auto" }}>
          <StatusDot state="running" label="2 / 4" />
        </span>
      </div>
      <div style={{ padding: "6px 12px" }}>
        <PlanStep state="done" label="Size the EU total addressable market" />
        <PlanStep state="done" label="Map the top 5 incumbent competitors" />
        <PlanStep state="running" label="Assess GDPR & regulatory requirements" />
        <PlanStep state="queued" label="Synthesize a go / no-go recommendation" />
      </div>
    </div>
  );
}

function SubAgents() {
  const agents: { name: string; state: "done" | "running" }[] = [
    { name: "Market sizing", state: "done" },
    { name: "Competitor scan", state: "done" },
    { name: "Regulatory", state: "running" },
  ];
  return (
    <div className="flex flex-wrap" style={{ gap: 8 }}>
      {agents.map((a) => (
        <div
          key={a.name}
          className="flex items-center"
          style={{
            gap: 7,
            fontSize: 12,
            padding: "5px 10px",
            borderRadius: 9999,
            border: `1px solid ${tok.grey300}`,
            background: tok.container,
          }}
        >
          <Avatar role="agent" size={16} />
          {a.name}
          <StatusDot state={a.state} />
        </div>
      ))}
    </div>
  );
}

// ── Thinking trace ───────────────────────────────────────────────────────────

function ThinkingLine() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "none",
          padding: "2px 0",
          cursor: "pointer",
          fontFamily: tok.mono,
          fontSize: 11.5,
          color: tok.textSecondary,
        }}
      >
        <ChevronRight size={13} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
        Thought about market-entry trade-offs · 6s
      </button>
      {open && (
        <div
          style={{
            fontSize: 11.5,
            lineHeight: "17px",
            color: tok.textDisabled,
            borderLeft: `2px solid ${tok.grey300}`,
            paddingLeft: 10,
            marginTop: 4,
          }}
        >
          TAM is large but fragmented by country. The deciding factor is regulatory cost, so I’m weighting the GDPR
          sub-agent’s findings most heavily before recommending.
        </div>
      )}
    </div>
  );
}

// ── Generative-UI report + comparison table ──────────────────────────────────

function CompareTable() {
  const rows = [
    ["Globex", "Strong (DE, FR)", "~24%", "Enterprise"],
    ["Initech", "Moderate (UK)", "~11%", "Mid-market"],
    ["Hooli", "Entering 2026", "—", "Freemium"],
  ];
  return (
    <div style={{ border: `1px solid ${tok.grey300}`, borderRadius: 8, overflow: "hidden", margin: "10px 0" }}>
      <div className="flex items-center" style={{ gap: 6, padding: "6px 10px", background: "var(--fill-100)", borderBottom: `1px solid ${tok.grey300}` }}>
        <Tag mono>generative UI</Tag>
        <span style={{ fontSize: 11.5, color: tok.textDisabled }}>Competitor landscape · synthesized from 8 sources</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: tok.container }}>
            {["Competitor", "EU presence", "Est. share", "Pricing"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "7px 10px",
                  fontWeight: 600,
                  color: tok.textSecondary,
                  borderBottom: `1px solid ${tok.grey300}`,
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r[0]} style={{ background: i % 2 ? "var(--fill-100)" : tok.container }}>
              {r.map((c, j) => (
                <td
                  key={j}
                  style={{ padding: "7px 10px", color: j === 0 ? tok.textPrimary : tok.textSecondary, fontWeight: j === 0 ? 600 : 400 }}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Report() {
  return (
    <div>
      <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>Findings</h4>
      <p style={{ fontSize: 13, lineHeight: "21px", color: tok.textPrimary, margin: "0 0 4px" }}>
        The EU represents a <strong>€2.4B</strong> addressable market growing ~14% YoY,<Cite n={1} /> but it’s
        fragmented across national regulators. Germany and France account for over half of incumbent revenue.<Cite n={2} />
      </p>
      <CompareTable />
      <p style={{ fontSize: 13, lineHeight: "21px", color: tok.textPrimary, margin: 0 }}>
        Regulatory load is the swing factor: GDPR plus the AI Act add an estimated 4–6 months of compliance work before
        launch<Cite n={3} /> <Caret />
      </p>
    </div>
  );
}

// ── Wiring ───────────────────────────────────────────────────────────────────

const wiring = `import { useAgent, useCoAgentStateRender } from "@copilotkit/react-core/v2";

function ResearchWorkspace() {
  // The full-page agent IS the product — drive its run + read shared state.
  const { state, running } = useAgent({ name: "deep_research" });

  // Render the agent's evolving plan + sub-agent fan-out from SHARED STATE
  // (STATE_SNAPSHOT / STATE_DELTA), so the UI is the same source of truth.
  useCoAgentStateRender({
    name: "deep_research",
    render: ({ state }) => (
      <>
        <ResearchPlan steps={state.plan} />
        <SubAgents agents={state.workers} />
      </>
    ),
  });

  return (
    <main>
      <ResearchPlan steps={state.plan} />
      <SubAgents agents={state.workers} />
      <Report blocks={state.report} sources={state.sources} />
      <Composer placeholder="Ask a follow-up about this research…" disabled={running} />
    </main>
  );
}

// AG-UI events in play:
// STATE_SNAPSHOT      → seed plan + sub-agent roster
// STATE_DELTA         → tick steps done→running→queued live
// TEXT_MESSAGE_*      → stream the report tokens with the caret
// TOOL_CALL_* (search)→ append source cards as they resolve
// RUN_FINISHED        → mark plan complete, enable follow-ups`;

// ── Story ────────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      <SectionLabel>Live screen · a deep-research run in progress</SectionLabel>
      <WindowFrame title="research.acme.ai">
        <div style={{ height: 620, overflowY: "auto", background: "var(--surface-main)" }} className="ck-scroll">
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 28px 90px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <span style={{ fontFamily: tok.mono, fontSize: 11, color: tok.textDisabled }}>DEEP RESEARCH</span>
              <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em", margin: "4px 0 0" }}>
                Should we enter the EU market in 2026?
              </h3>
            </div>

            <ResearchPlan />
            <SubAgents />
            <ThinkingLine />
            <Report />

            <div className="flex flex-wrap" style={{ gap: 8 }}>
              <SourceCard n={1} domain="statista.com" title="EU SaaS market size & growth, 2026 outlook" />
              <SourceCard n={2} domain="gartner.com" title="Western Europe competitive landscape" />
              <SourceCard n={3} domain="europa.eu" title="AI Act — compliance timelines for providers" />
            </div>

            <div
              className="flex items-center"
              style={{ gap: 6, fontSize: 10.5, color: tok.textDisabled, fontFamily: tok.mono }}
            >
              <Globe size={12} /> 14 sources · 3 sub-agents · 38s elapsed
            </div>

            <Composer placeholder="Ask a follow-up about this research…" />
          </div>
        </div>
      </WindowFrame>
      <Note>
        Here the AI <strong>is</strong> the product — a full-page surface, not a panel bolted onto something else. The
        run is legible end to end: a <strong>plan</strong> that ticks through its steps, <strong>parallel sub-agents</strong>{" "}
        fanned out per question, and a <strong>streaming report</strong> whose every claim carries a citation. The plan
        and worker roster are driven from <strong>shared agent state</strong>, so the screen and the run never drift
        apart.
      </Note>

      <SectionLabel>Composes</SectionLabel>
      <Composes
        items={[
          { slug: "main-panel", label: "Main Panel", role: "Full-page surface where the agent is the whole app." },
          { slug: "deep-research", label: "Deep Research", role: "The live plan + step progress for a long-running run." },
          { slug: "sub-agents", label: "Sub-Agents", role: "Parallel workers, one per research question, with status." },
          { slug: "thinking-reasoning", label: "Thinking / Reasoning", role: "Collapsible trace of how findings are weighted." },
          { slug: "web-research", label: "Web Research", role: "Source cards + inline citations behind every claim." },
          { slug: "generative-ui-inline", label: "Inline Generative UI", role: "The synthesized competitor comparison table." },
          { slug: "agent-activity-traceability", label: "Activity & Traceability", role: "Sources / agents / elapsed-time provenance bar." },
          { slug: "chat-message", label: "Chat Message", role: "The follow-up composer to interrogate the report." },
        ]}
      />

      <CodeNote title="CopilotKit wiring · the assembled workspace" code={wiring} />
    </Showcase>
  );
}
