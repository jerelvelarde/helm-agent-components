# Deep Research

> An autonomous, long-running research agent that takes a single prompt, proposes an editable plan, browses dozens-to-hundreds of sources, and delivers a structured, cited report — with live progress visibility throughout.

**Category:** Component · **Cluster:** Multi-agent & research · **Aliases:** deep research agent, research mode, long-running research, agentic research, research report generation, Perplexity Research, multi-source report with citations

---

## Definition

Deep Research is a multi-phase, long-running (minutes, not seconds) agentic component that autonomously issues queries, reads sources, synthesizes findings, and produces a multi-section report with inline citations. It solves the transparency problem inherent to expensive, time-consuming background runs: users need to see work happening, not just wait. It appears as a dedicated mode or panel in research-grade products, distinguished from a standard chat turn by an explicit plan-approval gate, a live activity feed, and a final structured report artifact.

---

## When to use / when not to

- **Use** when the task requires pulling from many independent sources — competitive analysis, literature reviews, regulatory landscape scans, due-diligence summaries — where a single-turn LLM answer would be unreliably shallow.
- **Use** when the cost/benefit of a 5-30 minute wait is justified by the depth required, and the user has signaled intent for that depth (a "Research" mode or button, not the default chat path).
- **Use** when the output will be used as a deliverable — exported, shared, or cited in a document — rather than ephemeral chat context.
- **Do not use** for quick factual lookups or short-horizon answers where a tool-augmented chat turn is sufficient and faster.
- **Do not use** as the default interaction mode; gate it behind an explicit trigger so users only invoke it deliberately.

---

## Anatomy

```
┌──────────────────────────────────────────────────────┐
│  [1] Prompt / Scoping input                          │
│      Optional: [2] Clarifying questions (HITL)       │
├──────────────────────────────────────────────────────┤
│  [3] Research plan                                   │
│      ┌─────────────────────────────────────────┐    │
│      │  • Sub-topic A                          │    │
│      │  • Sub-topic B                [Edit]    │    │
│      │  • Sub-topic C                          │    │
│      └─────────────────────────────────────────┘    │
│          [ Start research ]  [ Cancel ]              │
├──────────────────────────────────────────────────────┤
│  [4] Activity / progress feed (live)                 │
│      ↳ Query: "renewable energy policy 2024"         │
│      ↳ Source: arxiv.org/abs/2401.xxxxx (reading)    │
│      ↳ Sub-topic A: ✓  Sub-topic B: …               │
│      ↳ [5] Show thinking toggle ▸                    │
│                          [6] Steer / interrupt ▸     │
├──────────────────────────────────────────────────────┤
│  [7] Report (streams in sections as they finalize)   │
│      ## Executive Summary                            │
│      … [8] Inline citations [1][2]                  │
│      ## Section 1: …                                 │
│      ─────────────────────────────                  │
│      [9] Sources list   [10] Export ▸  [Share ▸]    │
└──────────────────────────────────────────────────────┘
```

**Parts:**
1. **Prompt / scoping input** — the initial research question; may include source-scoping/connectors.
2. **Clarifying questions** — optional HITL step before the plan is generated; scopes underspecified prompts.
3. **Research plan** — agent-proposed outline of sub-topics and intended sources; editable and gated behind explicit approval (the primary trust + cost-control moment).
4. **Activity / progress feed** — live list of queries issued, sources being read, and sub-topics in progress.
5. **Show thinking / thinking panel** — real-time summary of what the model has learned and what it intends next (Gemini-style).
6. **Steering / interrupt affordance** — mid-run controls to refine scope, restrict sources, or inject a follow-up prompt.
7. **Report** — the final deliverable; streams in section-by-section as each finalizes.
8. **Inline citations** — claim-level source references anchored in the narrative text.
9. **Sources list** — deduplicated bibliography of all sources consulted.
10. **Export / share controls** — PDF, doc, or sharable Page output.

