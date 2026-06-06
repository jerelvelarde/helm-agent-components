import { Check, ChevronRight, Code2, Eye, RefreshCw, Sparkles } from "lucide-react";
import {
  Bubble,
  Caret,
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
  slug: "canvas-builder",
  title: "Canvas / Artifact Builder",
  category: "Examples",
  blurb:
    "A Lovable-style split view: chat on the left co-creates a live artifact on the right, kept in lockstep through shared state.",
  copilotkit: "useCoAgent (shared state) · useRenderTool · useConfigureSuggestions",
  spec: "layouts/split-view.md",
};

// ── The live artifact (right pane) ───────────────────────────────────────────

function PricingCard({ name, price, features, featured }: { name: string; price: string; features: string[]; featured?: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        background: featured ? "var(--indigo-soft)" : tok.container,
        border: featured ? `1.5px solid ${tok.indigo}` : `1px solid ${tok.grey300}`,
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
      }}
    >
      {featured && (
        <span
          style={{
            position: "absolute",
            top: -9,
            left: 16,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#fff",
            background: tok.indigo,
            borderRadius: 9999,
            padding: "2px 9px",
          }}
        >
          Popular
        </span>
      )}
      <div style={{ fontSize: 13, fontWeight: 600, color: tok.textSecondary }}>{name}</div>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
        {price}
        <span style={{ fontSize: 12, fontWeight: 500, color: tok.textDisabled }}>/mo</span>
      </div>
      <div className="flex flex-col" style={{ gap: 6, marginTop: 2 }}>
        {features.map((f) => (
          <div key={f} className="flex items-center" style={{ gap: 6, fontSize: 12, color: tok.textSecondary }}>
            <Check size={13} color={featured ? tok.indigo : tok.success} strokeWidth={2.5} /> {f}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "auto",
          textAlign: "center",
          fontSize: 12.5,
          fontWeight: 600,
          borderRadius: 8,
          padding: "8px 0",
          background: featured ? tok.indigo : "transparent",
          color: featured ? "#fff" : tok.textPrimary,
          border: featured ? "none" : `1px solid ${tok.border}`,
        }}
      >
        Choose {name}
      </div>
    </div>
  );
}

function ArtifactPane() {
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--surface-background)" }}>
      {/* artifact toolbar */}
      <div
        className="flex items-center"
        style={{ gap: 8, padding: "8px 12px", borderBottom: `1px solid ${tok.grey300}`, background: tok.container }}
      >
        <div className="flex items-center" style={{ gap: 2, background: "var(--fill-100)", borderRadius: 8, padding: 2 }}>
          <span className="flex items-center" style={{ gap: 5, fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 6, background: "var(--surface-container)", color: tok.textPrimary }}>
            <Eye size={12} /> Preview
          </span>
          <span className="flex items-center" style={{ gap: 5, fontSize: 12, padding: "4px 10px", color: tok.textDisabled }}>
            <Code2 size={12} /> Code
          </span>
        </div>
        <span style={{ flex: 1 }} />
        <span className="flex items-center" style={{ gap: 5, fontSize: 11, color: tok.indigo }}>
          <RefreshCw size={11} className="ck-pulse" /> updating
        </span>
        <Tag mono>shared state</Tag>
      </div>

      {/* rendered artifact */}
      <div className="ck-scroll" style={{ flex: 1, overflowY: "auto", padding: "26px 22px", background: "var(--fill-100)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>Simple, transparent pricing</div>
          <div style={{ fontSize: 12.5, color: tok.textDisabled, marginTop: 4 }}>Start free. Upgrade when you grow.</div>
        </div>
        <div className="flex" style={{ gap: 12, alignItems: "stretch" }}>
          <PricingCard name="Starter" price="$0" features={["1 project", "Community support"]} />
          <PricingCard name="Pro" price="$24" features={["Unlimited projects", "Priority support", "Analytics"]} featured />
          <PricingCard name="Team" price="$79" features={["Everything in Pro", "SSO & roles", "Audit log"]} />
        </div>
      </div>
    </div>
  );
}

// ── Chat pane (left) ─────────────────────────────────────────────────────────

