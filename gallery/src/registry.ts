import { CATEGORY_ORDER, type Category, type StoryModule } from "./stories/_types";

export const REPO_URL = "https://github.com/jerelvelarde/helm-agent-components";
export const REPO_BLOB = `${REPO_URL}/blob/main/`;

export interface Entry {
  meta: StoryModule["meta"];
  Component: StoryModule["default"];
}

// Stories self-register: any ./stories/*.tsx exporting `meta` + a default component appears.
const modules = import.meta.glob<StoryModule>("./stories/*.tsx", { eager: true });

export const entries: Entry[] = Object.values(modules)
  .filter((m): m is StoryModule => Boolean(m && m.meta && m.default))
  .map((m) => ({ meta: m.meta, Component: m.default }))
  .sort((a, b) => {
    const ci =
      CATEGORY_ORDER.indexOf(a.meta.category) - CATEGORY_ORDER.indexOf(b.meta.category);
    return ci !== 0 ? ci : a.meta.title.localeCompare(b.meta.title);
  });

export const groups: { category: Category; items: Entry[] }[] = (
  CATEGORY_ORDER as readonly Category[]
)
  .map((category) => ({ category, items: entries.filter((e) => e.meta.category === category) }))
  .filter((g) => g.items.length > 0);

export function getEntry(slug: string): Entry | undefined {
  return entries.find((e) => e.meta.slug === slug);
}

export function matchesQuery(e: Entry, q: string): boolean {
  if (!q.trim()) return true;
  const hay = `${e.meta.title} ${e.meta.blurb} ${e.meta.category} ${e.meta.copilotkit}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((t) => hay.includes(t));
}

export const firstComponentSlug =
  entries.find((e) => e.meta.category !== "Layouts")?.meta.slug ?? entries[0]?.meta.slug ?? "";
export const firstLayoutSlug =
  entries.find((e) => e.meta.category === "Layouts")?.meta.slug ?? firstComponentSlug;
export const firstExampleSlug =
  entries.find((e) => e.meta.category === "Examples")?.meta.slug ?? firstComponentSlug;
