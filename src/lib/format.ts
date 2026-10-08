const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Fixed UTC formatting so server and client render the same string. */
export function formatDay(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** Drop the [n] citation tokens so a reply reads cleanly out of context. */
export function stripMarkers(content: string): string {
  return content.replace(/\s*\[\d+\]/g, "").replace(/\s+/g, " ").trim();
}
