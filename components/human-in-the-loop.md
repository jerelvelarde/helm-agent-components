# Human-in-the-Loop Prompt

> A family of blocking interaction checkpoints that pause an agent mid-run, hand control to a human for approval or input, durably preserve state, and resume when the human responds.

**Category:** Component · **Cluster:** Human-in-the-loop (HITL) · **Aliases:** confirm/cancel prompt, approval gate, interrupt, in-thread form, disambiguation prompt, blocking interaction, pause-and-resume

---

## Definition

Human-in-the-Loop (HITL) prompts are structured checkpoints that suspend an agent's execution, surface a decision or input request to a human, and resume only when a verified response arrives. They solve the core trust and safety problem in agentic systems: consequential actions that must not execute without explicit human consent, ambiguous intents that require clarification, and multi-field data that must be collected before a task can proceed. HITL prompts appear inline in the conversation thread or as blocking modal surfaces — the stakes and friction level determine which. Together, they form a friction ladder from a single-tap approval on a reversible action up to typed confirmation or step-up authentication on irreversible ones.

### Four HITL variants

| # | Variant | Core question | Friction level |
|---|---|---|---|
| 1 | **Approval (yes/no)** | "Should I do this?" | Calibrated to stakes: one-click → typed confirm → step-up auth |
| 2 | **Option selection** | "Which of these?" | Low — tap to commit (single) or check + submit (multi) |
| 3 | **Multi-step form / wizard** | "Fill in these fields" | Medium–high — validation, progressive steps, review step |
| 4 | **Interrupts & gating** | Control-flow machinery that underpins all three above | Framework-level; per-action gating policy |

---

## When to use / when not to

- **Use** before executing any action with real-world side effects that cannot be trivially reversed: sending messages, committing to databases, submitting payments, deleting resources, initiating API calls to external services.
- **Use** when the agent must resolve genuine ambiguity before proceeding — the correct path depends on a preference or decision only the user can supply.
- **Use** for collecting multiple related fields in one pass (form/wizard) instead of a serial back-and-forth that loses context across turns.
- **Do not use** for routine, easily reversible, idempotent operations where prompting would cause approval fatigue and train users to click through without reading.
- **Do not use** when the agent has enough context and authority to proceed autonomously; prefer surfacing a notification or undo affordance post-execution instead.

---

## Anatomy

All four variants share a core interrupt anatomy, with variant-specific input surfaces substituting for the buttons zone.

```
┌──────────────────────────────────────────────────────────┐
│ [Agent avatar]   Proposed action / question label         │
│                  ─────────────────────────────────────── │
│                  Action summary / preview (diff, args,    │
│                  fields, options, form steps)             │
│                  ─────────────────────────────────────── │
│ VARIANT 1 APPROVAL                                        │
│   [ Approve ]   [ Reject ]   [⌄ Always allow…]           │
│                                                           │
│ VARIANT 2 OPTION SELECTION                                │
│   ○ Option A    ○ Option B    ○ Option C   [ Other… ]    │
│   (checkboxes for multi-select + [Submit] button)         │
│                                                           │
│ VARIANT 3 FORM / WIZARD                                   │
│   ● Step 1 ── ○ Step 2 ── ○ Step 3 (stepper)            │
│   [ Field label    _____________________ ]               │
│   [ Field label    _____________________ ]               │
│   [ Back ]                    [ Next / Submit ]          │
│                                                           │
│ (status badge: awaiting-decision / approved / rejected)   │
└──────────────────────────────────────────────────────────┘
```

**Parts:**

