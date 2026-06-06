import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, RotateCcw, Search, X } from "lucide-react";
import {
  Btn,
  CodeNote,
  Note,
  SectionLabel,
  Showcase,
  Skeleton,
  StatusDot,
  Tag,
  Variant,
  tok,
} from "../ui/kit";
import type { StoryMeta } from "./_types";

export const meta: StoryMeta = {
  slug: "threads-history",
  title: "Threads / Conversation History",
  category: "Conversation management",
  blurb: "Persisted conversations — thread list, sessions, rename/search, branching, restore.",
  copilotkit: "Threads · MESSAGES_SNAPSHOT",
  spec: "components/threads-history.md",
};

// ── shared mock data ────────────────────────────────────────────────────────

const THREADS = [
  { id: "t1", title: "Analyze Q3 financials", active: true, ts: "2m ago" },
  { id: "t2", title: "Draft investor memo", active: false, ts: "1h ago" },
  { id: "t3", title: "Due diligence on Acme Corp", active: false, ts: "Yesterday" },
  { id: "t4", title: "Compliance risk review", active: false, ts: "Yesterday" },
];

const PROJECT_THREADS = [
  { id: "p1", title: "NDA review — Contoso", ts: "3 days ago" },
  { id: "p2", title: "Term sheet redline", ts: "3 days ago" },
];

// ── small sub-components ────────────────────────────────────────────────────

function ThreadRow({
  title,
  ts,
  selected,
  streaming,
  showMenu,
}: {
  title: string;
  ts: string;
  selected?: boolean;
  streaming?: boolean;
  showMenu?: boolean;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        gap: 8,
        padding: "7px 10px",
        borderRadius: 7,
        background: selected ? `${tok.indigo}14` : "transparent",
        border: selected ? `1px solid ${tok.indigo}33` : "1px solid transparent",
        cursor: "pointer",
      }}
    >
      {streaming ? (
        <StatusDot state="running" />
      ) : (
        <span style={{ width: 8, minWidth: 8 }} />
      )}
      <span
        style={{
          flex: 1,
          fontSize: 13,
          color: selected ? tok.indigo : tok.textPrimary,
          fontWeight: selected ? 500 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </span>
      <span style={{ fontSize: 11, color: tok.textDisabled, whiteSpace: "nowrap" }}>{ts}</span>
      {showMenu && (
        <button
          aria-label={`More options for '${title}'`}
          style={{
            width: 22,
            height: 22,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: tok.textDisabled,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
          }}
        >
          <MoreHorizontal size={13} />
        </button>
      )}
    </div>
  );
}

// ── wiring snippet ──────────────────────────────────────────────────────────

const wiring = `import { CopilotKit, useCopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-core/v2/styles.css";

// Sidebar: list threads and switch between them.
function ThreadSidebar() {
  const { threadId, setThreadId } = useCopilotKit();
  const threads = useMyThreadStore(); // your persistence layer

  return (
    <nav role="navigation" aria-label="Conversation history">
      <button onClick={() => setThreadId(undefined)}>+ New chat</button>
      <ul role="listbox" aria-label="Past conversations">
        {threads.map((t) => (
          <li
            key={t.id}
            role="option"
            aria-selected={t.id === threadId}
            aria-current={t.id === threadId ? "page" : undefined}
          >
            <button onClick={() => setThreadId(t.id)}>{t.title}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Resuming: pass threadId to CopilotChat.
// The runtime replays MESSAGES_SNAPSHOT to rehydrate history,
// then reconnects to a live stream if a run is still active.
export function App({ threadId }: { threadId?: string }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div style={{ display: "flex" }}>
        <ThreadSidebar />
        <CopilotChat threadId={threadId} />
      </div>
    </CopilotKit>
  );
}

// v1 equivalent: CopilotSidebar / CopilotPopup accept the same threadId prop.
// Full thread CRUD (rename, archive, delete) requires the v2 persistence runtime:
// see https://docs.copilotkit.ai/learn/whats-new/v1-50`;

// ── story ───────────────────────────────────────────────────────────────────

