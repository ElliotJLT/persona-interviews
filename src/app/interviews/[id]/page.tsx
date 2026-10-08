import { notFound } from "next/navigation";
import { ConversationPanel } from "@/components/conversation-panel";
import { suggestedOpenings } from "@/lib/openings";
import {
  getCitations,
  getConversation,
  getMessages,
  getPersona,
  getResponse,
} from "@/lib/store";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conversation = getConversation(id);
  if (!conversation) notFound();

  const persona = getPersona(conversation.personaId);
  if (!persona) notFound();

  const response = getResponse(persona.id);
  const messages = getMessages(conversation.id);

  return (
    <ConversationPanel
      conversationId={conversation.id}
      persona={persona}
      response={response}
      seedMessages={messages}
      seedCitations={messages.flatMap((message) => getCitations(message.id))}
      openings={response ? suggestedOpenings(response) : []}
    />
  );
}
