# Video
> A multimodal component where video is both an input the agent perceives (live camera, shared screen, uploaded clip, computer-use browser) and an output it produces (talking avatar, generated clip, or a live watch-it-work panel).

**Category:** Component · **Cluster:** Multimodal (voice, video, image) · **Aliases:** video input, video output, camera / live video, screen share, computer use, AI avatar, conversational video interface (CVI), vision (live), text-to-video, video generation

## Definition

The Video component covers two complementary flows: **video-in** (streaming the user's camera, a shared window, or a remote browser into the agent's perception) and **video-out** (the agent producing a rendered clip, an animated avatar face, or a live "computer use" view for the user to watch). It solves the gap between text-only agents and the rich visual context users actually have on screen. It appears in agentic setups where real-time visual grounding improves answer quality, in automation agents that operate a virtual computer, in synthetic-presenter interfaces, and in prompt-to-video creative tools.

## When to use / when not to

- **Use** when the user's screen or camera is the subject — tech support, code review over screen share, "what does this UI do" questions — and text alone cannot capture the context.
- **Use** for computer-use agents that navigate a browser or operate a desktop, where users need a live view of what the agent is doing and a way to intervene.
- **Use** when a talking avatar makes the interaction meaningfully more human — onboarding, coaching, customer-facing demos — and the latency budget supports realtime rendering.
- **Use** for text-to-video generation when the product's core value is video creation; expose a storyboard/timeline editor for multi-segment compositions.
- **Do not use** when a screenshot or static image upload is sufficient — live streaming adds latency, permission friction, and privacy exposure with no benefit.

## Anatomy