- **Interrupt header** — agent identity + a plain-language label of what is being asked ("Send this email?" / "Which audience?" / "Step 1 of 3: Delivery details").
- **Action preview / context pane** — shows exactly what will happen: proposed tool args, message diff, target resource, blast radius. Never a vague "Proceed?".
- **Input surface** — variant-specific: buttons (approval), chips/radios/checkboxes (options), form fields + stepper (wizard).
- **Auxiliary controls** — "Always allow" / "Remember this decision" scoping dropdown; "Reject with feedback" free-text for approval variant; "Other…" escape for option variant.
- **Status badge** — real-time lifecycle indicator: `awaiting-decision`, `approved → executing`, `rejected`, `submitted`, `expired`.
- **Respond callback / resolve trigger** — invisible to the user but central to the implementation: the function that unblocks the paused run.

---

## States

### Shared across variants

| State | Trigger | UI treatment |
|---|---|---|
| `idle` | No pending interrupt | Prompt not rendered |
| `streaming / rendering` | Tool args or form schema arriving | Skeleton fields / streaming args visible; input controls disabled |
| `awaiting-decision` | Args or schema complete; prompt active | Input controls enabled; agent visibly blocked (not spinning) |
| `submitting / loading` | User commits decision; network in-flight | Controls disabled; loading indicator on submit button |
| `resolved / applied` | `respond()` or `resolve()` called; agent resumed | Controls disabled; transcript echoes the chosen value; run resumes |
| `expired` | `expiresAt` TTL passed | Banner "this request expired — re-run" with retry affordance |
| `error` | Invalid or partial resume payload | Inline error + re-prompt; never silent proceed |

### Variant-specific additions

| Variant | Additional states |
|---|---|
| Approval (1) | `approving` (optimistic in-flight after click); `denied` (rejection persisted and fed back to model) |
| Option selection (2) | `selecting` (chip highlighted before commit); `empty` (no options generated — falls back to free text) |
| Multi-step form (3) | `editing`, `validating` (inline field errors), `step-transition` (back/next), `review/preview`, `cancelled / abandoned` |
| Interrupts & gating (4) | `interrupt-raised`, `state-persisted` (snapshot emitted), `awaiting-human`, `resuming`, `resumed / continued`, `cancelled` |

---

## Vocabulary

| Term | Definition |
|---|---|
| **Approve / Reject (Allow / Deny)** | The two terminal decisions on an approval prompt; reject feeds a structured denial payload back to the model so it can replan |
| **Denial payload** | Structured rejection data (`{approved: false}`) returned to the agent on deny so it reasons about the refusal rather than crashing |
| **Friction calibration** | Matching confirmation weight (one-click → typed confirm → step-up auth) to reversibility and blast radius of an action |
| **Always-allow / remember-this** | User-scoped whitelist exempting a tool or pattern from future prompts (per-session, per-solution, or global) |
| **Auto-accept / YOLO mode** | Session flag that suppresses all prompts; Claude Code Shift+Tab, Cursor Auto-Run; trades safety for speed |
| **Quick reply / suggestion chip** | Tappable pill rendering a candidate option; reduces typing and steers users toward understood intents |
| **Single-select vs multi-select** | Choose-exactly-one (radio/chips, commits on tap) vs choose-any-subset (checkboxes, requires explicit Submit) |
| **Disambiguation / clarifying question** | Option prompt whose purpose is to resolve ambiguity before the agent proceeds |
| **Other / free-text escape** | Fallback input so users aren't stranded when none of the offered options fit |
| **Slot / field** | One unit of data the agent needs; a form maps slots to validated inputs |
| **Slot filling** | Collecting the full set of required parameters before the agent can proceed |
| **Step / stage** | One screen of a wizard; gated so step N+1 is unlocked only when step N is valid |
| **Progressive disclosure** | Revealing fields/steps only as they become relevant to reduce cognitive load |
| **Preview-before-apply / plan review** | Showing the proposed plan or diff for inspection and edit before the agent commits the change |
| **Partial / scoped approval** | Accepting some steps, fields, or diff hunks while editing or rejecting others |
| **interrupt()** | Framework call (LangGraph) inside a node that pauses the graph and returns a payload to the caller |
| **Command(resume=…)** | LangGraph mechanism to re-enter an interrupted graph and feed the human's response back |
| **Checkpointer / persistence** | Durable store of agent state at the interrupt point so a pause survives page reloads |
| **reason** | AG-UI categorical routing hint on an interrupt: `tool_call`, `input_required`, `confirmation`, or `<framework>:<name>` |
| **responseSchema** | JSON Schema attached to an AG-UI interrupt declaring the expected resume payload; clients validate before submitting |
| **expiresAt / TTL** | ISO-8601 deadline after which a resume attempt produces `RunError` |
| **resolved vs cancelled** | Resume statuses: `resolved` = user responded with a payload; `cancelled` = user abandoned without meaningful input |
| **Parallel interrupts** | Multiple open interrupts emitted in one run; a single resume array must address every open interrupt |
| **Typed confirmation / step-up** | High-friction gate requiring the user to type a resource name or "CONFIRM" (or re-authenticate) before irreversible execution |

