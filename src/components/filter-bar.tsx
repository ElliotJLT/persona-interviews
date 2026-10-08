"use client";

import { useState } from "react";
import { FACETS, society, type FacetKey } from "@/lib/graph";

export type Filters = Partial<Record<FacetKey, string[]>>;

function matches(
  node: (typeof society.nodes)[number],
  filters: Filters,
  activeOptions: string[],
  skip?: FacetKey,
): boolean {
  if (!activeOptions.includes(node.option)) return false;
  return FACETS.every((facet) => {
    if (facet.key === skip) return true;
    const selected = filters[facet.key] ?? [];
    return selected.length === 0 || selected.includes(node[facet.key]);
  });
}

/**
 * Faceted filtering rather than a row of pills. Values are grouped under the
 * attribute they belong to, each carries the number of respondents it would
 * leave in view, and the count is calculated with that facet's own selections
 * ignored. That is what makes multi-select inside a facet read as "or" while
 * facets combine as "and", and it means no value on offer can lead to an
 * empty result.
 */
export function FilterBar({
  filters,
  activeOptions,
  onChange,
}: {
  filters: Filters;
  activeOptions: string[];
  onChange: (next: Filters) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (key: FacetKey, value: string) => {
    const current = filters[key] ?? [];
    onChange({
      ...filters,
      [key]: current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors duration-150 ${
            open
              ? "border-border-strong bg-surface-sunk text-ink"
              : "border-border bg-card text-ink-muted hover:border-border-strong hover:text-ink"
          }`}
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden
            className="size-[0.875rem]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <path d="M2.5 4.5h11M4.5 8h7M6.5 11.5h3" />
          </svg>
          Filter audience
        </button>

        {open ? (
          <div className="absolute top-full right-0 z-30 mt-2 w-[19rem] animate-[panel-in_200ms_ease-out] overflow-hidden rounded-xl border border-border bg-card shadow-[0_16px_40px_-12px_rgba(29,27,23,0.26)]">
            <div className="max-h-[24rem] overflow-y-auto p-1.5">
              {FACETS.map((facet) => (
                <div key={facet.key} className="p-2.5">
                  <p className="label">{facet.label}</p>
                  <ul className="mt-2 flex flex-col gap-0.5">
                    {facet.values.map((value) => {
                      const selected = (filters[facet.key] ?? []).includes(value);
                      const count = society.nodes.filter(
                        (node) =>
                          node[facet.key] === value &&
                          matches(node, filters, activeOptions, facet.key),
                      ).length;
                      return (
                        <li key={value}>
                          <button
                            type="button"
                            onClick={() => toggle(facet.key, value)}
                            aria-pressed={selected}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 hover:bg-surface-sunk"
                          >
                            <span
                              aria-hidden
                              className={`flex size-4 shrink-0 items-center justify-center rounded border text-[0.625rem] text-white ${
                                selected
                                  ? "border-ink bg-ink"
                                  : "border-border-strong"
                              }`}
                            >
                              {selected ? "✓" : ""}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[0.875rem] text-ink">
                              {value}
                            </span>
                            <span className="shrink-0 text-[0.75rem] text-ink-muted tabular-nums">
                              {count}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Respondents left in view under the current filters. */
export function countInView(filters: Filters, activeOptions: string[]): number {
  return society.nodes.filter((node) => matches(node, filters, activeOptions))
    .length;
}

export function nodeMatches(
  node: (typeof society.nodes)[number],
  filters: Filters,
  activeOptions: string[],
): boolean {
  return matches(node, filters, activeOptions);
}

/** The filters currently narrowing the view, shown as the state they are. */
export function AppliedFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const applied = FACETS.flatMap((facet) =>
    (filters[facet.key] ?? []).map((value) => ({ facet: facet.key, value })),
  );
  if (applied.length === 0) return null;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-6 py-3">
      <span className="label mr-1">Filtered by</span>
      {applied.map(({ facet, value }) => (
        <button
          key={`${facet}-${value}`}
          type="button"
          onClick={() =>
            onChange({
              ...filters,
              [facet]: (filters[facet] ?? []).filter((entry) => entry !== value),
            })
          }
          className="group flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-sunk py-1 pr-2 pl-3 text-[0.8125rem] font-medium text-ink transition-colors duration-150 hover:border-ink"
        >
          {value}
          <span aria-hidden className="text-ink-muted group-hover:text-ink">
            &times;
          </span>
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange({})}
        className="ml-1 rounded-lg px-2 py-1 text-[0.75rem] font-medium text-ink-muted transition-colors duration-150 hover:text-accent"
      >
        Clear all
      </button>
    </div>
  );
}
