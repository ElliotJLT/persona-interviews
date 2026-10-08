/**
 * Domain model for the persona chat.
 *
 * Shaped the way the production schema would be: one interface per table,
 * cross-references as ids (foreign keys), no denormalised nesting. The mock
 * store reads like a database so the real one can slot in behind the same
 * contracts.
 */

export interface Survey {
  id: string;
  question: string;
  options: string[];
  audience: string;
  respondentCount: number;
  createdAt: string;
}

/**
 * Materialised aggregate per option. Counts are the stored truth; shares are
 * derived at read time so the two can never drift apart.
 */
export interface SurveyResult {
  id: string;
  surveyId: string;
  option: string;
  count: number;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  gender: string;
  generation: string;
  seniority: string;
  industry: string;
  avatarUrl: string | null;
}

/** A persona's answer to one survey — the ground truth a chat can cite. */
export interface SurveyResponse {
  id: string;
  surveyId: string;
  personaId: string;
  choice: string;
  comment: string;
}

/**
 * Where a cited claim comes from. `simulated` is a first-class source:
 * extrapolation is allowed, but it is never allowed to look like data.
 */
export type CitationSource =
  | { kind: "survey_response"; responseId: string }
  | { kind: "profile_attribute"; attribute: keyof Persona }
  | { kind: "simulated"; note: string };

export interface Citation {
  id: string;
  messageId: string;
  /** Position marker matching a [n] token in the message content. */
  marker: number;
  source: CitationSource;
  /** Verbatim excerpt from the source, when one exists. */
  quote: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  author: "user" | "persona";
  /** Plain text with [n] citation markers for persona messages. */
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  personaId: string;
  surveyId: string;
  title: string;
  /**
   * Where the interview stands. `completed` is a durable state a researcher
   * sets when they are done with someone; everything live is `in_progress`.
   */
  status: "in_progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

/**
 * A persona reply a researcher pinned to the project's findings. It carries its
 * own copy of the message and the sources behind it, so a finding stays intact
 * as evidence even after the interview it came from moves on.
 */
export interface Finding {
  id: string;
  conversationId: string;
  personaId: string;
  personaName: string;
  choice: string;
  content: string;
  citations: Citation[];
  savedAt: string;
}

/**
 * A finding written against the survey. The stat is stored apart from the prose
 * so the interface can lead with the number instead of burying it in a
 * paragraph.
 */
export interface Insight {
  id: string;
  surveyId: string;
  stat: string | null;
  headline: string;
  detail: string;
}