---

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle / empty | No research initiated | Prompt input + optional connector/source-scope controls; possibly starter suggestions |
| Clarifying questions | Agent asks before plan (underspecified prompt) | HITL form in thread; sends user answers back to agent |
| Plan proposed | Agent emits plan; awaiting user approval | Editable plan card with sub-topics; "Start research" / "Cancel" primary actions; run is blocked |
| Researching | User approves plan | Activity feed animates: live query/source entries stream in; progress indicators per sub-topic; "Show thinking" toggle available; steering controls exposed |
| Interruptible / steering | User activates mid-run controls | Inline focus-refinement form or source-restriction picker; agent pauses briefly to incorporate |
| Synthesizing & verifying | All sources consumed; drafting phase | Activity feed shows "Synthesizing…"; partial report sections stream into the report panel as they finalize; conflict flags may appear inline |
| Report ready | Run completes | Full multi-section report with inline citations; sources list; export/share controls enabled |
| Export / share | User triggers export | PDF/doc download or shareable Page link generated |
| Error / partial | Timeout, source failure, or run error | Partial cited results shown; error banner with source count and retry; no silent empty state |

---

## Vocabulary

| Term | Definition |
|---|---|
| Research plan | The agent's proposed outline of sub-topics and intended sources, shown before the run starts; editable and gated behind explicit user approval. |
| Clarifying questions | Follow-up questions posed by the agent before generating the plan, used to scope underspecified prompts. |
| Activity / progress feed | The live panel streaming queries issued, sources being read, and per-sub-topic status during an active run. |
| Show thinking / thinking panel | Real-time display of what the agent has learned so far and what it intends to do next (mid-run reasoning stream). |
| Streaming progress | Real-time emission of thought summaries, partial report sections, and inline artifacts (charts, images) as research proceeds. |
| Steering / interrupt | Mid-run controls for refining scope, filtering allowed sources, or injecting a follow-up prompt without a full restart. |
| Synthesis / verification phase | Late-run stage where partial notes are merged into a coherent narrative and conflicting claims between sources are flagged. |
| Source-scoping / connectors | Pre-run controls that limit research to selected domains or connect private data (MCP connectors, enterprise knowledge) so the report draws on the right corpus. |
| Report export / Page | Converting the finished report to PDF, doc, or a sharable hosted page that preserves citations intact. |

---

## Real-world examples