```
┌──────────────────────────────────────────────────────┐
│  Video Surface                                        │
│  ┌──────────────────────┐  ┌────────────────────────┐ │
│  │  LIVE FEED / CANVAS  │  │  AGENT VIEW            │ │
│  │  (camera / screen /  │  │  (avatar face /        │ │
│  │   video player /     │  │   computer-use panel / │ │
│  │   generation preview)│  │   step log)            │ │
│  └──────────────────────┘  └────────────────────────┘ │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  STATUS BAR                                     │  │
│  │  [● ON AIR] [Sharing: My Window ▾] [Stop]       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ACTION RAIL                                    │  │
│  │  [Takeover] [Confirm/Reject HITL] [Cancel]      │  │
│  └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Parts:**
- **Live feed / canvas** — the user's camera frame, shared window, video player, or generation preview.
- **Agent view** — what the agent produces: an avatar surface, a live computer-use browser, a generated clip, or a step-by-step activity log.
- **Status bar** — always-visible on-air indicator, scope label (window name or "desktop"), and a single-click stop control.
- **Action rail** — context-sensitive controls: takeover button (computer use), HITL confirm/reject (consequential actions), cancel/pause (generation).

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle / off | Component mounts; user has not enabled sharing | Prompt card or empty surface; no stream active |
| Requesting permission | User clicks Share / Enable Camera | Browser permission dialog; spinner on the trigger button |
| Sharing / streaming | Permission granted; feed active | Live video frame; persistent **● ON AIR** badge; Stop button visible |
| Agent perceiving / analyzing | Agent processes a frame (screen share, camera) | Subtle pulse or "analyzing…" label on agent view; no frame freeze |
| Agent acting (computer use) | Computer-use agent moves cursor, types, clicks | Live browser/VM panel; step log updates; cursor animation visible |
| Awaiting confirmation (HITL) | Agent about to take a consequential action | HITL card overlaid on action rail; run paused until response |
| Takeover | User clicks Takeover | Agent pauses; user has direct mouse/keyboard control; "You are in control" banner |
| Generating | Text-to-video render queued/running | Progress bar with % and stage label (queued → rendering → post-processing) |
| Done | Generation complete or conversation answer returned | Clip player or agent response visible; clear stop/close affordance |
| Paused / stopped | User stops share or pauses playback | Feed goes dark; on-air badge removed; resume/restart available |
| Error | Permission denied, stream lost, render failed | Error card with cause (e.g., "Camera access denied") and a recovery action |

## Vocabulary

| Term | Definition |
|---|---|
| Screen share / desktop share | User streams a window or whole desktop to the agent so it can reason about on-screen context. |
| Computer use / CUA | A computer-using agent that perceives a screen and takes mouse/keyboard actions in a (often remote) browser or VM. |
| Live video / vision | Continuous camera or screen feed the model interprets during a conversation, as opposed to a single uploaded image. |
| Conversational video interface (CVI) | A framework and UX pattern for real-time, face-to-face video chat with an AI that sees, hears, and responds. |
| Avatar / digital twin | A synthetic talking face (lip-synced, expressive) that visually represents the assistant in realtime. |
| Lip-sync / full-duplex rendering | Aligning generated mouth and expression with speech audio, with listening and speaking able to overlap simultaneously. |
| Takeover / watch mode | Letting the user observe the agent operate, or take manual control of the shared computer at any point. |
| Storyboard / timeline editor | Per-frame or per-segment prompt cards arranged on a timeline to compose or extend a generated video. |
| Remix / extend | Deriving a new clip from an existing generation or uploaded asset rather than starting from text alone. |

## Real-world examples

- **ChatGPT Agent / Operator (OpenAI)** — The agent operates its own virtual computer (visual + text browser plus a terminal) and shows a live visualization of its actions; Watch Mode requires active user oversight for sensitive tasks (e.g. sending email). Takeover mode hands control directly to the user with no screenshots captured to protect credentials. Advanced Voice adds live video + screen share in mobile, grounding the voice conversation. [source](https://openai.com/index/introducing-chatgpt-agent/)
- **Microsoft Copilot Vision (Windows)** — A "glasses" icon in the Copilot composer lets users share a specific window or the whole desktop; Copilot analyzes the live screen and answers questions about it. Stopping the share is a single-click action. User images, voice, and context are not logged or stored. [source](https://blogs.windows.com/windows-insider/2025/07/15/copilot-on-windows-vision-desktop-share-begins-rolling-out-to-windows-insiders/)
- **Tavus (Conversational Video Interface)** — A CVI framework for real-time multimodal video agents (Phoenix-4 model, Feb 2026); targets sub-600ms end-to-end conversational latency, full-duplex operation, and 10+ controllable emotion states, streaming over WebRTC. Integrates as an avatar layer in voice stacks (e.g., LiveKit + OpenAI Realtime). [source](https://docs.tavus.io/sections/conversational-video-interface/overview-cvi)
- **OpenAI Sora (text-to-video)** — A dedicated creation UI with a Storyboard timeline editor where users place multiple prompt cards in sequence and Sora blends them into a continuous clip; users can upload assets to extend, remix, or blend generations. Sora was discontinued March 24, 2026, but the storyboard/remix interaction pattern persists across competitors. [source](https://openai.com/index/sora-2/)

## CopilotKit & AG-UI mapping

Video is not a built-in CopilotKit media primitive; it is composed from existing primitives:

- **Computer-use / screen analysis** — the agent calls a backend tool (e.g., `analyze_screen`, `click_element`). Each step emits `TOOL_CALL_START` → `TOOL_CALL_ARGS` → `TOOL_CALL_END` → `TOOL_CALL_RESULT`. Render the live panel with `useRenderTool` (v2); the `status` field drives `InProgress` (action in flight) and `Complete` (result shown).
- **Render progress and live state** — use `useAgent` (v2) or `useCoAgent` (v1) to read `STATE_SNAPSHOT` / `STATE_DELTA` events carrying render progress (`{ stage, percent }`) or the agent's current screen coordinates, and reflect them in a progress bar or live step log.
- **HITL gate before consequential actions** — `useHumanInTheLoop` (v2) pauses the run until the user confirms. `useInterrupt` handles framework-level interrupts (e.g., LangGraph `interrupt()`).
- **Avatar / video player** — mount as a tool-call render component; the agent calls a tool with video URL or stream handle, and your render function surfaces the `<video>` element or avatar iframe.
- **Custom/external signals** — `RAW` / `CUSTOM` AG-UI events can carry WebRTC stream handles or external video signals not modeled by the standard event types.

v1 equivalent for HITL: `useCopilotAction({ renderAndWaitForResponse })`.

```tsx
import { useRenderTool, useHumanInTheLoop, useAgent } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Render the live computer-use panel as the agent acts
useRenderTool({
  name: "computer_action",
  parameters: z.object({
    action: z.string(),
    screenshot_url: z.string().optional(),
  }),
  render: ({ status, args }) => (
    <ComputerUsePanel
      action={args.action}
      screenshotUrl={args.screenshot_url}
      isActive={status === "executing"}
    />
  ),
});

// Pause before a consequential action — e.g. submitting a form
useHumanInTheLoop({
  name: "confirm_submit",
  parameters: z.object({ target: z.string(), summary: z.string() }),
  render: ({ status, args, respond }) =>
    status === "executing" ? (
      <ConfirmActionCard
        summary={args.summary}
        onConfirm={() => respond?.("confirmed")}
        onCancel={() => respond?.("cancelled")}
      />
    ) : (
      <ConfirmActionCard summary={args.summary} disabled />
    ),
});

