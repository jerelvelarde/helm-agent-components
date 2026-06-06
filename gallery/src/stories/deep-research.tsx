import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Globe, Play, RotateCcw, Sparkles } from "lucide-react";
import {
  Avatar,
  Btn,
  Caret,
  Cite,
  CodeNote,
  Composer,
  Note,
  SectionLabel,
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
  slug: "deep-research",
  title: "Deep Research",
  category: "Multi-agent & research",
  blurb: "Long-running research agents — plan display, live progress, multi-source cited report generation.",
  copilotkit: "useAgent · STATE_DELTA",
  spec: "components/deep-research.md",
};

// ─── Plan Proposed ──────────────────────────────────────────────────────────

const PLAN_TOPICS = [
  "Renewable energy policy landscape (2023–2025)",
  "Grid-scale storage: lithium vs. alternative chemistries",
  "Permitting reform and regulatory bottlenecks",
  "Levelized cost trends: solar, wind, offshore",
  "Corporate PPA market and Fortune 500 commitments",
];

function PlanCard() {
  const [topics, setTopics] = useState(PLAN_TOPICS);
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        <Avatar role="agent" size={24} />
        <span style={{ fontSize: 13, color: tok.textSecondary }}>
          Research plan ready — review and start when satisfied
        </span>
      </div>
      <div
        style={{
          background: tok.grey200,
          border: `1px solid ${tok.border}`,
          borderRadius: 8,
          padding: 12,
        }}
      >
        {topics.map((t, i) => (
          <div key={i} className="flex items-center" style={{ gap: 8, marginBottom: i < topics.length - 1 ? 8 : 0 }}>
            <span style={{ fontSize: 12, color: tok.textDisabled, fontFamily: tok.mono, minWidth: 16 }}>
              {i + 1}.
            </span>
            <span style={{ flex: 1, fontSize: 13, color: tok.textPrimary }}>{t}</span>
            <button
              aria-label={`Remove topic ${i + 1}`}
              onClick={() => setTopics((prev) => prev.filter((_, j) => j !== i))}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 14,
                color: tok.textDisabled,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center" style={{ gap: 8 }}>
        <Btn variant="primary">
          <span className="flex items-center" style={{ gap: 6 }}>
            <Play size={13} /> Start research
          </span>
        </Btn>
        <Btn variant="ghost">Cancel</Btn>
        <span style={{ flex: 1 }} />
        <Tag mono>~12 min</Tag>
        <Tag>5 sub-topics</Tag>
      </div>
    </div>
  );
}

// ─── Activity Feed ───────────────────────────────────────────────────────────

const FEED_STEPS = [
  { label: "Query issued", detail: '"renewable energy policy 2024 regulatory"', done: true },
  { label: "Reading", detail: "iea.org/reports/world-energy-outlook-2024", done: true },
  { label: "Reading", detail: "energy.gov/eere/solar/solar-energy-grid-storage", done: true },
  { label: "Query issued", detail: '"grid-scale battery storage cost trends"', done: false, active: true },
  { label: "Reading", detail: "nrel.gov/publications/…", done: false, active: false },
];

function FeedRow({ step }: { step: (typeof FEED_STEPS)[number] }) {
  return (
    <div className="flex items-start" style={{ gap: 8, padding: "5px 0" }}>
      <StatusDot state={step.done ? "done" : step.active ? "running" : "idle"} />
      <span style={{ fontSize: 12, color: tok.textSecondary, minWidth: 60 }}>{step.label}</span>
      <span
        style={{
          flex: 1,
          fontSize: 12,
          fontFamily: tok.mono,
          color: step.active ? tok.indigo : tok.textDisabled,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {step.detail}
      </span>
    </div>
  );
}

function SubTopicRow({ label, pct }: { label: string; pct: number }) {
  const done = pct >= 100;
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <StatusDot state={done ? "done" : pct > 0 ? "running" : "idle"} />
      <span style={{ fontSize: 12, color: tok.textSecondary, flex: 1 }}>{label}</span>
      <div
        style={{
          width: 80,
          height: 4,
          borderRadius: 99,
          background: tok.grey300,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 99,
            background: done ? tok.success : tok.indigo,
          }}
        />
      </div>
    </div>
  );
}

function ActivityPanel() {
  const [showThinking, setShowThinking] = useState(false);
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        <StatusDot state="running" label="Researching" />
        <span style={{ flex: 1 }} />
        <Tag>23 sources read</Tag>
      </div>

      <div>
        <SectionLabel>Sub-topics</SectionLabel>
        <div className="flex flex-col" style={{ gap: 6 }}>
          <SubTopicRow label="Renewable energy policy" pct={100} />
          <SubTopicRow label="Grid-scale storage" pct={62} />
          <SubTopicRow label="Permitting reform" pct={18} />
          <SubTopicRow label="LCOE trends" pct={0} />
        </div>
      </div>

      <div>
        <SectionLabel>Activity feed</SectionLabel>
        <div style={{ borderLeft: `2px solid ${tok.grey300}`, paddingLeft: 10 }}>
          {FEED_STEPS.map((s, i) => (
            <FeedRow key={i} step={s} />
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowThinking((v) => !v)}
        aria-expanded={showThinking}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          color: tok.textSecondary,
          padding: 0,
        }}
      >
        {showThinking ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        Show thinking
      </button>
      {showThinking && (
        <div
          style={{
            background: tok.grey200,
            border: `1px solid ${tok.border}`,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
            color: tok.textSecondary,
            lineHeight: "18px",
          }}
        >
          Completed sub-topic 1. IEA data confirms strong YoY deployment growth. Moving to
          grid-scale storage — NREL cost projections appear more optimistic than Bloomberg
          NEF; flagging for synthesis. <Caret />
        </div>
      )}
    </div>
  );
}

// ─── Synthesizing ────────────────────────────────────────────────────────────

function SynthesizingPanel() {
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        <StatusDot state="running" label="Synthesizing & verifying" />
        <span style={{ flex: 1 }} />
        <Tag>47 sources</Tag>
      </div>
      <ToolFrame name="synthesize_section" status="executing" args='section: "Executive Summary"' />
      <div>
        <SectionLabel>Report (streaming)</SectionLabel>
        <div
          style={{
            background: tok.grey200,
            border: `1px solid ${tok.border}`,
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>Executive Summary</p>
          <p style={{ fontSize: 13, lineHeight: "20px", margin: 0, color: tok.textPrimary }}>
            Global renewable capacity additions reached a record 473 GW in 2024,
            <Cite n={1} /> driven by accelerated solar deployment in the US, EU, and India.
            Grid-scale storage installations grew 85% YoY
            <Cite n={2} /> as battery costs continued their decline toward $75/kWh.
            <Caret />
          </p>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton h={11} />
            <Skeleton w="75%" h={11} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Report Ready ────────────────────────────────────────────────────────────

const SOURCES = [
  { n: 1, domain: "iea.org", title: "World Energy Outlook 2024" },
  { n: 2, domain: "nrel.gov", title: "Grid-Scale Battery Cost Projections" },
  { n: 3, domain: "energy.gov", title: "Solar Market Insight Q4 2024" },
  { n: 4, domain: "bloomberg.com", title: "NEF Annual Energy Storage Outlook" },
];

function ReportPanel() {
  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        <StatusDot state="done" label="Report ready" />
        <span style={{ flex: 1 }} />
        <Btn variant="ghost">
          <span className="flex items-center" style={{ gap: 5 }}>
            <FileText size={13} /> Export PDF
          </span>
        </Btn>
        <Btn variant="ghost">
          <span className="flex items-center" style={{ gap: 5 }}>
            <Globe size={13} /> Share
          </span>
        </Btn>
      </div>

      <div
        style={{
          background: tok.grey200,
          border: `1px solid ${tok.border}`,
          borderRadius: 8,
          padding: "14px 16px",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px", color: tok.textPrimary }}>
          Executive Summary
        </p>
        <p style={{ fontSize: 13, lineHeight: "20px", margin: "0 0 12px", color: tok.textPrimary }}>
          Global renewable capacity additions reached a record 473 GW in 2024,
          <Cite n={1} /> driven by accelerated solar deployment in the US, EU, and India.
          Grid-scale storage grew 85% YoY
          <Cite n={2} /> as battery costs fell toward $75/kWh.
          Permitting bottlenecks remain the primary constraint in Western markets.
          <Cite n={3} />
        </p>
        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 6px", color: tok.textPrimary }}>
          Section 1 — Policy Landscape
        </p>
        <p style={{ fontSize: 13, lineHeight: "20px", margin: 0, color: tok.textSecondary }}>
          The Inflation Reduction Act extended domestic manufacturing incentives through 2032.
          <Cite n={4} /> EU member states finalized Net-Zero Industry Act targets, requiring
          40% domestic clean-tech production capacity by 2030…
        </p>
      </div>

      <div>
        <SectionLabel>Sources</SectionLabel>
        <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
          {SOURCES.map((s) => (
            <SourceCard key={s.n} n={s.n} domain={s.domain} title={s.title} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Error / Partial ─────────────────────────────────────────────────────────

function ErrorPanel() {
  return (
    <div className="flex flex-col" style={{ gap: 10 }}>
      <div
        style={{
          background: "var(--error-soft)",
          border: `1px solid ${tok.error}`,
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <StatusDot state="error" />
        <span style={{ fontSize: 13, color: tok.error, flex: 1 }}>
          Run timed out after 18 min — 3 of 5 sub-topics completed.
        </span>
        <Btn variant="ghost">
          <span className="flex items-center" style={{ gap: 5 }}>
            <RotateCcw size={13} /> Retry
          </span>
        </Btn>
      </div>
      <div>
        <SectionLabel>Partial results — 31 sources consulted</SectionLabel>
        <div className="flex flex-col" style={{ gap: 6 }}>
          <SubTopicRow label="Renewable energy policy" pct={100} />
          <SubTopicRow label="Grid-scale storage" pct={100} />
          <SubTopicRow label="Permitting reform" pct={100} />
          <SubTopicRow label="LCOE trends" pct={0} />
          <SubTopicRow label="Corporate PPA market" pct={0} />
        </div>
      </div>
      <div
        style={{
          background: tok.grey200,
          border: `1px solid ${tok.border}`,
          borderRadius: 8,
          padding: "12px 14px",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>
          Partial Report (3 sections available)
        </p>
        <p style={{ fontSize: 13, lineHeight: "20px", margin: 0, color: tok.textSecondary }}>
          Completed sub-topics are available below. LCOE trends and corporate PPA sections
          were not reached — retry to complete the report.
          <Cite n={1} />
          <Cite n={2} />
        </p>
      </div>
    </div>
  );
}

// ─── Wiring ──────────────────────────────────────────────────────────────────

const wiring = `import { useInterrupt } from "@copilotkit/react-core";
import { useAgent } from "@copilotkit/react-core/v2";
import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

// 1. Plan-approval gate (framework interrupt)
useInterrupt({
  enabled: ({ eventValue }) => eventValue.type === "plan_approval",
  render: ({ event, resolve }) => (
    <ResearchPlanCard
      plan={event.value.plan}
      onApprove={(edited) => resolve({ approved: true, plan: edited })}
      onCancel={() => resolve({ approved: false })}
    />
  ),
});

// 2. Live progress from shared state (STATE_SNAPSHOT / STATE_DELTA)
const { agent } = useAgent({ agentId: "deep-research-agent" });
const { steps, subTopics } = agent.state as DeepResearchState;
// Render <ActivityFeed steps={steps} subTopics={subTopics} />

// 3. Per-source tool-call cards in the activity feed
useRenderTool({
  name: "read_source",
  parameters: z.object({ url: z.string(), query: z.string() }),
  render: ({ status, args }) => (
    <SourceCard
      url={args.url}
      query={args.query}
      isReading={status === "executing"}
      isDone={status === "complete"}
    />
  ),
});

// v1 equivalents:
// Plan gate  → useCopilotAction({ renderAndWaitForResponse })
// Live state → useCoAgent({ name: "deep-research-agent", initialState })`;

// ─── Story ───────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      <Variant label="idle" hint="prompt input before a run is started">
        <div className="flex flex-col" style={{ gap: 10 }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 2 }}>
            <Sparkles size={15} color={tok.indigo} />
            <span style={{ fontSize: 13, fontWeight: 500, color: tok.textPrimary }}>Deep Research</span>
            <Tag selected>Mode</Tag>
          </div>
          <Composer
            value="What is the current state of renewable energy policy and grid-scale storage adoption globally?"
            placeholder="Ask a research question…"
          />
          <div className="flex" style={{ gap: 6 }}>
            <Tag>Competitive analysis</Tag>
            <Tag>Literature review</Tag>
            <Tag>Regulatory scan</Tag>
          </div>
        </div>
      </Variant>

      <Variant label="plan proposed" hint="editable sub-topic outline; run gated behind explicit approval">
        <PlanCard />
      </Variant>

      <Variant label="researching" hint="live activity feed with per-sub-topic progress and show-thinking toggle">
        <ActivityPanel />
      </Variant>

      <Variant label="synthesizing" hint="all sources consumed; report sections stream in as each finalizes">
        <SynthesizingPanel />
      </Variant>

      <Variant label="report ready" hint="full cited report with sources list and export controls">
        <ReportPanel />
      </Variant>

      <Variant label="error / partial" hint="timeout or source failure — partial results shown, never a blank error">
        <ErrorPanel />
      </Variant>

      <Note>
        Gate every run behind an editable plan. Stream individual queries and source reads — a bare spinner makes
        a stall indistinguishable from progress. Make citations claim-level and mandatory; end-only references
        cannot be verified claim-by-claim.
      </Note>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
