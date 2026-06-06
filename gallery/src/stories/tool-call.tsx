import { CodeNote, Note, SectionLabel, Showcase, ToolFrame, ToolLine, Variant, tok } from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "tool-call",
  title: "Tool Call",
  category: "Agent transparency",
  blurb:
    "The card that renders a tool invocation through its InProgress → Executing → Complete lifecycle — name, arguments, result.",
  copilotkit: "useRenderTool · ToolCallStatus",
  spec: "components/tool-call.md",
};

const wiring = `import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

useRenderTool({
  name: "search_web",
  parameters: z.object({ query: z.string() }),
  render: ({ status, args, result }) => (
    <ToolFrame
      name="search_web"
      status={status}          // "inProgress" | "executing" | "complete"
      args={status !== "inProgress" && \`query: "\${args.query}"\`}
    >
      {status === "complete" && result}
    </ToolFrame>
  ),
});

// Generic fallback for any unregistered tool:
// useDefaultRenderTool(({ name, status }) => <ToolFrame name={name} status={status} />);`;

const compactWiring = `import { useDefaultRenderTool } from "@copilotkit/react-core/v2";

// The low-chrome default: one collapsible line per tool, collapsed by default.
// Expands on click to reveal arguments + result, so a long transcript stays glanceable.
useDefaultRenderTool(({ name, status, args, result }) => (
  <ToolLine
    name={name}
    status={status}                              // "inProgress" | "executing" | "complete"
    summary={status === "complete" ? "done" : undefined}
    args={args && JSON.stringify(args)}
  >
    {status === "complete" && result}
  </ToolLine>
));`;

export default function Story() {
  return (
    <Showcase>
      <SectionLabel>Rich card · high-value tools that earn the space</SectionLabel>

      <Variant label="inProgress" hint="arguments still streaming from the agent">
        <ToolFrame name="search_web" status="inProgress" args={'query: "agentic UI patt▍'} />
      </Variant>

      <Variant label="executing" hint="args resolved; the tool is running">
        <ToolFrame name="search_web" status="executing" args={'query: "agentic UI patterns 2026"'} />
      </Variant>

      <Variant label="complete" hint="result rendered inline in the same card">
        <ToolFrame
          name="search_web"
          status="complete"
          args={'query: "agentic UI patterns 2026"'}
        >
          <div className="flex flex-col" style={{ gap: 4 }}>
            <span>Found 8 results · top match:</span>
            <span style={{ color: tok.indigo }}>"Designing Agent-Native Interfaces" — copilotkit.ai</span>
          </div>
        </ToolFrame>
      </Variant>

      <Variant label="error" hint="failed call with a retry affordance">
        <ToolFrame name="search_web" status="error" args={'query: "agentic UI patterns 2026"'}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <span style={{ color: tok.error }}>Request timed out after 30s.</span>
            <button
              style={{
                marginLeft: "auto",
                border: `1px solid ${tok.border}`,
                background: "transparent",
                borderRadius: 8,
                padding: "4px 12px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </ToolFrame>
      </Variant>

      <Note>
        Show a human-readable tool name, the arguments in a compact key–value form (not raw JSON), and never
        auto-dismiss completed cards — the thread is an implicit audit log of what the agent did.
      </Note>

      <SectionLabel>Compact line · routine tools, collapsed by default</SectionLabel>

      <Variant label="collapsed" hint="one line in the thread — click the row to expand args + result">
        <ToolLine name="search_web" status="complete" summary="8 results" args={'query: "agentic UI patterns 2026"'}>
          <span style={{ color: tok.indigo }}>"Designing Agent-Native Interfaces" — copilotkit.ai</span>
        </ToolLine>
      </Variant>

      <Variant label="running" hint="pulsing dot while the tool executes; no card chrome">
        <ToolLine name="search_web" status="executing" summary={'query: "agentic UI patterns 2026"'} />
      </Variant>

      <Variant label="expanded" hint="defaultOpen — the same line, already revealed">
        <ToolLine name="get_weather" status="complete" summary="72°F, clear" defaultOpen args={'city: "San Francisco"'}>
          <span>72°F and clear in San Francisco. Wind 6 mph NW.</span>
        </ToolLine>
      </Variant>

      <Variant label="failed" hint="errors collapse to a line too; expand for the reason">
        <ToolLine name="charge_card" status="error" summary="timed out" args={'amount: 4200, currency: "usd"'}>
          <span style={{ color: tok.error }}>Gateway timed out after 30s — retry from the menu.</span>
        </ToolLine>
      </Variant>

      <Note>
        Two densities of one component. The <strong>card</strong> is for high-value tools whose output deserves
        space — diffs, charts, approval forms. The <strong>line</strong> is the collapsed-by-default fallback
        (<code>useDefaultRenderTool</code>) for routine calls: a glanceable summary that expands on demand, so a
        long transcript stays readable.
      </Note>

      <CodeNote code={wiring} />
      <CodeNote title="Compact line · generic fallback" code={compactWiring} />
    </Showcase>
  );
}
