# Helm — Gallery

A Storybook-style gallery of **runnable, presentational starter components** for agentic apps, derived from the [design system](../README.md). Each "story" implements a component's anatomy and key states with mock data — no API keys or backend required — and ships the real **CopilotKit** hook wiring as a copy-pasteable snippet so it's a true starting point.

Themed to the CopilotKit / CopilotCloud visual identity (lavender-gray canvas, frosted-glass surfaces, Plus Jakarta Sans, signature blur circles).

## Run it

```bash
cd gallery
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static bundle in `dist/`.

## How it's organized

```
gallery/
├── index.html              # loads Plus Jakarta Sans + Spline Sans Mono
├── src/
│   ├── index.css           # CopilotKit theme tokens + primitives
│   ├── App.tsx             # gallery shell: blur circles, sidebar nav, canvas
│   ├── ui/kit.tsx          # shared themed primitives (Glass, Tag, Bubble, ToolFrame, …)
│   └── stories/            # one *.tsx per component — auto-discovered via import.meta.glob
│       ├── _types.ts       # the StoryMeta contract every story exports
│       └── <slug>.tsx      # a story: `export const meta` + `export default` component
```

Stories self-register: drop a `src/stories/<slug>.tsx` that exports a `meta: StoryMeta` and a default component, and it appears in the sidebar automatically.

## From presentational → live

Each story's **CopilotKit wiring** panel shows the hooks to use (`useRenderTool`, `useHumanInTheLoop`, `useAgent`, …). To go live, see the matching spec under [`../components`](../components) / [`../layouts`](../layouts) and the [primitive reference](../reference/copilotkit-primitives.md).
