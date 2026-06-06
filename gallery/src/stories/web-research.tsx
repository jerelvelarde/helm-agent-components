import { Globe, Loader, RotateCcw, Search } from "lucide-react";
import {
  Bubble,
  Btn,
  Caret,
  Cite,
  CodeNote,
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
  slug: "web-research",
  title: "Web Research / Search",
  category: "Multi-agent & research",
  blurb: "Search with provenance — source cards, inline citations, query transparency.",
  copilotkit: "useRenderTool · TOOL_CALL_*",
  spec: "components/web-research.md",
};

// ─── mock data ────────────────────────────────────────────────────────────────

const SOURCES = [
  { n: 1, domain: "reuters.com", title: "AI chip demand rises 34% YoY on training workloads" },
  { n: 2, domain: "techcrunch.com", title: "Advanced packaging bottleneck threatens supply ramp" },
  { n: 3, domain: "bbc.com", title: "TSMC forecasts record revenue as AI orders surge" },
  { n: 4, domain: "ft.com", title: "GPU allocation wars: hyperscalers vs. startups" },
];

const wiring = `import { useRenderTool } from "@copilotkit/react-core/v2";
import { useAgent } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Render the web_search tool call inside the chat thread.
// status drives the full InProgress → Executing → Complete lifecycle.
useRenderTool({
  name: "web_search",
  parameters: z.object({
    queries: z.array(z.string()),
  }),
  render: ({ status, args, result }) => {
    const data =
      status === "complete" && result ? JSON.parse(result) : null;
    return (
      <WebSearchCard
        status={status}
        queries={args.queries ?? []}
        sources={data?.sources ?? []}
        answer={data?.answer ?? ""}
      />
    );
  },
});

// Separately: consume live shared state for multi-step research
// (arrives as AG-UI STATE_SNAPSHOT / STATE_DELTA events).
const { agent } = useAgent({ agentId: "research-agent" });
const liveSources = agent.state?.sources ?? [];

// v1 equivalent:
// useCopilotAction({ name: "web_search", parameters: [...], render })
// useCoAgent({ name: "research-agent" })`;

// ─── story ────────────────────────────────────────────────────────────────────

