"use client";

import type { Citation } from "@/lib/types";

interface Entry {
  id: string;
  text: string;
  /** How many claims in this interview leaned on this source. */
  uses: number;
}

interface Group {
  key: "survey" | "profile" | "simulated";
  title: string;
  grounded: boolean;
  entries: Entry[];
}

/**
 * A mark per kind of source: a speech bubble for what the respondent said, a tag
 * for what their profile holds (attributes read like the pills the record
 * shows them as, not a person, so this stays distinct from the record's own
 * profile mark), an open question for what the survey never asked. Colour
 * still carries grounded against extrapolated, so the icon says which kind of
 * source and the tint says whether it is evidence.
 */
const ICONS: Record<Group["key"], React.ReactNode> = {
  survey: (
    <path d="M14 10a1.33 1.33 0 0 1-1.33 1.33H4.67l-2.67 2.67V3.33a1.33 1.33 0 0 1 1.33-1.33h9.33a1.33 1.33 0 0 1 1.33 1.33z" />
  ),
  profile: (
    <>
      <path d="M2.6 8.3V3.6a1 1 0 0 1 1-1h4.7a1 1 0 0 1 .71.29l4.99 4.99a1 1 0 0 1 0 1.42l-4.7 4.7a1 1 0 0 1-1.42 0L2.9 9.01a1 1 0 0 1-.3-.71Z" />
      <circle cx="5.6" cy="5.6" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  simulated: (
    <>
      <circle cx="8" cy="8" r="5.8" strokeDasharray="2.4 2" />
      <path d="M6.3 6.4a1.8 1.8 0 0 1 3.4.7c0 1.2-1.7 1.4-1.7 2.4M8 11.6v.1" />
    </>
  ),
};

function SourceIcon({ kind }: { kind: Group["key"] }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="size-[1.125rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[kind]}
    </svg>
  );
}

function IconSquare({ group }: { group: Group }) {
  return (
    <span
      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
        group.grounded
          ? "bg-grounded-soft text-grounded"
          : "bg-simulated-soft text-simulated"
      }`}
    >
      <SourceIcon kind={group.key} />
    </span>
  );
}

/**
 * One row per source, not per claim. Two claims resting on the same survey
 * quote is one source used twice, and listing it twice would read as a fault
 * in the very panel meant to establish that the evidence is handled carefully.
 */
function group(citations: Citation[]): Group[] {
  const groups: Group[] = [
    { key: "survey", title: "Their survey answer", grounded: true, entries: [] },
    { key: "profile", title: "Their profile", grounded: true, entries: [] },
    { key: "simulated", title: "Not in the data", grounded: false, entries: [] },
  ];

  for (const citation of citations) {
    const target =
      citation.source.kind === "survey_response"
        ? groups[0]
        : citation.source.kind === "profile_attribute"
          ? groups[1]
          : groups[2];

    const text =
      citation.source.kind === "simulated"
        ? citation.source.note
        : (citation.quote ?? "");

    const existing = target.entries.find((entry) => entry.text === text);
    if (existing) existing.uses += 1;
    else target.entries.push({ id: citation.id, text, uses: 1 });
  }

  return groups.filter((entry) => entry.entries.length > 0);
}

const PanelIcon = (
  <svg
    viewBox="0 0 16 16"
    aria-hidden
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
  >
    <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
    <path d="M6 3v10" />
  </svg>
);

/**
 * The interview's evidence, as its own column. Collapsed it is a rail of the
 * source kinds in play; expanded it lists each source as a card. Either way it
 * answers the question a client takes into a decision: how much of this
 * conversation was evidence and how much was the model reasoning.
 */
export function SourceSummary({
  citations,
  collapsed,
  onExpand,
  onCollapse,
}: {
  citations: Citation[];
  collapsed: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const groups = group(citations);

  if (collapsed) {
    return (
      <div
        aria-label="Sources, collapsed"
        className="flex h-full w-full flex-col items-center gap-2 bg-card py-4"
      >
        <button
          type="button"
          onClick={onExpand}
          aria-label="Expand sources"
          title="Sources"
          className="flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-surface-sunk hover:text-ink"
        >
          {PanelIcon}
        </button>

        {groups.length > 0 ? (
          <span className="my-1 h-px w-6 bg-border" />
        ) : null}

        {groups.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={onExpand}
            title={`${entry.title} · ${entry.entries.length}`}
            className="transition-transform duration-150 hover:scale-105"
          >
            <IconSquare group={entry} />
            <span className="sr-only">
              {entry.title}, {entry.entries.length}
            </span>
          </button>
        ))}
      </div>
    );
  }

  const grounded = citations.filter(
    (citation) => citation.source.kind !== "simulated",
  ).length;
  const simulated = citations.length - grounded;

  return (
    <div
      aria-label="Sources used in this interview"
      className="flex h-full w-full flex-col bg-card"
    >
      <div className="flex h-[4.75rem] shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-5">
        <p className="label">Sources</p>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Collapse sources"
          title="Collapse"
          className="flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-surface-sunk hover:text-ink"
        >
          {PanelIcon}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-sunk px-4 py-4">
        {citations.length === 0 ? (
          <p className="px-1 text-[0.8125rem] leading-relaxed text-ink-muted">
            Nothing cited yet. Every claim in a reply appears here with what it
            was drawn from.
          </p>
        ) : (
          <>
            <div className="mb-4 flex gap-2 px-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-grounded-soft px-2.5 py-1 text-[0.75rem] font-medium text-grounded">
                <span className="size-1.5 rounded-full bg-grounded" />
                {grounded} grounded
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-simulated bg-simulated-soft px-2.5 py-1 text-[0.75rem] font-medium text-simulated">
                {simulated} extrapolated
              </span>
            </div>

            <ul className="flex flex-col gap-2.5">
              {groups.flatMap((entry) =>
                entry.entries.map((source) => (
                  <li
                    key={source.id}
                    className={`flex gap-3 rounded-xl border bg-card p-3 ${
                      entry.grounded
                        ? "border-border"
                        : "border-dashed border-border-strong"
                    }`}
                  >
                    <IconSquare group={entry} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[0.75rem] font-medium ${entry.grounded ? "text-grounded" : "text-simulated"}`}
                      >
                        {entry.title}
                      </p>
                      <p className="mt-1 text-[0.8125rem] leading-relaxed">
                        {entry.grounded ? (
                          <span className="verbatim text-ink">
                            &ldquo;{source.text}&rdquo;
                          </span>
                        ) : (
                          <span className="text-ink-muted">{source.text}</span>
                        )}
                      </p>
                      {source.uses > 1 ? (
                        <p className="mt-1.5 text-[0.6875rem] text-ink-muted">
                          Cited {source.uses} times
                        </p>
                      ) : null}
                    </div>
                  </li>
                )),
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
