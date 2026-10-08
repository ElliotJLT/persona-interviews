import { getResults } from "./store";
import type { SurveyResponse } from "./types";

/** First clause of a comment, used to quote a respondent back to themselves. */
function firstClause(comment: string): string {
  const clause = comment.split(/[,.]/)[0]?.trim() ?? comment;
  return clause.length > 64 ? `${clause.slice(0, 61).trimEnd()}...` : clause;
}

/**
 * Openings are derived from this respondent's own answer rather than offered as
 * generic prompts, so the first question is already about them.
 */
export function suggestedOpenings(response: SurveyResponse): string[] {
  const contender = getResults()
    .filter((result) => result.option !== response.choice)
    .sort((a, b) => b.share - a.share)[0];

  const openings = [`Why did you choose ${response.choice}?`];

  if (contender) {
    openings.push(
      `What would it take for you to choose ${contender.option} instead?`,
    );
  }

  openings.push(
    `You said "${firstClause(response.comment)}". What does that look like day to day?`,
  );

  return openings;
}

/**
 * Once a conversation is under way the suggestions turn into follow-ups. They
 * stay derived from this respondent's answer, and they deliberately probe the
 * seams the provenance system is built to show: how far the answer generalises,
 * what would move it, and where it stops being grounded.
 */
export function suggestedFollowUps(response: SurveyResponse): string[] {
  const contender = getResults()
    .filter((result) => result.option !== response.choice)
    .sort((a, b) => b.share - a.share)[0];

  const followUps = [`Would everyone who chose ${response.choice} say the same?`];

  if (contender) {
    followUps.push(`What would make you switch to ${contender.option}?`);
  } else {
    followUps.push("Where does your answer stop being backed by data?");
  }

  return followUps;
}
