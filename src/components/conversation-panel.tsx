"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { citationsFor, stageReply } from "@/lib/replies";
import { suggestedFollowUps } from "@/lib/openings";
import { downloadTranscript } from "@/lib/transcript-export";
import {
  messageId,
  readTranscript,
  subscribe,
  timestamp,
  writeTranscript,
  type Transcript,
} from "@/lib/transcript-store";
import type { Citation, Message, Persona, SurveyResponse } from "@/lib/types";
import { setSourcesOpen } from "@/lib/ui-store";
import { ComposerPlusMenu } from "./composer-menu";
import { MessageThread, ThinkingRow } from "./message-thread";
import { PersonaMark } from "./persona-mark";

/**
 * The interview. By this point the respondent has been read and chosen, so the
 * conversation owns the screen and the map is one step back rather than
 * occupying width it cannot use.
 */
export function ConversationPanel({
  conversationId,
  persona,
  response,
  seedMessages,
  seedCitations,
  openings,
}: {
  conversationId: string;
  persona: Persona;
  response: SurveyResponse | undefined;
  seedMessages: Message[];
  seedCitations: Citation[];
  openings: string[];
}) {
  const firstName = persona.name.split(" ")[0];
  const seed: Transcript = { messages: seedMessages, citations: seedCitations };
  const transcript = useSyncExternalStore(
    subscribe,
    () => readTranscript(conversationId, seed),
    () => seed,
  );
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript.messages.length, waiting]);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || waiting || !response) return;

    const userMessage: Message = {
      id: messageId(),
      conversationId,
      author: "user",
      content: trimmed,
      createdAt: timestamp(),
    };

    const withQuestion: Transcript = {
      messages: [...transcript.messages, userMessage],
      citations: transcript.citations,
    };
    writeTranscript(conversationId, withQuestion);
    setDraft("");
    setWaiting(true);

    window.setTimeout(() => {
      const reply = stageReply(trimmed, persona, response);
      const replyId = messageId("_r");
      writeTranscript(conversationId, {
        messages: [
          ...withQuestion.messages,
          {
            id: replyId,
            conversationId,
            author: "persona",
            content: reply.content,
            createdAt: timestamp(),
          },
        ],
        citations: [
          ...withQuestion.citations,
          ...citationsFor(replyId, reply),
        ],
      });
      setWaiting(false);
    }, 900);
  };

  const empty = transcript.messages.length === 0;
  // Openings while the thread is cold, follow-ups once it is under way. Either
  // way the suggestions come from this respondent's own answer, so a next
  // question is one tap rather than a cold box.
  const suggestions =
    empty || !response ? openings : suggestedFollowUps(response);

  return (
    <section
      aria-label={`Interview with ${persona.name}`}
      className="flex h-full w-full min-w-0 flex-col bg-card"
    >
      <header className="flex h-[4.75rem] shrink-0 items-center border-b border-border bg-surface px-6">
        <div className="flex w-full items-center gap-3">
          <PersonaMark
            name={persona.name}
            choice={response?.choice ?? ""}
            personaId={persona.id}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.9375rem] font-medium text-ink">
              {persona.name}
            </p>
            <p className="truncate text-[0.75rem] text-ink-muted">
              Simulated respondent
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              downloadTranscript(
                persona,
                response,
                transcript.messages,
                transcript.citations,
              )
            }
            disabled={empty}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-[0.8125rem] font-medium text-ink-muted transition-colors duration-150 hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              viewBox="0 0 16 16"
              aria-hidden
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 2.5v7M5 7l3 3 3-3M3 12.5h10" />
            </svg>
            Export transcript
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
        <div className={`mx-auto max-w-[42rem] ${empty && !waiting ? "flex min-h-full flex-col justify-center" : ""}`}>
          {empty && !waiting ? (
            <div>
              <h3 className="text-base font-medium text-ink">
                Start with what you want to understand
              </h3>
              <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-ink-muted">
                {firstName} answers from the survey response and the profile
                behind it. Every claim is marked with where it came from, and
                anything past that data is marked as extrapolation. Pick a
                question below to begin, or ask your own.
              </p>
            </div>
          ) : (
            <>
              <MessageThread
                messages={transcript.messages}
                citations={transcript.citations}
                conversationId={conversationId}
                personaName={persona.name}
                personaId={persona.id}
                choice={response?.choice ?? ""}
                onViewSources={() => setSourcesOpen(true)}
              />
              {waiting ? (
                <ol className="mt-7">
                  <ThinkingRow
                    personaName={persona.name}
                    personaId={persona.id}
                    choice={response?.choice ?? ""}
                  />
                </ol>
              ) : null}
            </>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-card px-8 py-4">
        <div className="mx-auto max-w-[42rem]">
          {/* Suggested questions, derived from this respondent's answer. Cold
              thread gets openings; a live one gets follow-ups. */}
          {response && !waiting ? (
            <div className="mb-2.5">
              <p className="label mb-2">
                {empty ? "Openings from this answer" : "Follow-ups"}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="group flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-left text-[0.8125rem] leading-snug text-ink transition-colors duration-150 hover:border-border-strong hover:bg-card"
                  >
                    <span
                      aria-hidden
                      className="text-ink-muted transition-transform duration-150 group-hover:translate-x-0.5"
                    >
                      &rarr;
                    </span>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask(draft);
            }}
          >
            {/* Standard chat input: one field that grows with content, the
                add and send fixed to the ends and bottom-aligned so they hold
                still as the text wraps. */}
            <div className="flex items-end gap-1.5 rounded-2xl border border-border bg-surface px-2 py-1.5 focus-within:border-border-strong">
              <ComposerPlusMenu current={persona} />
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    ask(draft);
                  }
                }}
                rows={1}
                placeholder={`Ask ${firstName} about their answer`}
                aria-label={`Ask ${firstName} a question`}
                className="block max-h-[200px] min-h-[2.25rem] flex-1 resize-none bg-transparent px-1 py-2 text-[0.9375rem] leading-relaxed text-ink placeholder:text-ink-muted focus:outline-none"
              />
              <button
                type="button"
                disabled
                aria-label="Voice input"
                title="Voice input"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-muted opacity-45"
              >
                <svg viewBox="0 0 16 16" aria-hidden className="size-[1.125rem]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="2" width="4" height="7" rx="2" />
                  <path d="M4 7.5a4 4 0 0 0 8 0M8 11.5V14" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={!draft.trim() || waiting}
                aria-label="Send"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors duration-150 hover:bg-[#bd5637] disabled:cursor-not-allowed disabled:bg-border-strong"
              >
                <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" />
                </svg>
              </button>
            </div>
          </form>

          <p className="mt-2.5 text-[0.75rem] text-ink-muted">
            {firstName} is a simulated respondent. Claims are marked as grounded
            in their data or as the model reasoning past it.
          </p>
        </div>
      </div>
    </section>
  );
}
