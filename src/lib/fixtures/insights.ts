import type { Insight } from "../types";

export const insights: Insight[] = [
  {
    id: "ins_autumn_lead",
    surveyId: "sur_seasons",
    stat: "40%",
    headline: "Autumn leads, and it leads on focus",
    detail:
      "Autumn outpaces Spring and Summer, tied at 25% each. Respondents describe it as the season with the fewest interruptions rather than the most pleasant weather.",
  },
  {
    id: "ins_winter_gap",
    surveyId: "sur_seasons",
    stat: "10%",
    headline: "Winter is the minority answer worth reading",
    detail:
      "Too small a segment to interpret from the chart alone. The respondents who chose it frame quiet markets as an advantage, which is a different argument from the rest of the population.",
  },
  {
    id: "ins_productivity_frame",
    surveyId: "sur_seasons",
    stat: null,
    headline: "Season is being read as a work rhythm, not a preference",
    detail:
      "Across every option, respondents justify their answer through professional momentum: build cycles, hiring waves, portfolio reviews. Almost nobody argues from comfort.",
  },
];
