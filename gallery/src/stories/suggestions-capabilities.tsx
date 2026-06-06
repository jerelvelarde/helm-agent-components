import { useState } from "react";
import { ChevronDown, RotateCcw, Sparkles, X } from "lucide-react";
import {
  Avatar,
  Bubble,
  CodeNote,
  Composer,
  Note,
  SectionLabel,
  Showcase,
  Skeleton,
  Tag,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "suggestions-capabilities",
  title: "Suggestions & Capability Surfacing",
  category: "Conversation management",
  blurb:
    "Surfacing what the agent can do — prompt starters, suggestion chips, slash-command palette, empty states.",
  copilotkit: "useConfigureSuggestions",
  spec: "components/suggestions-capabilities.md",
};

// ── shared data ──────────────────────────────────────────────────────────────

const CAPABILITY_CARDS = [
  { icon: "✍️", title: "Draft & edit", desc: "Write, rewrite, or improve any document." },
  { icon: "🔍", title: "Summarize", desc: "Condense long content into key points." },
  { icon: "📊", title: "Analyse data", desc: "Spot trends and surface insights." },
];

const STARTERS = [
  "Summarize the key risks in this contract",
  "Draft an executive summary",
  "Find gaps in the proposal",
  "Suggest next steps",
];

const FOLLOW_UPS = ["See the full analysis", "Export as PDF", "Revise tone"];

const PALETTE_ITEMS = [
  { group: "Tools", name: "/summarize", desc: "Summarize the active document" },
  { group: "Tools", name: "/suggest", desc: "Suggest next steps" },
  { group: "Prompts", name: "/review", desc: "Run a quality review" },
  { group: "Prompts", name: "/draft", desc: "Draft from outline" },
];

// ── sub-components ────────────────────────────────────────────────────────────

function CapabilityCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 130,
        border: `1px solid ${tok.grey300}`,
        borderRadius: 10,
        padding: "12px 14px",
        background: tok.grey200,
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: tok.textPrimary, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 12, color: tok.textSecondary, lineHeight: "17px" }}>{desc}</div>
    </div>
  );
}

