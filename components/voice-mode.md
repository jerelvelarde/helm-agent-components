# Voice Mode (Realtime Voice-in / Voice-out)
> A bidirectional, low-latency spoken conversation where user and agent exchange audio in near-real time over a persistent connection, with support for interruption and synthesized speech output. **Category:** Component · **Cluster:** Multimodal (voice, video, image) · **Aliases:** realtime voice, advanced voice, live voice, conversational voice, speech-to-speech, voice agent, full-duplex voice, talk mode

## Definition

Voice Mode is a full-duplex, speech-to-speech interaction where the user speaks and the agent speaks back with synthesized audio, typically over a WebRTC or WebSocket session that remains open for the duration of the conversation. It solves the problem of eyes-free, hands-free, or ambient interaction — contexts where typing is impractical or where the conversational rhythm of spoken language is preferable to text. It appears as a dedicated mode overlay or as an integrated mic affordance alongside the standard chat input, and is visually represented by an animated orb, waveform, or persona that reflects listening/thinking/speaking states in real time.

## When to use / when not to

- **Use** when hands-free or eyes-free interaction is required: automotive copilots, field-service agents, mobile accessibility, or ambient assistants where users can't reliably reach a keyboard.
- **Use** when conversational latency and natural turn-taking matter more than precise text review — exploratory Q&A, coaching, language learning, or quick-fire decision flows.
- **Use** when your agent backend supports a realtime audio path (OpenAI Realtime API, Gemini Live) so the speech-to-speech path delivers sub-second response latency.
- **Avoid** for tasks where the output must be reviewed character-by-character (structured forms, legal/financial document review) — text chat with read-aloud is safer.
- **Avoid** as the sole interface in shared or public environments where audio output would expose private content; fall back to text with optional TTS.

## Anatomy

