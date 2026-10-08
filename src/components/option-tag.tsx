import { getOptionIndex } from "@/lib/store";

/**
 * The colour a survey option carries. Written out in full so Tailwind can see
 * the class names; the index into this list is the option's assignment.
 */
const OPTION_STYLES = [
  { dot: "bg-data-1", tint: "bg-data-1/12 text-data-1" },
  { dot: "bg-data-2", tint: "bg-data-2/12 text-data-2" },
  { dot: "bg-data-3", tint: "bg-data-3/14 text-data-3" },
  { dot: "bg-data-4", tint: "bg-data-4/12 text-data-4" },
];

export function optionStyles(option: string) {
  const index = getOptionIndex(option);
  return OPTION_STYLES[index] ?? OPTION_STYLES[0];
}

const stylesFor = optionStyles;

export function OptionTag({ option }: { option: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium ${stylesFor(option).tint}`}
    >
      {option}
    </span>
  );
}

export function OptionDot({ option }: { option: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-2 shrink-0 rounded-full ${stylesFor(option).dot}`}
    />
  );
}