- **ChatGPT Deep Research (OpenAI)** — Proposes an editable research plan before starting; the Feb 2026 update added real-time interrupt/steer controls, domain filtering, and MCP server connectors; delivers a full-screen cited report viewable and exportable after ~5-30 min runs. [Source](https://en.wikipedia.org/wiki/ChatGPT_Deep_Research)
- **Gemini Deep Research (Google)** — Presents a multi-step plan for user refinement, then shows a live "thinking panel" (what has been learned + what comes next) while browsing; can natively generate charts and infographics inline in the streaming report; concludes with a cited report. [Source](https://gemini.google/overview/deep-research/)
- **Perplexity Deep Research / Research mode** — Selectable research mode that moves through query interpretation, research execution, and synthesis/verification; flags conflicting claims mid-synthesis; final report carries dense inline citations and can be exported to PDF/doc or turned into a shareable Page. [Source](https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research)
- **Microsoft 365 Copilot — Researcher** — GA June 2025; combines OpenAI's deep research model with M365 orchestration, connecting web and third-party enterprise data via connectors to produce analyst-grade deliverables grounded in work context. [Source](https://www.microsoft.com/en-us/microsoft-365/blog/2025/06/02/researcher-and-analyst-are-now-generally-available-in-microsoft-365-copilot/)

---

## CopilotKit & AG-UI mapping

Deep Research composes three CopilotKit mechanisms: **HITL** for the plan-approval gate, **shared state** for live progress streaming, and **tool-call rendering** for per-source activity.

**Plan-approval gate** → `useHumanInTheLoop` (v2) or `useInterrupt` (for LangGraph/framework interrupts). The agent emits the research plan and pauses; the UI renders an editable plan card and calls `respond` or `resolve` when the user approves. v1 equivalent: `useCopilotAction({ renderAndWaitForResponse })`.

**Live activity / progress feed** → `useAgent` (v2) subscribes to `STATE_SNAPSHOT` / `STATE_DELTA` events emitted by `copilotkit_emit_state` on the backend. Render the `agent.state.steps` list into the activity feed. v1 equivalent: `useCoAgent`.

**Per-source tool-call cards** → `useRenderTool` renders each `search_web` / `read_source` tool call with `ToolCallStatus` (`InProgress → Executing → Complete`), surfacing individual source activity in the feed.

**Final report** → streams into the thread as the agent's final `TEXT_MESSAGE_*` sequence, or is held in shared state and rendered as a dedicated report panel.

AG-UI events driving the component:
- `RUN_STARTED / RUN_FINISHED / RUN_ERROR` — global run lifecycle
- `TOOL_CALL_START / TOOL_CALL_ARGS / TOOL_CALL_END / TOOL_CALL_RESULT` — per-source activity feed entries
- `STATE_SNAPSHOT / STATE_DELTA` — live progress state (steps, sub-topic status, partial notes)
- `TEXT_MESSAGE_*` — streamed report sections

```tsx
import { useInterrupt } from "@copilotkit/react-core";
import { useAgent } from "@copilotkit/react-core/v2";
import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

// 1. Plan-approval gate: intercept the agent's framework interrupt
useInterrupt({
  enabled: ({ eventValue }) => eventValue.type === "plan_approval",
  render: ({ event, resolve }) => (
    <ResearchPlanCard
      plan={event.value.plan}
      onApprove={(editedPlan) => resolve({ approved: true, plan: editedPlan })}
      onCancel={() => resolve({ approved: false })}
    />
  ),
});

// 2. Live progress feed from shared agent state (STATE_SNAPSHOT / STATE_DELTA)
const { agent } = useAgent({ agentId: "deep-research-agent" });
const { steps, subTopics } = agent.state as DeepResearchState;
// Render <ActivityFeed steps={steps} subTopics={subTopics} /> in your panel

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
// v1 equivalent for plan gate: useCopilotAction({ renderAndWaitForResponse })
// v1 equivalent for shared state: useCoAgent({ name: "deep-research-agent", initialState })
```

Host the panel in `CopilotSidebar` for a side-by-side layout or `CopilotChat` in a dedicated full-page route. See [useInterrupt docs](https://docs.copilotkit.ai/integrations/langgraph/generative-ui/your-components/interrupt-based), [useAgent / shared state](https://docs.copilotkit.ai/learn/whats-new/v1-50), and [useRenderTool](https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool).

---

## Best practices

- **Gate the run behind an editable plan.** Show the proposed research outline before a single query fires, let the user edit it, and require explicit "Start research" confirmation. This is the highest-leverage moment for trust, cost control, and scope alignment — ChatGPT, Gemini, and Perplexity all do it.
- **Treat the activity feed as a first-class feature, not a spinner.** Stream individual queries, source URLs, and sub-topic progress in real time. A bare "Researching… please wait" message makes a stall indistinguishable from progress.
- **Expose steering controls mid-run.** Let users narrow scope, block specific domains, or inject a correction prompt without forcing a full cancel-restart cycle. A small interrupt affordance prevents minutes of wasted compute.
- **Stream report sections as they finalize.** Don't hold the entire report until the very end. Render each section as it completes so the user builds confidence in the output incrementally.
- **Make citations claim-level and mandatory.** Every specific claim in the report must link to its source. A polished multi-page document with end-only or missing citations cannot be verified and erodes trust.
- **Persist the run across navigation.** Long-running research should survive a tab switch, a refresh, or an accidental close. Losing the entire run on navigation is unacceptable for a 10-30 minute task.
- **Communicate cost and quota honestly.** Where runs are metered (credit quotas, usage limits), surface that before the user commits to "Start research" — not after a failed run.
- **Provide partial results on error.** If the run times out or sources fail, return what was found rather than a blank error. Show the source count consulted, what was retrieved, and a retry option.
- **Add a trust disclaimer.** Explicitly note that the report can contain errors and should be verified against the linked sources — especially critical in health, legal, and financial contexts.

---

## Anti-patterns

- **Starting a run with no plan and no confirmation.** Kicking off a 10-30 minute, potentially expensive run from a vague prompt with no scope confirmation means the user only discovers the wrong direction after waiting.
- **A bare progress spinner.** "This may take a few minutes" with no query/source visibility makes the UX opaque and every silent period feel like a crash.
- **Weak or end-only citations.** A confident multi-section report that lists references only at the bottom cannot be verified claim-by-claim, undermining the core value proposition of deep research.
- **No interrupt or steer affordance.** Forcing a full cancel and restart to correct a drifting investigation wastes the entire elapsed run time. Always provide at minimum a "Stop and save partial results" control.
- **Losing the run on navigation.** Deep research is a background task; treating it as a blocking foreground process that dies if the user switches tabs is a fundamental architectural failure.

---

## Accessibility

- Announce phase transitions (`plan proposed → researching → synthesizing → report ready`) via `aria-live="polite"` regions so screen reader users track progress without visual scanning; avoid announcing every individual source to prevent live-region flooding.
- The editable research plan must be a keyboard-navigable form — not read-only display text — with each sub-topic field reachable by Tab, editable inline, and labelled with `aria-label` or `<label>`.
- Activity feed items that expand (e.g., "show thinking" disclosure) must use `<button aria-expanded="true/false">` so their collapsed/expanded state is announced.
- Export and share buttons must have descriptive `aria-label` values (not just icon-only); focus should advance to the download confirmation or generated link on activation.
- For reduced-motion environments (`prefers-reduced-motion: reduce`), replace animated progress indicators and streaming text effects with static, punctual updates.
- When the report is ready, move focus programmatically to the report heading so keyboard and screen reader users are not left in the activity feed with no signal that the deliverable is available.

---

## Related

- [./human-in-the-loop.md](./human-in-the-loop.md) — Human-in-the-Loop Prompt (plan approval gate pattern)
- [./agent-activity-traceability.md](./agent-activity-traceability.md) — Agent Status, Activity & Traceability (activity feed fundamentals)
- [./web-research.md](./web-research.md) — Web Research / Search (single-turn search; the lighter-weight alternative)
- [./thinking-reasoning.md](./thinking-reasoning.md) — Thinking / Reasoning Display (show-thinking panel pattern)
- [./tool-call.md](./tool-call.md) — Tool Call (per-source tool-call card rendering)
- [./sub-agents.md](./sub-agents.md) — Sub-Agents / Multi-Agent Orchestration (multi-agent composition patterns)
- [./generative-ui-inline.md](./generative-ui-inline.md) — Inline Generative UI (Static / Controlled) (report as agentic generative UI artifact)
- [../layouts/canvas-workspace.md](../layouts/canvas-workspace.md) — Canvas / Workspace & Artifacts (full-page report panel layout)
- [../layouts/side-panel.md](../layouts/side-panel.md) — Side Panel / Sidebar Copilot (side-by-side research layout)
- [../reference/copilotkit-primitives.md](../reference/copilotkit-primitives.md) — CopilotKit primitive reference
- [../reference/ag-ui-protocol.md](../reference/ag-ui-protocol.md) — AG-UI protocol reference
- [../reference/glossary.md](../reference/glossary.md) — Master vocabulary

---

## Sources

- https://en.wikipedia.org/wiki/ChatGPT_Deep_Research
- https://gemini.google/overview/deep-research/
- https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research
- https://www.microsoft.com/en-us/microsoft-365/blog/2025/06/02/researcher-and-analyst-are-now-generally-available-in-microsoft-365-copilot/
- https://docs.copilotkit.ai/integrations/langgraph/generative-ui/your-components/interrupt-based
- https://docs.copilotkit.ai/learn/whats-new/v1-50
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop
- https://docs.ag-ui.com/concepts/events