// Read live render progress from shared agent state
const { agent } = useAgent({ agentId: "video-render-agent" });
const { stage, percent } = agent.state as { stage: string; percent: number };
// Render: <RenderProgress stage={stage} percent={percent} />
```

v1 shared-state equivalent: `useCoAgent({ name: "video-render-agent" })`.

## Best practices

- **Make sharing explicit and revocable.** Require a per-session opt-in click, display a persistent on-air badge for the entire share session, and make stopping the share a single obvious action — never infer or auto-start a feed.
- **Show the agent's perception.** Stream a live view or step-by-step log of what the agent sees and does; "watch it work" transparency builds trust and lets users catch wrong-window or wrong-context errors early.
- **Gate consequential computer-use actions.** Any purchase, send, or destructive operation must route through a HITL confirmation (`useHumanInTheLoop`) before execution. Offer instant takeover/stop at all times.
- **Show real generation progress.** For multi-minute video renders, display queued → rendering % → post-processing stages rather than an indeterminate spinner. Support cancel, and send a completion notification if the user has navigated away.
- **Label synthetic media.** Mark AI avatars and generated clips with a visible "AI-generated" badge and, where supported, attach provenance metadata (C2PA content credentials or invisible watermarks) so viewers can distinguish real from synthetic.
- **Minimize sharing scope.** Default to window-sharing (not whole desktop), warn before desktop-wide share, and avoid persisting sensitive screen content — "no data stored in takeover mode" is the right default posture.
- **Signal avatar turn-taking.** For CVI/avatar surfaces, render distinct listening and speaking states on the face and audio waveform so full-duplex overlap reads as intentional, not broken. Mirror conventions from [Voice Mode](./voice-mode.md).
- **Target latency budgets.** Realtime CVI targets sub-600ms end-to-end. Screen analysis can tolerate 1–3 s with a clear "analyzing…" state. Video generation can take minutes — set expectation with a progress bar and async notification.

## Anti-patterns

- **Silent or always-on capture** — streaming the user's screen or camera with no visible on-air indicator, or starting capture automatically without an explicit opt-in click.
- **Ungated consequential actions** — letting a computer-use agent purchase, send email, or delete files without a HITL confirmation step or an instant-stop control.
- **Indeterminate spinners for long renders** — showing only a spinner for a multi-minute video generation with no progress %, no cancel affordance, and no completion notification.
- **Unlabeled synthetic video** — shipping AI avatars or generated clips with no "AI-generated" badge or provenance metadata, creating ambiguity about what is real.
- **Opaque agent perception** — hiding what the agent sees (the active window, the frame it analyzed) so users cannot verify it is acting on the correct context.

## Accessibility

- **Caption all speech output.** Avatar speech and AI-narrated video clips must have synchronized captions; generated captions from a speech-to-text step are acceptable when accurate. Provide a full transcript for long sessions.
- **Audio descriptions for visual-only content.** When the agent takes action based on what it sees on screen, narrate or log those actions in text alongside the visual so screen-reader users follow the same flow.
- **ARIA live regions for status.** The on-air badge, render progress bar, and HITL prompt should use `role="status"` or `aria-live="polite"` (or `assertive` for blocking HITL prompts) so screen readers announce state changes without focus movement.
- **Full keyboard access for controls.** Share/stop, takeover, confirm/reject, and cancel must all be reachable and operable via keyboard alone; do not rely on mouse-only drag or click-to-control interactions.
- **Focus management for HITL overlays.** When a HITL confirmation card appears, move focus into the card; when dismissed (confirmed or cancelled), return focus to the prior location or the next logical element in the thread.
- **Reduced-motion compliance.** Avatar facial animations and live frame transitions should respect `prefers-reduced-motion`; at minimum reduce animation frame rate or substitute a static avatar image when the user has the preference set.

## Related

- [Voice Mode (Realtime Voice-in / Voice-out)](./voice-mode.md) — avatar turn-taking and full-duplex conventions apply equally to CVI; share latency and state patterns.
- [Voice Input / Dictation](./voice-input.md) — grounding a voice conversation with live video (Advanced Voice + camera share) combines both components.
- [Human-in-the-Loop Prompt](./human-in-the-loop.md) — the HITL confirmation gate used in computer-use agents.
- [Tool Call](./tool-call.md) — each computer-use step renders as a tool-call card; share the `ToolCallStatus` lifecycle.
- [Agent Status, Activity & Traceability](./agent-activity-traceability.md) — the step log in computer-use watch mode is an instance of the activity/traceability surface.
- [Inline Generative UI (Static / Controlled)](./generative-ui-inline.md) — the video player or avatar surface mounted inside the chat is a static generative-UI component.
- [Canvas / Workspace & Artifacts](../layouts/canvas-workspace.md) — generated video clips and computer-use panels commonly occupy a canvas-layout artifact area.
- [Image Generation](./image-generation.md) — sibling multimodal output component; shares progress states and provenance labeling patterns.
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)

## Sources

- https://openai.com/index/introducing-chatgpt-agent/
- https://blogs.windows.com/windows-insider/2025/07/15/copilot-on-windows-vision-desktop-share-begins-rolling-out-to-windows-insiders/
- https://docs.tavus.io/sections/conversational-video-interface/overview-cvi
- https://openai.com/index/sora-2/
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop
- https://docs.copilotkit.ai/learn/whats-new/v1-50
- https://docs.ag-ui.com/concepts/events
