import { formatDay, formatTime } from "./format";
import type { Citation, CitationSource, Message, Persona, SurveyResponse } from "./types";

/**
 * A transcript ends up in a deck or a board paper, so the provenance has to
 * travel with the quote or the trust work stops at the edge of the app. Each
 * persona reply carries its own markers as footnotes: grounded quotes and the
 * flagged extrapolations, exactly as they read on screen.
 */

function sourceLabel(source: CitationSource): string {
  switch (source.kind) {
    case "survey_response":
      return "Grounded — their survey answer";
    case "profile_attribute":
      return "Grounded — their profile";
    case "simulated":
      return "Extrapolation — not in the data";
  }
}

function footnote(citation: Citation): string {
  const label = sourceLabel(citation.source);
  const detail =
    citation.source.kind === "simulated"
      ? citation.source.note
      : `"${citation.quote ?? ""}"`;
  return `  [${citation.marker}] ${label}: ${detail}`;
}

function block(
  message: Message,
  citations: Citation[],
  personaName: string,
): string {
  const who = message.author === "user" ? "Interviewer" : personaName;
  const stamp = `${formatDay(message.createdAt)} ${formatTime(message.createdAt)}`;
  const lines = [`${who} · ${stamp}`, message.content];

  if (message.author === "persona") {
    const notes = citations
      .filter((citation) => citation.messageId === message.id)
      .sort((a, b) => a.marker - b.marker)
      .map(footnote);
    if (notes.length > 0) lines.push("", ...notes);
  }

  return lines.join("\n");
}

export function buildTranscript(
  persona: Persona,
  response: SurveyResponse | undefined,
  messages: Message[],
  citations: Citation[],
): string {
  const grounded = citations.filter(
    (citation) => citation.source.kind !== "simulated",
  ).length;
  const extrapolated = citations.length - grounded;

  const header = [
    `Interview with ${persona.name}`,
    `${persona.role} · ${persona.company}`,
    response ? `Answered: ${response.choice} — "${response.comment}"` : "",
    "",
    `${grounded} grounded claims · ${extrapolated} flagged as extrapolation`,
    "Every claim below is marked with where it came from. Grounded claims quote",
    "the survey answer or a profile attribute; extrapolation is the model",
    "reasoning past the data, and is never presented as evidence.",
    "",
    "————————————————————————————————",
    "",
  ].join("\n");

  const body = messages
    .map((message) => block(message, citations, persona.name))
    .join("\n\n");

  return `${header}${body}\n`;
}

/** Turn the transcript into a download without a round-trip to a server. */
export function downloadTranscript(
  persona: Persona,
  response: SurveyResponse | undefined,
  messages: Message[],
  citations: Citation[],
): void {
  const text = buildTranscript(persona, response, messages, citations);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const slug = persona.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `interview-${slug}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
