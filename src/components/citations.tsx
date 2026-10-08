"use client";

import { useState } from "react";
import type { Citation, CitationSource } from "@/lib/types";

function isGrounded(source: CitationSource): boolean {
  return source.kind !== "simulated";
}

function labelFor(source: CitationSource): string {
  switch (source.kind) {
    case "survey_response":
      return "Their survey answer";
    case "profile_attribute":
      return "Their profile";
    case "simulated":
      return "Not in the data";
  }
}

/**
 * A claim marker. Grounded and extrapolated share one shape and one type so
 * they sit in the sentence rather than decorating it, and separate on fill:
 * solid where there is a source behind the claim, outlined where there is not.
 * Colour alone would fail anyone who cannot separate two hues, and this is the
 * distinction the whole feature rests on.
 */
function Marker({ citation }: { citation: Citation }) {
  const grounded = isGrounded(citation.source);
  return (
    <span
      className={`inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-1 text-[0.6875rem] font-medium ${
        grounded
          ? "bg-ink text-white"
          : "border border-dashed border-ink bg-card text-ink"
      }`}
    >
      {citation.marker}
    </span>
  );
}

/** The marker plus the source it stands for, revealed on hover. */
function CitedClaim({
  citation,
  onViewSources,
}: {
  citation: Citation;
  onViewSources: () => void;
}) {
  const [open, setOpen] = useState(false);
  const grounded = isGrounded(citation.source);

  return (
    <span
      className="relative inline-block align-baseline"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <sup className="mx-0.5 -translate-y-[0.15em]">
        <button
          type="button"
          onClick={onViewSources}
          title="View all sources for this interview"
          className="cursor-pointer align-baseline"
        >
          <Marker citation={citation} />
          <span className="sr-only">
            {labelFor(citation.source)}. View all sources.
          </span>
        </button>
      </sup>

      {open ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 block w-[21rem] -translate-x-1/2 animate-[fade-in_120ms_ease-out] overflow-hidden rounded-xl border border-border bg-card text-left shadow-[0_16px_40px_-12px_rgba(29,27,23,0.28)]">
          <span className="block max-h-[13rem] overflow-y-auto px-4 py-3.5">
            <span
              className={`block text-[0.75rem] font-medium ${grounded ? "text-grounded" : "text-simulated"}`}
            >
              {labelFor(citation.source)}
            </span>
            <span className="mt-1.5 block text-[0.8125rem] leading-relaxed">
              {citation.source.kind === "simulated" ? (
                <span className="text-ink-muted">{citation.source.note}</span>
              ) : (
                <span className="verbatim text-ink">
                  &ldquo;{citation.quote}&rdquo;
                </span>
              )}
            </span>
          </span>
        </span>
      ) : null}
    </span>
  );
}

/** Message text with its [n] tokens swapped for claim markers. */
export function CitedText({
  content,
  citations,
  onViewSources,
}: {
  content: string;
  citations: Citation[];
  onViewSources: () => void;
}) {
  const byMarker = new Map(citations.map((entry) => [entry.marker, entry]));

  return (
    <>
      {content.split("\n\n").map((paragraph, index) => (
        <p
          key={index}
          className="text-[0.9375rem] leading-relaxed text-ink not-first:mt-4"
        >
          {paragraph.split(/(\[\d+\])/).map((part, partIndex) => {
            const match = part.match(/^\[(\d+)\]$/);
            if (!match) return part;
            const citation = byMarker.get(Number(match[1]));
            return citation ? (
              <CitedClaim
                key={partIndex}
                citation={citation}
                onViewSources={onViewSources}
              />
            ) : null;
          })}
        </p>
      ))}
    </>
  );
}
