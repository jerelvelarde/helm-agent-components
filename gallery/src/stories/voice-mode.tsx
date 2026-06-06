import { useState } from "react";
import { Mic, X, Play, RotateCcw, Globe } from "lucide-react";
import {
  Avatar,
  Btn,
  Caret,
  CodeNote,
  Note,
  Showcase,
  Skeleton,
  StatusDot,
  Tag,
  ToolFrame,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "voice-mode",
  title: "Voice Mode (Realtime)",
  category: "Multimodal",
  blurb: "Realtime conversational voice (voice-in / voice-out) — orb/waveform, turn-taking, barge-in.",
  copilotkit: "BYO realtime · transcribeAudioUrl",
  spec: "components/voice-mode.md",
};

/** Animated orb that reflects voice phase visually. */
function Orb({
  phase,
}: {
  phase: "idle" | "connecting" | "listening" | "thinking" | "speaking" | "muted" | "error";
}) {
  const colorMap: Record<string, string> = {
    idle: tok.textDisabled,
    connecting: tok.indigo,
    listening: tok.teal,
    thinking: tok.violet,
    speaking: tok.indigo,
    muted: "var(--idle-dot)",
    error: tok.error,
  };
  const color = colorMap[phase] ?? tok.textDisabled;
  const pulse = phase === "connecting" || phase === "listening" || phase === "speaking";
  const label: Record<string, string> = {
    idle: "Tap to start",
    connecting: "Connecting…",
    listening: "Listening",
    thinking: "Thinking…",
    speaking: "Agent speaking",
    muted: "Muted",
    error: "Connection failed",
  };

  return (
    <div className="flex flex-col items-center" style={{ gap: 16 }}>
      <div
        className={pulse ? "ck-pulse" : ""}
        style={{
          width: 80,
          height: 80,
          borderRadius: 9999,
          background: color,
          opacity: phase === "idle" || phase === "muted" ? 0.35 : 1,
          boxShadow: pulse ? `0 0 0 12px ${color}22, 0 0 0 24px ${color}0d` : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.25s, opacity 0.25s",
        }}
      >
        {phase === "muted" ? (
          <Mic size={28} color="var(--surface-container)" />
        ) : phase === "idle" ? (
          <Play size={28} color="var(--surface-container)" />
        ) : phase === "error" ? (
          <X size={28} color="var(--surface-container)" />
        ) : null}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: phase === "error" ? tok.error : tok.textSecondary,
          letterSpacing: "0.01em",
        }}
      >
        {label[phase]}
      </span>
    </div>
  );
}

