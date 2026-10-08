"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { society } from "@/lib/graph";
import type { ShellRespondent } from "@/lib/shell-data";
import { AppliedFilters, FilterBar, type Filters } from "./filter-bar";
import { RespondentSnapshot } from "./respondent-snapshot";
import { SocietyStage } from "./society-stage";

/**
 * The framed society. Giving the map a header and an edge stops it reading as
 * loose artwork behind the interface, and gives the colour key somewhere to
 * live once the context column steps aside for a conversation.
 */
export function SocietyPanel({
  activeOptions,
  respondents,
  filters,
  onFiltersChange,
  shownCount,
  focusPersonaId,
  focusName,
  populationCount,
  compact,
  onSelect,
}: {
  activeOptions: string[];
  respondents: ShellRespondent[];
  filters: Filters;
  onFiltersChange: (next: Filters) => void;
  shownCount: number;
  focusPersonaId: string | null;
  focusName: string | null;
  populationCount: number;
  compact: boolean;
  onSelect: (personaId: string) => void;
}) {
  const focused = Boolean(focusPersonaId);
  const [hover, setHover] = useState<{
    personaId: string;
    x: number;
    y: number;
  } | null>(null);
  const hovered =
    hover && hover.personaId !== focusPersonaId
      ? respondents.find((entry) => entry.persona.id === hover.personaId)
      : undefined;

  // The snapshot is hoverable, so leaving a dot doesn't drop it at once: a short
  // grace lets the cursor cross the gap onto the card and click through to the
  // record. Entering the card cancels the pending hide; leaving the card drops
  // it. Without this the card vanishes the instant you move toward it.
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };
  const onNodeHover = (
    next: { personaId: string; x: number; y: number } | null,
  ) => {
    cancelHide();
    if (next) setHover(next);
    else hideTimer.current = setTimeout(() => setHover(null), 160);
  };

  // A cluster the researcher gathers by shift-clicking, so a shared question can
  // go to a group at once. The interview itself isn't wired up yet; the gesture
  // and the target are.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [noted, setNoted] = useState(false);

  const clearCluster = () => {
    setSelected(new Set());
    setNoted(false);
  };

  // Selecting a respondent to read is a different intent, so opening a record
  // drops the cluster rather than letting it linger into the record view.
  const openRespondent = (personaId: string) => {
    clearCluster();
    onSelect(personaId);
  };

  const toggleSelect = (nodeId: string) => {
    setNoted(false);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const cluster = useMemo(() => {
    if (selected.size === 0) return null;
    const chosen = society.nodes.filter((node) => selected.has(node.id));
    if (chosen.length === 0) return null;
    const sum = chosen.reduce(
      (acc, node) => ({ x: acc.x + node.x, y: acc.y + node.y }),
      { x: 0, y: 0 },
    );
    return {
      count: chosen.length,
      x: sum.x / chosen.length / society.size,
      y: sum.y / chosen.length / society.size,
    };
  }, [selected]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex h-[4.75rem] shrink-0 items-center justify-between gap-8 border-b border-border px-6">
        <div
          className="flex min-w-0 items-center gap-3"
        >
          {focused ? (
            <Link
              href="/"
              aria-label="Back to all respondents"
              title="All respondents"
              className="group flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-ink-muted transition-colors duration-150 hover:border-border-strong hover:bg-surface-sunk hover:text-ink"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden
                className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.5 3.5 5 8l4.5 4.5" />
              </svg>
            </Link>
          ) : null}

          <p className="min-w-0 truncate">
            <span className="text-[0.9375rem] font-medium text-ink">
              {focused ? "Neighbourhood" : "The society"}
            </span>
            <span className="ml-2 text-[0.8125rem] text-ink-muted">
              {focused
                ? `${focusName} and the respondents whose views reach theirs`
                : `${shownCount} of ${populationCount} in view · select a lit respondent to open their record, shift-click to gather a cluster`}
            </span>
          </p>
        </div>

        <div className={`shrink-0 ${focused ? "hidden" : ""}`}>
          <FilterBar
            filters={filters}
            activeOptions={activeOptions}
            onChange={onFiltersChange}
          />
        </div>
      </header>

      {focused ? null : (
        <AppliedFilters filters={filters} onChange={onFiltersChange} />
      )}

      <div className="flex min-h-0 flex-1 items-center justify-center p-2">
        <div
          className={`relative h-full w-full ${compact ? "" : "aspect-square max-h-full max-w-full"}`}
        >
          <SocietyStage
            activeOptions={activeOptions}
            filters={filters}
            focusPersonaId={focusPersonaId}
            selectedPersonaId={focusPersonaId}
            selectedNodeIds={selected}
            selectable={!focused}
            onSelect={openRespondent}
            onShiftSelect={toggleSelect}
            onHover={onNodeHover}
            fill={compact}
          />

          {/* The floating action over a gathered cluster. */}
          {cluster && cluster.count >= 2 && !focused ? (
            <div
              className="absolute z-30 animate-[fade-in_120ms_ease-out]"
              style={{
                left: `${cluster.x * 100}%`,
                top: `${cluster.y * 100}%`,
                transform: "translate(-50%, calc(-100% - 1rem))",
              }}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-[0_16px_40px_-12px_rgba(29,27,23,0.28)]">
                  <button
                    type="button"
                    onClick={() => setNoted(true)}
                    className="flex items-center gap-2 rounded-full bg-accent px-3.5 py-2 text-[0.8125rem] font-medium text-white transition-colors duration-150 hover:bg-[#bd5637]"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="6" cy="6.5" r="2.2" />
                      <path d="M2.5 13c0-1.9 1.6-3 3.5-3s3.5 1.1 3.5 3M11 5.5v4M13 7.5h-4" />
                    </svg>
                    Interview {cluster.count} similar personas
                  </button>
                  <button
                    type="button"
                    onClick={clearCluster}
                    aria-label="Clear selection"
                    title="Clear selection"
                    className="flex size-8 items-center justify-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-surface-sunk hover:text-ink"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      aria-hidden
                      className="size-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
                {noted ? (
                  <span className="rounded-full bg-ink px-2.5 py-1 text-[0.6875rem] font-medium text-white">
                    Multi-persona interviews are coming soon
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {hovered && hover ? (
            <button
              type="button"
              onMouseEnter={cancelHide}
              onMouseLeave={() => setHover(null)}
              onClick={() => {
                cancelHide();
                setHover(null);
                openRespondent(hovered.persona.id);
              }}
              className="absolute z-20 cursor-pointer animate-[fade-in_120ms_ease-out] text-left"
              style={{
                left: `${hover.x * 100}%`,
                top: `${hover.y * 100}%`,
                transform: `translate(${hover.x > 0.55 ? "calc(-100% - 1rem)" : "1rem"}, ${
                  hover.y > 0.6 ? "calc(-100% - 0.5rem)" : "-0.5rem"
                })`,
              }}
            >
              <RespondentSnapshot
                persona={hovered.persona}
                response={hovered.response}
              />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
