import type { Survey, SurveyResponse, SurveyResult } from "../types";

export const survey: Survey = {
  id: "sur_seasons",
  question: "If you could live in one season year-round, which would you choose?",
  options: ["Spring", "Summer", "Autumn", "Winter"],
  audience: "Technology and finance leaders",
  respondentCount: 1000,
  createdAt: "2026-07-21T09:14:00Z",
};

export const surveyResults: SurveyResult[] = [
  { id: "srs_spring", surveyId: "sur_seasons", option: "Spring", count: 250 },
  { id: "srs_summer", surveyId: "sur_seasons", option: "Summer", count: 250 },
  { id: "srs_autumn", surveyId: "sur_seasons", option: "Autumn", count: 396 },
  { id: "srs_winter", surveyId: "sur_seasons", option: "Winter", count: 104 },
];

export const surveyResponses: SurveyResponse[] = [
  {
    id: "res_morgan",
    surveyId: "sur_seasons",
    personaId: "per_morgan",
    choice: "Summer",
    comment:
      "It mirrors how I think about work and projects — pushing forward, building something new. It's a season that's all about progress, you know?",
  },
  {
    id: "res_sharma",
    surveyId: "sur_seasons",
    personaId: "per_sharma",
    choice: "Spring",
    comment:
      "That feeling of things just coming alive, everything pushing upwards. That's what building an awesome team feels like to me. You start with these seeds, right?",
  },
  {
    id: "res_osei",
    surveyId: "sur_seasons",
    personaId: "per_osei",
    choice: "Spring",
    comment:
      "It's all about new beginnings, that fresh burst of growth after winter. For me that feeling perfectly mirrors the startup hustle.",
  },
  {
    id: "res_chen",
    surveyId: "sur_seasons",
    personaId: "per_chen",
    choice: "Autumn",
    comment:
      "Crisp air, no distractions. It's the season where I actually get my clearest thinking done, and the portfolio reviews show it.",
  },
  {
    id: "res_lindqvist",
    surveyId: "sur_seasons",
    personaId: "per_lindqvist",
    choice: "Autumn",
    comment:
      "Harvest season. You find out whether the year's bets actually paid off, and I like living close to that answer.",
  },
  {
    id: "res_moreau",
    surveyId: "sur_seasons",
    personaId: "per_moreau",
    choice: "Winter",
    comment:
      "Everyone else slows down, which is exactly when the interesting deals surface. Quiet markets reward people who stay at their desk.",
  },
];
