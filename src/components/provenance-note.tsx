"use client";

import { useState } from "react";

/**
 * How a respondent was built, kept to one control until asked for. The
 * explanation matters, but it is reference material and does not deserve
 * permanent residence above the conversation.
 */
export function ProvenanceNote({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 text-[0.8125rem] font-medium transition-colors duration-150 ${
          open ? "text-ink" : "text-ink-muted hover:text-ink"
        }`}
      >
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className="size-[0.875rem] shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        >
          <circle cx="8" cy="8" r="6.2" />
          <path d="M8 7.2v4M8 4.9v.1" />
        </svg>
        Where answers come from
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-30 mt-2 w-[22rem] rounded-xl border border-border bg-card p-4 shadow-[0_16px_40px_-12px_rgba(29,27,23,0.26)]">
          <p className="label">How {name} was built</p>
          <ol className="mt-3 flex flex-col gap-2.5 text-[0.8125rem] leading-relaxed text-ink-muted">
            <li>
              A psychographic profile triangulated from anonymised public
              observations and first-party research.
            </li>
            <li>
              Placed among the respondents lit on the map, whose views reach
              theirs through the network.
            </li>
            <li>
              Answers are reasoned from that profile. Anything past it is
              extrapolation, and the transcript marks it.
            </li>
          </ol>
        </div>
      ) : null}
    </div>
  );
}
