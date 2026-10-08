# Decisions

The calls that shaped this build, and why. Each one had a plausible alternative, so the reasoning matters more than the outcome.

## Keep the society, and make it carry meaning

The obvious move on a problem about chat is to build the chat and treat the survey view as an entry point. I kept the population graph as the centre of the experience instead. It is the one view that says this is a society rather than a spreadsheet, and dropping it would have produced a competent research dashboard with no relationship to the product it belongs to.

The condition I put on keeping it: in the old chat the disc is decorative, with position and proximity encoding nothing. So respondents are now drawn toward the others who answered as they did, and tied to their nearest neighbours. Mute an option and that community dims in place. The shape of the picture is now a finding.

## Overview first, then detail: browse before chat

The chat is the most valuable thing in the product, which makes it tempting to put it in front of the user immediately. That is the wrong order. Interviewing one respondent is drilling into a population you have not looked at yet, so it has to come second.

This follows Shneiderman's visual information-seeking mantra: **overview first, zoom and filter, then details on demand** (*The Eyes Have It*, 1996). The society is the overview, the result legend is the filter, the respondent record is the detail, and the interview is the deepest level. Presenting all of it at once is not generosity, it is cost: information foraging theory (Pirolli and Card at Xerox PARC) describes people sampling cheaply for scent before committing effort to a patch, and Hick's law says a wall of simultaneous choice slows the decision rather than helping it.

So the flow is three deliberate steps. Browse the society. Select a respondent and read their record. Then unlock the interview, which takes over the screen because by that point it deserves to.

## No preview card between the map and the record

The first version put a card on the map when you selected a respondent, carrying their name, role, answer, quote and attributes. The record panel then showed the same fields again. That is two clicks to do a one-click job and two components maintaining one set of content. Selecting a respondent now opens their record directly.

## Fade, never remove

Filtering an option dims that community where it sits rather than deleting it, and opening a respondent recedes the rest of the society rather than clearing it. A filter that empties the screen destroys the context that made the filter worth applying. The same rule drives the interview view: you always see how much of the population you are not looking at.

## Constructed identity, not a photograph

The old chat shows a photoreal portrait of a named public figure beside a first-person quote. Every signal there says *this is what he said*, when the truthful claim is *this is what the model predicts someone like him would say*. Respondents carry a generated mark instead. It is the difference between a record and a simulation, and the interface should not blur it.

## Provenance is the product, not a disclaimer

The old chat opens the chat with a line saying all views are fictional. That concedes the trust problem in the abstract and manages none of it in the specific. The blanket notice is gone. In its place, claims are marked individually as grounded in the survey response, drawn from the profile, or extrapolated beyond both. A user should be able to act on one sentence and discount the next.

## The context column gives way

Survey results, the filter and the insight list are browsing tools. During an interview they compete for width with the two things that matter: the respondent and the conversation. The column steps aside rather than staying for the sake of consistency, and the colour key it was holding moves onto the map where a legend belongs.

## Citations in the flow, not behind a hover

Every persona claim carries a marker, and the sources sit under the reply rather than in a tooltip. Evidence hidden behind an interaction is evidence most people never see, and the point is for a client to weigh a claim at the moment they read it.

Grounded and simulated are separated by shape as well as colour: solid markers for claims traced to the survey response or the profile, dashed for the model reasoning past both. Colour alone would fail anyone who cannot separate the two hues, and this distinction is the one the entire feature rests on.

## The respondent is allowed to refuse

Ask about people who were not surveyed and the persona declines, says plainly that it would be guessing, and suggests running the question across the population instead. A system with no visible failure states gives no signal worth trusting, so refusal is built as a feature rather than treated as a gap. It is also the honest commercial answer: the right response to a question one respondent cannot answer is another survey.

## Transcripts survive a reload

"I keep losing my chats after I log off" is answered by actually persisting them, not by showing a saved-interviews list that forgets. Transcripts are written to browser storage and read back through React's external-store API, so a saved interview is still there after a refresh.

## Provenance sits with the evidence, not with the button

"Where answers come from" explains the quote and the profile, so it closes the record after both rather than sitting beside the interview button. In the footer it reads as a footnote to the action, which is the wrong thing to qualify.

## One call to action on the record, not a menu of questions

The record's job is deciding whether this respondent is worth an interview, not composing the first question. Openings are offered inside the interview, one click later, so putting them on the record too would leave two screens maintaining one set of content, which is what made the preview card worth deleting.

## An evidence summary for the whole interview

Per-claim markers answer "is this sentence grounded". The sources panel answers the question a client actually carries into a decision: how much of this conversation was evidence and how much was the model reasoning. It counts grounded against extrapolated across the transcript and lists each source once, with how many claims leaned on it.

## Modes hand width to each other

Every column is flexible with an animated cap, so moving from browsing to a record to an interview is one panel giving width to the next rather than a cut between layouts. The society fades as it goes so its contents never reflow in front of the user.
