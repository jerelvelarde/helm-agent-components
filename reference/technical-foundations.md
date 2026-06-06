# Helm — Technical Foundations

> **What this is.** A research-grounded decision document for Helm's design and architecture: how it should be **customizable**, how it should be **distributed** to developers, and how much of the **hard work** it should do for them — benchmarked against Material Design, shadcn/ui, and Tailwind, and positioned against the agentic-UI landscape (CopilotKit, assistant-ui, Tambo, prompt-kit, and the component catalogues).
>
> Status: **proposal for discussion** (branch `technical-foundations`). Nothing here ships yet. The verified research behind every claim is cited inline and consolidated at the end.

---

## TL;DR — the decision in six lines

1. **Position Helm as the *design system* for agentic apps** — not a component catalogue. Its competitors are the **agentic-UI component catalogues**, whose common shape is a *bag of components that inherits your theme and couples to a single runtime SDK*, while Helm is a *system* with its own agentic token model, density rules, accessibility, and a conceptual taxonomy — and is **runtime-neutral**.
2. **Relationship to CopilotKit: `Helm : CopilotKit :: shadcn/ui : Vercel`.** Independent, MIT, individually credited to you; *grounded in* CopilotKit + AG-UI; *not owned* by them. (Exactly how shadcn — a Vercel employee — relates to Vercel.)
3. **Distribute via the shadcn registry standard** (the channel this whole category uses): `npx shadcn add @helm/<item>`. Own-the-code, zero lock-in, first-class AI-agent install via MCP. This is table stakes, not innovation.
4. **Customize via a CSS-variable token contract** (the stable public API) + CVA-style variants + slot composition + a theme generator. "Maximally opinionated by default, maximally customizable when needed."
5. **The moat = the agentic hard parts, *designed*:** dual-density tool-call lifecycle, thinking/reasoning, human-in-the-loop gating, citations/provenance, sub-agents, streaming/shared-state — all accessible, themed, and ownable. Nobody ships these as a coherent *system*. Helm already has the raw material.
6. **Motion is a first-class pillar, not polish.** Agentic UIs are *temporal* — streaming, thinking, tool-calls progressing — so motion is how the UI says the agent is *alive and working*. Helm systematizes it: motion tokens in the foundation, a CSS-first → Motion → Rive tier model, two motion "personalities", and a strict reduced-motion + compositor-only policy. Material has the rigor but isn't agentic; the agentic tools have the pieces but no *system* — the slot is open. (See **Part 6**.)

---

## Part 1 · Positioning Helm

### 1.1 The framing question — "a new library, or CopilotKit's frontend?"

The instinct is to pick one of two:

- **(A) A brand-new independent library** — clean credit, but no ecosystem gravity, and it competes *with* CopilotKit instead of riding its momentum.
- **(B) CopilotKit's agentic frontend** — instant distribution, but CopilotKit owns it, your name disappears into an org, and it's locked to one runtime.

There is a **third path with a proven precedent**, and it's the one you described:

> **Helm is to CopilotKit what shadcn/ui is to Vercel.**

