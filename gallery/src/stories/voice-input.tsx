import { useState } from "react";
import { Mic, Square, Loader, X, RotateCcw, ArrowRight } from "lucide-react";
import {
  Btn,
  Caret,
  CodeNote,
  Composer,
  Note,
  Showcase,
  StatusDot,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "voice-input",
  title: "Voice Input / Dictation",
  category: "Multimodal",
  blurb: "Push-to-talk / dictation — transcription, mic states, insert-to-composer.",
  copilotkit: "usePushToTalk",
  spec: "components/voice-input.md",
};

// ── shared mic-button primitive ──────────────────────────────────────────────

type MicPhase = "idle" | "requesting" | "recording" | "transcribing" | "denied" | "error";

function MicButton({
  phase,
  onClick,
}: {
  phase: MicPhase;
  onClick?: () => void;
}) {
  const isRecording = phase === "recording";
  const busy = phase === "transcribing" || phase === "requesting";
  const denied = phase === "denied";

  const bg = isRecording
    ? tok.indigo
    : denied
    ? tok.error
    : tok.textPrimary;

  return (
    <button
      aria-label={isRecording ? "Stop recording" : "Start voice input"}
      aria-pressed={isRecording}
      onClick={!busy && !denied ? onClick : undefined}
      disabled={busy}
      style={{
        width: 36,
        height: 36,
        borderRadius: 9999,
        border: isRecording ? `2px solid ${tok.indigo}` : "none",
        background: bg,
        color: "var(--surface-container)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: busy || denied ? "default" : "pointer",
        opacity: busy ? 0.6 : 1,
        boxShadow: isRecording ? `0 0 0 5px rgba(99,102,241,0.18)` : "none",
        transition: "box-shadow 0.2s, background 0.15s",
        position: "relative",
      }}
    >
      {phase === "transcribing" ? (
        <Loader size={16} />
      ) : (
        <Mic size={16} />
      )}
    </button>
  );
}

// ── amplitude bars mock ───────────────────────────────────────────────────────

