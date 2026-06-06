import { useState } from "react";
import { Globe, Loader, Pause, Play, RotateCcw, Video, X } from "lucide-react";
import {
  Avatar,
  Btn,
  CodeNote,
  Note,
  Showcase,
  StatusDot,
  Tag,
  ToolFrame,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "video",
  title: "Video",
  category: "Multimodal",
  blurb: "Video input/output — avatars, screen share, generated video, playback.",
  copilotkit: "BYO · useRenderTool",
  spec: "components/video.md",
};

// ── shared sub-components ──────────────────────────────────────────────────

function VideoSurface({
  label,
  badge,
  dim,
  children,
}: {
  label?: string;
  badge?: string;
  dim?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: dim ? "#1a1a22" : "#0c0c14",
        borderRadius: 10,
        overflow: "hidden",
        aspectRatio: "16/9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
      {label && (
        <span
          style={{
            position: "absolute",
            bottom: 8,
            left: 10,
            fontSize: 11,
            color: "rgba(255,255,255,0.55)",
            fontFamily: tok.mono,
          }}
        >
          {label}
        </span>
      )}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            background: "#c0392b",
            color: "var(--surface-container)",
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 99,
            letterSpacing: "0.05em",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function ProgressBar({ percent, stage }: { percent: number; stage: string }) {
  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        <Loader size={13} color={tok.indigo} className="ck-pulse" />
        <span style={{ fontSize: 12, color: tok.textSecondary }}>{stage}</span>
        <span style={{ marginLeft: "auto", fontFamily: tok.mono, fontSize: 12, color: tok.indigo }}>
          {percent}%
        </span>
      </div>
      <div style={{ height: 5, background: tok.grey300, borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: tok.indigo,
            borderRadius: 99,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── wiring snippet ─────────────────────────────────────────────────────────

const wiring = `import { useRenderTool, useHumanInTheLoop, useAgent } from "@copilotkit/react-core/v2";
import { z } from "zod";

// 1. Render a live computer-use step as the agent acts
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

// 2. Gate a consequential action — agent pauses until user responds
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

// 3. Read live render progress from shared agent state
const { agent } = useAgent({ agentId: "video-render-agent" });
const { stage, percent } = agent.state as { stage: string; percent: number };
// v1 equivalent: const { state } = useCoAgent({ name: "video-render-agent" });`;

// ── story ──────────────────────────────────────────────────────────────────

export default function Story() {
  const [sharing, setSharing] = useState(true);

  return (
    <Showcase>
      {/* 1. Idle — prompt to start sharing */}
      <Variant label="idle" hint="no stream active; explicit opt-in required">
        <div
          style={{
            background: tok.grey200,
            borderRadius: 10,
            padding: "36px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            textAlign: "center",
          }}
        >
          <Video size={32} color={tok.textDisabled} />
          <p style={{ margin: 0, fontSize: 14, color: tok.textSecondary, lineHeight: "20px" }}>
            Share your screen or camera so the agent can see your context.
          </p>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Btn variant="primary">Share Window</Btn>
            <Btn variant="ghost">Enable Camera</Btn>
          </div>
        </div>
        <Note>Always require an explicit click — never auto-start a feed.</Note>
      </Variant>

      {/* 2. Sharing / Streaming — on-air */}
      <Variant label="sharing · on air" hint="live screen feed with persistent ON AIR badge">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 2 }}>
            <StatusDot state={sharing ? "running" : "idle"} />
            <span style={{ fontSize: 12, color: tok.textSecondary }}>
              {sharing ? "Sharing: My Window" : "Share stopped"}
            </span>
            <span style={{ flex: 1 }} />
            <Tag>Copilot Vision</Tag>
            {sharing && (
              <button
                onClick={() => setSharing(false)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: tok.error,
                  background: "transparent",
                  border: `1px solid ${tok.error}`,
                  borderRadius: 6,
                  padding: "3px 10px",
                  cursor: "pointer",
                }}
              >
                <X size={11} /> Stop
              </button>
            )}
          </div>
          <VideoSurface label="Window · 1920×1080" badge={sharing ? "● ON AIR" : undefined} dim={!sharing}>
            {sharing ? (
              <Globe size={36} color="rgba(255,255,255,0.18)" />
            ) : (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Feed stopped</span>
            )}
          </VideoSurface>
          {!sharing && (
            <Btn variant="ghost" onClick={() => setSharing(true)}>
              <RotateCcw size={13} style={{ marginRight: 6 }} />
              Resume share
            </Btn>
          )}
        </div>
      </Variant>

      {/* 3. Computer use — agent acting */}
      <Variant label="computer use · agent acting" hint="live panel + step log; instant takeover available">
        <div className="flex flex-col" style={{ gap: 10 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <StatusDot state="running" label="Agent is navigating" />
            <span style={{ flex: 1 }} />
            <Btn variant="ghost">Takeover</Btn>
          </div>
          <div className="flex" style={{ gap: 10 }}>
            <div style={{ flex: 3 }}>
              <VideoSurface label="Remote browser · 1280×800" badge="● LIVE">
                <Globe size={40} color="rgba(255,255,255,0.12)" />
              </VideoSurface>
            </div>
            <div
              className="flex flex-col"
              style={{ flex: 2, gap: 6, overflowY: "auto", maxHeight: 140 }}
            >
              {[
                { done: true, text: "Opened checkout page" },
                { done: true, text: "Filled shipping address" },
                { done: false, text: "Selecting payment method…" },
              ].map(({ done, text }, i) => (
                <div
                  key={i}
                  className="flex items-center"
                  style={{ gap: 6, fontSize: 12, color: done ? tok.textSecondary : tok.textPrimary }}
                >
                  <StatusDot state={done ? "done" : "running"} />
                  {text}
                </div>
              ))}
            </div>
          </div>
          <ToolFrame name="computer_action" status="executing" args='action: "click", target: "#pay-btn"' />
        </div>
      </Variant>

      {/* 4. HITL — awaiting confirmation before consequential action */}
      <Variant label="HITL · awaiting confirmation" hint="agent paused; run resumes only after user responds">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <ToolFrame name="confirm_submit" status="executing" args='target: "payment form", summary: "Submit $149 order to Acme Co."'>
            <div
              style={{
                background: "var(--warning-soft)",
                border: `1px solid #e9d98c`,
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <p style={{ margin: "0 0 10px", fontSize: 13, color: tok.textPrimary, lineHeight: "18px" }}>
                <strong>The agent wants to submit payment:</strong> $149 order to Acme Co.
              </p>
              <div className="flex items-center" style={{ gap: 8 }}>
                <Btn variant="primary">Confirm</Btn>
                <Btn variant="ghost">Cancel</Btn>
              </div>
            </div>
          </ToolFrame>
          <Note>
            Use <code style={{ fontFamily: tok.mono, fontSize: 12 }}>useHumanInTheLoop</code> — the run stays
            paused until <code style={{ fontFamily: tok.mono, fontSize: 12 }}>respond()</code> is called.
          </Note>
        </div>
      </Variant>

      {/* 5. Generating — text-to-video progress */}
      <Variant label="generating" hint="queued → rendering → post-processing with % and cancel">
        <div className="flex flex-col" style={{ gap: 14 }}>
          <VideoSurface label="Preview — renders when complete" dim>
            <div className="flex flex-col items-center" style={{ gap: 10 }}>
              <Loader size={28} color="rgba(255,255,255,0.25)" className="ck-pulse" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Rendering…</span>
            </div>
          </VideoSurface>
          <ProgressBar percent={62} stage="Rendering · frame 186 / 300" />
          <div className="flex items-center" style={{ gap: 8 }}>
            <Tag>text-to-video</Tag>
            <Tag>HD 1080p</Tag>
            <span style={{ flex: 1 }} />
            <Btn variant="ghost">Cancel</Btn>
          </div>
        </div>
      </Variant>

      {/* 6. Done — playback + AI-generated badge */}
      <Variant label="done · playback" hint="clip ready; AI-generated label + play controls">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <VideoSurface label="product-demo-v3.mp4 · 0:24">
            <button
              style={{
                width: 52,
                height: 52,
                borderRadius: 99,
                background: "rgba(255,255,255,0.18)",
                border: "2px solid rgba(255,255,255,0.45)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Play size={22} color="var(--surface-container)" />
            </button>
          </VideoSurface>
          <div className="flex items-center" style={{ gap: 8 }}>
            <Avatar role="agent" size={22} />
            <span style={{ fontSize: 13, color: tok.textPrimary }}>product-demo-v3.mp4</span>
            <span style={{ flex: 1 }} />
            <Tag selected>AI-generated</Tag>
            <Btn variant="ghost">Download</Btn>
          </div>
          <Note>
            Always surface an "AI-generated" badge on synthetic clips; attach C2PA provenance metadata where supported.
          </Note>
        </div>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
