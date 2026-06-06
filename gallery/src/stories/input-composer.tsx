import { useState } from "react";
import { Mic, Paperclip, Send, Square, X, ChevronRight, FileText } from "lucide-react";
import { CodeNote, Note, Showcase, StatusDot, Tag, Variant, tok } from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "input-composer",
  title: "Input Box / Composer",
  category: "Conversational core",
  blurb: "The prompt-entry surface — multiline autogrow, send/stop, slash commands, @mentions, attachments.",
  copilotkit: "CopilotChatInput · CopilotTextarea",
  spec: "components/input-composer.md",
};

// ── shared sub-pieces ──────────────────────────────────────────────────────────

function ComposerShell({
  children,
  focused,
  error,
  disabled,
}: {
  children: React.ReactNode;
  focused?: boolean;
  error?: boolean;
  disabled?: boolean;
}) {
  const borderColor = error
    ? tok.error
    : focused
    ? tok.indigo
    : disabled
    ? tok.border
    : tok.border;
  const boxShadow = focused && !error ? `0 0 0 2px rgba(99,102,241,0.18)` : "none";
  return (
    <div
      style={{
        background: disabled ? tok.grey200 : "var(--surface-container)",
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        boxShadow,
        overflow: "hidden",
        transition: "border-color 0.15s, box-shadow 0.15s",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      {children}
    </div>
  );
}

function TextArea({
  value,
  placeholder,
  rows = 1,
  disabled,
}: {
  value?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        padding: "10px 14px",
        minHeight: rows * 22 + 20,
        fontSize: 14,
        lineHeight: "22px",
        color: value ? tok.textPrimary : tok.textDisabled,
        fontFamily: "inherit",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {value || placeholder}
    </div>
  );
}

function ToolbarRow({
  canSend,
  streaming,
  disabled,
}: {
  canSend?: boolean;
  streaming?: boolean;
  disabled?: boolean;
}) {
  const sendActive = canSend && !disabled;
  return (
    <div
      className="flex items-center"
      style={{
        padding: "6px 10px",
        borderTop: `1px solid ${tok.grey300}`,
        gap: 6,
      }}
    >
      <button
        aria-label="Attach file"
        disabled={disabled}
        style={{
          width: 30,
          height: 30,
          border: "none",
          background: "transparent",
          color: disabled ? tok.textDisabled : tok.textSecondary,
          borderRadius: 6,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paperclip size={16} />
      </button>
      <button
        aria-label="Voice input"
        disabled={disabled}
        style={{
          width: 30,
          height: 30,
          border: "none",
          background: "transparent",
          color: disabled ? tok.textDisabled : tok.textSecondary,
          borderRadius: 6,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Mic size={16} />
      </button>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 11, color: tok.textDisabled }}>
        {streaming ? null : "Enter to send · Shift+Enter for newline"}
      </span>
      <button
        aria-label={streaming ? "Stop generation" : "Send message"}
        disabled={!streaming && !sendActive}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: "none",
          background: streaming
            ? tok.error
            : sendActive
            ? tok.textPrimary
            : tok.grey300,
          color: streaming || sendActive ? "var(--surface-container)" : tok.textDisabled,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: !streaming && !sendActive ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
      >
        {streaming ? <Square size={13} /> : <Send size={14} />}
      </button>
    </div>
  );
}

// ── slash command overlay ──────────────────────────────────────────────────────

const SLASH_COMMANDS = [
  { cmd: "/fix", desc: "Fix a bug in selected code" },
  { cmd: "/tests", desc: "Generate unit tests" },
  { cmd: "/explain", desc: "Explain the selection" },
  { cmd: "/docs", desc: "Write documentation" },
];

function SlashMenu({ filter }: { filter: string }) {
  const matches = SLASH_COMMANDS.filter((c) =>
    c.cmd.includes(filter.toLowerCase())
  );
  return (
    <div
      role="listbox"
      aria-label="Slash commands"
      style={{
        background: "var(--surface-container)",
        border: `1px solid ${tok.grey300}`,
        borderRadius: 8,
        boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        overflow: "hidden",
        marginBottom: 6,
      }}
    >
      <div
        style={{
          padding: "5px 10px",
          fontSize: 11,
          color: tok.textDisabled,
          borderBottom: `1px solid ${tok.grey300}`,
          fontFamily: tok.mono,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Commands
      </div>
      {matches.map((item, i) => (
        <div
          key={item.cmd}
          role="option"
          aria-selected={i === 0}
          className="flex items-center"
          style={{
            padding: "7px 10px",
            gap: 10,
            background: i === 0 ? tok.grey200 : "transparent",
            cursor: "pointer",
          }}
        >
          <span style={{ fontFamily: tok.mono, fontSize: 13, color: tok.indigo, minWidth: 72 }}>
            {item.cmd}
          </span>
          <span style={{ fontSize: 13, color: tok.textSecondary }}>{item.desc}</span>
          {i === 0 && <ChevronRight size={13} style={{ marginLeft: "auto", color: tok.textDisabled }} />}
        </div>
      ))}
    </div>
  );
}

// ── attachment chip ────────────────────────────────────────────────────────────

function AttachChip({
  name,
  uploading,
  error,
}: {
  name: string;
  uploading?: boolean;
  error?: boolean;
}) {
  return (
    <div
      className="inline-flex items-center"
      style={{
        gap: 5,
        padding: "3px 8px 3px 6px",
        borderRadius: 6,
        border: `1px solid ${error ? tok.error : uploading ? tok.indigo : tok.grey300}`,
        background: error ? "var(--error-soft)" : uploading ? "var(--indigo-soft)" : tok.grey200,
        fontSize: 12,
        color: error ? tok.error : tok.textPrimary,
        maxWidth: 160,
      }}
    >
      <FileText size={13} color={error ? tok.error : tok.indigo} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name}
      </span>
      {uploading && (
        <StatusDot state="running" />
      )}
      {error && (
        <span style={{ color: tok.error, fontSize: 11, whiteSpace: "nowrap" }}>Too large</span>
      )}
      <button
        aria-label="Remove attachment"
        style={{
          border: "none",
          background: "transparent",
          color: error ? tok.error : tok.textDisabled,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          padding: 0,
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── wiring snippet ─────────────────────────────────────────────────────────────

const wiring = `import { CopilotChat } from "@copilotkit/react-ui";
import { useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

// Built-in composer — RUN_STARTED / RUN_FINISHED drive the
// send↔stop toggle automatically. Labels customize the UX.
<CopilotChat
  instructions="You are a helpful assistant."
  labels={{ placeholder: "Ask anything or type / for commands…" }}
/>

// Headless: build your own composer around sendMessage / isLoading.
// const { sendMessage, isLoading } = useAgent({ agentId: "my-agent" });

// HITL: agent pauses mid-run and waits for user clarification
// rendered inline where the composer normally sits.
useHumanInTheLoop({
  name: "clarify_intent",
  parameters: z.object({ question: z.string() }),
  render: ({ status, args, respond }) =>
    status === "executing" ? (
      <div>
        <p>{args.question}</p>
        <input
          autoFocus
          placeholder="Your answer…"
          onKeyDown={(e) => {
            if (e.key === "Enter")
              respond?.((e.target as HTMLInputElement).value);
          }}
        />
      </div>
    ) : (
      <p>Answered</p>
    ),
});
// v1 equivalent: useCopilotAction({ renderAndWaitForResponse })`;

// ── story ──────────────────────────────────────────────────────────────────────

export default function Story() {
  const [slashFilter, setSlashFilter] = useState("/fi");

  return (
    <Showcase>
      {/* 1. Idle / empty */}
      <Variant label="idle / empty" hint="placeholder shown; send disabled">
        <ComposerShell>
          <TextArea placeholder="Ask anything or type / for commands…" />
          <ToolbarRow canSend={false} />
        </ComposerShell>
        <div style={{ marginTop: 8 }}>
          <Note>Send button is disabled until the draft contains non-whitespace content (canSend = false).</Note>
        </div>
      </Variant>

      {/* 2. Typing / focused */}
      <Variant label="focused + typing" hint="ring highlight; send enabled; char hint in toolbar">
        <ComposerShell focused>
          <TextArea value="How do I wire the send↔stop toggle with useAgent?" />
          <ToolbarRow canSend />
        </ComposerShell>
        <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
          <Tag mono>Enter to send</Tag>
          <Tag mono>Shift+Enter for newline</Tag>
        </div>
      </Variant>

      {/* 3. Slash command overlay */}
      <Variant label="command / mention open" hint="/ triggers typeahead; arrow-key navigable; Esc closes">
        <div style={{ position: "relative" }}>
          <SlashMenu filter={slashFilter} />
          <ComposerShell focused>
            <TextArea value={slashFilter} />
            <ToolbarRow canSend />
          </ComposerShell>
        </div>
        <div style={{ marginTop: 8 }}>
          <Note>Overlay is role=listbox with aria-activedescendant; Escape closes and returns focus to textarea.</Note>
        </div>
      </Variant>

      {/* 4. Attaching — chips + error */}
      <Variant label="attaching" hint="chips above textarea; upload-in-progress + oversized-file error">
        <ComposerShell focused>
          <div className="flex" style={{ gap: 6, padding: "8px 12px 0", flexWrap: "wrap" }}>
            <AttachChip name="design-brief.pdf" />
            <AttachChip name="mockup-v3.fig" uploading />
            <AttachChip name="export-24mb.png" error />
          </div>
          <TextArea value="Summarise these docs and flag discrepancies." />
          <ToolbarRow canSend />
        </ComposerShell>
        <div style={{ marginTop: 8 }}>
          <Note>Client-side validation fires before upload; the oversized chip shows an inline error rather than a toast.</Note>
        </div>
      </Variant>

      {/* 5. Running / streaming — stop button */}
      <Variant label="running / streaming" hint="RUN_STARTED → send morphs to Stop; textarea locked">
        <ComposerShell disabled>
          <TextArea
            value="How do I wire the send↔stop toggle with useAgent?"
            disabled
          />
          <ToolbarRow streaming disabled={false} />
        </ComposerShell>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <StatusDot state="running" label="Agent is generating…" />
        </div>
      </Variant>

      {/* 6. Disabled */}
      <Variant label="disabled" hint="offline / rate-limited — reason in footer; no silent no-op">
        <ComposerShell disabled>
          <TextArea placeholder="Ask anything…" disabled />
          <ToolbarRow disabled />
        </ComposerShell>
        <div
          style={{
            marginTop: 6,
            padding: "6px 12px",
            borderRadius: 6,
            background: "var(--warning-soft)",
            border: `1px solid ${tok.warning}`,
            fontSize: 12,
            color: tok.warning,
          }}
        >
          Rate limit reached — try again in 60 seconds.
        </div>
      </Variant>

      <Note>
        The composer owns draft state and submit semantics. <strong>Always</strong> show the active
        shortcut in the footer, return focus to the textarea after send, and replace the send button
        with a keyboard-accessible Stop the moment <code style={{ fontFamily: tok.mono }}>RUN_STARTED</code> fires.
      </Note>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
