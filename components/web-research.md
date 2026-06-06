# Web Research / Search

> An agent component that issues live web searches, retrieves and reads pages, and returns answers with sources rendered as clickable cards and inline citations.

**Category:** Component · **Cluster:** Multi-agent & research · **Aliases:** web search, answer engine, grounded answers, search-grounded generation, RAG with citations, source cards, inline citations, browsing tool, search grounding, retrieval-augmented answers

## Definition

Web Research / Search is the UI/UX for an agent that fetches live web content and answers with every claim traceable to a retrieved source. It solves the trust problem of ungrounded generation: without it, users have no way to distinguish factual output from model hallucination. The component surfaces two defining elements — the **source card** (a clickable preview of each retrieved page) and the **inline citation** (a numbered marker that binds a specific sentence to the source supporting it). It appears in research assistants, answer engines, factual Q&A, and any agent-driven workflow where freshness and verifiability are requirements.

## When to use / when not to

- **Use** when answer accuracy is publicly verifiable and users need to audit claims (fact-checking, market research, competitive intelligence, legal/compliance references).
- **Use** when the question explicitly depends on recent or live data that the base model cannot reliably provide from training.
- **Use** when your product's credibility rests on source transparency — citation-forward design (every answer cited by default) builds more trust than opt-in citations.
- **Do not use** for fully private-document RAG where the retrieval corpus is known and controlled — prefer a dedicated RAG pipeline without the freshness and source-ranking complexity of live web search.
- **Do not use** for conversational small-talk or short-horizon tasks where the latency cost of a web round-trip exceeds the benefit; gate the tool call on intent detection.

## Anatomy

