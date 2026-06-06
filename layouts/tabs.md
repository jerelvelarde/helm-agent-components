# Tabs / Mode Switching

> A control that switches the agent — or its workspace — between distinct operating modes or views without leaving the surface.
**Category:** Layout · **Cluster:** Layouts & workspaces · **Aliases:** mode switcher, ask/edit/agent modes, model picker, segmented control, view tabs, panel tabs, mode toggle, tabbed workspace

## Definition

Tabs / Mode Switching encompasses controls that let users shift between named behavior profiles (e.g., Ask vs. Edit vs. Agent) or named content panes (e.g., Chat / Code / Preview / Plan) without navigating away. Mode tabs change the agent's autonomy scope, available tools, and edit permissions. View tabs change what content the workspace presents without altering agent behavior. The distinction matters: conflating the two leads to unexpected autonomy changes or confusing tool gating.

## When to use / when not to

- **Use** when the agent has meaningfully distinct operating modes with different risk profiles — a read-only Ask mode and an autonomous Agent mode warrant explicit user choice, not implicit escalation.
- **Use** when a workspace genuinely surfaces multiple content types (Chat, Code output, Preview, Execution plan) that cannot coexist without obscuring each other.
- **Use** for a model/effort picker when offering more than one reasoning depth or model, particularly when latency and cost trade-offs matter to users.
- **Avoid** when all "modes" produce nearly identical behavior — do not add friction if the difference is invisible to the user.
- **Avoid** when cardinality exceeds five options; reach for a dropdown or router-default instead of a bloated tab bar that confuses rather than clarifies.

## Anatomy

```
┌──────────────────────────────────────────────┐
│  ┌─────────┐ ┌──────────┐ ┌─────────────┐   │  ← Tab bar (role="tablist")
│  │  Ask    │ │  Edit    │ │  Agent  ●   │   │    ● = active/selected tab
│  └─────────┘ └──────────┘ └─────────────┘   │
├──────────────────────────────────────────────┤
│                                              │
│   Tab panel (role="tabpanel")                │
│   — mode-gated tools visible here           │
│   — agent context / chat surface            │
│                                              │
│  [Composer]  [Model picker ▾]               │  ← capability-gated inputs
└──────────────────────────────────────────────┘
```

**Structural parts:**
- **Tab bar** — the `role="tablist"` container holding all tab triggers. Fixed above or beside the panel.
- **Tab trigger** — individual `role="tab"` button; carries `aria-selected` and `aria-controls` pointing to its panel.
- **Tab panel** — `role="tabpanel"` region swapped into view; contains the chat surface, tool outputs, or content for that mode.
- **Active / selected state** — the visually distinct currently-chosen tab; reflected in `aria-selected="true"` and roving focus.
- **Mode badge** — persistent indicator in the composer showing which mode is live between turns.
- **Model / effort picker** — a secondary control (often a dropdown in the composer footer) for choosing reasoning depth; orthogonal to but often co-located with mode tabs.
- **Capability-gated inputs** — tools, file-attach buttons, or command affordances hidden or disabled when not applicable to the active mode.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Default mode selected | Initial render or session start | One tab shows `aria-selected="true"`, visually highlighted; others idle |
| Hover / focus on a tab | Pointer hover or keyboard arrow key | Focus ring or hover highlight; tooltip shows mode description if useful |
| Switching | User clicks / keys to a new tab | Instant panel swap; tab becomes active; badge updates in composer |
| Active mode with mode-specific tools visible | Mode settled after switch | Capability-gated tools appear or become enabled; irrelevant tools hidden |
| Disabled / locked mode | Context gating (plan required, credits, permissions) | Tab is `disabled`, visually muted; tooltip explains the gate |
| Auto / router deciding | System is choosing model/effort per turn | Picker shows "Auto" with a subtle spinner or badge; no tab is locked |
| Warning on mid-run switch | User attempts to change mode while agent is streaming | Inline warning or confirmation modal; switch either blocked or queued |

## Vocabulary

| Term | Definition |
|---|---|
| Mode | A named behavior profile that changes the agent's autonomy, allowed tools, or edit permissions (e.g., Ask, Edit, Agent). |
| Model / effort picker | A selector for the underlying model or reasoning depth (e.g., Auto / Fast / Thinking), usually co-located with the composer. |
| Segmented control | A compact set of mutually-exclusive toggle buttons used for low-cardinality mode choices (typically 2–4 options). |
| Router / auto mode | A meta-mode that delegates model/depth selection to the system based on query complexity; users opt in without committing to a specific model. |
| View tab | A tab that swaps the visible content of a pane (Chat / Code / Preview / Plan) rather than changing agent behavior or autonomy. |
| Active / selected state | The visually distinct currently-chosen tab, reflected via `aria-selected` and roving keyboard focus. |
| Sticky mode | Whether the chosen mode persists across turns and sessions or resets to a default each message. |
| Capability gating | Hiding or disabling tools and actions that don't apply to the current mode (e.g., no file writes in Ask mode). |

