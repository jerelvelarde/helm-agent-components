import { useState } from "react";
import { Copy, RefreshCw, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { Bubble, Caret, Cite, Note, Showcase, Variant, tok } from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "chat-message",
  title: "Chat Message",
  category: "Conversational core",
  blurb:
    "The atomic transcript unit — a role-attributed, streamed, Markdown-rendering turn with an action toolbar and branch navigation.",
  copilotkit: "CopilotChat · useRenderTool",
  spec: "components/chat-message.md",
};

function ActionBar() {
  const items = [
    { icon: Copy, label: "Copy" },
    { icon: RefreshCw, label: "Regenerate" },
    { icon: ThumbsUp, label: "Good response" },
    { icon: ThumbsDown, label: "Bad response" },
    { icon: Volume2, label: "Read aloud" },
  ];
  return (
    <div className="flex items-center" style={{ gap: 4, marginTop: 8, marginLeft: 36 }}>
      {items.map(({ icon: Icon, label }) => (
        <button
          key={label}
          aria-label={label}
          title={label}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: "none",
            background: "transparent",
            color: tok.textDisabled,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}

function Branches() {
  const [i, setI] = useState(1);
  const total = 3;
  return (
    <span className="inline-flex items-center" style={{ gap: 6, fontSize: 12, color: tok.textDisabled }}>
      <button
        aria-label="Previous response"
        onClick={() => setI((v) => Math.max(1, v - 1))}
        style={{ border: "none", background: "transparent", cursor: "pointer", color: "inherit" }}
      >
        ‹
      </button>
      <span style={{ fontFamily: tok.mono }}>
        {i}/{total}
      </span>
      <button
        aria-label="Next response"
        onClick={() => setI((v) => Math.min(total, v + 1))}
        style={{ border: "none", background: "transparent", cursor: "pointer", color: "inherit" }}
      >
        ›
      </button>
    </span>
  );
}

const wiring = `import { CopilotChat } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

// Drop-in transcript: user + assistant rows, streaming,
// Markdown, and the action toolbar are all handled.
<CopilotChat agentId="my-agent" />

// Headless control over the message list:
// const { messages, sendMessage, isLoading } = useCopilotChatHeadless_c();
// Override a single row via the assistantMessage / userMessage slots.`;

export default function Story() {
  return (
    <Showcase>
      <Variant label="conversation" hint="user + assistant turns, GFM markdown">
        <div className="flex flex-col" style={{ gap: 14 }}>
          <Bubble role="user">How do I cancel a running agent mid-stream?</Bubble>
          <Bubble role="assistant">
            Call <code style={{ fontFamily: tok.mono, fontSize: 13 }}>stop()</code> on the run. The current
            message keeps its partial text and is marked <em>stopped</em> — it isn't discarded.
            <Cite n={1} />
          </Bubble>
          <ActionBar />
        </div>
      </Variant>

      <Variant label="streaming" hint="token deltas + blinking caret; toolbar hidden until done">
        <Bubble role="assistant">
          You can wire it with <code style={{ fontFamily: tok.mono, fontSize: 13 }}>useCopilotChatHeadless_c</code>{" "}
          and call <Caret />
        </Bubble>
      </Variant>

      <Variant label="branches" hint="navigate alternative responses from edit / regenerate">
        <div className="flex flex-col" style={{ gap: 8 }}>
          <Bubble role="assistant">Here's a second take that's more concise.</Bubble>
          <div style={{ marginLeft: 36 }}>
            <Branches />
          </div>
        </div>
      </Variant>

      <Variant label="error" hint="recoverable, with retry — never a dead bubble">
        <div
          className="flex items-center"
          style={{ gap: 10, padding: "10px 14px", borderRadius: 12, background: "var(--error-soft)", color: tok.error }}
        >
          <span style={{ fontSize: 14 }}>The model failed to respond.</span>
          <button
            style={{
              marginLeft: "auto",
              border: `1px solid ${tok.error}`,
              background: "transparent",
              color: tok.error,
              borderRadius: 8,
              padding: "4px 12px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </Variant>

      <Note>
        Treat a message as an ordered list of typed <em>parts</em> (text, reasoning, tool-call, file, source),
        not a single string — that's what lets one row interleave prose, citations, and generative-UI widgets.
      </Note>

      <Variant label="copilotkit wiring" style={{ padding: 0, background: "transparent", border: "none" }}>
        <pre
          className="ck-scroll"
          style={{
            margin: 0,
            padding: 14,
            background: "var(--surface-container)",
            border: `1px solid ${tok.grey300}`,
            borderRadius: 8,
            fontFamily: tok.mono,
            fontSize: 12.5,
            lineHeight: 1.55,
            overflowX: "auto",
            color: "var(--code-fg)",
          }}
        >
          <code>{wiring}</code>
        </pre>
      </Variant>
    </Showcase>
  );
}
