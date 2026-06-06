# Floating Widget / Launcher

> A small persistent bubble pinned to a viewport corner that expands on demand into a bounded popup chat panel, overlaying the page without restructuring it.

**Category:** Layout · **Cluster:** Layouts & workspaces · **Aliases:** Chat bubble, Chat launcher, Messenger launcher, Floating action button (FAB) chat, Popup chat, Help bubble, Web widget / chat widget, Support bot bubble, In-app help assistant, Conversational widget

## Definition

The floating widget is a fixed-position launcher — most often a circular button anchored bottom-right — that expands into a self-contained chat panel floating above the page at roughly 380–420 px wide. It is a secondary, task-bounded surface: the host application remains the primary workspace and the AI is summoned on demand, then dismissed back to the bubble. Because it overlays rather than restructures the layout it carries the lowest commitment of any AI placement and is the default home for customer support, deflection, and in-app help assistants. The panel typically opens near its launcher, stays compact, and closes on outside-click, Escape, or a header close button; on mobile it usually fills most or all of the screen.

## When to use / when not to

- **Use** for task-bounded, episodic help that is secondary to the main task — customer support, sales/lead qualification, in-app help, deflection of repetitive questions — where the user's real work lives elsewhere on the page.
- **Use** when the AI must be available everywhere (any page, any route) with near-zero layout cost and minimal engineering footprint — typically a single embed snippet, no redesign of the host app.
- **Use** when low commitment and easy dismissal matter: the user should be able to summon, glance, and dismiss without losing their place or surrendering screen real estate.
- **Do not use** when the AI is the primary workspace or a continuous collaborator on a long task — a docked [Side Panel](./side-panel.md) or a full [Canvas Workspace](./canvas-workspace.md) is a better fit; a cramped 400 px popup fights long-running, multi-step, artifact-heavy work.
- **Do not use** when the AI must read and act on dense on-screen context the user is actively editing — a popup that floats over and occludes that content forces constant open/close churn; pin a sidebar instead.
- **Do not use** with auto-open or aggressive proactive triggers on conversion-critical or focus-critical screens (checkout, form editors) where an overlay covering the primary CTA destroys trust.

## Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│      Host Application (primary work surface)                 │
│                                                              │
│                                   ┌─────────────────────┐   │
│                                   │  Header (title, ×)  │   │ ← close button
│                                   ├─────────────────────┤   │
│                                   │                     │   │
│                                   │  Message list       │   │ ← scroll view; thread
│                                   │  (thread)           │   │
│                                   │                     │   │
│                                   ├─────────────────────┤   │
│                                   │  Conversation       │   │ ← starters / suggestions
│                                   │  starters           │   │
│                                   ├─────────────────────┤   │
│                                   │  Composer / input   │   │ ← pinned input row
│                                   └─────────────────────┘   │
│                                             ↑               │
│                                   ╭───────────────────╮     │
│                                   │  Launcher (bubble) │     │ ← fixed, bottom-right
│                                   ╰───────────────────╯     │
└──────────────────────────────────────────────────────────────┘

