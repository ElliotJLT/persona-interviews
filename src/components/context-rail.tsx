"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { stripMarkers } from "@/lib/format";
import type { ShellConversation, ShellData } from "@/lib/shell-data";
import {
  readTranscript,
  subscribe,
  type Transcript,
} from "@/lib/transcript-store";
import { optionStyles } from "./option-tag";
import { PersonaMark } from "./persona-mark";

interface RecentItem {
  conversationId: string;
  personaId: string;
  personaName: string;
  choice: string;
  status: ShellConversation["status"];
  preview: string;
  fromPersona: boolean;
  at: string;
}

const EMPTY: Transcript = { messages: [], citations: [] };

/**
 * The recent interviews, built on the client from whatever the transcripts hold
 * now. A conversation started this session sits beside the seeded ones, and a
 * refresh mid-interview leaves it exactly where it was, which is the whole point
 * of persisting it.
 */
function select(
  conversations: ShellConversation[],
  seeds: ShellData["transcripts"],
  live: boolean,
): RecentItem[] {
  const items: RecentItem[] = [];

  for (const conversation of conversations) {
    const seed = seeds[conversation.conversationId] ?? EMPTY;
    const transcript = live
      ? readTranscript(conversation.conversationId, seed)
      : seed;
    const last = transcript.messages.at(-1);
    if (!last) continue;

    items.push({
      conversationId: conversation.conversationId,
      personaId: conversation.personaId,
      personaName: conversation.personaName,
      choice: conversation.choice,
      status: conversation.status,
      preview: stripMarkers(last.content),
      fromPersona: last.author === "persona",
      at: last.createdAt,
    });
  }

  return items.sort((a, b) => b.at.localeCompare(a.at));
}

// useSyncExternalStore wants a stable reference while the data is unchanged, so
// each snapshot is memoised against a signature of the threads it summarises.
let liveCache: { sig: string; value: RecentItem[] } | null = null;
let serverCache: { sig: string; value: RecentItem[] } | null = null;

function signature(items: RecentItem[]): string {
  return items.map((item) => `${item.conversationId}:${item.at}`).join("|");
}

function cached(
  slot: { sig: string; value: RecentItem[] } | null,
  next: RecentItem[],
): { hit: RecentItem[]; store: { sig: string; value: RecentItem[] } } {
  const sig = signature(next);
  if (slot && slot.sig === sig) return { hit: slot.value, store: slot };
  const store = { sig, value: next };
  return { hit: next, store };
}