export default function Story() {
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState("Analyze Q3 financials");
  const [deleted, setDeleted] = useState(false);

  return (
    <Showcase>
      {/* 1. Idle list */}
      <Variant
        label="idle list"
        hint="threads loaded, grouped by recency; hover reveals ··· menu"
      >
        <div className="flex flex-col" style={{ gap: 2, width: 280 }}>
          {/* toolbar */}
          <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
            <button
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 7,
                border: `1px solid ${tok.border}`,
                background: tok.container,
                cursor: "pointer",
                fontSize: 13,
                color: tok.textSecondary,
              }}
            >
              <Plus size={14} />
              New chat
            </button>
            <button
              aria-label="Search conversations"
              style={{
                width: 32,
                height: 32,
                border: `1px solid ${tok.border}`,
                borderRadius: 7,
                background: tok.container,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: tok.textSecondary,
              }}
            >
              <Search size={14} />
            </button>
          </div>

          <SectionLabel>Today</SectionLabel>
          {THREADS.slice(0, 2).map((t) => (
            <ThreadRow key={t.id} title={t.title} ts={t.ts} streaming={t.active} showMenu />
          ))}

          <div style={{ height: 8 }} />
          <SectionLabel>Yesterday</SectionLabel>
          {THREADS.slice(2).map((t) => (
            <ThreadRow key={t.id} title={t.title} ts={t.ts} showMenu />
          ))}

          <div style={{ height: 8 }} />
          <SectionLabel>Q4 Deal Pipeline</SectionLabel>
          {PROJECT_THREADS.map((t) => (
            <ThreadRow key={t.id} title={t.title} ts={t.ts} showMenu />
          ))}
        </div>
      </Variant>

      {/* 2. Active / selected */}
      <Variant
        label="active / selected"
        hint="selected row: tinted bg, brand color title, aria-current=page"
      >
        <div className="flex flex-col" style={{ gap: 2, width: 280 }}>
          <SectionLabel>Today</SectionLabel>
          {THREADS.slice(0, 2).map((t, i) => (
            <ThreadRow
              key={t.id}
              title={t.title}
              ts={t.ts}
              selected={i === 0}
              streaming={t.active}
              showMenu
            />
          ))}
          <SectionLabel>Yesterday</SectionLabel>
          {THREADS.slice(2).map((t) => (
            <ThreadRow key={t.id} title={t.title} ts={t.ts} showMenu />
          ))}
        </div>
      </Variant>

      {/* 3. Loading skeleton */}
      <Variant label="loading" hint="skeleton rows while thread list fetches">
        <div className="flex flex-col" style={{ gap: 2, width: 280 }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 10 }}>
            <Skeleton h={32} style={{ flex: 1, borderRadius: 7 }} />
            <Skeleton w={32} h={32} style={{ borderRadius: 7 }} />
          </div>
          <Skeleton w={40} h={10} style={{ marginBottom: 6, borderRadius: 4 }} />
          {[90, 72, 84].map((w, i) => (
            <div key={i} className="flex items-center" style={{ gap: 8, padding: "7px 10px" }}>
              <Skeleton w={8} h={8} style={{ borderRadius: 9999 }} />
              <Skeleton w={`${w}%`} h={12} style={{ borderRadius: 4 }} />
              <Skeleton w={32} h={10} style={{ borderRadius: 4 }} />
            </div>
          ))}
          <Skeleton w={56} h={10} style={{ margin: "12px 0 6px", borderRadius: 4 }} />
          {[78, 65].map((w, i) => (
            <div key={i} className="flex items-center" style={{ gap: 8, padding: "7px 10px" }}>
              <Skeleton w={8} h={8} style={{ borderRadius: 9999 }} />
              <Skeleton w={`${w}%`} h={12} style={{ borderRadius: 4 }} />
              <Skeleton w={32} h={10} style={{ borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </Variant>

      {/* 4. Inline rename */}
      <Variant
        label="renaming"
        hint="row title becomes an <input>; commit on Enter, cancel on Escape"
      >
        <div className="flex flex-col" style={{ gap: 2, width: 280 }}>
          <SectionLabel>Today</SectionLabel>
          {/* renaming row */}
          <div
            className="flex items-center"
            style={{
              gap: 8,
              padding: "5px 10px",
              borderRadius: 7,
              background: `${tok.indigo}14`,
              border: `1px solid ${tok.indigo}33`,
            }}
          >
            <StatusDot state="running" />
            {renaming ? (
              <input
                autoFocus
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") setRenaming(false);
                }}
                style={{
                  flex: 1,
                  fontSize: 13,
                  border: `1px solid ${tok.indigo}`,
                  borderRadius: 4,
                  padding: "2px 6px",
                  outline: "none",
                  fontFamily: "inherit",
                  color: tok.textPrimary,
                }}
              />
            ) : (
              <span
                style={{ flex: 1, fontSize: 13, fontWeight: 500, color: tok.indigo }}
                onDoubleClick={() => setRenaming(true)}
              >
                {renameVal}
              </span>
            )}
            <button
              onClick={() => setRenaming((v) => !v)}
              style={{
                fontSize: 11,
                color: tok.indigo,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "0 2px",
              }}
            >
              {renaming ? "Save" : "Rename"}
            </button>
          </div>
          <ThreadRow title="Draft investor memo" ts="1h ago" showMenu />
        </div>
        <Note>Double-click the title or use the ··· menu → Rename to enter edit mode.</Note>
      </Variant>

      {/* 5. Delete with undo toast */}
      <Variant label="deleting / undo" hint="soft-delete with 5 s undo toast before permanent removal">
        <div className="flex flex-col" style={{ gap: 8, width: 280 }}>
          <SectionLabel>Today</SectionLabel>
          {deleted ? (
            <div style={{ fontSize: 13, color: tok.textDisabled, padding: "6px 10px" }}>
              (thread removed)
            </div>
          ) : (
            <div
              className="flex items-center"
              style={{
                gap: 8,
                padding: "7px 10px",
                borderRadius: 7,
                border: `1px dashed ${tok.error}55`,
                background: "var(--error-soft)",
              }}
            >
              <X size={13} color={tok.error} />
              <span style={{ flex: 1, fontSize: 13, color: tok.error, textDecoration: "line-through" }}>
                Analyze Q3 financials
              </span>
            </div>
          )}
          <ThreadRow title="Draft investor memo" ts="1h ago" showMenu />
          {/* undo toast */}
          {!deleted && (
            <div
              className="flex items-center"
              style={{
                gap: 10,
                marginTop: 6,
                padding: "8px 12px",
                borderRadius: 8,
                background: tok.textPrimary,
                color: tok.textInvert,
                fontSize: 13,
              }}
            >
              <span style={{ flex: 1 }}>Thread deleted</span>
              <button
                onClick={() => setDeleted(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: tok.indigo,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Undo
              </button>
              <RotateCcw size={13} color={tok.textDisabled} />
            </div>
          )}
          {deleted && (
            <Btn variant="ghost" onClick={() => setDeleted(false)}>
              Reset demo
            </Btn>
          )}
        </div>
      </Variant>

      {/* 6. Resuming / replaying snapshot */}
      <Variant
        label="resuming"
        hint="MESSAGES_SNAPSHOT replaying while historical events rehydrate the thread"
      >
        <div className="flex flex-col" style={{ gap: 10, width: 280 }}>
          <div
            className="flex items-center"
            style={{
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              background: tok.grey200,
              border: `1px solid ${tok.border}`,
            }}
          >
            <StatusDot state="running" label="Replaying conversation history…" />
            <Tag mono>MESSAGES_SNAPSHOT</Tag>
          </div>
          {/* ghost skeleton of messages being replayed */}
          <div className="flex flex-col" style={{ gap: 8, paddingLeft: 4 }}>
            <div className="flex" style={{ justifyContent: "flex-end" }}>
              <Skeleton w="55%" h={32} style={{ borderRadius: 10 }} />
            </div>
            <div className="flex items-end" style={{ gap: 8 }}>
              <Skeleton w={26} h={26} style={{ borderRadius: 9999, minWidth: 26 }} />
              <Skeleton w="70%" h={52} style={{ borderRadius: 10 }} />
            </div>
            <div className="flex" style={{ justifyContent: "flex-end" }}>
              <Skeleton w="40%" h={28} style={{ borderRadius: 10 }} />
            </div>
          </div>
          <Note>
            CopilotKit replays <code style={{ fontFamily: tok.mono, fontSize: 11 }}>MESSAGES_SNAPSHOT</code> on resume;
            if a run is still active, the live stream reconnects transparently.
          </Note>
        </div>
      </Variant>

      <CodeNote code={wiring} />
    </Showcase>
  );
}