export default function Story() {
  return (
    <Showcase>
      {/* 1 ── SEARCHING: query bar + skeleton source cards */}
      <Variant
        label="searching"
        hint="tool InProgress — query bar live, skeleton source cards streaming in"
      >
        <ToolFrame
          name="web_search"
          status="inProgress"
          args={
            <div className="flex items-center" style={{ gap: 6 }}>
              <Search size={11} color={tok.textDisabled} />
              <span style={{ color: tok.textSecondary }}>
                "AI chip supply chain 2025"
              </span>
              <Loader
                size={11}
                color={tok.indigo}
                style={{ animation: "spin 1s linear infinite" }}
              />
            </div>
          }
        >
          <div className="flex flex-col" style={{ gap: 8 }}>
            <SectionLabel>Sources loading</SectionLabel>
            <div className="flex" style={{ gap: 8, overflowX: "auto" }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    minWidth: 170,
                    maxWidth: 240,
                    background: tok.grey200,
                    border: `1px solid ${tok.grey300}`,
                    borderRadius: 8,
                    padding: "8px 10px",
                  }}
                >
                  <div className="flex items-center" style={{ gap: 6, marginBottom: 6 }}>
                    <Skeleton w={14} h={14} style={{ borderRadius: 3 }} />
                    <Skeleton w={80} h={10} />
                  </div>
                  <Skeleton w="90%" h={10} style={{ marginBottom: 4 }} />
                  <Skeleton w="65%" h={10} />
                </div>
              ))}
            </div>
          </div>
        </ToolFrame>
      </Variant>

      {/* 2 ── SOURCES ARRIVING: cards populating */}
      <Variant
        label="retrieving"
        hint="tool Executing — source cards resolve domain + title as pages are read"
      >
        <ToolFrame name="web_search" status="executing" args={'queries: ["AI chip supply chain 2025", "TSMC advanced packaging 2025"]'}>
          <div className="flex flex-col" style={{ gap: 8 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <StatusDot state="running" label="Reading 4 sources" />
              <span style={{ flex: 1 }} />
              <Tag mono>4 retrieved</Tag>
            </div>
            <div className="flex" style={{ gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              {SOURCES.map((s) => (
                <SourceCard key={s.n} n={s.n} domain={s.domain} title={s.title} />
              ))}
            </div>
          </div>
        </ToolFrame>
      </Variant>

      {/* 3 ── STREAMING ANSWER: inline citations appearing as text generates */}
      <Variant
        label="streaming answer"
        hint="tool transitioning to Complete — text streams with citation markers"
      >
        <div className="flex flex-col" style={{ gap: 12 }}>
          <Bubble role="user">What's driving the AI chip supply crunch in 2025?</Bubble>
          <Bubble role="assistant" full>
            <div className="flex flex-col" style={{ gap: 10 }}>
              <p style={{ margin: 0, lineHeight: "22px" }}>
                Global chip demand rose 34% year-over-year
                <Cite n={1} />, driven primarily by hyperscaler AI training
                workloads.<Cite n={2} /> Supply constraints remain concentrated
                in advanced packaging capacity,
                <Cite n={1} /> where TSMC and its peers are struggling to keep
                pace with orders.<Cite n={3} />
                <Caret />
              </p>
              <div className="flex" style={{ gap: 6, flexWrap: "wrap" }}>
                {SOURCES.slice(0, 3).map((s) => (
                  <SourceCard key={s.n} n={s.n} domain={s.domain} title={s.title} />
                ))}
              </div>
            </div>
          </Bubble>
        </div>
      </Variant>

      {/* 4 ── DONE: full answer + ranked sources panel */}
      <Variant
        label="done"
        hint="tool Complete — full answer, inline citations, sources panel"
      >
        <div className="flex flex-col" style={{ gap: 12 }}>
          <Bubble role="user">What's driving the AI chip supply crunch in 2025?</Bubble>
          <Bubble role="assistant" full>
            <div className="flex flex-col" style={{ gap: 12 }}>
              <p style={{ margin: 0, lineHeight: "22px" }}>
                Global chip demand rose 34% year-over-year<Cite n={1} />,
                driven by AI training workloads at hyperscalers.<Cite n={2} />{" "}
                Supply constraints remain concentrated in advanced
                packaging,<Cite n={1} /> where lead times have extended to 52+
                weeks. GPU allocation wars between hyperscalers and
                startups<Cite n={4} /> further squeeze available capacity.
                TSMC forecasts record revenue as AI orders surge.<Cite n={3} />
              </p>
              <div>
                <SectionLabel>Sources</SectionLabel>
                <div
                  className="flex"
                  style={{ gap: 8, overflowX: "auto", paddingBottom: 2 }}
                  role="list"
                  aria-label="Search sources"
                >
                  {SOURCES.map((s) => (
                    <div key={s.n} role="listitem">
                      <SourceCard n={s.n} domain={s.domain} title={s.title} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center" style={{ gap: 6 }}>
                <Globe size={12} color={tok.textDisabled} />
                <span style={{ fontSize: 11, color: tok.textDisabled }}>
                  Searched: "AI chip supply chain 2025" · "TSMC advanced packaging 2025"
                </span>
                <StatusDot state="done" />
              </div>
            </div>
          </Bubble>
        </div>
      </Variant>

      {/* 5 ── ERROR: search failure with retry */}
      <Variant
        label="error"
        hint="search tool failure — distinguishes search error from generation error"
      >
        <div className="flex flex-col" style={{ gap: 12 }}>
          <ToolFrame name="web_search" status="error" args={'queries: ["AI chip supply chain 2025"]'}>
            <div className="flex items-center" style={{ gap: 10 }}>
              <span style={{ color: tok.error, fontSize: 13 }}>
                Search timed out after 30 s — no sources retrieved.
              </span>
              <span style={{ flex: 1 }} />
              <Btn variant="ghost">
                <span className="flex items-center" style={{ gap: 5 }}>
                  <RotateCcw size={13} />
                  Retry
                </span>
              </Btn>
            </div>
          </ToolFrame>
          <Note>
            Distinguish a search tool failure (no sources) from a model generation error — the retry
            action should re-issue the search, not regenerate the answer.
          </Note>
        </div>
      </Variant>

      {/* 6 ── WIRING ─────────────────────────────────────────────────────── */}
      <CodeNote code={wiring} />
    </Showcase>
  );
}