Collapsed state:
┌──────────────────────────────────────────────────────────────┐
│      Host Application                                        │
│                                                    ●  [2]   │ ← launcher + unread badge
└──────────────────────────────────────────────────────────────┘
```

**Parts:**

- **Launcher (bubble / FAB)** — the small persistent floating button, typically circular, bottom-right, that opens and closes the panel; `CopilotChatToggleButton` in CopilotKit.
- **Popup panel / window** — the bounded chat surface that expands from the launcher and overlays the page without reflowing it; stays compact on desktop, fills the screen on mobile.
- **Header** — panel title, optional avatar or brand, and a visible close (×) button.
- **Scroll view / thread** — the scrollable message list; a single conversation thread preserved across dismiss/reopen.
- **Welcome screen / home space** — the panel's initial state before the user types: a greeting, a one-line capability statement, and conversation starters.
- **Conversation starters** — tappable canned questions that pre-qualify intent and lower the cost of the first message.
- **Composer** — pinned input area with send and (optionally) voice/attach controls.
- **Unread badge** — numeric or dot indicator on the launcher signaling a real waiting message.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle / collapsed | Panel closed | Launcher bubble only; unread badge if a message is waiting |
| Nudging / teaser | Auto-fired on timer, scroll depth, or page condition | Proactive tooltip beside the launcher; still dismissible; panel stays closed |
| Invoked / opening | User clicks launcher or hits keyboard shortcut | Panel animates open; focus moves to message input |
| Welcome / empty | Panel open, no messages yet | Home screen with greeting, capability copy, and conversation starters |
| Composing | User typing in input | Input active; send button enabled |
| Streaming / thinking | `TEXT_MESSAGE_CONTENT` events arrive | Token-by-token message bubble with typing indicator; politely announced to screen readers |
| Tool / generative-UI render | `TOOL_CALL_START/ARGS/END` sequence | Inline card (order status, form, confirm step) in message stream at `InProgress → Executing → Complete` |
| Handoff / escalated | Agent can't resolve; user requests a human | Visible transition label ("Connecting you to a teammate…"); conversation context preserved |
| Error / retry | `RUN_ERROR` | Inline error message in thread; retry affordance in composer area |
| Dismissed / minimized | Outside-click, Escape, or close button | Panel collapses; focus returns to launcher; thread preserved |
| Unread after dismiss | New inbound message while panel is closed | Badge increments on launcher; should reflect a real message |

## Vocabulary

| Term | Definition |
|---|---|
| Launcher (bubble / FAB) | The small persistent floating button — usually circular, bottom-right — that opens and closes the chat panel. |
| Popup panel / window | The bounded chat surface that expands from the launcher and overlays the page without reflowing it. |
| Popup vs. full panel | Popup = compact corner-anchored card; full panel = the same widget expanded to fill the viewport (the common mobile behavior). |
| Proactive nudge / teaser | A small auto-fired message or tooltip beside the launcher that invites engagement on a timer, scroll, or page condition without forcing the panel open. |
| Welcome screen / home space | The panel's initial state before the user types — greeting, capability subtitle, and conversation starters; Intercom calls its Messenger landing tab the Home space. |
| Conversation starters / suggested prompts | Tappable canned questions that pre-qualify intent and lower the cost of the first message. |
| Deflection | Resolving a query with AI so it never becomes a human ticket — the core success metric for support widgets. |
| Handoff / escalation | Transferring the conversation from the AI agent to a human teammate (or workflow), usually with a labeled, explicit transition. |
| Unread badge | A numeric or dot indicator on the launcher signaling a waiting message; should reflect a real message, never manufactured urgency. |
| `clickOutsideToClose` | Dismissal behavior where clicking anywhere outside the panel collapses it back to the launcher (a real CopilotKit prop on both v1 and v2 `CopilotPopup`/`CopilotSidebar`; default `true`). |

## Real-world examples

- **Intercom Fin (Messenger)** — A bottom-right Messenger launcher expands into a panel split into a Home space (landing tab with apps, articles, past conversations) and a Conversation space. Fin AI Agent answers appear inline, and the Messenger explicitly labels who is responding — Fin, a workflow bot, or a human teammate — showing a clear handoff when a human takes over, with Fin able to proactively offer escalation when it detects frustration or a request for a person. [Source](https://www.intercom.com/help/en/articles/9319961-updates-to-the-messenger)
- **Ada** — Installed via a single Embed2 JavaScript snippet dropped into the page `<head>`, which renders a customizable chat bubble. Launcher position, colors, avatar, and a pre-chat experience to capture user data are all configurable; the widget spans web, mobile (iOS/Android SDKs), and messaging channels, with handoff to Zendesk/Salesforce when the AI agent can't resolve the issue. Positioned as an autonomous generative-AI customer-service agent for high-volume deflection. [Source](https://www.ada.cx/)
- **Drift (Salesloft / Clari)** — A bottom-right conversational-marketing widget whose bot follows pre-built playbooks — branching on visitor behavior, firmographics, or referral source — to qualify leads and route them to the right rep or calendar slot, with native CRM sync. Note: Drift was announced for sunset on March 6, 2026; treat it as a reference for the B2B sales-widget pattern rather than a current build target. [Source](https://www.eesel.ai/blog/drift-ai)
- **Alhena AI** — Treats the launcher's "first 3 seconds" as three coordinated layers: launcher, welcome screen, and nudges. Launcher size is set independently for desktop and mobile; nudges fire on configurable timers (5 s/10 s/15 s) or scroll-depth with per-page URL targeting; built-in restraint suppresses nudges while chat is open, persists dismissals for a configurable period, and avoids covering the primary CTA. [Source](https://alhena.ai/blog/welcome-screen-launcher-nudge-configuration/)
- **CopilotKit CopilotPopup** — Renders a floating `CopilotChatToggleButton` (typically bottom-right) that opens a bounded popup wrapping `CopilotChat`, laid out via `CopilotPopupView` with a centered welcome message and suggestions above the input. On the v2 component, `defaultOpen` sets the initial state (default `false`) and `clickOutsideToClose` collapses it on outside-click (default `true`). [Source](https://docs.copilotkit.ai/reference/v2/components/CopilotPopup)

## CopilotKit & AG-UI mapping

**Primitives:** `CopilotPopup` (floating launcher + popup panel), `CopilotChatToggleButton` (the launcher button), `CopilotChat` / `CopilotChatView` (base chat surface), `useConfigureSuggestions` / `useSuggestions` (conversation starters), `useFrontendTool` (client-side agent actions), `useRenderTool` (generative-UI cards in thread), `useHumanInTheLoop` (handoff/confirm gates), `useAgent` (run state).

`CopilotPopup` (imported from `@copilotkit/react-ui`) is the direct primitive for this pattern — it is literally a `CopilotChatToggleButton` anchored to the viewport corner that expands a bounded popup wrapping `CopilotChat`. On the v2 component the confirmed open/close props are `defaultOpen` (default `false`) and `clickOutsideToClose` (default `true`). Escape-to-close, a keyboard shortcut, and an `onSetOpen` callback are documented on the **v1** `CopilotPopup`/`CopilotSidebar`; verify whether they are available on v2 before relying on them. Populate conversation starters with `useConfigureSuggestions` and read them via `useSuggestions`; render rich in-panel results with `useRenderTool`; gate risky escalations with `useHumanInTheLoop`. If the experience grows into a persistent collaborator, switch to `CopilotSidebar`. Note: external programmatic open/close control on v2 Sidebar/Popup has been a known gap (see [CopilotKit issue #3334](https://github.com/CopilotKit/CopilotKit/issues/3334)) — verify the current open-control API before relying on it.

AG-UI events drive the widget's visual states: `TEXT_MESSAGE_START/CONTENT/END` streams tokens into the bubble, `TOOL_CALL_START/ARGS/END` + `TOOL_CALL_RESULT` cycles the inline card through `InProgress → Executing → Complete`, and `RUN_STARTED/FINISHED/ERROR` bracket the run.

```tsx
import { CopilotPopup } from "@copilotkit/react-ui";
import {
  useFrontendTool,
  useConfigureSuggestions,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

// v1 equivalents: useCopilotAction, useCopilotChatSuggestions

function SupportWidget() {
  // Pre-populate the welcome screen with domain-relevant starters
  useConfigureSuggestions({
    instructions: "Suggest 3 short help questions a customer might ask.",
    minSuggestions: 2,
    maxSuggestions: 4,
  });

  // Client-side action the agent can invoke (e.g., open a returns form)
  useFrontendTool({
    name: "openReturnsForm",
    description: "Open the returns request form for the user",
    parameters: z.object({ orderId: z.string() }),
    handler: async ({ orderId }) => {
      window.location.href = `/returns?order=${orderId}`;
    },
    render: ({ status, args }) => (
      <div className="tool-badge">
        {status === "complete"
          ? "Returns form opened"
          : `Opening returns for order ${args.orderId}…`}
      </div>
    ),
  });

  // Gate escalation behind an explicit user confirmation
  useHumanInTheLoop({
    name: "confirmEscalate",
    parameters: z.object({ reason: z.string() }),
    render: ({ status, args, respond }) =>
      status === "executing" ? (
        <div className="escalation-card">
          <p>Connect you to a human agent? ({args.reason})</p>
          <button onClick={() => respond?.("yes")}>Yes, connect me</button>
          <button onClick={() => respond?.("no")}>No, keep chatting</button>
        </div>
      ) : (
        <div className="escalation-card escalation-card--settled">
          Escalation request sent.
        </div>
      ),
  });

  return (
    <CopilotPopup
      defaultOpen={false}
      clickOutsideToClose={true}
      labels={{
        title: "Support",
        initial:
          "Hi! I can help with order status, returns, or sizing. What do you need?",
      }}
      // Slot overrides: Button, Window, Header — customize chrome to match brand
    />
  );
}
```

> AG-UI events in play: `RUN_STARTED` (disable composer), `TEXT_MESSAGE_CONTENT` (stream tokens into bubble), `TOOL_CALL_START/ARGS/END` + `TOOL_CALL_RESULT` (inline card lifecycle for `openReturnsForm` and `confirmEscalate`), `RUN_FINISHED/ERROR` (settle or error state).

## Best practices

- Default the launcher to bottom-right with fixed pixel offsets and a z-index above sticky chrome; meet a 44×44 px minimum tap target and a 3:1 contrast ratio for the icon, 4.5:1 for body text.
- Give the launcher a real accessible name (`aria-label="Open support chat"`); render the open panel as `role="dialog"` with `aria-modal="true"` and an `aria-labelledby` title so screen readers announce it as a dialog.
- Manage focus rigorously: move focus into the message input on open, trap focus inside the open panel, and return focus to the launcher on close — always pair focus trapping with an Escape handler and a visible, keyboard-operable close button.
- Provide three explicit dismissal paths — outside-click, Escape, and a header close button — and preserve the conversation thread across dismiss/reopen so users don't need to re-explain themselves.
- Earn the open with the welcome screen: a short greeting, a one-line capability statement, and 2–3 tappable conversation starters. Industry benchmarks put unprompted widget opens in the low single digits (~2%); the first interaction must pay off.
- Stream responses (`TEXT_MESSAGE_CONTENT`) with a polite live-region announcement and a visible typing indicator; keep first-token latency low and never block the input while a previous turn streams.
- Be restrained with proactive nudges: fire at most once per session, suppress them while the panel is open or a conversation is active, persist dismissals, and never auto-open over a primary CTA like Add-to-Cart or Checkout.
- Make escalation first-class and clearly labeled — show who is answering (AI vs. workflow vs. human) and offer a visible path to a human when the AI can't resolve the request; respect `prefers-reduced-motion` for the open/close animation.

## Anti-patterns

- **Auto-opening the full panel on page load** (or re-opening it on every visit) — hijacks attention and trains users to dismiss the widget reflexively.
- **Fake unread badge** — manufacturing urgency with a badge when no real message is waiting erodes trust the moment the user opens an empty thread.
- **Aggressive or poorly targeted nudges** — stacking, repeating across pages, or covering the primary CTA; a popup over Add-to-Cart destroys both conversion and trust.
- **Broken keyboard and screen-reader access** — an unlabeled bubble, no `role="dialog"`, focus that never enters the panel (or is trapped with no Escape), and removed focus outlines make the launcher invisible to AT users.
- **Forcing context-heavy work through a cramped popup** — long-running, multi-step, artifact-heavy tasks belong in a docked sidebar or full canvas, not a 400 px corner bubble that occludes the content the user is editing.
- **Losing the conversation on dismiss** — resetting the thread every time the panel closes forces returning users to re-explain themselves from scratch.

## Accessibility

- Render the launcher as a `<button>` (not a `<div>`) with `aria-label="Open support chat"` and `aria-expanded` reflecting the panel state; ensure a visible focus ring at all times — never `outline: none` without an equivalent.
- When the panel opens, apply `role="dialog"` with `aria-modal="true"` and `aria-labelledby` pointing to the panel header; this tells screen readers to treat it as a modal dialog, suppressing background content.
- Trap focus inside the open panel (Tab and Shift+Tab cycle through panel controls only); Escape must close the panel and return focus to the launcher — this is intentional focus management, not an accessibility violation, per WCAG 2.5.3.
- Set `aria-live="polite"` on the message list region so screen readers announce completed messages after streaming ends; never use `aria-live="assertive"` on the streaming region, which would read every partial token.
- Apply `prefers-reduced-motion` media query to the open/close spring/fade animation; provide an instant-snap fallback so users with vestibular disorders are not affected by the panel expanding.
- On mobile (< 600 px), the panel should expand to fill most of the screen with a large, touch-friendly close target (minimum 44×44 px); maintain the same focus-trap and Escape behavior in the full-screen state.

## Related

- [Side Panel / Sidebar Copilot](./side-panel.md) — the docked, persistent alternative when the AI is a continuous collaborator
- [Main Panel / Full-Page Chat](./main-panel.md) — use when AI interaction is the primary task, not an overlay
- [Canvas Workspace](./canvas-workspace.md) — when the agent produces long-running artifacts that need their own surface
- [Ambient & Proactive](./ambient-proactive.md) — the proactive nudge/teaser pattern that can precede a widget open
- [Command Palette](./command-palette.md) — a keyboard-first alternative invocation surface
- [Chat Message](../components/chat-message.md) — individual messages in the popup thread
- [Input / Composer](../components/input-composer.md) — the composer embedded at the panel bottom
- [Suggestions & Capability Surfacing](../components/suggestions-capabilities.md) — conversation starters on the welcome screen
- [Human-in-the-Loop Prompt](../components/human-in-the-loop.md) — blocking escalation/confirm cards in the thread
- [Tool Call](../components/tool-call.md) — inline tool-call cards rendered during agent runs
- [Generative UI (inline)](../components/generative-ui-inline.md) — rich cards rendered inside the message stream
- [Threads / Conversation History](../components/threads-history.md) — preserving and restoring thread context across dismiss/reopen
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)
- [Master vocabulary / glossary](../reference/glossary.md)
- [Layouts README — "Where AI Sits" placement decision framework](./README.md)

## Sources

- https://docs.copilotkit.ai/reference/v2/components/CopilotPopup
- https://docs.copilotkit.ai/reference/v1/components/chat/CopilotPopup
- https://docs.copilotkit.ai/reference/v2/components/CopilotSidebar
- https://docs.copilotkit.ai/copilot-suggestions
- https://docs.copilotkit.ai/reference/v2/hooks/useConfigureSuggestions
- https://docs.copilotkit.ai/reference/v2/hooks/useSuggestions
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderToolCall
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- https://docs.copilotkit.ai/reference/v2/hooks/useFrontendTool
- https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop
- https://docs.copilotkit.ai/reference/v2/hooks/useAgent
- https://github.com/CopilotKit/CopilotKit/issues/3334
- https://www.intercom.com/help/en/articles/9319961-updates-to-the-messenger
- https://www.intercom.com/help/en/articles/7120684-fin-ai-agent-explained
- https://www.intercom.com/help/en/articles/7995955-hand-over-fin-ai-agent-conversations-to-another-support-tool
- https://www.intercom.com/blog/messenger-accessibility/
- https://www.ada.cx/
- https://developers.ada.cx/reference/embed2-quick-start
- https://www.eesel.ai/blog/drift-ai
- https://alhena.ai/blog/welcome-screen-launcher-nudge-configuration/
- https://threada.ai/blog/wcag-22-chat-widget-accessibility-checklist/
- https://www.freshworks.com/live-chat/proactive-chat/
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/dialog_role
- https://www.uxpin.com/studio/blog/how-to-build-accessible-modals-with-focus-traps/
- https://docs.ag-ui.com/concepts/messages
