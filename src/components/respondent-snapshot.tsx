import type { Persona, SurveyResponse } from "@/lib/types";
import { OptionTag } from "./option-tag";
import { PersonaMark } from "./persona-mark";

function opening(comment: string, limit = 96): string {
  if (comment.length <= limit) return comment;
  return `${comment.slice(0, limit).trimEnd()}…`;
}

/**
 * The middle rung of the drill-down. A dot carries community and answer; the
 * record carries everything. This sits between them and answers the only
 * question a hover is really asking, which is whether this respondent is worth
 * opening: who they are, what they chose, and the start of why.
 */
export function RespondentSnapshot({
  persona,
  response,
}: {
  persona: Persona;
  response: SurveyResponse | undefined;
}) {
  const firstName = persona.name.split(" ")[0];

  return (
    <div className="w-[19rem] overflow-hidden rounded-xl border border-border bg-card shadow-[0_16px_40px_-12px_rgba(29,27,23,0.28)]">
      <div className="flex items-start gap-3 px-4 pt-4">
        <PersonaMark
          name={persona.name}
          choice={response?.choice ?? ""}
          personaId={persona.id}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.875rem] leading-tight font-medium text-ink">
            {persona.name}
          </p>
          <p className="mt-0.5 truncate text-[0.75rem] leading-snug text-ink-muted">
            {persona.role}
          </p>
        </div>
      </div>

      {response ? (
        <div className="px-4 pt-3">
          <OptionTag option={response.choice} />
          <p className="verbatim mt-2.5 text-[0.8125rem] leading-relaxed text-ink">
            &ldquo;{opening(response.comment)}&rdquo;
          </p>
        </div>
      ) : null}

      <p className="mt-3.5 flex items-center gap-1.5 border-t border-border bg-surface-sunk px-4 py-2.5 text-[0.75rem] font-medium text-accent">
        Dive into the data and interview {firstName}
        <span
          aria-hidden
          className="animate-[nudge-x_900ms_ease-in-out_infinite]"
        >
          &rarr;
        </span>
      </p>
    </div>
  );
}