shadcn is a Vercel employee. shadcn/ui is **MIT, credited to him personally, framework-and-runtime-neutral, and *feels* independent** — yet his employer benefits enormously (the same registry protocol powers its own tools, its academy teaches it) and amplifies it *without owning it in a way that erases his name*. ([shadcn ↔ Vercel relationship](https://vercel.com/academy/shadcn-ui))

That is precisely "**related but not owned, and I want to be credited.**" It gives you:

- **Credit** — Helm is *yours* (MIT © Jerel Velarde, already in place), an identity independent of the CopilotKit brand.
- **Relation** — implementation and wiring snippets target CopilotKit + AG-UI; it is the natural design layer for every CopilotKit app; CopilotKit can *endorse and feature* it (ecosystem credit) without absorbing it.
- **Independence** — vendor-neutral taxonomy means it isn't a single-vendor accessory; it survives and travels regardless of which runtime wins.

**Recommendation:** keep Helm in your namespace, MIT, vendor-neutral in taxonomy and CopilotKit-grounded in implementation (the current stance — don't change it), and pursue *ecosystem endorsement* from CopilotKit rather than *ownership* by it.

### 1.2 The market has three layers — Helm owns the empty one

| Layer | What it is | Who's there |
|---|---|---|
| **Runtime / protocol** | Streaming, tool-call lifecycle, shared state, interrupts, A2A | **CopilotKit** (reference impl of **AG-UI**), LangGraph, Tambo backend |
| **Component catalogue** | A bag of React components you install and theme yourself | **prompt-kit**, LlamaIndex chat-ui, assistant-ui (primitives) |
| **Design system** | Tokens + a coherent visual language + customization model + accessibility + patterns + *taxonomy/guidelines* | **— empty —** |

CopilotKit itself calls its layer the *"agentic frontend"* — that's **runtime**, not design. Its UI (`@copilotkit/react-ui`) is opaque npm themed through a handful of CSS variables; it is explicitly plumbing, not a design system. The component catalogues are exactly that — *catalogues*: each inherits your existing shadcn theme and delegates the runtime to whatever SDK you wire in. **No one occupies the design-system layer for agentic apps.** That is Helm's slot.

### 1.3 The unique pain Helm answers

> *"My agentic app's tool-calls, thinking trace, approval prompts, and citations look ad-hoc and inconsistent, I can't make them on-brand, and every team rebuilds them from scratch — badly."*

- Teams shipping copilots reinvent the same hard surfaces (tool-call cards, reasoning disclosure, HITL gates, source citations) with no shared language, no accessibility, no theming story.
- **The component catalogues** get you *components*, but not a *system*: no opinionated agentic token model of their own, no density rules, no conceptual framework, and often a hard tilt toward one runtime.
- **CopilotKit** gets you the *runtime* and some prebuilt UI, but not design — themeable only at the margins, not ownable, not a system.

Helm answers: **"a real design system for agentic apps — designed, customizable, ownable, accessible, runtime-neutral — that makes your CopilotKit (or any AG-UI) app look intentional."**

### 1.4 Helm vs. the component catalogues — head to head

| Dimension | **Typical component catalogue** | **Helm (proposed)** |
|---|---|---|
| **Category** | Component **catalogue** | Design **system** (tokens → primitives → patterns → examples → taxonomy) |
| **Distribution** | shadcn registry (`npx … add`) | shadcn registry (`npx shadcn add @helm/…`) — **parity** |
| **Runtime** | Typically coupled to **one runtime SDK** | **Runtime-neutral**; grounded in **CopilotKit + AG-UI**, wiring snippets per runtime |
| **Theming** | Inherits the host **shadcn** theme | **Own agentic token system** (status/thinking/HITL/streaming roles) + theme generator |
| **Design opinion** | Minimal; matches your shadcn look | Opinionated, coherent visual language + **dual-density** model |
| **Conceptual layer** | None | **"Where AI sits"** layout taxonomy + two-altitude (concept + code) docs |
| **Accessibility** | Per-component, inherited | A **system-level** state/contrast model (Material lesson) |
| **Motion** | One-off effects (`shimmer`, Rive `persona`, spring auto-scroll) | A motion **system** — tokens, two personalities, the full liveness catalog, reduced-motion policy |
| **Ownership/credit** | Vendor-owned | **Independent, individually credited** |
| **Honest gaps today** | Broader catalogues (voice, code, workflow groups), vendor distribution muscle, more traction | Smaller surface, no traction yet, runtime wiring is docs not packages |

Be honest about the last row: the leading catalogues are **ahead on breadth and reach**. Helm wins on **coherence, neutrality, design taste, the conceptual framework, and CopilotKit grounding** — i.e. on being a *system*, not a pile.

### 1.5 What "related but not owned" looks like concretely

- **License/credit:** MIT © Jerel Velarde (done). Author-forward README and site.
- **Namespace:** your GitHub/registry namespace (`@helm/*`), not the CopilotKit org.
- **Grounding:** every component ships CopilotKit + AG-UI wiring; CopilotKit is the *first-class* runtime in docs.
- **Neutrality:** taxonomy and tokens make no CopilotKit assumption; a second wiring guide (assistant-ui / LangGraph) proves it.
- **Endorsement path:** aim to be listed in CopilotKit's ecosystem / docs and the public shadcn registry directory — *featured*, not *absorbed*.
- ⚠️ **Naming note:** "Helm" collides with the Kubernetes package manager (SEO/recognition). Worth a deliberate decision before any public launch — keep and differentiate, or pick a distinct mark. Flagged, not blocking.

---

## Part 2 · The three foundations questions

The evaluation axes from your brief, defined as Helm will be judged on them:

1. **Customizable** — can a developer make it look like *their* product, down to brand, density, and dark mode, without forking blind or fighting `!important`?
2. **Distributable** — how does a developer *get* it, integrate it, and (ideally) update it, using the channels they already trust?
3. **Built (hard parts for free)** — what genuinely difficult work does Helm do once, so every consumer doesn't redo it?

Parts 3–4 extract how the best systems answer these; Part 5 turns that into Helm's architecture.

> **Motion is a cross-cutting pillar, not a fourth axis** — it has to satisfy all three at once: *customizable* (motion tokens you retune), *distributable* (it ships in the registry like everything else), and *built* (the liveness choreography done for you). **Part 6** makes it concrete.

---

## Part 3 · How Material, shadcn/ui, and Tailwind answer them

### 3.1 Material Design 3 — the opinionated, tiered-token model

- **Customizable:** a strict **three-tier token system** — *reference* (`--md-ref-*`, raw values) → *system* (`--md-sys-*`, semantic roles) → *component* (`--md-comp-*`). Consumers theme the **system** layer; component tokens are internal. A single seed color generates a full accessible palette via the **HCT** color space; the **Material Theme Builder** turns a seed into a complete coded theme. ([m3.material.io/foundations/design-tokens](https://m3.material.io/foundations/design-tokens))
- **Distributable:** *both a spec and per-platform libraries.* Jetpack Compose Material3 and Angular Material are **actively developed**; **`@material/web` is in maintenance mode** (since June 2024) — the web-components bet underdelivered. ([github.com/material-components/material-web/discussions/5642](https://github.com/material-components/material-web/discussions/5642))
- **Hard parts solved:** accessibility by construction (every color role pairs with a contrast-guaranteed "on" role), tonal elevation that survives dark mode, state layers, adaptive layout, motion, i18n, and the seed→theme pipeline.
- **The lessons:** ✅ adopt the **tiered semantic token model**; ✅ make **accessibility structural** (role/contrast pairing, state layers); ✅ ship a **theme generator**, not just tokens; ❌ **don't distribute via Web Components / Shadow DOM** (the `@material/web` cautionary tale — form association, ARIA, `::slotted()` friction).

### 3.2 shadcn/ui — the registry / own-the-code model (the primary template)

- **Customizable:** you **own the source**. Built on **Radix** (headless a11y) + **Tailwind** + **CVA** (typed variants) + **`cn()`** (clsx + tailwind-merge). Theming is **CSS variables** in `:root`/`.dark` (now OKLCH), bridged to Tailwind via `@theme inline`. Customize by editing the file — no override API. ([ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming))
- **Distributable — the key innovation:** an **open registry standard**. Any HTTP server hosting `registry.json` is a registry; items declare `dependencies`, `registryDependencies` (resolved recursively), `cssVars`, and `files`. The CLI reads `components.json` and writes source into your repo. **Namespaced registries** (`@acme/button`, CLI 3.0, Aug 2025), **private/auth registries**, a **`registry:base`** payload that ships a whole design system in one item (CLI v4, Mar 2026), **GitHub registries** (Jun 2026), and a **registry MCP server** for AI-assisted install that needs *zero* author config. ([ui.shadcn.com/docs/registry](https://ui.shadcn.com/docs/registry), […/registry/mcp](https://ui.shadcn.com/docs/registry/mcp))
- **Hard parts solved:** accessibility (via Radix), the variant system, class-conflict resolution, semantic theme tokens + zero-config dark mode, **and the distribution machinery itself**.
- **The big weakness to beat:** **no versioning.** Once copied, a component is severed from upstream — no `npm update`, only a manual `diff`. Security/a11y fixes don't propagate. ([github.com/shadcn-ui/ui/discussions/9949](https://github.com/shadcn-ui/ui/discussions/9949))
- **The lessons:** ✅ **adopt the registry as the distribution channel**; ✅ ship a **`registry:base`** token payload; ✅ **slot/composition** API over monolithic props; ✅ make the **CSS-variable vocabulary the stable public API**; ✅ **support the MCP server day one**; ⭐ **beat shadcn on versioning** (add a `version` field + an upgrade/diff flow) — the single clearest improvement available.

### 3.3 Tailwind v4 — ship a *system*, tokens as CSS variables

- **Customizable:** CSS-first config via **`@theme`** (v4.0, **Jan 22 2025**), where one declaration both sets a `:root` custom property *and* generates utilities. Graduated overrides (`--color-*: initial` … up to `--*: initial`). `@utility` / `@custom-variant` extend the system. ([tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4))
- **Distributable:** an npm build tool (Vite/PostCSS plugin or CLI). Crucially, **design tokens travel as CSS variables on `:root`**, so any consumer — Tailwind or not, JS or not — can read `var(--…)`. Its component ecosystem layers on top: **Headless UI** (free npm, unstyled+accessible), **Tailwind Plus** and **Catalyst** (paid, copy-paste).
- **Hard parts solved:** the token→utility pipeline, dead-code elimination, scale enforcement, the full variant matrix (responsive/state/dark/container), preflight reset, and bundling.
- **The lessons:** ✅ **tokens are CSS variables first** (Tailwind-independent, runtime-readable) — so non-Tailwind consumers can still adopt Helm's language; ✅ **separate the token layer from the component layer** (Catalyst-style ownable components on a portable token base); ✅ **constraint is a feature** — curate an opinionated agentic scale; ✅ encode **agentic states as variants** (`data-helm-status="streaming"`).

### 3.4 Cross-cutting summary

| | **Customizability** | **Distribution** | **Hard parts done for you** |
|---|---|---|---|
| **Material 3** | Tiered tokens, seed→theme generator; component internals locked | npm per platform (web in maintenance); spec + impl | a11y-by-construction, elevation, motion, adaptive layout |
| **shadcn/ui** | Own the code; CSS-var theme; CVA variants | **Registry + CLI**, namespaced, MCP, `registry:base` | a11y via Radix, variants, **the registry machinery** |
| **Tailwind v4** | `@theme` tokens, graduated override, custom variants | npm build tool; **tokens as CSS vars** | token→utility pipeline, dead-code elim, variant matrix |
| **→ Helm** | **CSS-var token contract + CVA + own-the-code + theme gen** | **shadcn registry (`@helm/*`) + MCP, *versioned*** | **the agentic hard parts, designed + accessible** |

---

## Part 4 · The agentic-UI landscape (the real competitive set)

| Project | Distribution | Runtime coupling | Agent hard parts it solves | Design-system depth |
|---|---|---|---|---|
| **CopilotKit (UI)** | npm (`@copilotkit/react-ui` + `-core`) | **AG-UI** (it's the reference impl) | Deepest runtime: `useRenderTool` + `ToolCallStatus`, `useHumanInTheLoop`/`useInterrupt`, CoAgents shared state | Low — themed via ~8 CSS vars |
| **assistant-ui** | npm primitives + CLI-scaffolded shadcn shell | Adapters (LangGraph, custom) | Headless Radix-style primitives; inline HITL; generative UI registration | Medium — you style primitives |
| **Tambo** | npm (`@tambo-ai/react`) + scaffold | Tambo backend | "Agent picks the component": Zod-typed component registry, streamed props | Low–Medium |
| **prompt-kit / LlamaIndex chat-ui** | shadcn registry / dual npm+registry | LlamaIndex / others | Input + message + streaming; no tool-call/HITL system | Low |

**The two clear reads:**

1. **The shadcn registry is the winning distribution channel** for this category — prompt-kit, LlamaIndex, and the major catalogues all use it. Matching it gives Helm *identical adoption friction to the category leaders*.
2. **No one owns the design-system layer, and no one packages the agent hard parts *as designed, coherent components*.** CopilotKit has the deepest runtime but ships opaque UI; the catalogues have the broadest surface but no system. Helm's **dual-density tool-call** (`ToolFrame` + `ToolLine` keyed to the lifecycle), its **HITL** worked example, and its **`SourceCard` + `Cite`** citation system are differentiated *design* answers to exactly the surfaces everyone else leaves rough. ([CopilotKit useHumanInTheLoop](https://docs.copilotkit.ai/reference/hooks/useHumanInTheLoop))

---

## Part 5 · Recommended architecture for Helm

A four-layer design system on a portable token base, distributed through the shadcn registry, runtime-neutral by construction.

```
┌── Layer 4 · Examples & Layouts ─────────────────────────────┐
│   legal / support / research / coding / canvas + "Where AI   │  registry:block / registry:page
│   sits" taxonomy — reference compositions                    │
├── Layer 3 · Patterns / Blocks ──────────────────────────────┤
│   ApprovalGate (HITL), citation system, research plan,       │  registry:block
│   sub-agent strip — composed, opinionated                    │
├── Layer 2 · Primitives ─────────────────────────────────────┤
│   ToolFrame/ToolLine, Bubble, StatusDot, Caret, Cite,        │  registry:ui / registry:component
│   SourceCard, Composer … (today's kit.tsx) — slot-composable │
├── Layer 1 · Foundations / Tokens ───────────────────────────┤
│   helm-tokens.css: agentic CSS variables (status/thinking/   │  registry:base / registry:style
│   HITL/streaming/role), light+dark, constant-hex accents     │
└─────────────────────────────────────────────────────────────┘
        ╎ wiring snippets (docs, not deps): CopilotKit · AG-UI
```

### 5.1 Layer 1 — Foundations (this is the "design system" the catalogues lack)

- A standalone **`helm-tokens.css`** of agentic CSS custom properties. Extend today's surface/text/border tokens with **agentic semantics**: `--helm-tool-status-running|complete|error`, `--helm-thinking-surface`, `--helm-approval-accent`, `--helm-interrupt`, `--helm-streaming`, plus role colors (`user`/`assistant`/`agent`/`tool`).
- Light/dark via the existing `[data-theme="dark"]`; accent/status as **constant hex** so alpha overlays work in both modes (already Helm's pattern — keep it).
- Ship it as a **`registry:base`** item so a team adopts the *language* before any component, and every component declares `registryDependencies: ["helm-base"]`.
- Provide a **`@theme inline`** Tailwind bridge *and* keep the raw `:root` block, so **non-Tailwind consumers can still use the tokens** (the Tailwind lesson).
- Add a **theme generator** (brand color → full `helm-tokens.css`) — the Material Theme Builder move, the highest-leverage "hard part done for you."
- **Motion tokens live here too, beside color** — durations, easings, springs, and named keyframes as `@theme` tokens (full set in **Part 6**). Color and motion are the two halves of the foundation; a theme without motion isn't a system.

### 5.2 Layer 2 — Primitives

- Today's `kit.tsx` exports *are* the primitive kit (`ToolFrame`, `ToolLine`, `StatusDot`, `Caret`, `Cite`, `SourceCard`, `Bubble`, `Avatar`, `Composer`, …) — agentic-specific and not matched at this granularity elsewhere. They depend only on React + `lucide-react` and use inline styles over CSS variables, which makes them **trivially registry-distributable with no Tailwind requirement**.
- Refactor toward **slot/composition** (`<ToolCall>`, `<ToolCall.Header>`, `<ToolCall.Args>`, `<ToolCall.Status>`) and **CVA-style typed variants**, keyed to the existing `ToolStatus` / `RunState` / `Role` unions. Runtime-neutral props in, no runtime imports.

### 5.3 Layers 3–4 — Patterns and Examples

- Promote the composed surfaces (HITL `ApprovalGate`, citation system, research plan, sub-agent strip) and the five examples to **`registry:block` / `registry:page`** reference implementations, each with `registryDependencies` on primitives + base.
- Keep the **"Where AI sits"** taxonomy and the two-altitude docs as the system's guidelines layer — *this conceptual framework is itself a differentiator* none of the competitors have.

### 5.4 Distribution

- **Primary:** a shadcn-compatible registry. `registry.json` at e.g. `helm.design/r/` (or a public **GitHub registry** to start, zero infra). Install: `npx shadcn@latest add @helm/tool-call`.
- **MCP server day one** — needs only valid `registry.json` + *intent-rich* `description` fields ("use `ToolCall` for collapsible tool invocations; use `ApprovalGate` when the agent is paused on a destructive action") so AI agents install the right thing.
- **Optional thin `helm` CLI** wrapping shadcn (the same pattern other registries use) for brand + presets.
- ⭐ **Beat shadcn on versioning:** add a `version` to each item and a `helm diff` / upgrade flow that surfaces upstream changes and offers to merge non-conflicting hunks. This is the one place to be *better*, not just at parity.

### 5.5 Customizability model

Own-the-code (shadcn) + **the CSS-variable token contract as the stable public API** (Tailwind/Material) + CVA variants + slot composition + the theme generator. Component markup can evolve; as long as it reads `--helm-*`, a consumer's theme survives upgrades.

### 5.6 The hard parts Helm does for developers (the moat)

The *agentic* surfaces, **designed, accessible, themed, and ownable** — which no one packages as a system:

- **Tool calls** — dual-density (`ToolLine` default / `ToolFrame` when it earns the space), keyed to the `inProgress → executing → complete → error` lifecycle.
- **Thinking / reasoning** — collapsible disclosure with live status.
- **Human-in-the-loop** — approval / option / form gates calibrated to stakes, mapped to interrupts.
- **Citations / provenance** — `Cite` + `SourceCard`, claim-to-source traceability.
- **Streaming & shared state** — caret, skeletons, status dots; CoAgent-ready props.
- **Sub-agents / deep research** — plan steps, per-agent status, fan-out.
- **Accessibility** — the system-level contrast/state model Helm must own (these are custom components; there's no Radix to inherit).
- **The wiring** — CopilotKit / AG-UI snippets per component (today's `CodeNote`), kept as **docs, not dependencies**, so Helm stays runtime-neutral while being CopilotKit-grounded.
- **Liveness / motion** — the choreography that signals an agent is alive and working (streaming cadence, thinking shimmer, tool-status morph, spring auto-scroll), systematized as tokens + components with a reduced-motion policy (**Part 6**) — not re-invented, badly, per app.

---

## Part 6 · Motion & animation — the liveness pillar

> Agentic UIs are **temporal**. A copilot's value is in showing an agent *reasoning, calling tools, and acting over time* — so motion isn't decoration, it's the primary channel for "the agent is alive and working." Silence reads as *frozen / broken*; the right motion reads as *alive / trustworthy*. Motion is therefore a **first-class pillar** of Helm — it lives in the foundation (tokens) and is expressed in every primitive — not a finishing coat of paint.

### 6.1 The slot is open — Material has the rigor, the agentic tools have the pieces

| | Motion **system** (tokens, principles, personality, a11y) | Agentic motion **moments** (streaming, thinking, tool-calls…) |
|---|---|---|
| **Material 3 / M3 Expressive** | ✅ best-in-class — spring physics (spatial vs effects), `MotionScheme`, duration/easing tokens | ❌ not an agentic system |
| **Agentic chat / AI tools** | ❌ one-off effects, no tokens/principles | ✅ the best pieces exist in the wild — smooth-streamed text, shimmer, animated persona, spring auto-scroll |
| **CopilotKit / Cursor / Linear** | ❌ delegated to you | ⚠️ functional, motion-light |
| **→ Helm** | **Material's rigor…** | **…applied to the agentic moments** |

No one has applied design-system motion *rigor* to the *agentic moments*. That's Helm's motion thesis: **systematize liveness** — and it reinforces the whole positioning (a *system*, not a catalogue).

### 6.2 The agentic motion catalog — what Helm systematizes (ranked by liveness impact)

| # | Moment | What it communicates | Tier |
|---|---|---|---|
| 1 | **Streaming text** — caret + smooth cadence | "generating now" — highest-frequency moment; bursty tokens are jarring | CSS + buffer |
| 2 | **Thinking / reasoning** — shimmer + collapsible | "doing cognitive work" — required now that reasoning models are default | CSS |
| 3 | **Auto-scroll** — spring stick-to-bottom | follows the stream without fighting the user (the #1 streaming-UX bug) | JS |
| 4 | **Tool-call lifecycle** — status morph, expand | "taking an action" — `inProgress→executing→complete→error`, spinner→check | CSS/SVG |
| 5 | **Status indicators** — pulse dot / "working…" | bridges every silent gap; cheap, high-trust | CSS |
| 6 | **Skeletons** — shimmer in the pre-token gap | "something's coming" — ~40% lower *perceived* wait vs a spinner | CSS |
| 7 | **Plan / research progression** — steps tick through | a *map* for long runs; sub-agent fan-out; HITL pause state | CSS+JS |
| 8 | **Generative-UI arrival** — node fade-in + diffing | components materialize live without chaos (morphdom + ~0.3s fade) | JS |
| 9 | **Voice orb / waveform** — audio-reactive | the liveness signal when there's no text | WebGL |
| 10 | **Persona / avatar** — state-machine presence | a distinct entity, "alive" even when idle | Rive |

Moments **1–6 cover the vast majority of interactions and are mostly CSS**; 7–10 are higher-fidelity and opt-in.

### 6.3 Helm's motion architecture

**(a) Motion tokens live in Layer 1, next to color.** Promote what Helm already ships (`ck-pulse`, `ck-blink`, `ck-shimmer`, `ck-fade-up`) into a named scale, as Tailwind v4 `@theme` + raw CSS vars so they're usable from utilities, custom CSS, *and* Motion's JS API:

```css
@theme {
  /* duration */
  --helm-dur-instant: 80ms;  --helm-dur-fast: 150ms;
  --helm-dur-base: 250ms;    --helm-dur-slow: 400ms;
  /* easing (M3 emphasized) */
  --helm-ease-enter: cubic-bezier(0.05, 0.7, 0.1, 1);
  --helm-ease-exit:  cubic-bezier(0.3, 0, 0.8, 0.15);
  --helm-ease-std:   cubic-bezier(0.2, 0, 0, 1);
  /* spring — spatial overshoots, effects critically-damped (the M3 split) */
  --helm-spring-snap:   /* stiffness 520, damping 32 */;
  --helm-spring-base:   /* stiffness 400, damping 36 */;
  --helm-spring-effect: /* stiffness 1600, damping ratio 1.0 — no bounce */;
  /* named keyframes → utilities */
  --animate-stream-in:    stream-in 180ms var(--helm-ease-enter) both;
  --animate-tool-call-in: tool-call-in 220ms var(--helm-ease-enter) both;
  --animate-thinking:     thinking 1.4s var(--helm-ease-std) infinite;
}
```

**(b) Two motion personalities** (`MotionScheme`, the Material lesson). Agentic UIs straddle *productive* and *expressive*:
- **`helm-productive`** — tight springs, 150–250ms, minimal bounce → tool cards, progress, tables, logs.
- **`helm-expressive`** — floaty springs, 250–400ms, subtle overshoot → persona, onboarding, generative-UI reveals.

Set once at the provider; every component inherits — so a data-dense ops copilot and a consumer assistant can share components but feel different.

**(c) Three implementation tiers — use the lightest sufficient.** This keeps Helm's *core* free of any animation-library dependency (consistent with its no-Tailwind-required, runtime-neutral ethos); heavier tiers are **opt-in registry items**:

| Tier | Tech | Covers | Dependency |
|---|---|---|---|
| **1 · CSS only** (~70%) | Tailwind `@theme` keyframes + **`tw-animate-css`** | caret, shimmer, pulse, fade-in, accordion height, status transitions | none |
| **2 · Motion** | `motion/react` (formerly Framer Motion, v12) | message enter/exit (`AnimatePresence`), list reorder (`layout`/FLIP), spring **stick-to-bottom**, stagger, spinner→check | opt-in |
| **3 · Rive / WebGL** | Rive state machines / shader | `Persona` (idle/listening/thinking/speaking) + audio-reactive **voice orb** | opt-in |

Principle: **CSS by default, escalate only when the moment needs it.** Keeping the core primitives Tier-1 means Helm ships no hard animation dependency — Motion and Rive arrive only if you install those items.

**(d) Accessibility — non-negotiable, two-tier.** Helm already ships a `prefers-reduced-motion` block; formalize it as policy:
- **Decorative** motion (entrance slides, stagger, parallax) → **cut** under `reduce`; snap to final state.
- **Essential status signals** (thinking pulse, streaming indicator) → **simplify, don't remove** — an oscillating scale becomes a plain opacity blink so the *signal survives*.
- **WCAG 2.2.2** — a looping thinking/streaming animation must **stop when the agent finishes**: tie the animation lifecycle to `RunState` (idle → drop the class), never `infinite` with no off-switch.

**(e) Performance — agentic UIs are uniquely main-thread-contended** (token streaming + JSON parsing + React reconciliation all compete with animation):
- Animate **only `transform` + `opacity`**; never `height`/`width`/`top`. Expand tool-call cards via `scaleY` from `transform-origin: top`, not animated `height`.
- **Never animate CSS custom properties through keyframes** — it forces a style recalc across every element that inherits them (brutal in a transcript of hundreds of rows).
- `will-change` only while actively animating (the streaming row, the thinking dot); drop it on idle.

### 6.4 Helm already practices this — it just isn't named yet

Today's gallery ships `ck-pulse` (status), `ck-blink` (the `Caret`), `ck-shimmer` (the `Skeleton`), `ck-fade-up` (staggered hero entrance), a `prefers-reduced-motion` block, plus chevron/hover/progress transitions and a spinner — and the voice-mode story already specifies distinct idle/listening/thinking/speaking orb states. So Helm *practices* motion; the pillar's job is to **(1)** promote these into named tokens, **(2)** add the missing moments (smooth-streamed text, thinking shimmer, spring auto-scroll, tool-status morph, plan progression, persona/orb), and **(3)** publish the personality + reduced-motion + performance policy as part of the spec.

---

## Part 7 · What Helm already has (and what to build)

**Already in place — extractable today:**

- ✅ `kit.tsx` — a coherent agentic primitive library (React + lucide-react only; inline-style/CSS-var based → no Tailwind dependency).
- ✅ The two-tier theming contract (semantic CSS vars + `[data-theme]` + constant-hex accents).
- ✅ **Working motion primitives** — `ck-pulse` / `ck-blink` / `ck-shimmer` / `ck-fade-up` + a `prefers-reduced-motion` block — the seed for the motion-token layer (Part 6).
- ✅ The **dual-density tool-call** pattern — the clearest design contribution in the category.
- ✅ 30 worked stories + 5 composed examples, each paired with verified CopilotKit wiring (`CodeNote`).
- ✅ The taxonomy + glossary + two-altitude spec corpus — the guidelines layer.
- ✅ MIT, individually credited — the positioning is already legally true.

**To build (in order):**

1. `helm-tokens.css` — **color + motion** tokens — plus the agentic vocabulary (Layer 1), shipped as a `registry:base` item.
2. `registry.json` + per-item JSON (no component code needs to change to become a registry).
3. Refactor 2–3 flagship primitives (`ToolCall`, `ApprovalGate`, citation set) to slot + CVA, with intent-rich registry descriptions.
4. Promote the **Tier-1 CSS motion** (caret · shimmer · pulse · `stream-in` · tool-status morph) to tokens, and ship the two-tier reduced-motion policy.
5. MCP support + a public GitHub registry to start.
6. The theme generator and the `helm diff` versioning story.
7. A second runtime wiring guide (assistant-ui or LangGraph) to *prove* neutrality; optionally the Tier-2 (`motion/react`) and Tier-3 (Rive `Persona` / voice-orb) motion items.

---

## Part 8 · Open decisions to confirm

1. **Build now, or keep deciding?** This doc is a decision artifact; it builds nothing. Say the word to scaffold Layer 1 + the registry.
2. **Name** — keep "Helm" (and differentiate from the K8s tool) or choose a distinct mark before any public push?
3. **Registry host** — start on a **GitHub registry** (zero infra) or stand up `helm.design/r/` immediately?
4. **Endorsement** — do you want to pursue CopilotKit *featuring* Helm (ecosystem listing) as an explicit goal, and should the docs lead CopilotKit-first or runtime-neutral-first?
5. **Versioning ambition** — ship the shadcn model as-is first, or invest early in the `version` + upgrade flow that differentiates Helm?
6. **Motion ambition** — **Tier-1 CSS motion only** for v1 (no animation-library dependency), or include the **Motion (`motion/react`)** tier and a **Rive `Persona` / voice-orb** from the start? How far toward *alive* (persona/voice) vs. *legible* (streaming/thinking/tool-status) for the first release?

---

## Sources

**Reference systems**
- Material 3 design tokens & color system — https://m3.material.io/foundations/design-tokens · https://m3.material.io/styles/color/system/how-the-system-works
- `@material/web` maintenance mode — https://github.com/material-components/material-web/discussions/5642
- shadcn/ui registry, CLI, theming, MCP — https://ui.shadcn.com/docs/registry · https://ui.shadcn.com/docs/cli · https://ui.shadcn.com/docs/theming · https://ui.shadcn.com/docs/registry/mcp
- shadcn changelog (Tailwind v4, CLI 3.0/v4, Radix unification, GitHub registries) — https://ui.shadcn.com/docs/changelog
- shadcn versioning gap — https://github.com/shadcn-ui/ui/discussions/9949
- Tailwind v4 announcement & `@theme` — https://tailwindcss.com/blog/tailwindcss-v4 · https://tailwindcss.com/docs/theme
- Catalyst / Headless UI / Tailwind Plus — https://catalyst.tailwindui.com/docs · https://headlessui.com · https://tailwindcss.com/plus

**Agentic landscape**
- CopilotKit UI & hooks — https://www.npmjs.com/package/@copilotkit/react-ui · https://docs.copilotkit.ai/reference/hooks/useHumanInTheLoop
- assistant-ui — https://github.com/assistant-ui/assistant-ui · https://www.assistant-ui.com/docs
- Tambo — https://github.com/tambo-ai/tambo · https://docs.tambo.co
- prompt-kit — https://github.com/ibelick/prompt-kit · https://www.prompt-kit.com/docs/introduction
- LlamaIndex chat-ui — https://github.com/run-llama/chat-ui
- shadcn ↔ Vercel (positioning precedent) — https://vercel.com/academy/shadcn-ui

**Motion & animation**
- Material 3 / M3 Expressive motion (spring physics, `MotionScheme`, tokens) — https://m3.material.io/styles/motion/overview/how-it-works · https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
- Motion (formerly Framer Motion, v12) — https://motion.dev/docs/react · https://motion.dev/docs/react-upgrade-guide
- `tw-animate-css` (the `tailwindcss-animate` successor) — https://github.com/Wombosvideo/tw-animate-css
- Tailwind v4 animation + `@theme` — https://tailwindcss.com/docs/animation
- Radix animation (data-state driven) — https://www.radix-ui.com/primitives/docs/guides/animation
- View Transitions API + React `<ViewTransition>` — https://developer.chrome.com/blog/view-transitions-in-2025 · https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more
- Rive vs Lottie (persona / orb) — https://rive.app/blog/rive-as-a-lottie-alternative
- assistant-ui streaming / reasoning / tools — https://www.assistant-ui.com/docs/guides/tools
- `use-stick-to-bottom` (spring auto-scroll) — https://github.com/stackblitz-labs/use-stick-to-bottom
- Motion a11y & performance — https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html · https://web.dev/articles/animations-and-performance

> Full per-system research dossiers (Material, shadcn, Tailwind, the agentic landscape, **and motion**) were produced during this pass and can be expanded into appendices on request.