function ChatPane() {
  return (
    <div
      style={{
        width: 340,
        minWidth: 340,
        display: "flex",
        flexDirection: "column",
        background: tok.container,
        borderRight: `1px solid ${tok.grey300}`,
      }}
    >
      <div className="flex items-center" style={{ gap: 8, padding: "10px 14px", borderBottom: `1px solid ${tok.grey300}` }}>
        <Sparkles size={14} color={tok.indigo} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Builder</span>
        <StatusDot state="running" label="building" />
      </div>

      <div className="ck-scroll" style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <Bubble role="user">Build a 3-tier pricing page. Highlight the Pro plan.</Bubble>

        <ToolLine name="generate" status="complete" summary="PricingSection.tsx" defaultOpen>
          <span>3 tiers · Pro featured · responsive grid → rendered to the canvas →</span>
        </ToolLine>

        <Bubble role="assistant" full>
          Added a 3-tier pricing section with Pro highlighted. Tweak copy or styling and I'll update the canvas live.<Caret />
        </Bubble>

        <div className="flex flex-wrap" style={{ gap: 6 }}>
          {["Make it dark", "Add annual toggle", "Punchier copy"].map((s) => (
            <span
              key={s}
              className="flex items-center"
              style={{ gap: 4, fontSize: 11.5, padding: "5px 9px", borderRadius: 9999, border: `1px solid ${tok.border}`, background: tok.container, color: tok.textPrimary }}
            >
              {s} <ChevronRight size={10} color={tok.textDisabled} />
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: "10px 12px", borderTop: `1px solid ${tok.grey300}` }}>
        <Composer placeholder="Describe a change…" />
      </div>
    </div>
  );
}

// ── Wiring ───────────────────────────────────────────────────────────────────

const wiring = `import {
  useCoAgent,        // shared state: chat ⇄ artifact, one source of truth
  useRenderTool,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

function Studio() {
  // The artifact lives in shared agent state. The chat mutates it; the
  // canvas renders it. STATE_DELTA events stream edits in live.
  const { state, setState } = useCoAgent({
    name: "builder",
    initialState: { artifact: { component: "PricingSection", props: {} } },
  });

  // The agent (re)writes the artifact via a tool the canvas renders.
  useRenderTool({
    name: "generate",
    parameters: z.object({ component: z.string(), props: z.any() }),
    render: ({ status, args }) => (
      <ToolLine name="generate" status={status} summary={args.component + ".tsx"} />
    ),
  });

  // Next-step nudges based on the current artifact.
  useConfigureSuggestions({
    instructions: "Suggest 3 quick edits to the current artifact.",
    maxSuggestions: 3,
  });

  return (
    <div style={{ display: "flex" }}>
      <ChatPane />                         {/* drives */}
      <Canvas artifact={state.artifact} /> {/* renders shared state */}
    </div>
  );
}

// AG-UI events in play:
// STATE_SNAPSHOT  → seed the artifact
// STATE_DELTA     → stream live edits into the canvas as you chat
// TOOL_CALL_*     → generate → swap/patch the rendered component
// RUN_FINISHED    → settle the preview, refresh suggestions`;

// ── Story ────────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      <SectionLabel>Live screen · chat drives a live artifact beside it</SectionLabel>
      <WindowFrame title="studio.acme.com — Pricing page">
        <div style={{ display: "flex", height: 560 }}>
          <ChatPane />
          <ArtifactPane />
        </div>
      </WindowFrame>
      <Note>
        The split-view, co-creation model (Lovable, ChatGPT Canvas). The chat doesn't just describe the result — it{" "}
        <strong>is</strong> the editing surface, and the artifact updates <strong>live</strong> beside it. Both panes
        read and write one <strong>shared state</strong>, so the conversation and the canvas can never disagree.{" "}
        <strong>Suggestions</strong> propose the next edit; the artifact toolbar lets you flip between the rendered
        Preview and the generated Code.
      </Note>

      <SectionLabel>Composes</SectionLabel>
      <Composes
        items={[
          { slug: "split-view", label: "Split View", role: "Chat pane co-creating the artifact shown beside it." },
          { slug: "canvas-workspace", label: "Canvas / Artifacts", role: "The durable artifact surface the agent builds." },
          { slug: "chat-message", label: "Chat Message", role: "The conversation that drives every change." },
          { slug: "generative-ui-inline", label: "Inline Generative UI", role: "The live-rendered pricing component itself." },
          { slug: "tool-call", label: "Tool Call", role: "generate → writes/patches the artifact." },
          { slug: "suggestions-capabilities", label: "Suggestions", role: "Next-edit nudges based on the current artifact." },
          { slug: "agent-activity-traceability", label: "Activity & Traceability", role: "“Updating” + shared-state provenance on the canvas." },
          { slug: "input-composer", label: "Input / Composer", role: "Where you describe the next change." },
        ]}
      />

      <CodeNote title="CopilotKit wiring · the assembled studio" code={wiring} />
    </Showcase>
  );
}
