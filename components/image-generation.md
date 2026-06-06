# Image Generation
> The agent turns a text prompt (and optional reference images) into one or more generated images, rendered inline in the chat with progress feedback, iterative editing, and embedded provenance.

**Category:** Component · **Cluster:** Multimodal (voice, video, image) · **Aliases:** prompt-to-image, text-to-image, AI image generation, image editing / inpainting, generative imagery, image-to-image, image gen

## Definition

Image Generation is the component pattern for an agent calling an image model, streaming generation progress, and surfacing one or more images inline in the conversation thread. It covers the full cycle: prompt entry, queued/generating states with a sized placeholder, result display (single or gallery), and iterative editing via inpainting, outpainting, or natural-language transformations. It solves the problem of making a fundamentally asynchronous, multi-second operation feel responsive, correctable, and trustworthy in an agentic UI. It appears in creative tools, design assistants, marketing copilots, and any agent workflow that produces visual artifacts.

## When to use / when not to

- **Use** when the agent can call an image-generation model (DALL·E, GPT Image, Firefly, Stability, Imagen, etc.) and needs to surface results in the chat thread rather than redirecting to an external tool.
- **Use** when users need iterative control — masking a region to fix one detail, generating variations, or providing a reference image for style consistency.
- **Use** when your product context requires provenance disclosure (marketing, publishing, journalism) and you want to embed C2PA/SynthID metadata surfacing as part of the generation UX.
- **Avoid** when image quality, latency, or content-policy constraints make in-chat generation unreliable — instead link to a dedicated generation surface rather than fragmenting the UX with frequent failures.
- **Avoid** treating image generation as a side-channel: if the agent can produce images, make that capability discoverable through suggestions or capability surfacing rather than letting users discover it by accident.

## Anatomy

```
┌────────────────────────────────────────────────────────┐
│  Prompt bar / input composer                           │
│  ┌──────────────────────────────────────┐  [Generate]  │
│  │ "a misty mountain at dawn, cinematic"│              │
│  └──────────────────────────────────────┘              │
├────────────────────────────────────────────────────────┤
│  Generation progress region (tool-call render)         │
│  ┌────────────────────────────────────────────────┐    │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  40%       │    │
│  │          skeleton / shimmer placeholder         │    │
│  └────────────────────────────────────────────────┘    │
├────────────────────────────────────────────────────────┤
│  Result region                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Image 1 │  │  Image 2 │  │  Image 3 │  ← gallery  │
│  └──────────┘  └──────────┘  └──────────┘             │
│  [Download]  [Use as reference]  [Edit]   [Regenerate] │
├────────────────────────────────────────────────────────┤
│  Editing overlay (inpaint / outpaint)                  │
│  ┌──────────────────────────────────────┐              │
│  │ [Canvas + mask/brush tool]           │              │
│  │                                      │              │
│  └──────────────────────────────────────┘              │
│  "Describe the change:" [_____________] [Apply]        │
├────────────────────────────────────────────────────────┤
│  Provenance badge   🔵 AI-generated · C2PA/SynthID     │
└────────────────────────────────────────────────────────┘
```

**Parts:**
- **Prompt bar** — text input (and optional reference image upload); maps to the Input Composer.
- **Generation progress region** — sized skeleton/shimmer placeholder and optional progress percentage, rendered during the `InProgress`/`Executing` tool-call status.
- **Result region** — single image or gallery grid (batch n); each image has download, "use as reference", edit, and regenerate affordances.
- **Editing overlay** — select/mask/brush tool for inpainting or outpainting; collects an edit prompt and replaces only the masked region.
- **Provenance badge** — visible "AI-generated" label with optional C2PA content credentials or SynthID indicator.

## States

