# Voice Input / Dictation
> A one-directional microphone affordance that transcribes speech to editable text in a composer — not a live voice conversation, but a text-delivery mechanism the user reviews before sending.

**Category:** Component · **Cluster:** Multimodal (voice, video, image) · **Aliases:** dictation, speech-to-text (STT), voice typing, push-to-talk (PTT), voice-to-text, transcription input, mic input

## Definition

Voice Input / Dictation is a composer-level control that captures audio from the user's microphone, runs it through a speech-to-text engine, and delivers the resulting transcript into an editable text field — leaving the user in control of what actually gets sent. The hallmark interaction is a microphone button that either starts/stops on tap (toggle mode) or records only while held (push-to-talk mode), with partial transcription surfaced in real time. It is distinct from Voice Mode: this component's output is always text; no agent audio response is involved.

## When to use / when not to

- Use when users are mobile, have hands occupied, or find dictation faster than typing for long-form prompts (support tickets, clinical notes, legal descriptions).
- Use as an accessibility accommodation where keyboard input is slow or painful — dictation is a first-class input path, not a bonus feature.
- Use in enterprise or specialized contexts (medical, legal, field work) where users speak domain vocabulary fluently but typing introduces errors or friction.
- Do not use as a replacement for full Voice Mode when the user expects a spoken response — route those interactions to [Voice Mode](./voice-mode.md) instead.
- Do not use when the content domain is inherently symbolic (code identifiers, formulas, structured data) and the recognizer cannot be trained to those tokens; warn the user instead.

## Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│  Composer (Input Box)                                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ [partial transcript text — interim, muted style …]      │ │
│  │ finalized text the user can edit                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│  [ send ]  [ attach ]  [●MIC]  ◄── mic button                │
│             ↑ amplitude meter / pulse ring while recording   │
└──────────────────────────────────────────────────────────────┘

