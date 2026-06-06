import { useState } from "react";
import { Image, RotateCcw, Play, Check, X, Sparkles, Globe } from "lucide-react";
import {
  Btn,
  CodeNote,
  Composer,
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
  slug: "image-generation",
  title: "Image Generation",
  category: "Multimodal",
  blurb: "Prompt-to-image — generation progress, gallery, variations, in-image editing.",
  copilotkit: "useRenderTool",
  spec: "components/image-generation.md",
};

// ── Shimmer placeholder that reserves image layout ──────────────────────────
function ImagePlaceholder({ aspectRatio = "4/3", label }: { aspectRatio?: string; label?: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label || "Generating image…"}
      style={{ position: "relative", width: "100%", borderRadius: 8, overflow: "hidden" }}
    >
      <div style={{ paddingBottom: aspectRatio === "16/9" ? "56.25%" : "75%", position: "relative" }}>
        <Skeleton
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            borderRadius: 8,
          }}
          w="100%"
          h="100%"
        />
      </div>
    </div>
  );
}

// ── Provenance badge ─────────────────────────────────────────────────────────
function ProvenanceBadge() {
  return (
    <span
      className="inline-flex items-center"
      aria-label="AI-generated"
      style={{
        gap: 5,
        fontSize: 11,
        color: tok.textSecondary,
        background: tok.grey200,
        border: `1px solid ${tok.border}`,
        borderRadius: 9999,
        padding: "2px 8px",
      }}
    >
      <Globe size={11} />
      AI-generated · C2PA
    </span>
  );
}

// ── Mock image tile ──────────────────────────────────────────────────────────
function MockImageTile({
  index,
  label,
  selected,
  onSelect,
}: {
  index: number;
  label: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const hues = ["#c4b5fd", "#a5f3fc", "#bbf7d0", "#fed7aa"];
  return (
    <button
      onClick={onSelect}
      aria-label={`Generated image ${index + 1}: ${label}`}
      style={{
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        border: selected ? `2px solid ${tok.indigo}` : `2px solid transparent`,
        cursor: "pointer",
        background: hues[index % hues.length],
        aspectRatio: "4/3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "1 1 0",
        minWidth: 0,
      }}
    >
      <Image size={24} color="rgba(0,0,0,0.25)" />
      {selected && (
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: tok.indigo,
            color: "var(--surface-container)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={12} />
        </span>
      )}
    </button>
  );
}

// ── Progress bar (used during generation) ───────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div style={{ width: "100%", background: tok.grey200, borderRadius: 9999, height: 4 }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: 9999,
          background: tok.indigo,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

// ── Interactive gallery variant ──────────────────────────────────────────────
function GalleryResult({ prompt }: { prompt: string }) {
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      <div
        role="list"
        aria-label="Generated images"
        className="flex"
        style={{ gap: 8 }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} role="listitem" style={{ flex: "1 1 0", minWidth: 0 }}>
            <MockImageTile
              index={i}
              label={prompt}
              selected={selected === i}
              onSelect={() => setSelected(i)}
            />
          </div>
        ))}
      </div>
      <div
        aria-live="polite"
        aria-label="Image generation complete — 3 images ready"
        className="flex items-center"
        style={{ gap: 8, flexWrap: "wrap" }}
      >
        <ProvenanceBadge />
        <span style={{ flex: 1 }} />
        <Btn variant="ghost">Download</Btn>
        <Btn variant="ghost">Use as reference</Btn>
        <Btn variant="ghost">Edit</Btn>
        <Btn>
          <span className="inline-flex items-center" style={{ gap: 5 }}>
            <RotateCcw size={13} /> Regenerate
          </span>
        </Btn>
      </div>
    </div>
  );
}

const wiring = `import { useRenderTool } from "@copilotkit/react-core/v2";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Render backend image-generation tool call inline
useRenderTool({
  name: "generate_image",
  parameters: z.object({
    prompt: z.string(),
    n: z.number().optional(),        // batch size 1-4
    aspect_ratio: z.string().optional(),
  }),
  render: ({ status, args, result }) => {
    if (status === "inProgress") {
      return (
        <div aria-busy="true" aria-label="Generating image…">
          <div className="shimmer" style={{ aspectRatio: "16/9" }} />
          <span>Generating…</span>
        </div>
      );
    }
    if (status === "complete" && result) {
      const images: string[] = JSON.parse(result); // array of URLs
      return (
        <div role="list" aria-label="Generated images">
          {images.map((url, i) => (
            <div key={i} role="listitem">
              <img src={url} alt={\`Generated image \${i + 1}: \${args.prompt}\`} />
              <div>
                <a href={url} download>Download</a>
                <button>Edit</button>
                <button>Regenerate</button>
              </div>
              <span aria-label="AI-generated">AI-generated · C2PA</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  },
});

// Pause for user mask + edit prompt before regenerating a region (HITL)
useHumanInTheLoop({
  name: "request_inpaint",
  parameters: z.object({ imageUrl: z.string(), suggestion: z.string() }),
  render: ({ status, args, respond }) =>
    status === "executing" ? (
      <InpaintEditor
        imageUrl={args.imageUrl}
        suggestion={args.suggestion}
        onSubmit={(mask, editPrompt) => respond?.({ mask, editPrompt })}
        onCancel={() => respond?.({ cancelled: true })}
      />
    ) : (
      <InpaintEditor imageUrl={args.imageUrl} suggestion={args.suggestion} disabled />
    ),
});

// v1 equivalent:
// useCopilotAction({ name: "generate_image", render, renderAndWaitForResponse })`;

