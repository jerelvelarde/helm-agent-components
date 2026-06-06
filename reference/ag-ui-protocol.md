# AG-UI Protocol Reference

> [AG-UI](https://docs.ag-ui.com) (the **Agent–User Interaction protocol**) is the open, event-based wire format that connects an agent backend to a frontend. CopilotKit consumes AG-UI events to drive its chat, tool-call, state, and HITL surfaces. Understanding the event taxonomy explains *why* the components in this design system have the states they do — every visual state is downstream of an event.

---

## Why it matters for this design system

Most "agentic" components are not new widgets — they are **renderings of a stream of typed events**. A streaming message bubble is `TEXT_MESSAGE_*`. A tool-call card is `TOOL_CALL_*`. A live-updating canvas is `STATE_DELTA`. A "thinking" disclosure is a thinking event. When you design a component, you are really designing the visual grammar for an event sequence. AG-UI is framework-agnostic: the same events (and therefore the same components) work across LangGraph, CrewAI, Mastra, ADK, AG2, LlamaIndex, Microsoft Agent Framework, Pydantic AI, and CopilotKit's built-in agent.

```
Agent run ──► emits AG-UI events ──► CopilotKit ──► React components
   RUN_STARTED
   TEXT_MESSAGE_START → …CONTENT… → TEXT_MESSAGE_END   (assistant message streams in)
   TOOL_CALL_START → TOOL_CALL_ARGS → TOOL_CALL_END     (tool-call card: InProgress→Executing)
   TOOL_CALL_RESULT                                     (card: Complete)
   STATE_SNAPSHOT / STATE_DELTA                          (shared-state surfaces update)
   RUN_FINISHED | RUN_ERROR
```

---

## Event categories

AG-UI defines **25 event types** ([events reference](https://docs.ag-ui.com/concepts/events)) covering the full lifecycle of an agent interaction. All events extend a strongly-typed `BaseEvent`. They group into a few families:

### Lifecycle events
Bracket a run and signal status. Backbone for run-level UI: the global "agent is working" indicator, error toasts, completion states.

| Event | Drives |
|---|---|
| `RUN_STARTED` | Agent run begins — show "working", disable send, start activity log |
| `RUN_FINISHED` | Run completed cleanly — settle UI, enable input |
| `RUN_ERROR` | Run failed — error card + retry affordance |
| step lifecycle events | Multi-step progress (plans, sub-tasks) — step checklists / progress |

### Content events
The streaming text and tool-call substance of a turn.

| Event | Drives |
|---|---|
| `TEXT_MESSAGE_START` / `…CONTENT` / `…END` | The assistant **message bubble** streaming token-by-token |
| `TOOL_CALL_START` / `TOOL_CALL_ARGS` / `TOOL_CALL_END` | The **tool-call card** — name appears, args stream in (`InProgress`), args resolve (`Executing`) |
| `TOOL_CALL_RESULT` | Tool result returns — card → `Complete`, render result component |
| thinking-process events | The **thinking / reasoning** disclosure (chain-of-thought, reasoning stream). Exact event names: see the AG-UI events reference |

> The `TOOL_CALL_*` sequence is exactly what produces CopilotKit's `ToolCallStatus` machine (`InProgress → Executing → Complete`) described in [`copilotkit-primitives.md`](./copilotkit-primitives.md).

### State events
Efficient sync of agent state to the client — the foundation of **shared state / CoAgents** and any agent-driven canvas.

| Event | Meaning | Drives |
|---|---|---|
| `STATE_SNAPSHOT` | Complete state at a point in time | Initial hydration of a co-edited document / canvas / dashboard |
| `STATE_DELTA` | Incremental change as **JSON Patch (RFC 6902)** | Live, low-bandwidth updates to the shared surface |
| `MESSAGES_SNAPSHOT` | Complete conversation history | **Threads / history** rehydration, audit trail |

---

## Generative UI in AG-UI

AG-UI's core mechanism for generative UI is **sending client-side tools to the agent**, so the agent can invoke a UI component without the programmer pre-wiring every renderer. The ecosystem has converged on a few specs that ride on top (see the [Generative UI overview](https://docs.copilotkit.ai/learn/generative-ui)):

- **[A2UI](https://github.com/google/A2UI)** — Google's declarative generative-UI language: agents propose UI trees + constraints; the app validates and mounts them.
- **[MCP Apps](https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/)** — render interactive UI components served by MCP servers directly in chat.
- **[Open-JSON-UI](https://docs.copilotkit.ai/learn/generative-ui/specs/open-json-ui)** — an open standardization of OpenAI's declarative generative-UI schema.

These map to the **Declarative** and **Open-Ended** generative-UI types; CopilotKit's native `useRenderTool` covers the **Static** type.

---

## Practical mapping

| You are designing… | Watch these events |
|---|---|
| Streaming assistant bubble | `TEXT_MESSAGE_START/CONTENT/END` |
| Tool-call card with live status | `TOOL_CALL_START/ARGS/END`, `TOOL_CALL_RESULT` |
| Thinking / reasoning panel | thinking-process events + `TEXT_MESSAGE_*` |
| Co-edited canvas / live document | `STATE_SNAPSHOT`, `STATE_DELTA` |
| Thread restore / audit log | `MESSAGES_SNAPSHOT` |
| Global "agent working" + errors | `RUN_STARTED/FINISHED/ERROR` |
| Multi-step plan / sub-agent progress | step lifecycle + per-run `RUN_*` |

---

## Sources

- AG-UI introduction — https://docs.ag-ui.com/introduction
- Core architecture (state management) — https://docs.ag-ui.com/concepts/architecture
- Events (25 event types) — https://docs.ag-ui.com/concepts/events
- Integrations (A2UI, MCP Apps) — https://docs.ag-ui.com/integrations
- CopilotKit ↔ AG-UI — https://docs.copilotkit.ai
