import type { Persona } from "@/lib/types";

/** Small line icons, sized to sit on the text baseline of a pill. */
const ICONS: Record<string, React.ReactNode> = {
  location: (
    <>
      <path d="M8 14s5-4.35 5-8A5 5 0 0 0 3 6c0 3.65 5 8 5 8Z" />
      <circle cx="8" cy="6" r="1.8" />
    </>
  ),
  industry: (
    <>
      <path d="M2.5 13.5V7l4 2.2V7l4 2.2V3.5h3v10Z" />
    </>
  ),
  seniority: (
    <>
      <path d="M2.5 6.5h11v7h-11z" />
      <path d="M6 6.5V4.5h4v2" />
    </>
  ),
  generation: (
    <>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
    </>
  ),
  gender: (
    <>
      <circle cx="8" cy="5.5" r="2.6" />
      <path d="M3.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
    </>
  ),
};

function Pill({ icon, value }: { icon: string; value: string }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-[0.8125rem] text-ink">
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className="size-[0.875rem] shrink-0 text-ink-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONS[icon]}
      </svg>
      {value}
    </li>
  );
}

/**
 * The profile as pills. Ordered by how much each attribute tends to explain an
 * answer, and capped so a respondent carrying twenty attributes still renders
 * as a readable row rather than a wall.
 */
export function AttributePills({
  persona,
  limit,
}: {
  persona: Persona;
  limit?: number;
}) {
  const all: Array<{ icon: string; value: string }> = [
    { icon: "location", value: persona.location },
    { icon: "industry", value: persona.industry },
    { icon: "seniority", value: persona.seniority },
    { icon: "generation", value: persona.generation },
    { icon: "gender", value: persona.gender },
  ];

  const shown = limit ? all.slice(0, limit) : all;
  const remaining = all.length - shown.length;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map((entry) => (
        <Pill key={entry.icon} icon={entry.icon} value={entry.value} />
      ))}
      {remaining > 0 ? (
        <li className="inline-flex items-center rounded-full border border-dashed border-border-strong px-2.5 py-1.5 text-[0.8125rem] text-ink-muted">
          +{remaining} more
        </li>
      ) : null}
    </ul>
  );
}