```
┌──────────────────────────────────────────────────────────┐
│  Search queries bar (webSearchQueries)                   │
│  "Searching: 'AI chip supply chain 2025' …"              │
├──────────────────────────────────────────────────────────┤
│  Source cards carousel (horizontal scroll or grid)       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐           │
│  │ 🌐 bbc.com │ │ reuters.com│ │ techcr.com │  …        │
│  │ Title      │ │ Title      │ │ Title      │           │
│  │ Snippet…   │ │ Snippet…   │ │ Snippet…   │           │
│  └────────────┘ └────────────┘ └────────────┘           │
├──────────────────────────────────────────────────────────┤
│  Answer body                                             │
│  Global chip demand rose 34% YoY [1] driven by AI       │
│  training workloads [2][3]. Supply constraints remain    │
│  concentrated in advanced packaging [1].                 │
│                      ↑ inline citations (linked)         │
├──────────────────────────────────────────────────────────┤
│  Hover/focus snippet popover (on citation hover/focus)   │
│  ┌────────────────────────────────────────────────┐      │
│  │ [1] bbc.com — "…34% increase in Q1 2025…"  ↗ │      │
│  └────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

**Parts:**
- **Query bar** — displays the actual `webSearchQueries` the agent issued; signals search is live.
- **Source card** — title + domain + favicon + snippet; clickable to open source in new tab.
- **Inline citation** — numbered marker (`[1]`, `[2]`) anchored to the specific claim it supports; not a bibliography reference.
- **Snippet popover** — hover/focus-triggered preview of the cited snippet, avoiding a full context switch.
- **Sources panel** — ranked, deduped list of all retrieved sources rendered after the answer is complete.
- **Search Suggestions (Gemini-specific)** — `searchEntryPoint` chips from Gemini's grounding metadata; required by Google's Terms of Service when using Grounding with Google Search.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle | User has not submitted; agent awaiting input | Input available; no source cards or citations shown |
| Searching | Agent issued queries; tool `InProgress` | Query bar shows active search terms with a spinner; source cards area shows loading skeletons |
| Retrieving / reading sources | Agent fetching page content; cards arriving | Source cards stream in greyed/skeleton until title+snippet resolve; card count increments live |
| Streaming answer with citations | Agent generating text; tool transitioning to `Complete` | Message bubble streams token-by-token; inline citation markers appear as the supporting text generates |
| Done | All sources retrieved and answer complete | Full answer with inline citations; final ranked sources panel; input re-enabled |
| No / low results | Search returned empty or low-quality results | Empty state card with a suggestion to broaden or rephrase the query |
| Error | Search tool failure or network timeout | Error card with retry button; distinguishes search failure from a generation error |
| Uncited / low-confidence | Claim in answer has no grounding chunk mapping | Visual flag (muted color, warning indicator) that distinguishes ungrounded segments from cited ones |

## Vocabulary

| Term | Definition |
|---|---|
| Source card | A clickable card previewing a retrieved page — title, domain + favicon, and a short snippet — typically in a horizontal carousel above or beside the answer. |
| Inline citation | A numbered marker (`[1]`, superscript, or chip) anchored to a specific sentence that links the claim to the source supporting it; clicking opens or scrolls to the source. |
| Grounding chunk | In Gemini's grounding metadata, an object holding a web source's `uri` + `title`; the atomic unit an inline citation points at. |
| Grounding support | Gemini metadata mapping a text segment (`startIndex`/`endIndex`) to one or more `groundingChunkIndices` — the data structure that makes span-level inline citations buildable. |
| Search Suggestions / Search Entry Point | In Gemini grounding, the `searchEntryPoint` provides HTML/CSS to render Search Suggestions chips; Google's Terms of Service require these be displayed when using Grounding with Google Search. |
| webSearchQueries | The actual queries the agent ran, surfaced in Gemini's `groundingMetadata`; shown in the query bar so users see how the answer was sourced. |
| Hover preview / snippet popover | Tooltip shown on hovering or focusing a citation that reveals the source snippet without leaving the page. |
| Source diversity / dedup | Ranking that spreads citations across distinct domains rather than concentrating them on one site, improving trust and coverage. |
| Citation-forward | Design stance (Perplexity's) where every answer is grounded and visibly cited by default, not only on user request. |

## Real-world examples

- **Perplexity** — Citation-forward by default: every answer carries several numbered inline footnotes, each linked to its source, with a sources strip above the answer. Hovering a citation reveals a snippet popover you can click to open in a new tab. Live retrieval is core to the product — citations appear even in normal conversational mode, not only in "research" mode. [Source](https://ziptie.dev/blog/how-perplexity-ai-answers-work/)
- **Google Gemini (Grounding with Google Search)** — The API returns `groundingMetadata` with `webSearchQueries`, `groundingChunks` (`uri` + `title`), and `groundingSupports` that map answer-text segments (`startIndex`/`endIndex`) to chunk indices; developers build inline citations from this structure, and a `searchEntryPoint` supplies the Search Suggestions chips Google's ToS requires be rendered. [Source](https://ai.google.dev/gemini-api/docs/google-search)
- **ChatGPT Search** — When search is active, responses include inline citations; on desktop, hovering a citation shows more detail and clicking opens the source. A Sources panel below the response lists all cited pages. Crucially, citations only appear when the agent actively browsed — their presence is a verifiable signal that the answer is web-grounded. [Source](https://help.openai.com/en/articles/9237897-chatgpt-search)

## CopilotKit & AG-UI mapping

Web research is implemented as a backend agent tool. On the frontend, `useRenderTool` (v2) attaches a custom renderer to the search tool by name, driving the full `ToolCallStatus` lifecycle (`InProgress → Executing → Complete`) as source cards and the answer stream in. For progress that lives outside a single tool call (e.g., a multi-step research loop), stream a `sources` array into shared state via `copilotkit_emit_state` on the backend and consume it with `useAgent` (v2) to update the sources panel live — those arrive as AG-UI `STATE_SNAPSHOT` / `STATE_DELTA` events. Use `useCopilotReadable` to feed the currently-visible document or page context into the agent so it issues better-targeted queries.

v1 equivalent: replace `useRenderTool` with `useCopilotAction({ render })` and `useAgent` with `useCoAgent`.

Relevant AG-UI events: `TOOL_CALL_START / TOOL_CALL_ARGS / TOOL_CALL_END` drive the `InProgress → Executing` card; `TOOL_CALL_RESULT` drives `Complete` and triggers source card rendering; `STATE_SNAPSHOT / STATE_DELTA` keep the sources panel live across multi-turn research.

CopilotKit does not ship a `CitationCard` primitive — source cards and inline-citation rendering are app components.

```tsx
import { useRenderTool } from "@copilotkit/react-core/v2";
import { useAgent } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Render the web_search tool call in the chat thread
useRenderTool({
  name: "web_search",
  parameters: z.object({
    queries: z.array(z.string()),
  }),
  render: ({ status, args, result }) => {
    // result is a JSON string from the backend: { sources: SourceCard[], answer: string }
    const data = status === "complete" && result ? JSON.parse(result) : null;
    return (
      <WebSearchCard
        status={status}
        queries={args.queries ?? []}
        sources={data?.sources ?? []}
      />
    );
  },
});