| State | Trigger | UI treatment |
|---|---|---|
| Empty / prompt-entry | Component mounts or run completes | Prompt bar focused; optional example prompts via suggestions; no image shown |
| Queued / submitting | User sends prompt; `RUN_STARTED` | Prompt bar disabled; brief "queued" micro-copy or spinner in send button |
| Generating | `TOOL_CALL_START` → `InProgress` | Sized skeleton/shimmer placeholder reserves layout space; progress bar or percentage if model streams partials |
| Result(s) shown | `TOOL_CALL_RESULT` → `Complete` | Image(s) rendered in gallery; actions (download, edit, regenerate) available; provenance badge present |
| Editing (mask/select) | User clicks "Edit" on a result | Editing overlay opens over selected image; mask/brush tool active; second prompt field focused |
| Regenerating / variations | User clicks "Regenerate" or requests variations | Same generating state; existing images remain visible until new ones arrive (diff shows cleanly) |
| Done / saved | User clicks "Use as reference" or saves to canvas | Image is pinned to context/canvas; clear confirmation affordance |
| Downloaded / exported | User clicks "Download" | File download triggers; no visual state change needed beyond transient confirmation |
| Blocked (content policy) | Agent returns policy refusal | Error card with specific reason and suggested rephrase; no broken placeholder |
| Error (generation failed) | Timeout, model error, `RUN_ERROR` | Error card with retry action; placeholder removed cleanly |

## Vocabulary

| Term | Definition |
|---|---|
| Prompt / negative prompt | The text describing what to generate; a negative prompt specifies what the model should avoid including. |
| Inpainting | Masking a specific region of an image and regenerating only that area from a new prompt, leaving the rest intact. |
| Outpainting | Extending the image beyond its original borders, generating new content that continues the scene. |
| Select / mask / brush tool | The UI for marking the exact region to edit; a tight selection yields cleaner, more localized edits. |
| Image-to-image / reference | Conditioning generation on an uploaded or previously-generated image for style, composition, or character consistency. |
| Variations / gallery / batch (n) | Producing multiple candidates (commonly 1–4) shown as a grid for the user to compare and pick from. |
| Generation progress | Feedback while the image renders — driven by the `InProgress`/`Executing` tool-call status; expressed as a skeleton placeholder, shimmer, or progress percentage. |
| Character / subject consistency | Keeping the same person or object recognizable across multiple generations or sequential edits, often via an image-to-image reference. |
| Content credentials (C2PA) / SynthID | Provenance metadata and visible or invisible watermarks that cryptographically record the generating model, version, and edits, marking the image as AI-generated. |

## Real-world examples

