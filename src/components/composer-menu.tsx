"use client";

import { useEffect, useRef, useState } from "react";
import { getResults, listPersonas } from "@/lib/store";
import type { Persona } from "@/lib/types";
import { PersonaMark } from "./persona-mark";
import { optionStyles } from "./option-tag";

/**
 * The composer's plus menu. It holds one live-ish action and a set of ones the
 * product would grow into. The live one is the group interview: a client's
 * question is rarely about one person, so inviting another respondent or a whole
 * survey segment is the move closest to the point of the product, and its spread
 * would still trace to the data. The rest — files, connectors, research, spaces —
 * are greyed to show the shape of the surface without pretending it's built.
 */

function GreyItem({
  icon,
  label,
  chevron = false,
}: {
  icon: React.ReactNode;
  label: string;
  chevron?: boolean;
}) {
  return (
    <button
      type="button"
      disabled
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left opacity-45"
    >
      <span className="flex size-5 items-center justify-center text-ink-muted">
        {icon}
      </span>
      <span className="flex-1 text-[0.875rem] text-ink">{label}</span>
      {chevron ? (
        <span className="text-ink-muted" aria-hidden>
          &rsaquo;
        </span>
      ) : null}
    </button>
  );
}

export function ComposerPlusMenu({ current }: { current: Persona }) {
  const [open, setOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        setInviteOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const others = listPersonas().filter((persona) => persona.id !== current.id);
  const segments = getResults();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Add to the interview"
        className={`flex size-8 items-center justify-center rounded-lg transition-colors duration-150 ${
          open
            ? "bg-surface-sunk text-ink"
            : "text-ink-muted hover:bg-surface-sunk hover:text-ink"
        }`}
      >
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className="size-[1.125rem]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M8 3.5v9M3.5 8h9" />
        </svg>
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-40 mb-2 w-[21rem] animate-[fade-in_120ms_ease-out] overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-[0_16px_40px_-12px_rgba(29,27,23,0.28)]">
          <button
            type="button"
            onClick={() => setInviteOpen((value) => !value)}
            aria-expanded={inviteOpen}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-surface-sunk"
          >
            <span className="flex size-5 items-center justify-center text-ink-muted">
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
                <circle cx="6" cy="6" r="2.4" />
                <path d="M2.4 13c0-2 1.6-3.2 3.6-3.2 1 0 1.9.3 2.5.8M11 4.5v4M13 6.5h-4" />
              </svg>
            </span>
            <span className="flex-1 text-[0.875rem] text-ink">
              Invite to the interview
            </span>
            <span
              aria-hidden
              className={`text-ink-muted transition-transform duration-200 ${inviteOpen ? "rotate-180" : ""}`}
            >
              &#8964;
            </span>
          </button>

          {inviteOpen ? (
            <div className="mx-1 mb-1 rounded-lg border border-border bg-surface-sunk">
              <p className="px-3 pt-2.5 text-[0.75rem] text-ink-muted">
                Ask the same question to a group and read the spread. Not wired
                up in this prototype yet.
              </p>
              <div className="max-h-[13rem] overflow-y-auto py-1.5">
                <p className="label px-3 pt-1 pb-1">Add a respondent</p>
                {others.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    disabled
                    className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left opacity-60"
                  >
                    <PersonaMark
                      name={persona.name}
                      choice=""
                      personaId={persona.id}
                      size="sm"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[0.8125rem] text-ink">
                        {persona.name}
                      </span>
                      <span className="block truncate text-[0.75rem] text-ink-muted">
                        {persona.role}
                      </span>
                    </span>
                  </button>
                ))}

                <p className="label px-3 pt-2 pb-1">Add a segment</p>
                {segments.map((segment) => (
                  <button
                    key={segment.option}
                    type="button"
                    disabled
                    className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left opacity-60"
                  >
                    <span
                      className={`size-2 shrink-0 rounded-full ${optionStyles(segment.option).dot}`}
                    />
                    <span className="text-[0.8125rem] text-ink">
                      Everyone who chose {segment.option}
                    </span>
                    <span className="text-[0.75rem] text-ink-muted tabular-nums">
                      {Math.round(segment.share * 100)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="my-1.5 h-px bg-border" />

          <GreyItem
            label="Upload files or images"
            icon={
              <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 7.5 8 12.5a3 3 0 0 1-4.2-4.2l5-5a2 2 0 0 1 2.9 2.9l-5 5a1 1 0 0 1-1.5-1.5l4.6-4.6" />
              </svg>
            }
          />
          <GreyItem
            label="Research"
            icon={
              <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7" cy="7" r="4" />
                <path d="M10 10l3 3" />
              </svg>
            }
          />
          <GreyItem
            chevron
            label="Connectors"
            icon={
              <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2.5v4M10 2.5v4M4.5 6.5h7v2A3.5 3.5 0 0 1 8 12v0a3.5 3.5 0 0 1-3.5-3.5v-2ZM8 12v2" />
              </svg>
            }
          />
          <GreyItem
            chevron
            label="Spaces"
            icon={
              <svg viewBox="0 0 16 16" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 5.5a1 1 0 0 1 1-1h2.3l1 1.2h5.7a1 1 0 0 1 1 1v4.8a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V5.5Z" />
              </svg>
            }
          />
        </div>
      ) : null}
    </div>
  );
}