```
┌──────────────────────────────────────────────────────┐
│  Voice Mode Surface                                   │
│                                                       │
│   ┌────────────────────────────────────────────────┐  │
│   │             Orb / Waveform / Persona           │  │  ← animated visualization
│   │         (idle · listening · thinking ·         │  │    reflects current state
│   │              speaking · muted)                 │  │
│   └────────────────────────────────────────────────┘  │
│                                                       │
│   ┌────────────────────────────────────────────────┐  │
│   │  Live Captions                                 │  │  ← rolling transcript of
│   │  User: "Can you pull up last month's report?"  │  │    both speakers; persists
│   │  Agent: "Sure, here's the summary—"            │  │    to chat history
│   └────────────────────────────────────────────────┘  │
│                                                       │
│   ┌─────────────┐  ┌──────────┐  ┌───────────────┐   │
│   │  Mute (🎙)  │  │  End (✕) │  │ Settings (⚙)  │   │  ← persistent controls
│   └─────────────┘  └──────────┘  └───────────────┘   │
│                                                       │
│   ┌────────────────────────────────────────────────┐  │
│   │  Inline Visuals                                │  │  ← images, maps, cards
│   │  (rendered during agent turn when relevant)    │  │    concurrent with speech
│   └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Parts:**
- **Orb / waveform / persona** — the primary animated element; its animation drives all state legibility.
- **Live captions / transcript** — real-time on-screen text of both sides; feeds into persistent chat history.
- **Mute control** — temporarily suppresses mic without ending the session.
- **End affordance** — terminates the WebRTC/WebSocket session cleanly; always visible.
- **Settings / mode toggle** — hands-free vs. push-to-talk, interruption sensitivity, voice selection.
- **Inline visuals** — images, maps, or cards rendered during a voice turn as multimodal output.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle / tap-to-start | Session not yet opened | Mic icon or "Start voice" button; orb dim/static |
| Connecting | User taps start; session negotiating | Orb pulses softly; "Connecting…" caption |
| Listening | Session open; user speaking (VAD active) | Orb or waveform reacts to mic amplitude; caption streams user words |
| Thinking / processing | User end-of-turn detected; model generating | Orb animation shifts to "thinking" pattern; brief caption or ellipsis |
| Speaking | Agent audio streaming | Orb pulses to audio amplitude; agent caption streams live |
| Interrupted / barge-in | User speaks while agent is speaking | Agent audio stops immediately; orb snaps to listening animation; floor yields |
| Muted | User taps mute | Orb dims; mic icon shows strikethrough; agent continues if mid-turn |
| Reconnecting | Network drop mid-session | Spinner / orb flickers; "Reconnecting…" caption; resumes when restored |
| Ended / disconnected | User taps End or session closes cleanly | Orb fades; full transcript surfaced in chat history |
| Error | Mic permission denied, connection failure | Error message with specific cause; retry/settings affordance |

## Vocabulary

| Term | Definition |
|---|---|
| Barge-in / interruption | The user starts speaking while the agent is talking; the system cancels in-flight audio and yields the floor. |
| Turn detection / turn-taking | Deciding when the user has finished their turn so the model should respond — via silence (server VAD) or meaning (semantic VAD). |
| Semantic VAD | An end-of-turn classifier that operates on spoken words, not just silence; tunable via an "eagerness" knob (low/medium/high/auto) in the OpenAI Realtime API. |
| Server VAD | Endpointing based purely on detected silence or audio volume to chunk user audio into turns. |
| Speech-to-speech (S2S) | A single model ingests audio and emits audio directly, preserving tone and minimizing latency vs. a STT → LLM → TTS pipeline. |
| Orb / waveform / persona | The animated visual element signaling the current state: idle, listening, thinking, or speaking. |
| Full-duplex | Both sides can transmit simultaneously, enabling natural barge-in and backchanneling. |
| Captions / live transcript | Real-time on-screen text of both sides of the conversation, retained in chat history after the session ends. |
| WebRTC session | The peer connection commonly used to stream mic audio up and model audio down with minimal latency. |
| Inline visuals | Images, maps, or cards rendered in the conversation while voice continues — multimodal output during a voice turn. |

## Real-world examples

- **ChatGPT Advanced Voice (OpenAI)** — On November 25 2025 OpenAI merged voice into the main chat UI: the user taps a waveform icon next to the text field, talks, sees a live transcript alongside earlier messages, and watches inline images/maps render in real time. Barge-in interruption and continuous turn-taking are supported. A legacy "Separate mode" orb screen remains available in Settings > Voice Mode. Mobile adds live camera and screen-sharing input. [Source](https://techcrunch.com/2025/11/25/chatgpts-voice-mode-is-no-longer-a-separate-interface/)
- **OpenAI Realtime API** — Speech-to-speech over WebRTC/WebSocket with two VAD modes: server VAD chunks on detected silence/volume; semantic VAD uses a per-word classifier to detect end-of-turn, exposing an "eagerness" parameter. An `idle_timeout_ms` setting can auto-trigger a response after a long pause, firing `input_audio_buffer.timeout_triggered`. Interruptions are detected and the in-flight response is canceled server-side. [Source](https://platform.openai.com/docs/guides/realtime-vad)
- **Gemini Live (Google)** — Two-way voice with barge-in; a Settings toggle "Interrupt Live responses" switches between voice-interruption and tap-to-interrupt. A mute control prevents accidental barge-in. Newer Flash Live models (e.g. `gemini-live-2.5-flash`) pair voice with screen and camera sharing. [Source](https://support.google.com/gemini/answer/15274899?hl=en&co=GENIE.Platform%3DAndroid)
- **Perplexity Voice Assistant (iOS)** — Launched April 24 2025 with hands-free and push-to-talk modes and six selectable voices. While the agent speaks the answer it simultaneously surfaces live web search results and source links on screen, and can drive third-party apps (OpenTable, Uber, Apple Maps, Google Calendar, etc.) via voice intent. [Source](https://theaitrack.com/perplexity-ios-voice-assistant-2025/)

## CopilotKit & AG-UI mapping

CopilotKit provides two audio-specific props on its provider — `transcribeAudioUrl` (speech-in) and `textToSpeechUrl` (speech-out) — that add spoken reply capability on top of push-to-talk capture in standard chat components. Full realtime speech-to-speech with VAD and barge-in is **not a turnkey CopilotKit primitive today**; production realtime voice is built by connecting a realtime backend (OpenAI Realtime API, Gemini Live) as the agent and surfacing its lifecycle through AG-UI events.

**AG-UI event mapping for a voice turn:**

| Voice phase | AG-UI events |
|---|---|
| Session open / run start | `RUN_STARTED` |
| Live caption stream (agent speaking) | `TEXT_MESSAGE_START` → `TEXT_MESSAGE_CONTENT` → `TEXT_MESSAGE_END` |
| Inline visuals rendered during voice turn | `TOOL_CALL_START` → `TOOL_CALL_ARGS` → `TOOL_CALL_END` → `TOOL_CALL_RESULT` |
| Orb/waveform state driven from shared state | `STATE_SNAPSHOT` / `STATE_DELTA` via `useAgent` |
| Audio/turn signals, VAD events | `CUSTOM` events (application-defined payload) |
| Session end | `RUN_FINISHED` / `RUN_ERROR` |

**Rendering inline visuals during a voice turn** uses the same `useRenderTool` pattern as text-chat tool calls — the agent emits a `TOOL_CALL_*` sequence for a named visual tool, and the React component mounts in the transcript alongside the caption stream:

```tsx
import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Renders an inline card while the agent continues speaking.
// The agent emits a TOOL_CALL_* sequence for "show_location_card";
// this component mounts in the transcript alongside the live caption.
useRenderTool({
  name: "show_location_card",
  parameters: z.object({
    name: z.string(),
    address: z.string(),
    mapUrl: z.string().optional(),
  }),
  render: ({ status, args }) => (
    <div role="region" aria-label={`Location: ${args.name ?? "loading"}`}>
      {status === "complete" && args.mapUrl ? (
        <img src={args.mapUrl} alt={`Map of ${args.name}`} />
      ) : null}
      <p>{args.name}</p>
      <p>{args.address}</p>
    </div>
  ),
});
// v1 equivalent: useCopilotAction({ name: "show_location_card", render: ... })
```

For driving the orb/waveform animation from agent state, use `useAgent` (v2) to subscribe to `STATE_SNAPSHOT`/`STATE_DELTA` events your realtime backend emits:

```tsx
import { useAgent } from "@copilotkit/react-core/v2";