Overlay / modal variant (full-screen dictation):
┌───────────────────────┐
│    ● Listening…       │  ← live waveform / amplitude bar
│  "schedule a meet…"   │  ← partial transcript
│   [Done]  [Cancel]   │
└───────────────────────┘
```

**Parts:**
- **Mic button** — the primary trigger; holds `aria-pressed` state and `aria-label` reflecting current mode.
- **Amplitude meter / pulse ring** — real-time visual confirmation the mic is capturing audio.
- **Partial transcript zone** — shows interim (non-final) words in a visually distinct style (muted/italic) to signal they may change.
- **Final transcript** — committed text placed in the composer field, fully editable before send.
- **Permission prompt** — browser/OS mic-permission dialog; the app must handle grant and denial outcomes.
- **Error / empty state** — replaces the pulse ring on failure (no speech, network error, permission denied).

## States

| State | Trigger | UI treatment |
|---|---|---|
| Idle | Default; no recording active | Mic button shown at rest; no meter visible |
| Requesting permission | First tap on mic button | Button shows spinner or "Allow mic?" prompt; OS dialog fires |
| Permission denied / blocked | User rejects or browser policy blocks | Button disabled; inline message with link to OS/browser settings |
| Recording / listening | Permission granted; recording starts | Pulse ring or amplitude meter animates; `aria-pressed="true"`; button turns accent color |
| Transcribing (partial) | Recognizer emits interim results | Interim text appears in partial transcript zone in muted/italic style; still recording |
| Finalized | Recognizer locks a segment or user stops | Partial text replaced with styled final text in composer; editing cursor placed at end |
| No speech detected | VAD timeout or manual stop with empty audio | Empty state message ("No speech detected"); mic returns to idle |
| Error | Mic device unavailable, network/STT service failure | Inline error message; mic button returns to idle; retry available |

## Vocabulary

| Term | Definition |
|---|---|
| Push-to-talk (PTT) | Recording starts on press/hold and stops on release or a second tap; audio is then sent for transcription. |
| Live / partial transcription | Interim, non-final words rendered in real time as the user speaks; replaced when the recognizer commits a segment. |
| Final transcript | The committed text after the recognizer locks a segment; what lands in the editable composer. |
| Voice Activity Detection (VAD) | Logic that detects speech vs. silence to auto-start/stop capture or chunk audio without a manual button press. |
| Web Speech API (SpeechRecognition) | Browser-native STT available in Chrome and Edge; unsupported in Firefox and Safari, which require a server-side fallback. |
| MediaRecorder fallback | Capture-audio-then-POST-to-transcription-service path used when no native browser STT is available. |
| Endpointing | The decision point when an utterance is considered complete and the segment can be finalized and dispatched. |
| Dictation commands | Spoken control words ("new line", "send", "period") interpreted as formatting or submission actions rather than literal text. |
| Local vs. cloud transcription | On-device models (offline, private) vs. server models (higher accuracy, lower client overhead); choice has privacy implications. |

## Real-world examples

- **ChatGPT (OpenAI)** — Explicitly separates Dictation from Voice Mode: the composer mic transcribes speech to editable text (with pause-based punctuation inference) before the user sends. The macOS desktop app adds a "record mode" that captures meetings and produces transcripts + summaries. [Source](https://help.openai.com/en/articles/9617024-using-voice-mode-on-chatgpt)
- **superwhisper (macOS)** — Menu-bar dictation using a hotkey hold (PTT) with fully local Whisper-family models; audio never leaves the machine; text appears at the system cursor in any app. [Source](https://superwhisper.com/)
- **GitHub Copilot CLI** — Voice input in the terminal agent: hold space bar or Ctrl+X then V to dictate a prompt; transcription runs entirely on-device, recognized text is placed at the cursor for editing before submission. Positioned as accessibility and ergonomics within the coding-agent loop. [Source](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/voice-input)

## CopilotKit & AG-UI mapping

CopilotKit's prebuilt chat components include a push-to-talk microphone in the composer. The built-in state machine progresses through `idle → recording → transcribing`, driven by the `usePushToTalk` hook in `@copilotkit/react-ui`. That hook reads `transcribeAudioUrl` (and `textToSpeechUrl` for playback) from the `CopilotKit` provider's config and POSTs recorded audio to the transcription endpoint — for example, an OpenAI Whisper or ElevenLabs route on your own server.

Once transcribed, the text flows into the normal composer → send pipeline. No special AG-UI event type is required: the transcript becomes a standard `TEXT_MESSAGE_*` run on the AG-UI stream, exactly like a typed message.

**Custom implementation example** — wire a standalone mic button to CopilotKit's headless chat and a server-side Whisper endpoint:

```tsx
import { useRef, useState } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";

// v1 equivalent: replace useAgent + useCopilotKit with useCopilotChat