- **ChatGPT image generation (OpenAI, GPT Image)** — Generates images inline in chat; selecting a result opens an expanded editor where the user masks a region and describes a change to regenerate only that area (inpainting) without redoing the whole image. OpenAI replaced DALL·E 3 with native GPT Image 1 (and later GPT Image 1.5) in 2025 and applies C2PA Content Credentials to all generated images. [Source](https://openai.com/index/new-chatgpt-images-is-here/)
- **Google Gemini "Nano Banana" (image)** — Gemini's generation/editing models (Gemini 2.5 Flash Image and Gemini 3 Pro Image) support blending multiple reference images, maintaining character consistency for storytelling, and natural-language targeted transformations. Every generated image carries an invisible SynthID watermark; Gemini can also verify whether an uploaded image originated from Google AI. [Source](https://gemini.google/overview/image-generation/)
- **Adobe Firefly** — Content Credentials are applied automatically to every Firefly-generated image: a cryptographically signed C2PA manifest recording the model, version, and edit history is embedded in the file and preserved through the editing pipeline, making provenance a first-class part of the generation UX. [Source](https://contentauthenticity.org/blog/meeting-the-moment-with-c2pa-and-firefly)

## CopilotKit & AG-UI mapping

Image generation fits CopilotKit's Static Generative UI model: the backend agent calls the image tool; the AG-UI event stream carries `TOOL_CALL_START` → `TOOL_CALL_ARGS` → `TOOL_CALL_END` → `TOOL_CALL_RESULT`, which map directly to the `ToolCallStatus` lifecycle (`InProgress` → `Executing` → `Complete`). Register a renderer with `useRenderTool` (v2) to display the generating state and the final image(s) inline.

For the editing/approval step (select region → approve regeneration), use `useHumanInTheLoop` to pause agent execution until the user submits the mask and edit prompt.

Progress across a longer agentic pipeline (e.g., multiple images in sequence) can flow through `STATE_DELTA` via `useAgent` shared state.

> v1 equivalent: `useCopilotAction({ name: "generate_image", render, renderAndWaitForResponse })` from `@copilotkit/react-core`.

```tsx
import { useRenderTool } from "@copilotkit/react-core/v2";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Render the backend image-generation tool call inline
useRenderTool({
  name: "generate_image",
  parameters: z.object({
    prompt: z.string(),
    n: z.number().optional(),
    aspect_ratio: z.string().optional(),
  }),
  render: ({ status, args, result }) => {
    if (status === "inProgress") {
      return (
        <div className="img-gen-placeholder" aria-busy="true" aria-label="Generating image…">
          <div className="shimmer" style={{ aspectRatio: "16/9" }} />
          <span className="progress-label">Generating…</span>
        </div>
      );
    }
    if (status === "complete" && result) {
      const images: string[] = JSON.parse(result); // array of URLs
      return (
        <div role="list" aria-label="Generated images">
          {images.map((url, i) => (
            <div key={i} role="listitem">
              <img src={url} alt={`Generated image ${i + 1}: ${args.prompt}`} />
              <div className="img-actions">
                <a href={url} download>Download</a>
                <button>Edit</button>
                <button>Regenerate</button>
              </div>
              <span className="provenance-badge" aria-label="AI-generated">AI-generated</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  },
});

// Pause for user to provide mask + edit prompt before regenerating a region
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
```

AG-UI events involved: `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END`, `TOOL_CALL_RESULT` (drives the `ToolCallStatus` lifecycle); `STATE_DELTA` for multi-image batch progress via shared state; `RUN_ERROR` for generation failures.

Docs: [useRenderTool](https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool) · [useHumanInTheLoop](https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop) · [Generative UI](https://docs.copilotkit.ai/learn/generative-ui)

## Best practices

- **Reserve layout before the image arrives.** Render a sized skeleton or shimmer placeholder (`aspect-ratio` matches the expected output) the moment `TOOL_CALL_START` fires — this prevents layout shift and makes the multi-second wait feel active rather than frozen.
- **Show meaningful progress, not just a spinner.** For generation jobs that run 3–15+ seconds, a progress percentage or staged micro-copy ("Sampling…", "Refining…") performs better than an indeterminate spinner; use whatever signal the model or tool exposes.
- **Default to a small gallery (2–4 candidates) over a single image.** Users converge faster when they can compare and pick rather than serially regenerating from scratch. Expose batch size as a user control when the underlying model supports it.
- **Make editing localized.** Provide a mask/brush tool for inpainting so fixing one detail does not regenerate the entire image. Include undo/redo and an explicit "regenerate this region only" action.
- **Attach provenance unconditionally.** Embed C2PA Content Credentials or SynthID metadata in every download and render a visible "AI-generated" badge in the result UI. Do not let users export images without it — this is a trust and regulatory hygiene floor, not an optional feature.
- **Keep the prompt editable alongside the result.** Users iterate on prompts after seeing results; preserve the originating prompt in an editable field and maintain a generation history so users can branch, compare, and re-run with incremental tweaks.
- **Explain content-policy refusals.** Return a card naming the violated policy and suggesting a compliant rephrase. Silent failures or generic errors erode trust and leave users guessing.
- **Make download and "use as reference" first-class affordances.** These are the two most common follow-on actions; do not bury them in a context menu.

## Anti-patterns

- **Indeterminate spinner with no placeholder.** A bare spinner for a multi-second render provides no sense of progress and causes a jarring layout jump when the image pops in. Always reserve the layout footprint before the image loads.
- **Full-image regeneration to fix a small region.** Forcing users to regenerate the whole image to change one element wastes time and credits. Masked inpainting is the correct primitive — ship it or explicitly acknowledge the limitation.
- **Images with no AI-generated label or provenance metadata.** Distributing AI-generated images without disclosure violates platform policies, emerging regulations, and user trust. C2PA metadata and a visible badge are not optional.
- **Inaccessible gallery and editor.** A gallery that can't be navigated by keyboard, images without alt text, and an editing canvas with no screen-reader equivalent exclude a significant portion of users and violate WCAG 2.1 AA.
- **Silent policy refusals.** Returning a generic error or empty result when a prompt is blocked leaves users confused. Name the policy, explain what triggered it, and offer a rephrase path.

## Accessibility

- **Images require alt text.** Auto-populate `alt` from the generation prompt (e.g., `alt="Generated image: {prompt}"`); expose an editable alt-text field before download so users can refine it for downstream use. Never use an empty `alt` on a meaningful image.
- **Gallery is a landmark list.** Wrap the image grid in `role="list"` with each item as `role="listitem"`; use `aria-label="Generated images"` on the container. Keyboard focus must traverse items and reach all action buttons (Download, Edit, Regenerate) via Tab/Enter.
- **Announce generation completion.** Use `aria-live="polite"` on a status region to announce state transitions ("Image generation complete — 3 images ready") so screen-reader users don't have to poll.
- **Placeholder has descriptive aria state.** The shimmer/skeleton region should carry `aria-busy="true"` and `aria-label="Generating image…"` while in progress; remove `aria-busy` (or update `aria-label`) when the image arrives.
- **Editing canvas needs keyboard and screen-reader access.** If the mask/brush tool is a canvas element, provide a keyboard-accessible alternative (e.g., region selection via arrow keys with a describe-and-apply text path) and label the canvas via `aria-label` with usage instructions.
- **Reduced motion.** Shimmer/pulse animations must respect `prefers-reduced-motion`: substitute a static skeleton with a visible progress bar for users who have reduced motion enabled.

## Related

- [./generative-ui-inline.md](./generative-ui-inline.md) — Inline Generative UI (Static / Controlled): the base pattern `useRenderTool` that this component specializes.
- [./tool-call.md](./tool-call.md) — Tool Call: the `ToolCallStatus` lifecycle (`InProgress → Executing → Complete`) that drives the generation-progress state.
- [./human-in-the-loop.md](./human-in-the-loop.md) — Human-in-the-Loop Prompt: the `useHumanInTheLoop` pattern used for the mask-and-approve editing step.
- [./video.md](./video.md) — Video: sibling multimodal component for agent-driven video generation.
- [./input-composer.md](./input-composer.md) — Input Box / Composer: the prompt bar and reference-image upload affordance.
- [../layouts/canvas-workspace.md](../layouts/canvas-workspace.md) — Canvas / Workspace & Artifacts: where generated images are pinned as artifacts and co-edited with the agent.
- [../reference/copilotkit-primitives.md](../reference/copilotkit-primitives.md) — CopilotKit primitive reference.
- [../reference/ag-ui-protocol.md](../reference/ag-ui-protocol.md) — AG-UI protocol reference.

## Sources

- https://openai.com/index/new-chatgpt-images-is-here/
- https://gemini.google/overview/image-generation/
- https://contentauthenticity.org/blog/meeting-the-moment-with-c2pa-and-firefly
- https://docs.copilotkit.ai/reference/v2/hooks/useRenderTool
- https://docs.copilotkit.ai/reference/v2/hooks/useHumanInTheLoop
- https://docs.copilotkit.ai/learn/generative-ui
- https://docs.ag-ui.com/concepts/events