const { agent } = useAgent({ agentId: "voice-agent" });
// agent.state.voicePhase: "idle" | "listening" | "thinking" | "speaking" | "muted"
// v1 equivalent: useCoAgent({ name: "voice-agent" })
```

Docs: [CopilotKit docs](https://docs.copilotkit.ai) · [AG-UI events](https://docs.ag-ui.com/concepts/events) · [`useRenderTool`](https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool) · [`useAgent`](https://docs.copilotkit.ai/learn/whats-new/v1-50)

## Best practices

- **Make barge-in instantaneous.** Detect incoming user audio, immediately cancel the agent's audio output, and snap the visualization from speaking → listening within a single animation frame. Any perceptible delay makes interruption feel broken.
- **Stream captions for both sides.** Drive the caption from `TEXT_MESSAGE_CONTENT` events as tokens arrive. Persist the full transcript to chat history so the conversation is reviewable after the call ends — this is essential for deaf/hard-of-hearing users and noisy environments.
- **Keep every state visually distinct.** Idle, listening, thinking, and speaking must each have a unique orb/waveform animation so users always know whose "turn" it is and that they are being heard. Never reuse the same visual for two states.
- **Tune endpointing to the use case.** Expose VAD sensitivity settings or a push-to-talk fallback. Over-eager semantic VAD cuts users off mid-thought; sluggish server VAD leaves dead air. The right default varies by domain (slow/deliberate speech vs. quick commands).
- **Show a "thinking" animation, never dead air.** After the user's turn ends, display a distinct thinking state immediately — even 200 ms of a blank orb reads as a hang or disconnection.
- **Surface a persistent, honest mic indicator.** Users must always be able to tell whether the mic is live. A clearly visible indicator (icon + status label) and an unambiguous "End" button address both privacy trust and safety.
- **Pair inline visuals tightly with speech.** When the agent emits a `show_location_card` or similar tool call while speaking, render it at the moment the speech references it so the multimodal output reinforces the spoken content rather than distracting from it.
- **Keyboard-operate every control.** Mute, end, and settings must be reachable and activatable via keyboard — voice mode users may be unable to reach the screen mid-call.

## Anti-patterns

- **No barge-in.** Forcing users to wait for a long agent monologue before they can correct, redirect, or stop it destroys the feeling of natural conversation and erodes trust.
- **Audio-only output with no captions.** Excluding users with hearing impairments, erasing the conversation from history, and making the session unauditable are all consequences of omitting a transcript.
- **Ambiguous visualization.** Using the same animation for "listening" and "speaking" causes users to talk over the agent or sit in silence waiting for their turn — both break turn-taking.
- **Miscalibrated endpointing.** An eagerness setting that is too high interrupts users mid-sentence; one that is too low leaves long pauses that feel like freezes. Ship a sensible default and expose a setting.
- **Hiding the mic state after a turn.** If users cannot tell whether the mic is still hot — especially after a barge-in or after the agent finishes speaking — they will either repeat themselves unnecessarily or be silently recorded.

## Accessibility

- **ARIA live regions for captions.** Set `aria-live="polite"` on the caption container so screen readers announce incoming agent text without interrupting ongoing user interaction; use `aria-live="assertive"` only for state-change announcements (connected, disconnected, error).
- **Announce state transitions.** Emit visually hidden `aria-live` announcements when the session state changes: "Voice session started", "Agent speaking", "Listening for your response", "Voice session ended".
- **Keyboard controls.** Mute (`M`), End (`Escape` or dedicated button), and Settings must be fully operable without a pointer device. Each control must have a descriptive `aria-label` and visible focus indicator.
- **Focus management.** When the voice modal/overlay opens, move focus to the primary control (Mute or End). When it closes, return focus to the originating trigger.
- **Never lock information inside speech only.** Any content the agent delivers verbally must also appear in the live caption and persist in chat history — this covers screen-reader users and anyone who cannot process audio in the moment.
- **Reduced-motion support.** Orb/waveform animations should respect `prefers-reduced-motion`: replace pulsing/morphing animations with a simple, static icon change between states.

## Related

- [./voice-input.md](./voice-input.md) — Voice Input / Dictation (push-to-talk capture feeding text chat; no speech output)
- [./chat-message.md](./chat-message.md) — Chat Message (the caption stream and inline visual transcript)
- [./input-composer.md](./input-composer.md) — Input Box / Composer (the text-mode entry point Voice Mode overlays or replaces)
- [./tool-call.md](./tool-call.md) — Tool Call (the same render pattern used for inline visuals during voice turns)
- [./generative-ui-inline.md](./generative-ui-inline.md) — Inline Generative UI (static controlled components rendered alongside voice captions)
- [./agent-activity-traceability.md](./agent-activity-traceability.md) — Agent Status, Activity & Traceability (the run lifecycle that wraps a voice session)
- [../layouts/tabs.md](../layouts/tabs.md) — Tabs / Mode Switching (the UI pattern for toggling between text and voice modes)
- [../reference/copilotkit-primitives.md](../reference/copilotkit-primitives.md) — CopilotKit primitive reference
- [../reference/ag-ui-protocol.md](../reference/ag-ui-protocol.md) — AG-UI protocol reference
- [../reference/glossary.md](../reference/glossary.md) — Master vocabulary

## Sources

- https://techcrunch.com/2025/11/25/chatgpts-voice-mode-is-no-longer-a-separate-interface/
- https://platform.openai.com/docs/guides/realtime-vad
- https://support.google.com/gemini/answer/15274899?hl=en&co=GENIE.Platform%3DAndroid
- https://theaitrack.com/perplexity-ios-voice-assistant-2025/
- https://docs.copilotkit.ai
- https://docs.ag-ui.com/concepts/events
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- https://docs.copilotkit.ai/learn/whats-new/v1-50
