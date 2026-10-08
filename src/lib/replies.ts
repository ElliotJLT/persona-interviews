import type { Citation, CitationSource, Persona, SurveyResponse } from "./types";
import { getResults } from "./store";

export interface StagedReply {
  content: string;
  citations: Array<{
    marker: number;
    source: CitationSource;
    quote: string | null;
  }>;
}

/**
 * The mocked reply engine. It exists to demonstrate the citation system rather
 * than to imitate a language model, so every reply it produces is assembled
 * from the respondent's own record: a claim is either traced to their survey
 * response, traced to a profile attribute, or explicitly marked as the model
 * reasoning past what it knows.
 */

type Intent = "why" | "counterfactual" | "elaborate" | "beyond" | "general";

const BEYOND_SIGNALS = [
  "everyone",
  "most people",
  "your team",
  "your staff",
  "your employees",
  "colleagues",
  "engineers",
  "other people",
  "others",
  "predict",
  "will happen",
  "next year",
  "generalise",
  "generalize",
];

function detect(question: string, response: SurveyResponse): Intent {
  const text = question.toLowerCase();

  if (BEYOND_SIGNALS.some((signal) => text.includes(signal))) return "beyond";
  if (
    text.includes("instead") ||
    text.includes("would it take") ||
    text.includes("switch") ||
    text.includes("make you")
  ) {
    return "counterfactual";
  }
  if (text.includes("you said") || text.includes("what did you mean")) {
    return "elaborate";
  }
  if (text.includes("why") && text.includes(response.choice.toLowerCase())) {
    return "why";
  }
  if (text.includes("why")) return "why";
  return "general";
}

function firstClause(comment: string): string {
  const clause = comment.split(/[,.]/)[0]?.trim() ?? comment;
  return clause.charAt(0).toLowerCase() + clause.slice(1);
}

function contender(choice: string): string {
  return (
    getResults()
      .filter((result) => result.option !== choice)
      .sort((a, b) => b.share - a.share)[0]?.option ?? "another option"
  );
}

export function stageReply(
  question: string,
  persona: Persona,
  response: SurveyResponse,
): StagedReply {
  const intent = detect(question, response);
  const groundedInResponse: CitationSource = {
    kind: "survey_response",
    responseId: response.id,
  };

  switch (intent) {
    case "why":
      return {
        content: `It comes back to what I put in the survey: ${firstClause(response.comment)} [1]. That is the honest core of it.\n\nThe rest is the seat I am in. Working in ${persona.industry.toLowerCase()} [2] shapes how the year is structured for me, and ${response.choice.toLowerCase()} is where that rhythm sits most comfortably. How much of that is the season and how much is the job, I could not separate for you [3].`,
        citations: [
          {
            marker: 1,
            source: groundedInResponse,
            quote: response.comment,
          },
          {
            marker: 2,
            source: { kind: "profile_attribute", attribute: "industry" },
            quote: persona.industry,
          },
          {
            marker: 3,
            source: {
              kind: "simulated",
              note: "The survey did not ask how the respondent separates seasonal preference from working conditions.",
            },
            quote: null,
          },
        ],
      };

    case "counterfactual":
      return {
        content: `Nothing in the survey asked me that, so treat this as reasoning rather than a recorded answer [1].\n\nWhat I can tell you is what my answer rested on: "${firstClause(response.comment)}" [2]. Take that away and ${contender(response.choice)} becomes arguable. Leave it in place and it does not. If the difference matters to your decision, it is worth putting to the population as its own question rather than taking mine for it.`,
        citations: [
          {
            marker: 1,
            source: {
              kind: "simulated",
              note: "A counterfactual. The respondent was asked what they chose, not what would change their mind.",
            },
            quote: null,
          },
          { marker: 2, source: groundedInResponse, quote: response.comment },
        ],
      };

    case "elaborate":
      return {
        content: `That was my phrasing, so I will stand behind it: ${firstClause(response.comment)} [1].\n\nDay to day it looks like the work I do as ${persona.role.toLowerCase()} [2] rather than anything about weather. The specifics of my week are me filling in a picture the survey never asked about [3].`,
        citations: [
          { marker: 1, source: groundedInResponse, quote: response.comment },
          {
            marker: 2,
            source: { kind: "profile_attribute", attribute: "role" },
            quote: persona.role,
          },
          {
            marker: 3,
            source: {
              kind: "simulated",
              note: "Illustrative detail generated from the profile, not collected in the survey.",
            },
            quote: null,
          },
        ],
      };

    case "beyond":
      return {
        content: `I would be speaking for people who were not in this survey, so I am going to be clear that this is a guess [1].\n\nMy own answer came from one thing, that "${firstClause(response.comment)}" [2], and I have no way of knowing how far that travels. If you need that answer, run it as a survey across the population rather than taking it from one respondent.`,
        citations: [
          {
            marker: 1,
            source: {
              kind: "simulated",
              note: "The question asks about a population this respondent cannot speak for. Nothing here is evidence.",
            },
            quote: null,
          },
          { marker: 2, source: groundedInResponse, quote: response.comment },
        ],
      };

    default:
      return {
        content: `I can speak to two things with any confidence: the answer I gave in this survey [1], and the profile behind it, including working in ${persona.industry.toLowerCase()} at ${persona.seniority.toLowerCase()} [2]. Ask me about either and you will get something grounded.\n\nOutside those, I am reasoning rather than reporting, and I will say so when I am [3].`,
        citations: [
          { marker: 1, source: groundedInResponse, quote: response.comment },
          {
            marker: 2,
            source: { kind: "profile_attribute", attribute: "seniority" },
            quote: `${persona.seniority}, ${persona.industry}`,
          },
          {
            marker: 3,
            source: {
              kind: "simulated",
              note: "A statement about the respondent's own limits, not a survey finding.",
            },
            quote: null,
          },
        ],
      };
  }
}

/** Turn a staged reply into citation rows for a given message id. */
export function citationsFor(
  messageId: string,
  reply: StagedReply,
): Citation[] {
  return reply.citations.map((citation) => ({
    id: `cit_${messageId}_${citation.marker}`,
    messageId,
    marker: citation.marker,
    source: citation.source,
    quote: citation.quote,
  }));
}
