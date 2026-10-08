import Image from "next/image";
import { getOptionIndex, getPersona } from "@/lib/store";

const TINTS = ["--data-1", "--data-2", "--data-3", "--data-4"];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Stable pseudo-random from a string, so a respondent's mark never changes. */
function seedOf(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const SIZES = {
  sm: { box: "size-8", text: "text-[0.6875rem]" },
  md: { box: "size-11", text: "text-sm" },
  lg: { box: "size-20", text: "text-xl" },
} as const;

/**
 * A respondent's face. Where a portrait is loaded it carries the mark, tinted
 * to their answer; otherwise a bloom generated from their id stands in, so the
 * fallback is still recognisable and consistent. Initials sit underneath both,
 * which is what a portrait that fails to load falls back to.
 */
export function PersonaMark({
  name,
  choice,
  personaId,
  size = "md",
}: {
  name: string;
  choice: string;
  personaId?: string;
  size?: keyof typeof SIZES;
}) {
  const tint = `var(${TINTS[getOptionIndex(choice)] ?? TINTS[0]})`;
  const seed = seedOf(personaId ?? name);
  const dimensions = SIZES[size];
  const avatarUrl = personaId ? getPersona(personaId)?.avatarUrl : null;

  // Three soft blooms placed from the seed give each respondent a distinct
  // texture while staying inside their answer's colour.
  const blooms = [0, 1, 2].map((i) => {
    const angle = ((seed >> (i * 3)) % 360) * (Math.PI / 180);
    const distance = 18 + ((seed >> (i * 5)) % 26);
    return {
      cx: 50 + Math.round(Math.cos(angle) * distance),
      cy: 50 + Math.round(Math.sin(angle) * distance),
      r: 26 + ((seed >> (i * 7)) % 22),
      opacity: 0.55 - i * 0.13,
    };
  });

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${dimensions.box}`}
      style={{ backgroundColor: `color-mix(in oklab, ${tint} 12%, white)` }}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <filter id={`bloom-${seed}`}>
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <g filter={`url(#bloom-${seed})`}>
          {blooms.map((bloom, i) => (
            <circle
              key={i}
              cx={bloom.cx}
              cy={bloom.cy}
              r={bloom.r}
              fill={tint}
              opacity={bloom.opacity}
            />
          ))}
        </g>
      </svg>
      <span
        className={`relative font-medium tracking-wide ${dimensions.text}`}
        style={{ color: `color-mix(in oklab, ${tint} 72%, black)` }}
      >
        {initials(name)}
      </span>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          fill
          sizes="80px"
          className="object-cover"
        />
      ) : null}
    </span>
  );
}
