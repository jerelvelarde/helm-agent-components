import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, RotateCcw, Search, Sparkles } from "lucide-react";
import {
  Avatar, Bubble, Caret, Cite, CodeNote, Composer, Note,
  SectionLabel, Showcase, SourceCard, StatusDot, Tag,
  ToolFrame, Variant, tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "main-panel",
  title: "Main Panel / Full-Page Chat",
  category: "Layouts",
  blurb: "The full-page conversational app where chat is the primary surface.",
  copilotkit: "CopilotChat",
  spec: "layouts/main-panel.md",
};

// ── Shared helpers ─────────────────────────────────────────────────────────

function Rail() {
  const threads = [
    { id: 1, label: "Research on agentic UI patterns", active: true },
    { id: 2, label: "Draft product spec — v2 launch" },
    { id: 3, label: "Competitive analysis: Perplexity" },
  ];
  return (
    <div style={{ width: 192, borderRight: `1px solid ${tok.grey300}`, background: tok.grey200, display: "flex", flexDirection: "column", padding: "12px 0", fontSize: 13 }}>
      <div className="flex items-center" style={{ gap: 6, padding: "0 12px 12px" }}>
        <Avatar role="agent" size={22} />
        <span style={{ fontWeight: 600, color: tok.textPrimary }}>Research AI</span>
      </div>
      <button style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 8px 10px", padding: "6px 10px", borderRadius: 8, border: `1px solid ${tok.border}`, background: tok.container, fontSize: 12, color: tok.textPrimary, cursor: "pointer", fontFamily: "inherit" }}>
        <Plus size={13} /> New chat
      </button>
      <SectionLabel>Today</SectionLabel>
      <div className="flex flex-col" style={{ gap: 1, padding: "0 8px" }}>
        {threads.map((t) => (
          <div key={t.id} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, color: t.active ? tok.textPrimary : tok.textSecondary, background: t.active ? tok.container : "transparent", fontWeight: t.active ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20, border: `1px solid ${tok.border}`, background: tok.container, fontSize: 13, color: tok.textPrimary, cursor: "pointer", fontFamily: "inherit" }}>
      <Icon size={13} /> {label}
    </button>
  );
}

// ── Wiring ─────────────────────────────────────────────────────────────────

const wiring = `import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useRenderTool, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { useCopilotReadable } from "@copilotkit/react-core";
import { z } from "zod";
import "@copilotkit/react-core/v2/styles.css";

function App() {
  useCopilotReadable({ description: "Current user", value: { role: "analyst" } });
  useConfigureSuggestions({ instructions: "Suggest research tasks.", minSuggestions: 3, maxSuggestions: 5 });
  useRenderTool({
    name: "web_search",
    parameters: z.object({ query: z.string() }),
    render: ({ status, args, result }) => <ToolCard status={status} query={args.query} result={result} />,
  });
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotChat labels={{ title: "Research Assistant", initial: "What would you like to explore?" }} />
    </CopilotKit>
  );
}
// v1: useRenderTool → useCopilotAction({ render }); useConfigureSuggestions → useCopilotChatSuggestions`;

// ── Story ──────────────────────────────────────────────────────────────────

export default function Story() {
  const [thinkingOpen, setThinkingOpen] = useState(false);

  return (
    <Showcase>
      {/* 1 — Empty / landing */}
      <Variant label="Empty / landing" hint="no messages — greeting + suggestion chips; composer active">
        <div className="flex" style={{ height: 300, borderRadius: 8, overflow: "hidden", border: `1px solid ${tok.grey300}` }}>
          <Rail />
          <div className="flex flex-col" style={{ flex: 1, background: tok.surfaceMain }}>
            <div className="flex flex-col items-center" style={{ flex: 1, justifyContent: "center", gap: 18, padding: "16px 24px" }}>
              <Avatar role="agent" size={40} />
              <span style={{ fontSize: 17, fontWeight: 600, color: tok.textPrimary }}>What can I help with?</span>
              <div className="flex" style={{ gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                <Chip icon={Search} label="Research a topic" />
                <Chip icon={Sparkles} label="Draft a document" />
                <Chip icon={RotateCcw} label="Summarize & compare" />
              </div>
            </div>
            <div style={{ padding: "0 16px 14px" }}>
              <Composer placeholder="Ask anything…" />
            </div>
          </div>
        </div>
      </Variant>

      {/* 2 — Thinking / reasoning trace */}
      <Variant label="Thinking / reasoning" hint="collapsible trace before first token; pulsing dot">
        <div className="flex flex-col" style={{ maxWidth: 640, gap: 12 }}>
          <Bubble role="user">What are the best practices for agentic UI patterns in 2026?</Bubble>
          <div style={{ marginLeft: 36, borderTop: `1px solid ${tok.grey300}`, borderRight: `1px solid ${tok.grey300}`, borderBottom: `1px solid ${tok.grey300}`, borderLeft: `3px solid ${tok.indigo}`, borderRadius: 8, overflow: "hidden", background: tok.container }}>
            <button onClick={() => setThinkingOpen((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <StatusDot state="running" />
              <span style={{ fontSize: 13, color: tok.textSecondary, fontStyle: "italic" }}>Thinking…</span>
              <span style={{ flex: 1 }} />
              {thinkingOpen ? <ChevronDown size={14} color={tok.textDisabled} /> : <ChevronRight size={14} color={tok.textDisabled} />}
            </button>
            {thinkingOpen && (
              <div style={{ padding: "8px 12px 12px", borderTop: `1px solid ${tok.grey300}`, fontSize: 12.5, lineHeight: "20px", color: tok.textSecondary, fontStyle: "italic" }}>
                The user wants agentic UI best practices — I should cover streaming, tool transparency, HITL, and composer UX. Let me pull recent implementation findings…
              </div>
            )}
          </div>
          <Bubble role="assistant"><Caret /></Bubble>
        </div>
        <Note>Use aria-expanded + aria-controls on the toggle so screen readers can interact with the trace.</Note>
      </Variant>

      {/* 3 — Streaming + inline tool running */}
      <Variant label="Streaming + tool running" hint="token stream in bubble; tool card inline; stop visible">
        <div className="flex flex-col" style={{ maxWidth: 640, gap: 12 }}>
          <Bubble role="user">Find recent papers on multi-agent coordination and summarize the top 3.</Bubble>
          <div style={{ marginLeft: 36 }}>
            <ToolFrame name="web_search" status="executing" args={'query: "multi-agent coordination 2025–2026"'} />
          </div>
          <Bubble role="assistant">Here are the leading findings so far — expanding once the search completes<Caret /></Bubble>
          <Composer streaming placeholder="Ask a follow-up or press stop…" />
        </div>
        <Note>Keep the composer live during streaming — stop replaces send; users can queue follow-ups or interrupt generation.</Note>
      </Variant>

      {/* 4 — Complete with citations + sources */}
      <Variant label="Complete — citations + sources" hint="RUN_FINISHED; action bar + inline cite markers">
        <div className="flex flex-col" style={{ maxWidth: 640, gap: 12 }}>
          <Bubble role="user">Summarize the key principles of agentic UI design.</Bubble>
          <Bubble role="assistant" full>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <p style={{ margin: 0 }}>
                Effective agentic UI centres on <strong>transparency</strong><Cite n={1} /> — surfacing what the agent is doing via inline tool cards and reasoning traces. A live composer<Cite n={2} /> and explicit stop control keep the user in charge. Citations<Cite n={3} /> should appear adjacent to claims so answers stay verifiable at a glance.
              </p>
              <div className="flex" style={{ gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                <SourceCard n={1} domain="copilotkit.ai" title="Building Transparent Agent UIs" />
                <SourceCard n={2} domain="assistant-ui.com" title="Composer & Thread Primitives" />
                <SourceCard n={3} domain="perplexity.ai" title="Citation UX in AI Assistants" />
              </div>
            </div>
          </Bubble>
          <div className="flex items-center" style={{ gap: 8, marginLeft: 36 }}>
            <Tag>Copy</Tag>
            <Tag>Regenerate</Tag>
            <Tag>Share</Tag>
          </div>
        </div>
      </Variant>

      {/* 5 — Error / retry */}
      <Variant label="Error / retry" hint="RUN_ERROR — inline error card; composer re-enabled">
        <div className="flex flex-col" style={{ maxWidth: 640, gap: 12 }}>
          <Bubble role="user">Analyze the Q2 pipeline and flag any at-risk deals.</Bubble>
          <div className="flex items-center" style={{ gap: 10, marginLeft: 36, padding: "10px 14px", borderRadius: 12, background: "var(--error-soft)", border: `1px solid ${tok.error}33` }}>
            <StatusDot state="error" />
            <span style={{ fontSize: 13, color: tok.error }}>The agent encountered an error and could not complete this request.</span>
            <button style={{ marginLeft: "auto", border: `1px solid ${tok.error}`, background: "transparent", color: tok.error, borderRadius: 8, padding: "4px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              Retry
            </button>
          </div>
          <Composer placeholder="Ask a follow-up or retry…" />
        </div>
        <Note>Errors should never dead-end the user — surface a one-tap retry and keep the composer active so they can rephrase.</Note>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
