import type { Citation, Conversation, Message } from "../types";

/**
 * Seeded conversations double as the demo of the citation system: every
 * persona claim is either grounded ([n] -> survey response or profile
 * attribute) or explicitly flagged as simulated extrapolation.
 */

export const conversations: Conversation[] = [
  {
    id: "con_morgan_summer",
    personaId: "per_morgan",
    surveyId: "sur_seasons",
    title: "Follow-up: why Summer",
    status: "completed",
    createdAt: "2026-07-22T10:02:00Z",
    updatedAt: "2026-07-22T10:09:00Z",
  },
  {
    id: "con_chen_autumn",
    personaId: "per_chen",
    surveyId: "sur_seasons",
    title: "Autumn and clear thinking",
    status: "in_progress",
    createdAt: "2026-07-23T15:40:00Z",
    updatedAt: "2026-07-23T15:44:00Z",
  },
  // Respondents with no interview yet. Every persona has a conversation record
  // so the interview surface has somewhere to open, started or not.
  {
    id: "con_sharma",
    personaId: "per_sharma",
    surveyId: "sur_seasons",
    title: "Untitled interview",
    status: "in_progress",
    createdAt: "2026-07-21T09:20:00Z",
    updatedAt: "2026-07-21T09:20:00Z",
  },
  {
    id: "con_osei",
    personaId: "per_osei",
    surveyId: "sur_seasons",
    title: "Untitled interview",
    status: "in_progress",
    createdAt: "2026-07-21T09:20:00Z",
    updatedAt: "2026-07-21T09:20:00Z",
  },
  {
    id: "con_lindqvist",
    personaId: "per_lindqvist",
    surveyId: "sur_seasons",
    title: "Untitled interview",
    status: "in_progress",
    createdAt: "2026-07-21T09:20:00Z",
    updatedAt: "2026-07-21T09:20:00Z",
  },
  {
    id: "con_moreau",
    personaId: "per_moreau",
    surveyId: "sur_seasons",
    title: "Untitled interview",
    status: "in_progress",
    createdAt: "2026-07-21T09:20:00Z",
    updatedAt: "2026-07-21T09:20:00Z",
  },
];

export const messages: Message[] = [
  {
    id: "msg_zs_1",
    conversationId: "con_morgan_summer",
    author: "user",
    content: "Why did you choose summer?",
    createdAt: "2026-07-22T10:02:10Z",
  },
  {
    id: "msg_zs_2",
    conversationId: "con_morgan_summer",
    author: "persona",
    content:
      "The honest answer is momentum. I said it in the survey: summer mirrors how I think about work and projects, pushing forward, building something new [1]. When everything is in high gear you can keep going without external friction.\n\nSome of that is the seat I'm in. Running a technology company [2] gives the year a build rhythm, and summer is the long uninterrupted stretch of it. Whether that holds for people outside that rhythm, I couldn't tell you. That part is me extrapolating from my own calendar [3].",
    createdAt: "2026-07-22T10:02:24Z",
  },
  {
    id: "msg_zs_3",
    conversationId: "con_morgan_summer",
    author: "user",
    content: "Would that answer hold for your engineers, or just for you?",
    createdAt: "2026-07-22T10:08:30Z",
  },
  {
    id: "msg_zs_4",
    conversationId: "con_morgan_summer",
    author: "persona",
    content:
      "Now you're asking me to speak for people who weren't in the survey, so treat this as a guess rather than data [1]. My instinct is that the momentum framing lands with senior people who set their own pace, and much less with anyone whose summer is dictated by someone else's roadmap. If that question matters to you, it's worth running as its own survey rather than taking my word for it.",
    createdAt: "2026-07-22T10:08:47Z",
  },
  {
    id: "msg_ca_1",
    conversationId: "con_chen_autumn",
    author: "user",
    content: "You said autumn is when your clearest thinking happens. What makes it different from the other seasons?",
    createdAt: "2026-07-23T15:40:20Z",
  },
  {
    id: "msg_ca_2",
    conversationId: "con_chen_autumn",
    author: "persona",
    content:
      "Two things from my answer: crisp air and no distractions [1]. The summer social calendar ends, the year-end scramble hasn't started, and I can sit with the portfolio properly. As a managing partner [2] the deep-work windows are what I actually get paid for; autumn simply has the most of them. The bit about the reviews showing it is my own scorekeeping, not something the survey measured [3].",
    createdAt: "2026-07-23T15:41:02Z",
  },
];

export const citations: Citation[] = [
  {
    id: "cit_zs_2_1",
    messageId: "msg_zs_2",
    marker: 1,
    source: { kind: "survey_response", responseId: "res_morgan" },
    quote:
      "It mirrors how I think about work and projects — pushing forward, building something new.",
  },
  {
    id: "cit_zs_2_2",
    messageId: "msg_zs_2",
    marker: 2,
    source: { kind: "profile_attribute", attribute: "industry" },
    quote: "Technology",
  },
  {
    id: "cit_zs_2_3",
    messageId: "msg_zs_2",
    marker: 3,
    source: {
      kind: "simulated",
      note: "Extrapolation beyond the survey data. Treat as the persona's inference, not evidence.",
    },
    quote: null,
  },
  {
    id: "cit_zs_4_1",
    messageId: "msg_zs_4",
    marker: 1,
    source: {
      kind: "simulated",
      note: "The persona is speculating about a population that was not surveyed.",
    },
    quote: null,
  },
  {
    id: "cit_ca_2_1",
    messageId: "msg_ca_2",
    marker: 1,
    source: { kind: "survey_response", responseId: "res_chen" },
    quote: "Crisp air, no distractions.",
  },
  {
    id: "cit_ca_2_2",
    messageId: "msg_ca_2",
    marker: 2,
    source: { kind: "profile_attribute", attribute: "role" },
    quote: "Managing Partner",
  },
  {
    id: "cit_ca_2_3",
    messageId: "msg_ca_2",
    marker: 3,
    source: {
      kind: "simulated",
      note: "Self-reported pattern; the survey did not measure review outcomes.",
    },
    quote: null,
  },
];
