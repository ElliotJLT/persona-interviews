"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { society } from "@/lib/graph";
import { readTranscript, subscribe } from "@/lib/transcript-store";
import { getSourcesOpen, setSourcesOpen, subscribeUi } from "@/lib/ui-store";
import type { ShellData } from "@/lib/shell-data";
import { ContextRail } from "./context-rail";
import { countInView, type Filters } from "./filter-bar";
import { RespondentPanel } from "./respondent-panel";
import { SocietyPanel } from "./society-panel";
import { SourceSummary } from "./source-summary";

/**
 * Three steps, in the order the work actually happens. Browse the society,
 * read a respondent, then interview them. Each step gives width to the one
 * after it, and the society stays mounted throughout so none of it reads as
 * leaving the page.
 */
export function AppShell({
  data,
  children,
}: {
  data: ShellData;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [muted, setMuted] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [recordOpen, setRecordOpen] = useState(true);
  const sourcesOpen = useSyncExternalStore(
    subscribeUi,
    getSourcesOpen,
    () => false,
  );

  const segments = pathname.split("/").filter(Boolean);
  const mode: "browse" | "record" | "interview" =
    segments[0] === "interviews"
      ? "interview"
      : segments[0] === "respondents"
        ? "record"
        : "browse";

  const focus =
    mode === "record"
      ? data.respondents.find((entry) => entry.persona.id === segments[1])
      : mode === "interview"
        ? data.respondents.find((entry) => entry.conversationId === segments[1])
        : undefined;

  const activeOptions = data.results
    .map((result) => result.option)
    .filter((option) => !muted.includes(option));

  const shownCount = countInView(filters, activeOptions);

  const openRecord = (personaId: string) =>
    router.push(`/respondents/${personaId}`);

  const openConversationId =
    mode === "interview" ? (segments[1] ?? null) : null;
  const seed = openConversationId
    ? (data.transcripts[openConversationId] ?? { messages: [], citations: [] })
    : { messages: [], citations: [] };
  const transcript = useSyncExternalStore(
    subscribe,
    () => (openConversationId ? readTranscript(openConversationId, seed) : seed),
    () => seed,
  );
  const showSources = mode === "interview" && sourcesOpen;

  const glide = "duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)]";

  // Each panel is laid out at a fixed width and revealed by an animating cap,
  // so moving between modes widens the right column without a single line of
  // text rewrapping. The society keeps its place on the left throughout, which
  // is what makes this read as one screen opening rather than two screens
  // swapping.
  // The record keeps one width for its whole life. Opening an interview
  // collapses the society and lets the record slide into its place, so the
  // panel a user was reading is the same object in the same shape, moved.
  // In an interview the record folds to a rail rather than vanishing, the same
  // way the sources column does on the other side of the transcript.
  const recordCollapsed = mode === "interview" && !recordOpen;
  const recordWidth =
    mode === "browse" ? "0rem" : recordCollapsed ? "3.5rem" : "26rem";
  const societyCap = mode === "interview" ? "0px" : "200vw";

  return (
    <div className="flex h-full gap-3 bg-surface p-3">
      <div
        aria-hidden={mode !== "browse"}
        className={`flex h-full shrink-0 overflow-hidden transition-[width] ${glide} ${
          mode === "browse" ? "w-[26rem]" : "-mr-3 w-0"
        }`}
      >
        <div className="h-full w-[26rem] shrink-0 overflow-hidden rounded-2xl border border-border">
          <ContextRail
            data={data}
            muted={muted}
            onToggleOption={(option) =>
              setMuted((current) =>
                current.includes(option)
                  ? current.filter((entry) => entry !== option)
                  : [...current, option],
              )
            }
            onShowAll={() => setMuted([])}
            activeConversationId={
              mode === "interview" ? (segments[1] ?? null) : null
            }
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 gap-3">
        <div
          style={{ maxWidth: societyCap }}
          className={`min-w-0 flex-1 overflow-hidden transition-[max-width,opacity] ${glide} ${
            mode === "interview" ? "-mr-3 opacity-0 duration-150" : "opacity-100"
          }`}
        >
          <SocietyPanel
            activeOptions={activeOptions}
            respondents={data.respondents}
            filters={filters}
            onFiltersChange={setFilters}
            shownCount={shownCount}
            focusPersonaId={focus?.persona.id ?? null}
            focusName={focus?.persona.name.split(" ")[0] ?? null}
            compact={false}
            populationCount={society.nodes.length}
            onSelect={openRecord}
          />
        </div>

        <div
          style={{ width: recordWidth }}
          className={`flex h-full shrink-0 overflow-hidden transition-[width] ${glide}`}
        >
          <div
            style={{ width: recordCollapsed ? "3.5rem" : "26rem" }}
            className="h-full shrink-0 overflow-hidden rounded-2xl border border-border"
          >
            {focus ? (
              <RespondentPanel
                persona={focus.persona}
                response={focus.response}
                conversationId={focus.conversationId}
                hasTranscript={focus.hasTranscript}
                inInterview={mode === "interview"}
                activeConversationId={openConversationId}
                collapsed={recordCollapsed}
                onExpand={() => setRecordOpen(true)}
                onCollapse={() => setRecordOpen(false)}
              />
            ) : null}
          </div>
        </div>

        {/* Laid out at the width it will settle at, so the transcript never
            rewraps while the column opens. Absent entirely until then, or its
            fixed inner width would claim space the society still needs. */}
        {mode === "interview" ? (
          <div className="flex h-full min-w-0 flex-1">
            <div className="h-full min-w-0 flex-1 overflow-hidden rounded-2xl border border-border">
              {children}
            </div>
          </div>
        ) : null}

        {/* Sources sit beside the transcript rather than inside it, so the
            evidence is a component of the workspace in its own right. */}
        {mode === "interview" ? (
          <div
            className={`h-full shrink-0 overflow-hidden transition-[width] ${glide} ${
              showSources ? "w-[21.5rem]" : "w-[3.5rem]"
            }`}
          >
            <div
              className={`h-full overflow-hidden rounded-2xl border border-border ${
                showSources ? "w-[21.5rem]" : "w-[3.5rem]"
              }`}
            >
              <SourceSummary
                citations={transcript.citations}
                collapsed={!showSources}
                onExpand={() => setSourcesOpen(true)}
                onCollapse={() => setSourcesOpen(false)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