// Separately, consume live shared state for a multi-step research agent
// (arrives via AG-UI STATE_SNAPSHOT / STATE_DELTA)
const { agent } = useAgent({ agentId: "research-agent" });
const sources: SourceCard[] = agent.state?.sources ?? [];
// Render <SourcesPanel sources={sources} /> alongside the chat
```

> v1 equivalent: `useCopilotAction({ name: "web_search", parameters: [...], render })` and `useCoAgent({ name: "research-agent" })`.
> Docs: [useRenderTool](https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool) · [useAgent / shared state](https://docs.copilotkit.ai/learn/whats-new/v1-50) · [useCopilotReadable](https://docs.copilotkit.ai)

## Best practices

- **Anchor citations to the claim, not the answer.** Span-level linking (Gemini's `groundingSupports` with `startIndex`/`endIndex`, or equivalent) lets users verify each sentence independently — a bibliography at the end forces reverse-engineering of what supports what.
- **Make source cards credibility-scannable.** Always include domain + favicon + title + snippet. A bare URL or title-only card provides no signal for evaluating trustworthiness before clicking.
- **Stream progressively.** Reveal source cards as they are retrieved (skeletons → populated), and animate inline citations in as their supporting text generates. Users should see the answer being grounded in real time, not receive a completed result after a silent wait.
- **Show the search queries.** Surfacing `webSearchQueries` in the query bar makes the agent's intent transparent, allows users to spot a misframed query before the answer lands, and signals that freshness is guaranteed by an actual search, not cached training data.
- **Provide hover/focus snippet previews.** The Perplexity pattern — a popover on citation hover that shows the relevant excerpt — dramatically reduces context switches. Ensure the popover is also triggered by keyboard focus (not hover alone) so keyboard users get the same benefit.
- **Flag uncited claims visually.** If any part of the answer lacks a `groundingChunk` mapping, render it with a distinct visual treatment (muted color, warning indicator). Presenting ungrounded claims with the same authority as cited ones is a trust violation.
- **Latency: show the searching state immediately.** Display the query bar and skeleton source cards as soon as the tool call starts (`InProgress`). Never block the entire UI while waiting for the slowest source fetch.
- **Open sources in a new tab.** Navigating in the same tab destroys the answer and scroll position; new-tab (or a side panel) preserves the research context.
- **Enforce source diversity.** Deduplicate and spread citations across distinct domains. An answer citing five pages from one site has lower epistemic value than one citing five independent sources.

## Anti-patterns

- **Citation theater** — numbered markers that don't actually map to the span they decorate, point to the wrong source, or are decorative. Fabricated citations are worse than no citations because they create false confidence in verifiability.
- **End-of-answer bibliography only** — placing all sources at the bottom with no claim-level attribution forces users to guess which source supports which sentence, negating the point of citation.
- **Uniform visual treatment for grounded and ungrounded claims** — presenting model-generated speculation with the same styling as cited facts hides where the agent is actually grounded.
- **Source cards without snippet or favicon** — a title and bare URL is not enough for credibility assessment; users need the snippet and the domain's visual identity to decide whether to click.
- **Same-tab source navigation** — opening a citation in the current tab destroys the answer state; always open in a new tab or a side panel that preserves scroll position.

## Accessibility

- **Inline citations must be real links or buttons**, not styled `<span>` elements. Each citation should carry an `aria-label` like `"Source 3: reuters.com"` — not a bare `[3]` — so screen-reader users hear the destination, not just a number.
- **Do not rely on superscript size or color alone** to convey citation meaning. Pair visual treatment with the accessible label and ensure the citation meets WCAG contrast minimums at its displayed size.
- **Snippet popovers must be focus-triggered**, not hover-only. Implement with `<Popover>` or a `role="tooltip"` that appears on both `:hover` and `:focus-visible` so keyboard users access the same preview as pointer users.
- **Source cards in a carousel must be keyboard-navigable.** If the carousel uses `overflow-x: scroll`, ensure each card is reachable via Tab and that the focused card scrolls into view. A `role="list"` / `role="listitem"` structure gives screen readers the item count.
- **Live regions for streaming.** The query bar and source-count updates should use `aria-live="polite"` so screen-reader users are informed when new sources arrive without interrupting ongoing narration.
- **Reduced motion.** Source card streaming animations and citation fade-ins should respect `prefers-reduced-motion` — replace animated entrances with instant reveal for users with vestibular sensitivity.

## Related

- [Tool Call](./tool-call.md) — the generic tool-call card lifecycle that `useRenderTool` drives; web search is a specialization.
- [Deep Research](./deep-research.md) — multi-step, multi-query research with planning, synthesis, and a structured report; web search is the single-turn predecessor.
- [Sub-Agents / Multi-Agent Orchestration](./sub-agents.md) — when a research agent delegates individual searches to sub-agents, this component renders each sub-agent's search result.
- [Agent Status, Activity & Traceability](./agent-activity-traceability.md) — the query bar and source-retrieval log are a specialized form of activity tracing.
- [Thinking / Reasoning Display](./thinking-reasoning.md) — the agent's chain-of-thought about which queries to issue often precedes the search tool call.
- [Human-in-the-Loop Prompt](./human-in-the-loop.md) — use when the agent needs the user to confirm or redirect a query strategy before issuing expensive searches.
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary](../reference/glossary.md)

## Sources

- https://ziptie.dev/blog/how-perplexity-ai-answers-work/
- https://ai.google.dev/gemini-api/docs/google-search
- https://help.openai.com/en/articles/9237897-chatgpt-search
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- https://docs.copilotkit.ai/learn/whats-new/v1-50
- https://docs.ag-ui.com/concepts/events