## Real-world examples

- **GitHub Copilot in VS Code** — A dropdown at the bottom of the chat panel exposes three explicit modes: Ask (answers only, no edits), Edit (applies inline edits across chosen files), Agent (autonomous multi-step with command execution). Inline chat (Cmd+I) is a separate surface entirely, reinforcing that the panel tab controls agent scope, not just content. [Source](https://github.blog/ai-and-ml/github-copilot/copilot-ask-edit-and-agent-modes-what-they-do-and-when-to-use-them/)
- **ChatGPT model picker (GPT-5)** — The composer exposes Auto, Fast, and Thinking options; Auto delegates model selection to a real-time router that chooses between fast and deep-reasoning models per turn based on complexity. The picker is back after an iteration cycle that revealed how quickly granular model choices overwhelm users. [Source](https://techcrunch.com/2025/08/12/chatgpts-model-picker-is-back-and-its-complicated/)
- **Cursor (Agents Window & Agent Tabs)** — Cursor 2.0 introduced parallel agents (up to eight, each on an isolated codebase copy). Cursor 3.0 ("Glass") added the Agents Window and Agent Tabs — a grid of independent agent sessions each with its own context, model, and execution environment — plus a browser-based Design Mode that lets users target UI elements directly. [Source](https://cursor.com/changelog/3-0)
- **Perplexity modes** — Search, Research, and Labs are pre-query mode selectors near the composer. Search = fast retrieval; Research = deep multi-source cited report; Labs = interactive dashboard/app generation. The choice gates both autonomy depth and output format. [Source](https://www.perplexity.ai/hub/getting-started)

## CopilotKit & AG-UI mapping

CopilotKit does not ship a prebuilt mode-switcher component — you build the tab bar or segmented control yourself and use hooks to scope agent behavior per mode.

**Agent / thread scoping per mode:** Switch between agents or threads by passing a different `agentId` to `useAgent`. Each agent ID maps to its own run context, tools, and state.

**Capability gating per mode:** Conditionally register `useFrontendTool` based on the active mode. When a mode is inactive, simply don't call the hook (or gate with `enabled`). Tools registered in one mode are invisible to the agent in another.

**Sharing mode state with the agent:** Use `useCopilotReadable` to push the current mode into the agent's context so it reasons within the right behavior profile.

**AG-UI relevance:** Mode switches that launch a new agent run emit `RUN_STARTED`; the agent's available tools are determined at runtime, not at the protocol level — AG-UI has no "mode" event. `STATE_SNAPSHOT` / `STATE_DELTA` are the right primitives if the tab panel hosts a co-edited canvas that persists across mode switches.

```tsx
import { useAgent } from "@copilotkit/react-core/v2";
import { useFrontendTool } from "@copilotkit/react-core/v2";
import { useCopilotReadable } from "@copilotkit/react-core";
import { z } from "zod";
import { useState } from "react";

type Mode = "ask" | "edit" | "agent";

function AgentModeWorkspace() {
  const [mode, setMode] = useState<Mode>("ask");

  // Expose active mode to the agent's context
  useCopilotReadable({
    description: "The user's selected operating mode",
    value: mode,
  });

  // Gate tools by mode — only register when the mode permits them
  useFrontendTool({
    name: "apply_edit",
    description: "Apply a code edit to the open file",
    parameters: z.object({ patch: z.string() }),
    handler: async ({ patch }) => applyPatch(patch),
    // Only mounted (and therefore available to the agent) when mode allows writes
    ...(mode === "ask" && { handler: async () => "read-only mode — edits disabled" }),
  });

  return (
    <div>
      {/* Build the tablist yourself; CopilotKit does not provide a mode switcher */}
      <div role="tablist" aria-label="Agent mode">
        {(["ask", "edit", "agent"] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* CopilotSidebar (or CopilotChat) renders the chat panel for this mode */}
      <div role="tabpanel">
        {/* Embed CopilotChat / CopilotSidebar here */}
      </div>
    </div>
  );
}
// v1 equivalent: replace useAgent with useCoAgent; useFrontendTool with useCopilotAction
```

See [`../reference/copilotkit-primitives.md`](../reference/copilotkit-primitives.md) for `useAgent`, `useFrontendTool`, and `useCopilotReadable` full signatures.

## Best practices

- **Describe consequences before commitment.** Each tab label alone ("Agent") does not convey what the mode can do. Add a short subtitle, tooltip, or onboarding hint — "can edit files and run commands" — so users grant higher autonomy knowingly.
- **Implement a proper ARIA tablist.** Use `role="tablist"` / `role="tab"` / `role="tabpanel"`, `aria-selected`, `aria-controls`, and `id` linkage. Arrow-key roving focus is required; Tab moves focus into the panel, not across tabs.
- **Gate capabilities to the active mode.** Conditionally mount `useFrontendTool` hooks rather than registering all tools and letting the agent decide which to call — the wrong tool in the wrong mode is a trust failure, not just a UX glitch.
- **Persist the last-used mode per workspace** (localStorage or server preference) and badge the active mode in the composer. Users returning to a session must immediately know the agent's current autonomy level.
- **Default to Auto / low-autonomy.** Lead with Ask or Auto so most users never touch the mode picker; power users escalate deliberately.
- **Block or warn on mid-run switches.** If a user changes mode while the agent is streaming or executing a tool, prompt them: "Switch to Ask mode? The current run will be cancelled." Do not silently discard in-flight work.
- **Preserve tab-panel state across switches.** Scroll position, draft text, and in-progress output should survive a round-trip. Destroying inactive tab state (loss of draft messages, scroll positions) breaks the mental model of tabs as persistent panes.
- **Keep cardinality low.** Two to four mode options is the usable ceiling for a segmented control. If you need more, a dropdown with an "Auto" default reduces cognitive load for the majority path.

## Anti-patterns

- **Over-granular pickers.** A model picker with eight named models and three reasoning depths forces users to research LLM internals before asking a question. Lead with Auto; hide expert options behind "Advanced."
- **Silent mode resets.** If ask mode quietly resets to agent mode between turns or sessions, users lose the expectation of read-only safety. Sticky mode must be the default; resets must be deliberate and visible.
- **Tabs built from unsemantic markup.** `<div onClick>` tabs are invisible to screen readers, unreachable by keyboard, and inaccessible to switch-access users. ARIA tablist markup is not optional.
- **Hiding the active mode.** If the mode badge is absent or buried, users in Agent mode may not realize the agent is about to modify files or execute commands. The active mode must be persistently visible in or near the composer.
- **Destroying inactive tab state.** Switching from Chat to Code and back should not lose the user's scroll position, message draft, or any output that was rendering. Unmounting DOM is fine only if state is preserved externally.

## Accessibility

- **ARIA tablist pattern.** Container: `role="tablist"`. Each trigger: `role="tab"`, `aria-selected="true|false"`, `aria-controls="<panelId>"`, `id="<tabId>"`. Panel: `role="tabpanel"`, `aria-labelledby="<tabId>"`, `tabindex="0"`. This is the WAI-ARIA authoring practices 1.1 / 1.2 Tabs pattern.
- **Keyboard navigation.** Arrow Left / Right moves focus across tabs within the tablist (roving `tabindex`). Tab moves focus into the active panel. Home / End jump to first / last tab. Activating a focused tab with Enter or Space is required; do not require double-press.
- **Focus management on switch.** When the user activates a new tab via keyboard, do not move focus into the panel automatically — focus stays on the tab trigger until the user presses Tab. If the switch triggers an agent run, announce the state change via a live region.
- **Live region for mode changes.** When the active mode changes (especially if triggered programmatically), announce it to screen readers with an `aria-live="polite"` region: "Mode changed to Agent." This is critical when the mode badge updates outside the tab bar.
- **Disabled tabs.** Use `aria-disabled="true"` rather than the HTML `disabled` attribute on `<button role="tab">` so the tab remains reachable and its tooltip/explanation is accessible. Provide a visible reason for the gate.
- **Reduced motion.** Any animated panel transition (fade, slide) must respect `prefers-reduced-motion: reduce`. The functional switch should be instant; animation is cosmetic.

## Related

- [Side Panel / Sidebar Copilot](./side-panel.md) — the most common layout that hosts a mode-switched chat pane
- [Main Panel / Full-Page Chat](./main-panel.md) — full-page layout where mode switching changes the dominant agent surface
- [Canvas / Workspace & Artifacts](./canvas-workspace.md) — the view tab for Code / Preview / Artifact output
- [Human-in-the-Loop Prompt](../components/human-in-the-loop.md) — triggered by Agent mode; requires explicit user confirmation before high-autonomy actions
- [Agent Status, Activity & Traceability](../components/agent-activity-traceability.md) — surfaces which tools are live in the current mode
- [Suggestions & Capability Surfacing](../components/suggestions-capabilities.md) — starter prompts that update to reflect the active mode's available actions
- [Threads / Conversation History](../components/threads-history.md) — threads may carry mode metadata as part of their audit trail
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)

## Sources

- https://github.blog/ai-and-ml/github-copilot/copilot-ask-edit-and-agent-modes-what-they-do-and-when-to-use-them/
- https://techcrunch.com/2025/08/12/chatgpts-model-picker-is-back-and-its-complicated/
- https://cursor.com/changelog/3-0
- https://www.perplexity.ai/hub/getting-started
- https://docs.copilotkit.ai
- https://docs.copilotkit.ai/reference/v2/hooks/useFrontendTool
- https://docs.ag-ui.com/concepts/events
