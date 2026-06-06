import { useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import {
  Bubble,
  Btn,
  CodeNote,
  Composer,
  Note,
  Showcase,
  StatusDot,
  Tag,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "tabs",
  title: "Tabs / Mode Switching",
  category: "Layouts",
  blurb: "Mode switching across agent surfaces/workspaces within one view.",
  copilotkit: "CopilotChatView",
  spec: "layouts/tabs.md",
};

type Mode = "ask" | "edit" | "agent";
type ModelOption = "auto" | "fast" | "thinking";

const MODES: { id: Mode; label: string; caption: string }[] = [
  { id: "ask", label: "Ask", caption: "Read-only answers" },
  { id: "edit", label: "Edit", caption: "Apply inline edits" },
  { id: "agent", label: "Agent", caption: "Autonomous + commands" },
];

function TabBar({
  active,
  onChange,
  disabledIds = [],
}: {
  active: Mode;
  onChange?: (m: Mode) => void;
  disabledIds?: Mode[];
}) {
  return (
    <div
      role="tablist"
      aria-label="Agent mode"
      className="flex items-center"
      style={{
        gap: 2,
        background: tok.bg,
        borderRadius: 10,
        padding: 3,
        width: "fit-content",
      }}
    >
      {MODES.map(({ id, label }) => {
        const isActive = id === active;
        const isDisabled = disabledIds.includes(id);
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={isDisabled}
            onClick={() => !isDisabled && onChange?.(id)}
            style={{
              padding: "5px 14px",
              borderRadius: 8,
              border: "none",
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              cursor: isDisabled ? "default" : "pointer",
              background: isActive ? tok.container : "transparent",
              color: isDisabled
                ? tok.textDisabled
                : isActive
                ? tok.textPrimary
                : tok.textSecondary,
              boxShadow: isActive ? `0 1px 3px rgba(0,0,0,0.08)` : "none",
              transition: "background 0.12s, color 0.12s",
              opacity: isDisabled ? 0.55 : 1,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function ModeBadge({ mode }: { mode: Mode }) {
  const colors: Record<Mode, string> = {
    ask: tok.teal,
    edit: tok.indigo,
    agent: tok.violet,
  };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 9999,
        background: colors[mode] + "18",
        color: colors[mode],
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {mode}
    </span>
  );
}

const TOOL_VISIBILITY: Record<Mode, string[]> = {
  ask: [],
  edit: ["apply_edit"],
  agent: ["apply_edit", "run_command", "read_file"],
};

function CapabilityRow({ tools }: { tools: string[] }) {
  return (
    <div className="flex items-center" style={{ gap: 6, flexWrap: "wrap" }}>
      {["apply_edit", "run_command", "read_file"].map((t) => {
        const enabled = tools.includes(t);
        return (
          <span
            key={t}
            style={{
              fontFamily: tok.mono,
              fontSize: 11.5,
              padding: "3px 10px",
              borderRadius: 6,
              background: enabled ? tok.indigo + "12" : tok.bg,
              color: enabled ? tok.indigo : tok.textDisabled,
              border: `1px solid ${enabled ? tok.indigo + "30" : tok.border}`,
              opacity: enabled ? 1 : 0.6,
            }}
          >
            {t}
          </span>
        );
      })}
    </div>
  );
}

const wiring = `import { useFrontendTool } from "@copilotkit/react-core/v2";
import { useCopilotReadable } from "@copilotkit/react-core";
import { z } from "zod";
import { useState } from "react";

type Mode = "ask" | "edit" | "agent";

function AgentModeWorkspace() {
  const [mode, setMode] = useState<Mode>("ask");

  // Push the active mode into the agent's context
  useCopilotReadable({
    description: "The user's selected operating mode",
    value: mode,
  });

  // Gate tools by mode — only mount when the mode permits writes
  useFrontendTool({
    name: "apply_edit",
    description: "Apply a code edit to the open file",
    parameters: z.object({ patch: z.string() }),
    handler: async ({ patch }) =>
      mode === "ask" ? "read-only — edits disabled" : applyPatch(patch),
  });

  return (
    <div>
      {/* Build the tablist yourself — CopilotKit has no prebuilt switcher */}
      <div role="tablist" aria-label="Agent mode">
        {(["ask", "edit", "agent"] as Mode[]).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m}
            onClick={() => setMode(m)}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Chat surface for the active mode */}
      <div role="tabpanel">
        {/* <CopilotChatView agentId={agentIdForMode[mode]} /> */}
      </div>
    </div>
  );
}
// v1 equivalent: replace useFrontendTool with useCopilotAction`;

export default function Story() {
  const [liveMode, setLiveMode] = useState<Mode>("ask");
  const [modelOption, setModelOption] = useState<ModelOption>("auto");

  return (
    <Showcase>
      {/* ── 1. Default / idle ── */}
      <Variant label="default mode selected" hint="Ask is active on initial render">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <TabBar active="ask" />
          <p style={{ fontSize: 13, color: tok.textSecondary, margin: 0 }}>
            {MODES.find((m) => m.id === "ask")?.caption} · no file writes permitted
          </p>
          <div className="flex flex-col" style={{ gap: 10 }}>
            <Bubble role="user">Explain how useFrontendTool scopes tool visibility per mode.</Bubble>
            <Bubble role="assistant">
              Each mode conditionally mounts <code style={{ fontFamily: tok.mono, fontSize: 13 }}>useFrontendTool</code>.
              In Ask, write-capable hooks are simply not registered — the agent cannot call them.
            </Bubble>
          </div>
          <Composer placeholder="Ask anything (read-only mode)…" />
        </div>
      </Variant>

      {/* ── 2. Interactive mode switch ── */}
      <Variant label="switching" hint="click tabs to switch — badge and tool list update">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div className="flex items-center" style={{ gap: 10, flexWrap: "wrap" }}>
            <TabBar active={liveMode} onChange={setLiveMode} />
            <ModeBadge mode={liveMode} />
          </div>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: tok.bg,
              fontSize: 13,
              color: tok.textSecondary,
            }}
          >
            <span style={{ fontWeight: 500 }}>{MODES.find((m) => m.id === liveMode)?.caption}</span>
            {" — "}active tools:
          </div>
          <CapabilityRow tools={TOOL_VISIBILITY[liveMode]} />
          <Composer
            placeholder={
              liveMode === "ask"
                ? "Ask anything…"
                : liveMode === "edit"
                ? "Describe the edit to apply…"
                : "Tell the agent what to do…"
            }
          />
          <Note>Switching updates the mode badge, composer hint, and gated tool set instantly.</Note>
        </div>
      </Variant>

      {/* ── 3. Active mode with capability gating ── */}
      <Variant label="active mode — agent" hint="full tool set visible; mode badge persistent">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <TabBar active="agent" />
            <StatusDot state="running" label="Running" />
          </div>
          <div className="flex flex-col" style={{ gap: 10 }}>
            <Bubble role="user">Refactor the auth module and run the test suite.</Bubble>
            <Bubble role="assistant">
              Starting with a read of the auth module, then I'll apply the refactor and run{" "}
              <code style={{ fontFamily: tok.mono, fontSize: 13 }}>npm test</code>.
            </Bubble>
          </div>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${tok.border}`,
              background: tok.container,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 500, color: tok.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Capability-gated tools
            </div>
            <CapabilityRow tools={TOOL_VISIBILITY["agent"]} />
          </div>
          <Composer streaming />
        </div>
      </Variant>

      {/* ── 4. Disabled / locked mode ── */}
      <Variant label="disabled mode" hint="Agent tab locked — plan required">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <TabBar active="ask" disabledIds={["agent"]} />
          <div
            className="flex items-center"
            style={{
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              background: tok.warning + "10",
              border: `1px solid ${tok.warning}30`,
            }}
          >
            <span style={{ fontSize: 20 }}>🔒</span>
            <span style={{ fontSize: 13, color: tok.warning }}>
              <strong>Agent mode</strong> requires an active workspace plan.
            </span>
            <Btn variant="ghost">Upgrade</Btn>
          </div>
          <Note>
            Use <code style={{ fontFamily: tok.mono }}>aria-disabled="true"</code> (not{" "}
            <code style={{ fontFamily: tok.mono }}>disabled</code>) so locked tabs stay reachable and their
            tooltips are accessible.
          </Note>
        </div>
      </Variant>

      {/* ── 5. Auto / model picker ── */}
      <Variant label="model / effort picker" hint="Auto delegates depth to the router per turn">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <TabBar active="ask" />
          <div className="flex items-center" style={{ gap: 8 }}>
            <span style={{ fontSize: 13, color: tok.textSecondary }}>Model:</span>
            {(["auto", "fast", "thinking"] as ModelOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setModelOption(opt)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 9999,
                  border: `1px solid ${modelOption === opt ? tok.indigo : tok.border}`,
                  background: modelOption === opt ? tok.indigo + "14" : tok.container,
                  color: modelOption === opt ? tok.indigo : tok.textSecondary,
                  fontSize: 12,
                  fontWeight: modelOption === opt ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {opt === "auto" ? (
                  <span className="inline-flex items-center" style={{ gap: 4 }}>
                    <Sparkles size={12} /> Auto
                  </span>
                ) : opt === "thinking" ? (
                  <span className="inline-flex items-center" style={{ gap: 4 }}>
                    <ChevronDown size={12} /> Thinking
                  </span>
                ) : (
                  "Fast"
                )}
              </button>
            ))}
            {modelOption === "auto" && (
              <Tag>routes per turn</Tag>
            )}
          </div>
          <Composer placeholder="Auto selects the right depth for each question…" />
          <Note>
            The model picker is orthogonal to mode tabs — keep it in the composer footer so it's co-located but
            not confused with behavior-mode switching.
          </Note>
        </div>
      </Variant>

      {/* ── 6. Mid-run switch warning ── */}
      <Variant label="mid-run switch warning" hint="user tries to change mode while agent is streaming">
        <div className="flex flex-col" style={{ gap: 12 }}>
          <div className="flex items-center" style={{ gap: 10 }}>
            <TabBar active="agent" />
            <StatusDot state="running" label="Running" />
          </div>
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              background: tok.warning + "0f",
              border: `1px solid ${tok.warning}40`,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: tok.warning, margin: "0 0 6px" }}>
              Switch to Ask mode?
            </p>
            <p style={{ fontSize: 13, color: tok.textSecondary, margin: "0 0 12px" }}>
              The agent is mid-run. Switching now will cancel the current execution.
            </p>
            <div className="flex items-center" style={{ gap: 8 }}>
              <Btn variant="danger">Cancel run &amp; switch</Btn>
              <Btn variant="ghost">Stay in Agent</Btn>
            </div>
          </div>
          <Note>
            Never silently discard in-flight work. Present a confirmation; let the user decide whether to cancel
            or queue the mode change.
          </Note>
        </div>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