/** Persistent control bar: Mute / End / Reconnect. */
function ControlBar({
  muted,
  onMute,
  onEnd,
}: {
  muted?: boolean;
  onMute?: () => void;
  onEnd?: () => void;
}) {
  return (
    <div className="flex items-center" style={{ gap: 10, justifyContent: "center" }}>
      <button
        aria-label={muted ? "Unmute microphone" : "Mute microphone"}
        onClick={onMute}
        style={{
          width: 40,
          height: 40,
          borderRadius: 9999,
          border: `1px solid ${tok.border}`,
          background: muted ? tok.textPrimary : "transparent",
          color: muted ? tok.textInvert : tok.textSecondary,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Mic size={17} />
      </button>
      <button
        aria-label="End voice session"
        onClick={onEnd}
        style={{
          width: 40,
          height: 40,
          borderRadius: 9999,
          border: "none",
          background: tok.error,
          color: "var(--surface-container)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={17} />
      </button>
    </div>
  );
}

/** Live caption row — one speaker turn. */
function CaptionRow({
  speaker,
  text,
  streaming,
}: {
  speaker: "user" | "agent";
  text: string;
  streaming?: boolean;
}) {
  return (
    <div className="flex" style={{ gap: 8, alignItems: "flex-start" }}>
      <Avatar role={speaker === "user" ? "user" : "assistant"} size={22} />
      <div
        style={{
          flex: 1,
          fontSize: 13,
          lineHeight: "20px",
          color: tok.textPrimary,
          paddingTop: 1,
        }}
      >
        {text}
        {streaming && <Caret />}
      </div>
    </div>
  );
}

const wiring = `import { useAgent } from "@copilotkit/react-core/v2";
import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

// 1. Subscribe to voice phase from the realtime backend's shared state.
//    Your OpenAI Realtime / Gemini Live agent emits STATE_SNAPSHOT/DELTA
//    with { voicePhase: "idle" | "listening" | "thinking" | "speaking" | "muted" }.
const { agent } = useAgent({ agentId: "voice-agent" });
const phase = agent.state.voicePhase ?? "idle";

// 2. Render inline visuals that arrive as tool calls during a voice turn.
//    The agent emits TOOL_CALL_* for "show_location_card" while speaking;
//    this component mounts in the transcript alongside the live caption.
useRenderTool({
  name: "show_location_card",
  parameters: z.object({
    name: z.string(),
    address: z.string(),
    mapUrl: z.string().optional(),
  }),
  render: ({ status, args }) => (
    <div role="region" aria-label={\`Location: \${args.name ?? "loading"}\`}>
      {status === "complete" && args.mapUrl ? (
        <img src={args.mapUrl} alt={\`Map of \${args.name}\`} />
      ) : null}
      <p>{args.name}</p>
      <p>{args.address}</p>
    </div>
  ),
});

// 3. Configure the CopilotKit provider with audio endpoints (push-to-talk TTS):
// <CopilotKit
//   transcribeAudioUrl="/api/transcribe"   // speech-in
//   textToSpeechUrl="/api/tts"             // speech-out
// >
//
// Full realtime (VAD + barge-in) requires a BYO realtime backend
// (OpenAI Realtime API or Gemini Live) surfaced via AG-UI CUSTOM events.
// v1 equivalent for shared state: useCoAgent({ name: "voice-agent" })`;

export default function Story() {
  const [muted, setMuted] = useState(false);

  return (
    <Showcase>
      {/* ── 1. Idle / tap-to-start ─────────────────────────────────── */}
      <Variant label="idle" hint="session not yet opened — orb dim, tap to start">
        <div className="flex flex-col items-center" style={{ gap: 20, paddingTop: 8, paddingBottom: 8 }}>
          <Orb phase="idle" />
          <Btn variant="primary">Start voice session</Btn>
          <Note>Orb is dim and static. Mic indicator is not yet live.</Note>
        </div>
      </Variant>

      {/* ── 2. Listening ───────────────────────────────────────────── */}
      <Variant label="listening" hint="session open; user speaking — VAD active, caption streams">
        <div className="flex flex-col" style={{ gap: 20 }}>
          <div className="flex flex-col items-center" style={{ gap: 8 }}>
            <Orb phase="listening" />
            <div className="flex items-center" style={{ gap: 6 }}>
              <StatusDot state="running" />
              <Tag>Mic live</Tag>
            </div>
          </div>
          <div
            style={{
              background: tok.grey200,
              borderRadius: 10,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <CaptionRow speaker="agent" text="Sure, I can pull that up. Which region are you interested in?" />
            <CaptionRow speaker="user" text="Can you pull up last month's report for" streaming />
          </div>
          <ControlBar muted={muted} onMute={() => setMuted((v) => !v)} />
        </div>
      </Variant>

      {/* ── 3. Speaking + inline visual ────────────────────────────── */}
      <Variant label="speaking" hint="agent audio streaming; inline visual rendered mid-turn">
        <div className="flex flex-col" style={{ gap: 20 }}>
          <div className="flex flex-col items-center" style={{ gap: 8 }}>
            <Orb phase="speaking" />
            <div className="flex items-center" style={{ gap: 6 }}>
              <StatusDot state="running" />
              <Tag>Agent speaking</Tag>
            </div>
          </div>
          <div
            style={{
              background: tok.grey200,
              borderRadius: 10,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <CaptionRow speaker="agent" text="Here's the EMEA summary — revenue was up 14% versus October. The top market was" streaming />
            {/* Inline visual rendered during voice turn via TOOL_CALL_* */}
            <div style={{ marginLeft: 30 }}>
              <ToolFrame
                name="show_region_chart"
                status="complete"
                args='region: "EMEA", month: "November 2025"'
              >
                <div className="flex items-center" style={{ gap: 8 }}>
                  <Globe size={15} color={tok.teal} />
                  <span style={{ fontSize: 13 }}>EMEA · Nov 2025 · Revenue +14% MoM</span>
                </div>
              </ToolFrame>
            </div>
          </div>
          <ControlBar muted={muted} onMute={() => setMuted((v) => !v)} />
        </div>
      </Variant>

      {/* ── 4. Thinking + muted ────────────────────────────────────── */}
      <Variant label="thinking / muted" hint="two sub-states: processing after user turn · mic suppressed">
        <div className="flex" style={{ gap: 24 }}>
          {/* Thinking */}
          <div className="flex flex-col items-center" style={{ flex: 1, gap: 14 }}>
            <span style={{ fontSize: 11, color: tok.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Thinking
            </span>
            <Orb phase="thinking" />
            <div
              style={{
                background: tok.grey200,
                borderRadius: 10,
                padding: "10px 14px",
                width: "100%",
              }}
            >
              <CaptionRow speaker="user" text="Can you compare that to Q3 overall?" />
              <div style={{ marginLeft: 30, marginTop: 8 }}>
                <Skeleton h={12} w="80%" />
                <Skeleton h={12} w="55%" style={{ marginTop: 6 }} />
              </div>
            </div>
          </div>

          {/* Muted */}
          <div className="flex flex-col items-center" style={{ flex: 1, gap: 14 }}>
            <span style={{ fontSize: 11, color: tok.textDisabled, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Muted
            </span>
            <Orb phase="muted" />
            <div className="flex items-center" style={{ gap: 6 }}>
              <Mic size={15} color={tok.textDisabled} style={{ opacity: 0.5 }} />
              <span style={{ fontSize: 13, color: tok.textDisabled }}>Mic off — agent continues</span>
            </div>
          </div>
        </div>
      </Variant>

      {/* ── 5. Error / reconnecting ────────────────────────────────── */}
      <Variant label="error / reconnecting" hint="connection failure with retry and specific cause text">
        <div className="flex flex-col items-center" style={{ gap: 16, paddingTop: 4, paddingBottom: 4 }}>
          <Orb phase="error" />
          <div
            style={{
              background: "var(--error-soft)",
              border: `1px solid #f5c6c0`,
              borderRadius: 10,
              padding: "12px 16px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div className="flex items-center" style={{ gap: 8 }}>
              <StatusDot state="error" />
              <span style={{ fontSize: 13, fontWeight: 500, color: tok.error }}>
                Realtime connection lost
              </span>
            </div>
            <span style={{ fontSize: 12, color: tok.textSecondary }}>
              WebSocket closed unexpectedly. Check your network connection and retry.
            </span>
            <div className="flex items-center" style={{ gap: 8 }}>
              <Btn variant="primary">
                <span className="flex items-center" style={{ gap: 6 }}>
                  <RotateCcw size={13} />
                  Reconnect
                </span>
              </Btn>
              <Btn variant="ghost">End session</Btn>
            </div>
          </div>
        </div>
      </Variant>

      <Note>
        Each state must have a <em>visually distinct</em> orb animation — idle, listening, thinking, and speaking
        must never share the same visual. Stream captions for both sides and persist the full transcript to chat
        history so the conversation is auditable after the session ends.
      </Note>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