export default function Story() {
  return (
    <Showcase>
      {/* 1 — Prompt entry */}
      <Variant label="prompt-entry" hint="empty state — composer focused with example suggestions">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
            <Tag>a misty mountain at dawn, cinematic</Tag>
            <Tag>product photo, white background</Tag>
            <Tag>character portrait, oil painting</Tag>
          </div>
          <Composer
            placeholder="Describe the image you want to generate…"
          />
          <Note>
            Prompt bar focused; example suggestions surface the capability. No image shown yet.
          </Note>
        </div>
      </Variant>

      {/* 2 — Generating (inProgress) */}
      <Variant label="generating" hint="TOOL_CALL_START → InProgress; shimmer reserves layout">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <ToolFrame
            name="generate_image"
            status="inProgress"
            args={'prompt: "a misty mountain at dawn, cinematic"  ·  n: 3'}
          />
          <div className="flex" style={{ gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: "1 1 0", minWidth: 0 }}>
                <ImagePlaceholder label="Generating image…" />
              </div>
            ))}
          </div>
          <div className="flex items-center" style={{ gap: 10 }}>
            <ProgressBar pct={40} />
            <span style={{ fontSize: 12, color: tok.textDisabled, whiteSpace: "nowrap" }}>
              Sampling… 40%
            </span>
          </div>
          <Note>
            Sized skeleton placeholders prevent layout shift. Progress label uses model signal
            ("Sampling…", "Refining…") rather than a bare spinner.
          </Note>
        </div>
      </Variant>

      {/* 3 — Results / gallery */}
      <Variant label="results" hint="TOOL_CALL_RESULT → Complete; gallery with actions">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <ToolFrame
            name="generate_image"
            status="complete"
            args={'prompt: "a misty mountain at dawn, cinematic"  ·  n: 3'}
          />
          <GalleryResult prompt="a misty mountain at dawn, cinematic" />
          <Note>
            Three candidates let users compare and pick. Provenance badge is unconditional.
            Download and "Use as reference" are first-class affordances.
          </Note>
        </div>
      </Variant>

      {/* 4 — Editing / inpaint (HITL) */}
      <Variant label="editing" hint="useHumanInTheLoop → executing; mask region + edit prompt">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div
            style={{
              border: `2px dashed ${tok.indigo}`,
              borderRadius: 10,
              padding: 4,
              position: "relative",
            }}
          >
            <div
              style={{
                background: "#c4b5fd",
                borderRadius: 8,
                aspectRatio: "16/9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* masked region highlight */}
              <div
                style={{
                  position: "absolute",
                  top: "30%",
                  left: "20%",
                  width: "35%",
                  height: "40%",
                  border: `2px solid ${tok.warning}`,
                  background: "rgba(180,83,9,0.15)",
                  borderRadius: 4,
                }}
              />
              <Image size={32} color="rgba(0,0,0,0.2)" />
            </div>
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                fontSize: 11,
                color: tok.warning,
                background: "rgba(255,255,255,0.85)",
                borderRadius: 4,
                padding: "2px 6px",
                fontWeight: 500,
              }}
            >
              Region selected
            </span>
          </div>
          <div className="flex" style={{ gap: 8 }}>
            <div style={{ flex: 1 }}>
              <input
                readOnly
                defaultValue="Remove the fog and add golden sunlight"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: `1px solid ${tok.border}`,
                  fontSize: 13,
                  fontFamily: "inherit",
                  color: tok.textPrimary,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <Btn>
              <span className="inline-flex items-center" style={{ gap: 5 }}>
                <Play size={13} /> Apply
              </span>
            </Btn>
            <Btn variant="ghost">
              <X size={14} />
            </Btn>
          </div>
          <Note>
            Mask/brush tool marks the edit region; second prompt targets only the selection.
            Agent execution pauses via useHumanInTheLoop until the user submits.
          </Note>
        </div>
      </Variant>

      {/* 5 — Error / content policy */}
      <Variant label="blocked / error" hint="policy refusal or generation failure — clear path forward">
        <div className="flex flex-col" style={{ gap: 10 }}>
          {/* Content policy */}
          <div
            style={{
              background: "var(--warning-soft)",
              border: `1px solid ${tok.warning}`,
              borderRadius: 8,
              padding: "12px 14px",
            }}
          >
            <div className="flex items-center" style={{ gap: 8, marginBottom: 6 }}>
              <StatusDot state="waiting" />
              <span style={{ fontSize: 13, fontWeight: 600, color: tok.warning }}>
                Content policy: violence / harmful content
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: tok.textSecondary, lineHeight: "20px" }}>
              The prompt was declined. Try rephrasing — e.g. remove references to harm and describe a
              peaceful scene instead.
            </p>
          </div>

          {/* Generation failure */}
          <div
            style={{
              background: "var(--error-soft)",
              border: `1px solid ${tok.error}`,
              borderRadius: 8,
              padding: "12px 14px",
            }}
          >
            <div className="flex items-center" style={{ gap: 8 }}>
              <StatusDot state="error" />
              <span style={{ fontSize: 13, fontWeight: 600, color: tok.error }}>
                Generation failed — model timeout
              </span>
              <span style={{ flex: 1 }} />
              <Btn variant="ghost">
                <span className="inline-flex items-center" style={{ gap: 5 }}>
                  <RotateCcw size={13} /> Retry
                </span>
              </Btn>
            </div>
          </div>

          <Note>
            Policy refusals name the violated rule and suggest a rephrase. Failures expose a Retry
            action. Neither shows a broken placeholder or a silent empty state.
          </Note>
        </div>
      </Variant>

      {/* 6 — CodeNote wiring */}
      <CodeNote code={wiring} />
    </Showcase>
  );
}
