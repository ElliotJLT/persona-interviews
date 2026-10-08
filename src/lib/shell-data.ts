import {
  getCitations,
  getConversationForPersona,
  getMessages,
  getResponse,
  getResults,
  getSurvey,
  listInsights,
  listPersonas,
  type OptionShare,
} from "./store";
import type {
  Citation,
  Conversation,
  Insight,
  Message,
  Persona,
  Survey,
  SurveyResponse,
} from "./types";

export interface ShellRespondent {
  persona: Persona;
  response: SurveyResponse | undefined;
  conversationId: string | undefined;
  hasTranscript: boolean;
}

/**
 * Every persona's interview slot, started or not. The recent list is built on
 * the client from live transcripts, so a conversation begun this session shows
 * up beside the seeded ones rather than waiting on a server the mock lacks.
 */
export interface ShellConversation {
  conversationId: string;
  personaId: string;
  personaName: string;
  title: string;
  choice: string;
  status: Conversation["status"];
}

export interface ShellData {
  survey: Survey;
  results: OptionShare[];
  insights: Insight[];
  respondents: ShellRespondent[];
  conversations: ShellConversation[];
  transcripts: Record<string, { messages: Message[]; citations: Citation[] }>;
}

/** Everything the persistent shell needs, on every route. */
export function getShellData(): ShellData {
  return {
    survey: getSurvey(),
    results: getResults(),
    insights: listInsights(),
    respondents: listPersonas().map((persona) => {
      const conversation = getConversationForPersona(persona.id);
      return {
        persona,
        response: getResponse(persona.id),
        conversationId: conversation?.id,
        hasTranscript: conversation
          ? getMessages(conversation.id).length > 0
          : false,
      };
    }),
    transcripts: Object.fromEntries(
      listPersonas()
        .map((persona) => getConversationForPersona(persona.id))
        .filter((conversation) => conversation !== undefined)
        .map((conversation) => {
          const messages = getMessages(conversation.id);
          return [
            conversation.id,
            {
              messages,
              citations: messages.flatMap((message) => getCitations(message.id)),
            },
          ];
        }),
    ),
    conversations: listPersonas().flatMap((persona) => {
      const conversation = getConversationForPersona(persona.id);
      if (!conversation) return [];
      return [
        {
          conversationId: conversation.id,
          personaId: persona.id,
          personaName: persona.name,
          title: conversation.title,
          choice: getResponse(persona.id)?.choice ?? "",
          status: conversation.status,
        },
      ];
    }),
  };
}
