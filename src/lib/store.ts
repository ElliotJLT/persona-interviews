import {
  citations,
  conversations,
  insights,
  messages,
  personas,
  survey,
  surveyResponses,
  surveyResults,
} from "./fixtures";
import type {
  Citation,
  Conversation,
  Insight,
  Message,
  Persona,
  Survey,
  SurveyResponse,
} from "./types";

export function listInsights(): Insight[] {
  return insights;
}

/**
 * Read layer over the mock data. Components go through these functions rather
 * than importing fixtures directly, so the same call sites work when the
 * fixtures are replaced by real queries.
 */

export function getSurvey(): Survey {
  return survey;
}

export function listPersonas(): Persona[] {
  return personas;
}

export function getPersona(personaId: string): Persona | undefined {
  return personas.find((persona) => persona.id === personaId);
}

export function getResponse(personaId: string): SurveyResponse | undefined {
  return surveyResponses.find((response) => response.personaId === personaId);
}

export interface OptionShare {
  option: string;
  count: number;
  share: number;
}

/** Shares are derived from counts so the two can never disagree. */
export function getResults(): OptionShare[] {
  const total = surveyResults.reduce((sum, result) => sum + result.count, 0);
  return survey.options.map((option) => {
    const result = surveyResults.find((entry) => entry.option === option);
    const count = result?.count ?? 0;
    return { option, count, share: total === 0 ? 0 : count / total };
  });
}

export function listConversations(): Conversation[] {
  return [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Conversations that have at least one message. These are the saved interviews. */
export function listStartedConversations(): Conversation[] {
  return listConversations().filter((conversation) =>
    messages.some((message) => message.conversationId === conversation.id),
  );
}

export function getConversationForPersona(personaId: string): Conversation | undefined {
  return conversations.find((conversation) => conversation.personaId === personaId);
}

export function getConversation(conversationId: string): Conversation | undefined {
  return conversations.find((conversation) => conversation.id === conversationId);
}

export function getMessages(conversationId: string): Message[] {
  return messages.filter((message) => message.conversationId === conversationId);
}

export function getCitations(messageId: string): Citation[] {
  return citations
    .filter((citation) => citation.messageId === messageId)
    .sort((a, b) => a.marker - b.marker);
}

/**
 * Survey options carry a categorical colour, assigned once per survey and
 * reused everywhere that option appears. The index is the assignment.
 */
export function getOptionIndex(option: string): number {
  return survey.options.indexOf(option);
}