function AmplitudeBars() {
  const heights = [5, 12, 20, 14, 8, 18, 22, 10, 16, 6];
  return (
    <div className="flex items-center" style={{ gap: 3, height: 28 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="ck-pulse"
          style={{
            width: 3,
            height: h,
            borderRadius: 9999,
            background: tok.indigo,
            opacity: 0.7 + (i % 3) * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// ── wiring snippet ────────────────────────────────────────────────────────────

const wiring = `import { useRef, useState } from "react";
import { useCopilotKit } from "@copilotkit/react-core/v2";

// v1 equivalent: replace useCopilotKit with useCopilotChat

type Phase = "idle" | "recording" | "transcribing";

export function VoiceInputButton() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [partial, setPartial] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  // Access the send function from CopilotKit's headless chat
  const { sendMessage } = useCopilotKit();

  async function startRecording() {
    const stream = await navigator.mediaDevices
      .getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunks.current = [];
    rec.ondataavailable = (e) => chunks.current.push(e.data);
    rec.onstop = async () => {
      setPhase("transcribing");
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      const form = new FormData();
      form.append("audio", blob, "clip.webm");
      const { text } = await fetch("/api/transcribe", {
        method: "POST", body: form,
      }).then((r) => r.json());
      setPartial("");
      setPhase("idle");
      // Land in composer for user review — never auto-send
      sendMessage(text);
    };
    rec.start();
    recorder.current = rec;
    setPhase("recording");
  }

  function stopRecording() { recorder.current?.stop(); }

  return (
    <button
      aria-label={phase === "recording"
        ? "Stop recording" : "Start voice input"}
      aria-pressed={phase === "recording"}
      onPointerDown={startRecording}
      onPointerUp={stopRecording}
      disabled={phase === "transcribing"}
    >
      {partial && (
        <p aria-live="polite" style={{ fontStyle: "italic", opacity: 0.6 }}>
          {partial}
        </p>
      )}
    </button>
  );
}

// Built-in: CopilotKit's <CopilotChat> already includes a push-to-talk mic.
// Configure the transcription endpoint on the provider:
// <CopilotKit transcribeAudioUrl="/api/transcribe"> … </CopilotKit>`;

// ── Story ─────────────────────────────────────────────────────────────────────

export default function Story() {
  const [phase, setPhase] = useState<MicPhase>("idle");

  return (
    <Showcase>

      {/* 1 · Idle */}
      <Variant label="idle" hint="mic at rest — no meter, no permission requested yet">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <Composer placeholder="Message the agent…" />
          <div className="flex items-center" style={{ gap: 10 }}>
            <MicButton phase="idle" onClick={() => setPhase("recording")} />
            <span style={{ fontSize: 13, color: tok.textSecondary }}>
              Tap to start dictation
            </span>
          </div>
          <Note>
            The mic button lives in the composer toolbar. First press triggers the
            browser mic-permission dialog — never request access on page load.
          </Note>
        </div>
      </Variant>

      {/* 2 · Recording / listening */}
      <Variant label="recording" hint="amplitude meter pulses; aria-pressed=true; accent ring">
        <div className="flex flex-col" style={{ gap: 14 }}>
          <div
            style={{
              background: "var(--indigo-soft)",
              border: `1px solid rgba(99,102,241,0.2)`,
              borderRadius: 12,
              padding: "12px 14px",
              minHeight: 48,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontStyle: "italic",
                color: tok.textDisabled,
                lineHeight: "22px",
              }}
            >
              schedule a meeting with the design team for next Tuesday morning
              <Caret />
            </span>
          </div>
          <div className="flex items-center" style={{ gap: 12 }}>
            <MicButton phase="recording" />
            <AmplitudeBars />
            <StatusDot state="running" label="Listening…" />
          </div>
          <Note>
            Interim / partial transcript appears in muted italic while the
            recognizer is still processing — confirms the mic is live and prevents
            users repeating themselves.
          </Note>
        </div>
      </Variant>

      {/* 3 · Transcribing */}
      <Variant label="transcribing" hint="recording stopped; audio POSTed to /api/transcribe">
        <div className="flex flex-col" style={{ gap: 14 }}>
          <div
            style={{
              background: tok.grey200,
              borderRadius: 12,
              padding: "12px 14px",
              minHeight: 48,
            }}
          >
            <span style={{ fontSize: 13, color: tok.textDisabled }}>
              Processing audio…
            </span>
          </div>
          <div className="flex items-center" style={{ gap: 10 }}>
            <MicButton phase="transcribing" />
            <StatusDot state="running" label="Transcribing…" />
          </div>
        </div>
      </Variant>

      {/* 4 · Finalized — transcript in composer */}
      <Variant label="finalized" hint="final text lands in composer; user edits before sending">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <Composer value="Schedule a meeting with the design team for next Tuesday morning." />
          <div className="flex items-center" style={{ gap: 8 }}>
            <MicButton phase="idle" />
            <StatusDot state="done" label="Transcription complete" />
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: tok.textDisabled }}>
              Review and edit before sending
            </span>
            <ArrowRight size={13} color={tok.textDisabled} />
          </div>
          <Note>
            Always land the transcript in the composer — never auto-send. Users must
            be able to fix recognizer errors (names, jargon, punctuation) before the
            agent receives the message.
          </Note>
        </div>
      </Variant>

      {/* 5 · Permission denied */}
      <Variant label="permission denied" hint="browser or OS blocked mic access">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div
            className="flex items-center"
            style={{
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--error-soft)",
              border: `1px solid rgba(192,57,43,0.2)`,
            }}
          >
            <X size={15} color={tok.error} />
            <span style={{ fontSize: 13, color: tok.error }}>
              Microphone access was blocked.
            </span>
            <div style={{ flex: 1 }} />
            <button
              style={{
                fontSize: 12,
                color: tok.indigo,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Open browser settings
            </button>
          </div>
          <div className="flex items-center" style={{ gap: 10 }}>
            <MicButton phase="denied" />
            <span style={{ fontSize: 13, color: tok.textDisabled }}>
              Voice input unavailable — mic permission required
            </span>
          </div>
          <Note>
            Show an actionable explanation with a direct link to browser or OS
            settings. Never silently disable the button.
          </Note>
        </div>
      </Variant>

      {/* 6 · Error */}
      <Variant label="error" hint="STT service failure or device unavailable — retry available">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div
            className="flex items-center"
            style={{
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--error-soft)",
              border: `1px solid rgba(192,57,43,0.2)`,
            }}
          >
            <StatusDot state="error" />
            <span style={{ fontSize: 13, color: tok.error }}>
              Transcription failed — service unavailable.
            </span>
            <div style={{ flex: 1 }} />
            <Btn variant="ghost">
              <span className="flex items-center" style={{ gap: 6 }}>
                <RotateCcw size={13} /> Retry
              </span>
            </Btn>
          </div>
          <div className="flex items-center" style={{ gap: 10 }}>
            <MicButton phase="error" onClick={() => {}} />
            <span style={{ fontSize: 13, color: tok.textSecondary }}>
              Try again or type your message
            </span>
          </div>
          <Note>
            On error the mic returns to idle with a retry affordance. Provide the
            MediaRecorder fallback path for browsers without Web Speech API so the
            feature degrades gracefully.
          </Note>
        </div>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
