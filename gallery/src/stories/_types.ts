import type { ComponentType } from "react";

/** Sidebar grouping order — mirrors the design-system taxonomy in ../../README.md */
export const CATEGORY_ORDER = [
  "Conversational core",
  "Agent transparency",
  "Generative UI",
  "Human control",
  "Conversation management",
  "Multi-agent & research",
  "Multimodal",
  "Layouts",
  "Examples",
] as const;

export type Category = (typeof CATEGORY_ORDER)[number];

/** Every story file in ./stories exports a `meta` of this shape + a default component. */
export interface StoryMeta {
  /** kebab-case id; matches the spec filename */
  slug: string;
  /** display title */
  title: string;
  /** sidebar grouping */
  category: Category;
  /** one-line essence (also shown under the nav item) */
  blurb: string;
  /** the CopilotKit primitive(s) this maps to, e.g. "useRenderTool · ToolCallStatus" */
  copilotkit: string;
  /** repo-relative path to the spec markdown, e.g. "components/tool-call.md" */
  spec: string;
}

export interface StoryModule {
  meta: StoryMeta;
  default: ComponentType;
}