export function VoiceInputButton() {
  const [phase, setPhase] = useState<"idle" | "recording" | "transcribing">("idle");
  const [partial, setPartial] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  // Access the send function from CopilotKit's headless chat
  const { sendMessage } = useCopilotKit();

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunks.current = [];
    recorder.ondataavailable = (e) => chunks.current.push(e.data);
    recorder.onstop = async () => {
      setPhase("transcribing");
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      const form = new FormData();
      form.append("audio", blob, "clip.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const { text } = await res.json();
      setPartial("");
      setPhase("idle");
      // Transcript lands in the composer — caller can inject or auto-send
      sendMessage(text); // or pass to a controlled composer input instead
    };
    recorder.start();
    mediaRecorder.current = recorder;
    setPhase("recording");
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
  }

  return (
    <div>
      {partial && <p aria-live="polite" style={{ fontStyle: "italic", opacity: 0.6 }}>{partial}</p>}
      <button
        aria-label={phase === "recording" ? "Stop recording" : "Start voice input"}
        aria-pressed={phase === "recording"}
        onPointerDown={startRecording}
        onPointerUp={stopRecording}
        disabled={phase === "transcribing"}
      >
        {phase === "idle" && "🎙"}
        {phase === "recording" && "⏹ Stop"}
        {phase === "transcribing" && "…"}
      </button>
    </div>
  );
}
```

> **v1 note:** replace `useCopilotKit()` with `useCopilotChat()` from `@copilotkit/react-core` for `sendMessage`.
> **AG-UI:** the transcript enters the stream as `TEXT_MESSAGE_START / TEXT_MESSAGE_CONTENT / TEXT_MESSAGE_END` — no voice-specific event type is defined in the AG-UI protocol.
> Docs: [CopilotKit voice / audio setup](https://docs.copilotkit.ai) | [AG-UI events](https://docs.ag-ui.com/concepts/events)

## Best practices

- Surface partial transcription continuously as the user speaks — even rough interim text confirms the mic is active and prevents users from repeating themselves on long utterances.
- Never auto-send the transcript immediately on recording stop; always land it in the composer so users can fix recognizer errors (names, jargon, command-line flags, punctuation) before the agent receives it.
- Make mic state unambiguous: a pulsing amplitude ring or level meter while recording, and a clear visual (and optional audio) cue at both start and stop — an indicator that lingers after capture stops is a privacy violation.
- Handle the permission lifecycle explicitly: trigger the mic-access request from a user gesture, not on page load, and on denial show an actionable explanation with direct links to browser or OS settings rather than silently disabling the button.
- Provide a MediaRecorder + server-side STT fallback for browsers without the Web Speech API (Safari, Firefox) so the feature degrades gracefully rather than disappearing.
- Be transparent about data routing: indicate clearly whether audio is processed locally or sent to a cloud endpoint, and whether recordings are stored — this is non-negotiable in health, legal, and enterprise contexts.
- Allow users to opt out of auto-punctuation and auto-capitalization for domains where raw phonetic output is more useful (code, identifiers, structured data entry).
- For PTT, a keyboard shortcut (e.g. hold a hotkey) is as important as the pointer interaction — keyboard-primary and power users expect it.

## Anti-patterns

- **Auto-sending on stop** — dispatching the transcript the instant recording ends gives users no opportunity to correct recognizer mistakes; always require an explicit send gesture.
- **No visible recording indicator (or a stale one)** — a mic with no active state cue, or a "recording" indicator that persists after capture has stopped, erodes trust and creates privacy anxiety.
- **Silent failure in unsupported browsers** — hiding the mic button or throwing a console error without degrading to a server-side transcription path means a significant user cohort has no dictation feature at all.
- **Inaccessible mic button** — treating the microphone icon as a decorative element with no accessible name, no `aria-pressed` attribute, and no keyboard activation means screen-reader and keyboard users cannot use dictation at all.
- **Withholding partial transcription** — showing nothing until the recognizer finalizes a long utterance makes the interface feel frozen and causes users to repeat or abandon the interaction.

## Accessibility

- The mic button must be a native `<button>` (or have `role="button"`) with a dynamic `aria-label` that reflects current state: "Start voice input" at idle, "Stop recording" while active.
- Use `aria-pressed="true"` while recording so assistive technology announces the toggle state change.
- Announce state transitions via an `aria-live="polite"` region: emit "Listening…" on start, "Transcribing…" while processing, and "Transcription complete" (or the first few words of the result) on finalization.
- Partial transcript text should also be in an `aria-live` region (or appended to the same one) so screen-reader users hear interim output without having to navigate to it manually.
- Keyboard activation must work via `Enter` and `Space` on the button; PTT via `keydown`/`keyup` for hold-to-record patterns. Confirm focus returns to the composer after finalization.
- Respect `prefers-reduced-motion`: the pulse ring / amplitude animation should be suppressed or replaced with a static indicator for users who have that preference set.

## Related

- [Input Box / Composer](./input-composer.md) — the composer that receives the finalized transcript
- [Voice Mode (Realtime Voice-in / Voice-out)](./voice-mode.md) — the full bidirectional spoken conversation mode; use instead when the agent should also speak
- [Chat Message](./chat-message.md) — how the resulting text message is rendered once sent
- [Human-in-the-Loop Prompt](./human-in-the-loop.md) — if dictation is used to answer an agent interrupt
- [Suggestions & Capability Surfacing](./suggestions-capabilities.md) — complement dictation with tap-to-use prompt starters
- [CopilotKit primitive reference](../reference/copilotkit-primitives.md)
- [AG-UI protocol reference](../reference/ag-ui-protocol.md)

## Sources

- https://help.openai.com/en/articles/9617024-using-voice-mode-on-chatgpt
- https://superwhisper.com/
- https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/voice-input
- https://docs.copilotkit.ai
- https://docs.ag-ui.com/concepts/events