function StatusBadge({ status }: { status: ShellConversation["status"] }) {
  const done = status === "completed";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ${
        done
          ? "bg-grounded-soft text-grounded"
          : "bg-accent-soft text-[#a84e30]"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${done ? "bg-grounded" : "bg-accent"}`}
      />
      {done ? "Completed" : "In progress"}
    </span>
  );
}

/**
 * A rail section that folds. The header is always a slim bar so a collapsed
 * section costs one line; the body is the section's own content when open. Every
 * section here can close because the rail carries reference a researcher dips
 * into, not content they read top to bottom.
 */
function RailSection({
  title,
  count,
  open,
  onToggle,
  action,
  fill = false,
  children,
}: {
  title: string;
  count?: number;
  open: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
  /** When open, take the leftover height and scroll internally, so the
   *  sections below it stay pinned in view instead of being pushed off. */
  fill?: boolean;
  children: React.ReactNode;
}) {
  const filling = fill && open;
  return (
    <div
      className={`border-t border-border ${filling ? "flex min-h-0 flex-1 flex-col" : ""}`}
    >
      <div className="flex shrink-0 items-center gap-2 pr-5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex flex-1 items-center gap-2 py-3 pl-7 text-left"
        >
          <span className="label">{title}</span>
          {count != null && count > 0 ? (
            <span className="rounded-full bg-surface-sunk px-1.5 text-[0.6875rem] font-medium text-ink-muted tabular-nums">
              {count}
            </span>
          ) : null}
          <span
            aria-hidden
            className={`ml-auto text-ink-muted transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          >
            &#8964;
          </span>
        </button>
        {open ? action : null}
      </div>
      {open ? (
        <div
          className={`px-7 pt-0.5 pb-5 ${filling ? "min-h-0 flex-1 overflow-y-auto" : ""}`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The context column. It holds the same four things in both modes, so moving
 * into an interview never rearranges the furniture.
 */
export function ContextRail({
  data,
  muted,
  onToggleOption,
  onShowAll,
  activeConversationId,
}: {
  data: ShellData;
  muted: string[];
  onToggleOption: (option: string) => void;
  onShowAll: () => void;
  activeConversationId: string | null;
}) {
  const router = useRouter();

  const recent = useSyncExternalStore(
    subscribe,
    () => {
      const { hit, store } = cached(
        liveCache,
        select(data.conversations, data.transcripts, true),
      );
      liveCache = store;
      return hit;
    },
    () => {
      const { hit, store } = cached(
        serverCache,
        select(data.conversations, data.transcripts, false),
      );
      serverCache = store;
      return hit;
    },
  );

  const [open, setOpen] = useState({
    result: true,
    insights: true,
    recent: false,
  });
  const toggle = (key: keyof typeof open) =>
    setOpen((current) => ({ ...current, [key]: !current[key] }));

  return (
    <nav
      aria-label="Survey context"
      className="flex h-full w-full flex-col bg-card"
    >
      <div className="shrink-0 px-7 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <p className="label">Simulated survey</p>
        </div>
        <h1 className="mt-2 text-[1.0625rem] leading-snug font-medium text-ink">
          {data.survey.question}
        </h1>
        <p className="mt-2.5 text-[0.8125rem] text-ink-muted">
          {data.survey.audience} ·{" "}
          {data.survey.respondentCount.toLocaleString("en-GB")} respondents
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <RailSection
          title="Result"
          open={open.result}
          onToggle={() => toggle("result")}
          action={
            muted.length > 0 ? (
              <button
                type="button"
                onClick={onShowAll}
                className="shrink-0 text-[0.75rem] font-medium text-accent"
              >
                Show all
              </button>
            ) : null
          }
        >
          <ul className="flex flex-col gap-1">
            {data.results.map((result) => {
              const off = muted.includes(result.option);
              return (
                <li key={result.option}>
                  <button
                    type="button"
                    onClick={() => onToggleOption(result.option)}
                    aria-pressed={!off}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 hover:bg-surface-sunk ${
                      off ? "opacity-40" : ""
                    }`}
                  >
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${optionStyles(result.option).dot}`}
                    />
                    <span className="w-16 shrink-0 text-[0.875rem] text-ink">
                      {result.option}
                    </span>
                    <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-border">
                      <span
                        className={`block h-full rounded-full ${optionStyles(result.option).dot}`}
                        style={{ width: `${Math.round(result.share * 100)}%` }}
                      />
                    </span>
                    <span className="w-9 shrink-0 text-right text-[0.875rem] font-medium text-ink tabular-nums">
                      {Math.round(result.share * 100)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </RailSection>

        <RailSection
          title="What the result says"
          open={open.insights}
          onToggle={() => toggle("insights")}
          fill
        >
          <ul className="flex flex-col gap-4">
            {data.insights.map((insight) => (
              <li key={insight.id}>
                {insight.stat ? (
                  <p className="text-[1.5rem] leading-none font-medium text-ink tabular-nums">
                    {insight.stat}
                  </p>
                ) : null}
                <h3
                  className={`text-[0.9375rem] leading-snug font-medium text-ink ${insight.stat ? "mt-1.5" : ""}`}
                >
                  {insight.headline}
                </h3>
                <p className="mt-1 text-[0.8125rem] leading-snug text-ink-muted">
                  {insight.detail}
                </p>
              </li>
            ))}
          </ul>
        </RailSection>

        {recent.length > 0 ? (
          <RailSection
            title="Recent interviews"
            count={recent.length}
            open={open.recent}
            onToggle={() => toggle("recent")}
          >
            {/* A list of chats: one respondent, one status, one line of the last
                thing said. Click anywhere to drop straight into the thread; on
                hover an arrow nudges to say so. */}
            <ul className="-mx-2 flex flex-col">
              {recent.map((item) => {
                const active = item.conversationId === activeConversationId;
                return (
                  <li key={item.conversationId}>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/interviews/${item.conversationId}`)
                      }
                      aria-current={active ? "page" : undefined}
                      className={`group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 ${
                        active ? "bg-surface-sunk" : "hover:bg-surface-sunk"
                      }`}
                    >
                      <PersonaMark
                        name={item.personaName}
                        choice={item.choice}
                        personaId={item.personaId}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-[0.875rem] font-medium text-ink">
                            {item.personaName}
                          </span>
                          <StatusBadge status={item.status} />
                        </span>
                        <span className="mt-0.5 block truncate text-[0.75rem] text-ink-muted">
                          {item.fromPersona ? "" : "You: "}
                          {item.preview}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="flex w-4 shrink-0 justify-center self-center text-ink-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:animate-[nudge-x_900ms_ease-in-out_infinite]"
                      >
                        &rarr;
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </RailSection>
        ) : null}
      </div>
    </nav>
  );
}