---

## Real-world examples

- **ChatGPT agent (OpenAI)** — Explicitly asks permission before consequential real-world actions; fills a cart and pre-fills payment but stops before submitting; refuses high-stakes financial actions outright; runs "watch mode" requiring active supervision on sensitive sites. Users can interrupt, take over the browser (takeover mode), or stop at any point. [https://openai.com/index/introducing-chatgpt-agent/](https://openai.com/index/introducing-chatgpt-agent/)

- **GitHub Copilot agent mode (VS Code / Visual Studio)** — Before running a terminal command or non-built-in tool, Copilot surfaces a Continue button; a dropdown lets users auto-confirm that specific tool for the rest of the session, the solution, or always. `chat.tools.terminal.autoApprove` regex lists in VS Code settings handle allow/deny at the workspace level. [https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode](https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode)

- **Claude Code (Anthropic)** — Per-tool permission modes: `ask` rules prompt per dangerous operation; `allow` rules pre-authorize; Shift+Tab toggles auto-accept-edits; "auto mode" delegates routine approvals to a transcript classifier (Sonnet 4.6) acting as a substitute human approver, reducing fatigue while maintaining a gate. `--dangerously-skip-permissions` removes all gating. [https://www.anthropic.com/engineering/claude-code-auto-mode](https://www.anthropic.com/engineering/claude-code-auto-mode)

- **OpenAI ChatKit widgets (AgentKit)** — Ships a `Select` node (single-select with options + change Action) plus `Buttons` and a `Form` widget that wraps `Text`, `Select`, and `DatePicker` inputs with an `onSubmitAction`; `Card` containers expose confirm/cancel for a review step. Designers compose layouts in ChatKit Studio's Widget Builder. [https://developers.openai.com/api/docs/guides/chatkit-widgets](https://developers.openai.com/api/docs/guides/chatkit-widgets)

- **ChatGPT Deep Research (OpenAI)** — Before starting a long-horizon research run, asks clarifying questions to confirm goals and proposes a research plan the user can review and edit in-chat before compute is spent — HITL option selection gating an expensive task. [https://help.openai.com/en/articles/10500283-deep-research-in-chatgpt](https://help.openai.com/en/articles/10500283-deep-research-in-chatgpt)

- **Devin (Cognition) — Interactive Planning** — Before consuming ACUs, surfaces relevant files plus a step-by-step plan with a confidence estimate (🟢🟡🔴); when unsure it pauses for the user to review, edit, and confirm the plan before proceeding — gating expensive agentic work. [https://cognition.ai/blog/introducing-devin-2-2](https://cognition.ai/blog/introducing-devin-2-2)

- **AG-UI protocol (CopilotKit)** — Models HITL as an interrupt-aware run lifecycle: `RunFinished` carries `outcome.type: 'interrupt'` with an `interrupts[]` array (each with `id`, `reason`, `toolCallId`, `responseSchema`, `expiresAt`); `StateSnapshot` and `MessagesSnapshot` must precede `RunFinished`; the next `RunAgentInput` on the same `threadId` carries `resume:[{interruptId, status, payload}]` covering every open interrupt. [https://docs.ag-ui.com/concepts/interrupts](https://docs.ag-ui.com/concepts/interrupts)

- **LangGraph / LangChain HITL middleware** — `interrupt()` inside a node pauses the graph and persists state via the checkpointer; the app resumes with `Command(resume=…)` on the same thread. Middleware exposes a four-way decision per tool: approve, edit args, reject with feedback, or respond to an ask-user tool. Requires a durable checkpointer (e.g. `AsyncPostgresSaver`) in production. [https://docs.langchain.com/oss/python/langchain/human-in-the-loop](https://docs.langchain.com/oss/python/langchain/human-in-the-loop)

---

## CopilotKit & AG-UI mapping

CopilotKit exposes two distinct primitives for HITL, differing in *who initiates the pause*.

### Friction ladder

| Stakes | Gate type | Primitive |
|---|---|---|
| Low / reversible (e.g. add label) | Auto-run or silent notification | No HITL gate |
| Medium / recoverable (e.g. send email draft) | Approval prompt (one-click) | `useHumanInTheLoop` |
| High / consequential (e.g. deploy to prod) | Approval + preview | `useHumanInTheLoop` with diff preview in `render` |
| Very high / irreversible (e.g. delete account) | Typed confirmation or step-up auth | `useHumanInTheLoop` with typed-confirm input |
| Ambiguous intent | Option selection | `useHumanInTheLoop` (enum schema) |
| Multi-field collection | In-thread form / wizard | `useHumanInTheLoop` (multi-step local state in `render`) |
| Graph interrupt (LangGraph node) | Any of the above, framework-driven | `useInterrupt` |

### `useHumanInTheLoop` — agent-driven tool pause (variants 1–3)

The agent calls a named tool; the run **blocks** until `respond` is called in the UI. No `handler` is needed — `respond` is the exit. This is the primary primitive for approval, option selection, and form collection.

```tsx
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Variant 1 — Approval
useHumanInTheLoop({
  name: "confirm_destructive_action",
  parameters: z.object({
    action: z.string().describe("Plain-language description of the action"),
    targetResource: z.string(),
    irreversible: z.boolean(),
  }),
  render: ({ status, args, respond }) => {
    if (status !== "executing" || !respond) return null;
    return (
      <ApprovalDialog
        action={args.action}
        target={args.targetResource}
        irreversible={args.irreversible}
        // Default focus on the safer choice (Cancel)
        onApprove={() => respond({ approved: true })}
        onReject={(reason?: string) => respond({ approved: false, reason })}
      />
    );
  },
});

// Variant 2 — Option selection (single-select enum)
useHumanInTheLoop({
  name: "clarify_audience",
  parameters: z.object({
    question: z.string(),
    options: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
  render: ({ status, args, respond }) =>
    status === "executing" && respond ? (
      <OptionChips
        question={args.question}
        options={args.options}
        onSelect={(value) => respond({ selected: value })}
        onOther={(text) => respond({ selected: text, freeText: true })}
      />
    ) : null,
});
```

> **v1 equivalent:** `useCopilotAction({ name, parameters: [...], renderAndWaitForResponse })` — `render` receives `{ args, status, respond }`; call `respond(value)` when the user commits.

### `useInterrupt` — framework/graph interrupt (variant 4)

Use when the agent graph raises an interrupt natively (LangGraph `interrupt()`, custom events). The `resolve` callback resumes the graph; `enabled` scopes which interrupt types this handler claims.

```tsx
import { useInterrupt } from "@copilotkit/react-core";

useInterrupt({
  enabled: ({ eventValue }) =>
    eventValue.type === "approval" || eventValue.type === "input_required",
  render: ({ event, resolve }) => (
    <ApproveComponent
      content={event.value.content}
      schema={event.value.responseSchema}
      onAnswer={(answer) => resolve(answer)}
    />
  ),
});
```

> **v1 equivalent:** `useLangGraphInterrupt` (legacy, LangGraph-specific).

### AG-UI interrupt contract

At the wire level, all HITL variants ride the same AG-UI interrupt lifecycle:

1. Agent emits `STATE_SNAPSHOT` + `MESSAGES_SNAPSHOT` before the run ends.
2. `RUN_FINISHED` carries `outcome.type: 'interrupt'` with `interrupts: [{ id, reason, toolCallId?, responseSchema, expiresAt? }]`.
3. `reason` values: `tool_call` (approval, option, form — tool-call-driven), `input_required` (structured form/option), `confirmation` (explicit confirmation gate).
4. Client validates the human's answer against `responseSchema`, then sends the next `RunAgentInput` on the same `threadId` with `resume: [{ interruptId, status: 'resolved'|'cancelled', payload }]`.
5. Every open interrupt must be addressed in one `resume` array. Resumes must be idempotent; `expiresAt` is enforced server-side.

---

## Best practices

- **Calibrate friction to stakes.** One-click for reversible actions; require typed "CONFIRM" or step-up auth for destructive/irreversible ones; refuse out-of-policy actions outright. Never use a soft yes/no dialog for a genuinely catastrophic action.
- **Show what will actually happen.** Surface the exact tool args, diff, recipients, amount, or target resource before the buttons appear. A vague "Proceed?" prompt trains users to approve blindly.
- **Treat rejection as first-class.** Feed a structured `{ approved: false, reason }` denial payload back to the model so it can replan. Expose a "reject with feedback" text input so users can steer the replanning.
- **Offer scoped always-allow to fight approval fatigue** — per-session, per-workspace, or per-tool — but make destructive-scope whitelisting hard (e.g. require explicit confirmation to add an always-allow rule).
- **Stream args, gate controls.** In the `inProgress` (streaming args) phase, show the action summary forming but keep approve/reject/submit disabled until `status === 'executing'` and args are complete. Prevents mis-taps on a half-rendered proposal.
- **Persist state at the interrupt boundary.** Emit `STATE_SNAPSHOT` + `MESSAGES_SNAPSHOT` before `RUN_FINISHED`; for forms, preserve entered data across step navigation, interrupts, and page reloads. Never wipe a half-filled wizard on re-render.
- **Make the blocked state unmistakable.** The agent must visually appear paused — not spinning or loading — with a clear "waiting for your input" affordance. A quiet UI where the agent looks hung is an anti-pattern.
- **Handle timeouts and expiry explicitly.** When `expiresAt` passes, render a "this request expired — re-run" banner. Silent hangs lose user trust.
- **For multi-step forms, end with a review step.** Show a summary of all collected values and the consequence of submission before apply; support partial/scoped approval of diff hunks or plan steps.

---

## Anti-patterns

- **Default focus on the destructive button.** Pre-highlighting Approve means users rubber-stamp via reflex. Default focus should be the safer choice (Cancel/Reject), especially for irreversible actions.
- **Approval fatigue with no escape.** Prompting on every trivial reversible action — with no always-allow or auto-accept escape — trains users to click through without reading. Every gate should have a scoped exemption path for routine patterns.
- **Vague approval requests.** Asking "Continue?" without showing what will happen (no diff, no recipient, no amount, no target) makes the gate theater, not safety.
- **Optimistic execution or silent bypasses.** Never proceed before `respond`/`resolve` is called; never treat a closed or ignored dialog as implicit approval; never let a new message on the thread bypass an open interrupt.
- **One giant form with no progressive disclosure** — or the inverse: over-fragmenting trivial input into many steps. Match step depth to actual cognitive load. Equally, losing entered data on validation failure or step navigation destroys trust in the form.
- **Non-idempotent resumes.** A retried or duplicated resume that re-runs the gated side effect twice can cause double charges, duplicate records, or double sends. Resume responses must be idempotent.

---

## Accessibility

- **ARIA roles.** Render approval dialogs as `role="alertdialog"` (for modal, blocking prompts) or `role="dialog"` (for non-blocking inline variants). Associate a visible `aria-labelledby` (the action label) and `aria-describedby` (the preview/consequence text).
- **Focus management.** When a HITL prompt appears, move focus to it programmatically. Within the prompt, default focus to the safer choice (Cancel/Reject button); within an option group, focus the first option or the recommended default. On resolve, return focus to the relevant point in the thread.
- **Keyboard operation.** Full keyboard navigation is required: `Enter`/`Space` to confirm the focused choice, `Escape` to dismiss/reject (approval prompts), arrow keys within `radiogroup` or checkbox group for option selection, `Tab`/`Shift+Tab` between fields in forms, `Back`/`Next` reachable via Tab order.
- **Live-region announcements.** When a new HITL prompt arrives, announce it via an `aria-live="polite"` or `aria-live="assertive"` region so screen-reader users aren't silently left waiting. Use `assertive` for high-stakes blocking prompts.
- **Option selection controls.** Chips must be `<button>` elements (not `div`s with `onClick`). Single-select groups use `role="radiogroup"` with `role="radio"` items; multi-select uses labeled `<input type="checkbox">` elements. Never rely on color or icon alone to convey selection state.
- **Forms.** Associate every `<label>` with its field; group steps in `<fieldset>` with `<legend>`; expose validation errors via `aria-describedby` linked to an error message element and `aria-live="polite"` on the error container; move focus to the new step's heading or first field on step transition.

---

## Related

- [Tool Call](./tool-call.md) — the `TOOL_CALL_*` lifecycle that underlies all HITL tool calls; `useHumanInTheLoop` is built on top of `useFrontendTool`
- [Inline Generative UI (Static / Controlled)](./generative-ui-inline.md) — HITL render functions produce Static Generative UI; approval/form UI renders inside the same tool-call slot
- [Agent Status, Activity & Traceability](./agent-activity-traceability.md) — the global "agent blocked / awaiting input" indicator that pairs with an active HITL prompt
- [Suggestions & Capability Surfacing](./suggestions-capabilities.md) — option-selection quick replies are the low-friction sibling of HITL option prompts; `useConfigureSuggestions` vs `useHumanInTheLoop`
- [Deep Research](./deep-research.md) — uses HITL clarifying-question gates before committing to a long research run
- [Sub-Agents / Multi-Agent Orchestration](./sub-agents.md) — parallel interrupts and inter-agent gating patterns
- [Threads / Conversation History](./threads-history.md) — interrupt state and `MESSAGES_SNAPSHOT` power thread restore and audit trails
- [Canvas / Workspace & Artifacts](../layouts/canvas-workspace.md) — preview-before-apply / diff review is a HITL variant in canvas/workspace layouts
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md) — `useHumanInTheLoop`, `useInterrupt`, `ToolCallStatus`
- [AG-UI protocol reference](../reference/ag-ui-protocol.md) — interrupt lifecycle, `reason`, `responseSchema`, `expiresAt`, resume contract

---

## Sources

- https://openai.com/index/introducing-chatgpt-agent/
- https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode
- https://www.anthropic.com/engineering/claude-code-auto-mode
- https://developers.openai.com/api/docs/guides/chatkit-widgets
- https://help.openai.com/en/articles/10500283-deep-research-in-chatgpt
- https://cognition.ai/blog/introducing-devin-2-2
- https://docs.ag-ui.com/concepts/interrupts
- https://docs.langchain.com/oss/python/langchain/human-in-the-loop
- https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop
- https://docs.copilotkit.ai/integrations/langgraph/generative-ui/your-components/interrupt-based