function Chip({
  label,
  onDismiss,
  disabled,
}: {
  label: string;
  onDismiss?: () => void;
  disabled?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: 5,
        padding: "5px 11px",
        borderRadius: 9999,
        border: `1px solid ${disabled ? tok.grey300 : tok.border}`,
        background: disabled ? tok.grey200 : tok.container,
        fontSize: 12.5,
        color: disabled ? tok.textDisabled : tok.textPrimary,
        cursor: disabled ? "default" : "pointer",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
      {onDismiss && (
        <button
          aria-label={`Dismiss "${label}"`}
          onClick={onDismiss}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: tok.textDisabled,
            display: "inline-flex",
            alignItems: "center",
            padding: 0,
          }}
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}

// ── wiring snippet ────────────────────────────────────────────────────────────

const wiring = `import {
  useConfigureSuggestions,
  useCopilotReadable,
} from "@copilotkit/react-core/v2";
import { CopilotSidebar } from "@copilotkit/react-ui";

function DocumentCopilot({ documentTitle }: { documentTitle: string }) {
  // Make the current document visible to the agent so suggestions stay grounded.
  useCopilotReadable({
    description: "The document currently open in the editor",
    value: documentTitle,
  });

  // Generate context-aware chips.
  // available: "before-first-message" → zero-state starters only
  //            "after-first-message"  → follow-up chips only
  //            "always"               → both surfaces
  useConfigureSuggestions({
    instructions: \`Suggest 3 specific, action-oriented next steps for
      working on "\${documentTitle}". Focus on tasks the agent can actually
      perform: summarizing, editing, finding references, creating outlines.\`,
    minSuggestions: 2,
    maxSuggestions: 4,
    available: "always",
  });

  return (
    <CopilotSidebar
      defaultOpen
      labels={{
        title: "Document Assistant",
        initial: \`I can help you work on "\${documentTitle}".\`,
      }}
    />
  );
}

// v1 equivalent:
// useCopilotChatSuggestions({ instructions, minSuggestions, maxSuggestions })`;

// ── story ─────────────────────────────────────────────────────────────────────

export default function Story() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [paletteQuery, setPaletteQuery] = useState("/sum");

  const visibleFollowUps = FOLLOW_UPS.filter((l) => !dismissed.has(l));
  const filteredItems = PALETTE_ITEMS.filter((item) =>
    item.name.includes(paletteQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(paletteQuery.slice(1).toLowerCase())
  );
  const groups = Array.from(new Set(filteredItems.map((i) => i.group)));

  return (
    <Showcase>
      {/* ── 1. Zero / empty state ────────────────────────────────────────────── */}
      <Variant
        label="zero state"
        hint="new thread — greeting, capability cards, and starter chips visible"
      >
        <div className="flex flex-col" style={{ gap: 18 }}>
          {/* Greeting */}
          <div className="flex items-center" style={{ gap: 10 }}>
            <Avatar role="agent" size={30} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: tok.textPrimary }}>
                Document Assistant
              </div>
              <div style={{ fontSize: 12.5, color: tok.textSecondary, marginTop: 1 }}>
                I can see documents in this project — not external web pages.
              </div>
            </div>
          </div>

          {/* Capability cards */}
          <div className="flex" style={{ gap: 10, flexWrap: "wrap" }}>
            {CAPABILITY_CARDS.map((c) => (
              <CapabilityCard key={c.title} {...c} />
            ))}
          </div>

          {/* Starter chips */}
          <div>
            <SectionLabel>Suggested prompts</SectionLabel>
            <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
              {STARTERS.map((s) => (
                <Chip key={s} label={s} />
              ))}
              <span
                className="inline-flex items-center"
                style={{ gap: 3, fontSize: 12, color: tok.indigo, cursor: "pointer" }}
              >
                See more <ChevronDown size={13} />
              </span>
            </div>
          </div>

          <Composer placeholder="Ask anything about your document…" />
        </div>
      </Variant>

      {/* ── 2. Loading suggestions (skeleton chips) ──────────────────────────── */}
      <Variant
        label="loading suggestions"
        hint="dynamic generation in progress — input stays enabled"
      >
        <div className="flex flex-col" style={{ gap: 14 }}>
          <Bubble role="assistant">
            I've finished analysing the contract. Here are some things you might want to explore:
          </Bubble>
          <div className="flex items-center" style={{ gap: 8, flexWrap: "wrap" }}>
            <Skeleton w={160} h={30} style={{ borderRadius: 9999 }} />
            <Skeleton w={130} h={30} style={{ borderRadius: 9999 }} />
            <Skeleton w={150} h={30} style={{ borderRadius: 9999 }} />
          </div>
          <Composer placeholder="Message the agent…" />
        </div>
      </Variant>

      {/* ── 3. Suggestions ready — follow-up chips ───────────────────────────── */}
      <Variant
        label="suggestions ready"
        hint="follow-up chips after an assistant turn — dismiss with ×"
      >
        <div className="flex flex-col" style={{ gap: 14 }}>
          <Bubble role="assistant">
            The contract contains three medium-risk clauses in sections 4.2 and 7. I'd recommend
            reviewing the indemnity language before signing.
          </Bubble>

          {visibleFollowUps.length > 0 ? (
            <div
              className="flex items-center"
              style={{ gap: 8, flexWrap: "wrap", paddingLeft: 36 }}
            >
              {visibleFollowUps.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  onDismiss={() => setDismissed((prev) => new Set([...prev, label]))}
                />
              ))}
            </div>
          ) : (
            <div
              className="flex items-center"
              style={{ gap: 6, paddingLeft: 36 }}
            >
              <span style={{ fontSize: 12, color: tok.textDisabled }}>Chips dismissed</span>
              <button
                onClick={() => setDismissed(new Set())}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: tok.indigo,
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <RotateCcw size={11} /> Reset
              </button>
            </div>
          )}

          <Composer placeholder="Message the agent…" />
        </div>
      </Variant>

      {/* ── 4. Slash-command palette (typeahead active) ──────────────────────── */}
      <Variant
        label="palette typeahead"
        hint='user typed "/sum" — items filter in real time'
      >
        <div className="flex flex-col" style={{ gap: 0 }}>
          {/* Fake composer with open palette above it */}
          <div
            style={{
              border: `1px solid ${tok.grey300}`,
              borderRadius: 10,
              background: tok.container,
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              marginBottom: 4,
            }}
          >
            {/* Palette list */}
            <div style={{ padding: "10px 0" }}>
              {groups.length === 0 ? (
                <div style={{ padding: "8px 14px", fontSize: 13, color: tok.textDisabled }}>
                  No matching commands.
                </div>
              ) : (
                groups.map((group, gi) => (
                  <div key={group}>
                    {gi > 0 && (
                      <div style={{ height: 1, background: tok.grey300, margin: "6px 0" }} />
                    )}
                    <div
                      style={{
                        padding: "2px 14px 4px",
                        fontSize: 10,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: tok.textDisabled,
                      }}
                    >
                      {group}
                    </div>
                    {filteredItems
                      .filter((item) => item.group === group)
                      .map((item, idx) => (
                        <div
                          key={item.name}
                          className="flex items-center"
                          style={{
                            gap: 10,
                            padding: "7px 14px",
                            background: idx === 0 && gi === 0 ? tok.grey200 : "transparent",
                            cursor: "pointer",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: tok.mono,
                              fontSize: 12.5,
                              color: tok.indigo,
                              minWidth: 90,
                            }}
                          >
                            {item.name}
                          </span>
                          <span style={{ fontSize: 12.5, color: tok.textSecondary }}>
                            {item.desc}
                          </span>
                        </div>
                      ))}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mock input showing the query */}
          <div
            style={{
              border: `1px solid ${tok.indigo}`,
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 14,
              color: tok.textPrimary,
              background: tok.container,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Sparkles size={15} color={tok.indigo} />
            <span style={{ fontFamily: tok.mono, fontSize: 14 }}>{paletteQuery}</span>
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 16,
                background: tok.textPrimary,
                borderRadius: 1,
                marginLeft: 1,
                animation: "ck-blink 1s step-start infinite",
              }}
            />
            <span style={{ flex: 1 }} />
            <Tag mono>↑↓ navigate · Enter select · Esc close</Tag>
          </div>
        </div>

        <Note>
          The palette uses the combobox ARIA pattern: the input carries{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>role="combobox"</code> and{" "}
          <code style={{ fontFamily: tok.mono, fontSize: 12 }}>aria-activedescendant</code>; DOM
          focus stays on the input while arrow keys move the highlighted option.
        </Note>
      </Variant>

      {/* ── 5. Disabled during streaming ─────────────────────────────────────── */}
      <Variant
        label="streaming — chips disabled"
        hint="agent is responding; chips are suppressed to prevent double-sends"
      >
        <div className="flex flex-col" style={{ gap: 14 }}>
          <Bubble role="user">Summarise the indemnity clause in section 7.</Bubble>
          <Bubble role="assistant">
            Section 7 limits liability to direct damages and caps total exposure at the contract
            value. The indemnity covers third-party IP claims but excludes gross negligence…
          </Bubble>

          <div className="flex items-center" style={{ gap: 8, paddingLeft: 36 }}>
            {FOLLOW_UPS.map((label) => (
              <Chip key={label} label={label} disabled />
            ))}
          </div>

          <Composer placeholder="Message the agent…" streaming />
        </div>
      </Variant>

      <Note>
        Render static starters instantly (no round-trip). Use skeleton chips only for
        dynamically generated follow-ups. Cap follow-up chips at 2–4 and always allow dismissal
        — more than four shifts cognitive load back to the user.
      </Note>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
