# Persona interviews you can audit

An interview screen for synthetic research. You run a survey on a population of AI personas, then interview one respondent to find out why they answered the way they did.

A plain persona chat works, and nobody trusts it or knows what it's for. Those are different problems with a common cause: nothing in the interface says where an answer came from.

**Start here:** open the society, select a lit respondent, read their record, then interview them. Ask *"why did you choose Spring?"*, then ask *"would everyone on your team say the same?"* and watch what the persona does with the second one.

## The problems, and what the build does about them

| The problem | What's actually wrong | What's built |
|---|---|---|
| Nobody knows when or why to open a chat | The chat opens cold. Its only call to action names the mechanism, not the reason. | Interviews are reached through the population, so you arrive having chosen someone and knowing why. An interview with no messages opens with questions derived from that respondent's own answer, not generic prompts. |
| Interviews are lost on log-off | No persistence. The chat is a modal over a blurred graph and closing it destroys the session. | Every started interview lands in a Recent Interviews list on the first page, with the last thing said and whether it's finished, one click to resume. That's the actual fix: not losing the open chat is table stakes, but losing chats is answered by having somewhere to find them again. The transcript itself also survives a refresh mid-interview, held in browser storage and read back through React's external-store API. |
| There's no sense of who you're talking to | The rich profile sits in the results view and vanishes when the chat opens. | The respondent record sits beside the transcript for the whole conversation, so every claim can be checked against the profile that produced it. |
| Nobody trusts the replies | A blanket disclaimer at the top of the thread concedes the problem and manages none of it. | No disclaimer. Claims are marked individually, and the respondent refuses questions it can't answer from data. |
| There's no way to tell data from invention | Fluent invention and grounded fact look identical. | Every claim carries a marker: solid for grounded in the survey answer or profile, dashed for the model reasoning past both. Sources sit under each reply with the verbatim quote. |

## Three steps, in the order the work happens

**Browse.** The society is a sample of the population, with respondents drawn toward others who answered as they did. The result legend doubles as a filter: mute an option and that community dims where it sits rather than vanishing, so you keep seeing how much of the whole you're looking at.

**Read a respondent.** Selecting a lit dot opens their record: their answer, their own words at reading size, their profile, and how the respondent was built.

**Interview.** The record slides left and stays. The map goes, because it has no job during a conversation.

Overview first, then filter, then detail on demand. That ordering is Shneiderman's, and the reasoning is in `docs/decisions.md`.

## Trust is the feature, not a disclaimer

The mocked reply engine exists to demonstrate the citation system rather than to imitate a language model. Every reply is assembled from the respondent's own record, so a claim is either traced to their survey response, traced to a profile attribute, or explicitly marked as extrapolation.

Two consequences worth looking at:

**The respondent refuses.** Ask about people who weren't surveyed and it says plainly that it would be guessing, then suggests running the question across the population instead. A system with no visible failure states gives no signal worth trusting. It's also the commercially correct answer: the right response to a question one respondent can't answer is another survey.

**Sources are counted.** A column beside the transcript collects everything the conversation has rested on, split into grounded and extrapolated. Per-claim markers answer "is this sentence evidence". The column answers the question a client carries into a decision, which is how much of the whole conversation was.

## The work around the chat

A conversation is one moment in a longer job, so the build gives that job somewhere to live.

**Resume, don't restart.** Every interview with messages sits in a Recent Interviews list beside the survey: who, the last thing said, whether it's still going. One click resumes it, another starts it fresh with the same respondent.

**Keep what matters.** Bookmark any reply and it lands in Findings, held with the respondent and its sources across every interview in the project, so research ends somewhere other than a scroll back up the thread.

**Leave with it.** Export a transcript and the provenance travels with it. Each reply carries its grounded quotes and its flagged extrapolations as footnotes, because these end up in decks where the quote and its source have to stay together.

## Running it

```bash
npm install
npm run dev
```

No API keys. Replies are assembled from each respondent's own record rather than generated, so the citation system can be shown deterministically.

## How I built this

About four hours, on a tight token budget, which I treated as part of the problem. Over sixty commits, and the first six are all documents.

**The complaints were the starting point, and I refused to treat them as the spec.** Taking them literally gets you a tooltip that says "this is AI generated" and a save button. So the first pass was an audit, not a build, separating what users say from what is actually wrong underneath, which is where "I don't trust it" turns into "fluent invention and grounded fact are rendered identically". Every feature in the table at the top of this README traces to a line in that audit. Anything that didn't, didn't get built.

**I wrote the constraints down before writing code, so the constraints could win arguments later.** `docs/design.md` is a binding system: tokens, motion thresholds, and twenty-two interaction principles covering trust, conversation, and how to draw a population. `docs/decisions.md` records the calls that had a plausible alternative, with the alternative. Both are checked into the repo and referenced from `CLAUDE.md`, which means an AI agent working in this codebase reads them before it touches a file. That is the actual trick: the design system is not a PDF nobody opens, it is the thing the machine is held to. When I asked for a soft background behind the society and got a grey rectangle, the reason it went back out is principle 21, position carries community and nothing else should be varying. The system caught it, not my mood that afternoon.

**Schema before screens.** `src/lib/types.ts` is shaped the way the production schema would be, one type per table with references as foreign keys. The mock store in `src/lib/store.ts` reads like a database, so the seam a real backend slots behind already exists. Commit five is the domain model. The first pixel is commit ten.

**I routed the work across three models rather than using one for everything.** The build ran in Claude Code inside Conductor, so several workstreams could go at once. Roughly the first twenty commits, the part that is all documents and domain modelling, were planned with Claude Fable 5 working alongside Opus: the hardest reasoning in the project is the audit and the design system, because every later decision inherits from them, and that is what the top tier is for. Once the shape was settled the work changed character. Scaffolding a component, wiring the external store, adding a citation marker, fixing a spacing bug: each is small, well-specified, and has a right answer. That is Sonnet 5's territory, near the top tier on coding and agentic tasks at a fraction of the cost, so the quickfire loop ran there and I kept the expensive models for the decisions that actually needed them. Routing by task rather than defaulting to the biggest model is the difference between a demo you can afford to iterate on and one you build once and stop touching.

**What did not delegate.** The product decisions, the audit, the design system, the call on what the complaints really mean, and the repeated no to things that looked plausible and served nothing. Models are unreliable at taste and at knowing when to stop. Most of the iteration in the back half of this history is me rejecting output, and the commit messages record why rather than what. The grey smudge behind the society graph made it into a commit and straight back out again, which is the process working rather than failing.

**I drove it by voice, on purpose.** Direction went in through Wispr Flow rather than the keyboard, from the first framing of the problem through every round of feedback on a screen. That reads like a tooling footnote and isn't one. Speaking is faster than typing, so briefs stayed long and specific instead of being trimmed to whatever I could be bothered to type, and keeping my hands off the implementation kept me in the reviewing seat rather than the writing one. The job I was doing on this build was to be the eyes: open the screen, judge it against the design system and the complaints, and say what was wrong. Voice is what made that sustainable across sixty-odd rounds of it.

**I checked it in a browser, every time.** Not typecheck and vibes. Each change was driven headlessly and screenshotted, so "the findings drawer works" means a reply was actually bookmarked, the page was actually reloaded, and the quote was actually still there. Several bugs in this README's feature list were caught that way and never reached a commit.

## What I'd do with more time

**Wire up the group interview.** The composer's invite and the map's shift-click both gather a group already. What's missing is the thing they gather toward: putting one question to five respondents across different answers and reading the spread, which is how research actually works and what browsing between people is for. The build stages this and doesn't yet run it. It's also the honest answer to a question one respondent can't give, which is another survey.

**Lean the trust work on the refusal, not the markers.** Every claim carries a grounded or extrapolated marker, on the assumption that marking raises trust. It might not. A dashed marker can read as "made up" rather than "reasoned past the data", and take the whole conversation down with it. The mark that clearly earns its place is the refusal, where the persona won't speak for people who weren't surveyed and points at running another survey, honest and commercially right in one move. I'd make the per-claim marks quieter, put the weight on that moment, and test whether it reads as more trustworthy rather than less.

**Turn the refusal into the next commission.** "I'd be guessing" is the persona telling a client exactly where their survey stops covering the population. Right now that's just honesty. Log which questions trigger a refusal most often across a client's interviews and surface the pattern back as a suggested next survey, so closing the gap is the product's own next move rather than something the client has to think up cold. Provenance earns the trust; the refusal is where that trust turns into the next sale, which is the retention and upsell case for the whole feature.

**Put a designer on the palette.** It's tuned for one job: keeping four survey options separable from each other and from the grounded/simulated pair, at accessible contrast, so no colour in the interface is ever decorative. That's the right trade for a tool whose whole argument is evidence, and it's the reason provenance reads at a glance. It also leaves the product cooler than the brand deserves, and there's no dark mode. Both are the work of someone who does colour systems for a living: an expressive palette that carries warmth and still holds the data encoding, built twice for light and dark, with the semantic tokens already in `globals.css` as the seam.

**Explore the society as a space worth spending time in, not just a filtered view.** Right now the map is browse, filter, click through, and that's as far as it goes. Obsidian's graph view earns the attention it gets because you can open a node into its local neighbourhood, follow a thread of similar notes, and the shape of the graph becomes part of how you understand the material, which is close to what a survey population actually is. I don't think anyone owns that territory for survey data yet. An expandable tree from one respondent into who answered like them, a "similar cases" panel that reads like backlinks, both feel like where this graph wants to go. This is a design problem before it's an engineering one: what expands, what a wrong click teaches someone, how far the metaphor holds before it stops being honest about a sample. I'd want to prototype it with a designer rather than guess my way there alone.

**The society at full scale.** The graph renders a 250-respondent sample. Three thousand nodes needs aggregation, level-of-detail, and probably canvas rather than SVG. The interface says "a sample" rather than pretending otherwise, which is honest but not a solution.

**Instrument the trust question.** Log whether users open the sources column, and whether they ask follow-ups after a refusal or abandon. That tells you if provenance is being used or just displayed.

## Research I'd run

The build assumes clients want provenance. That's a hypothesis, not a finding.

**Watch five clients answer a live question.** Not a usability test on this interface. Give them a real decision they're facing, their own survey, and see whether they reach for an interview at all. If nobody does, the framing is wrong and no amount of trust marking will fix it.

**Trust calibration.** Show one group answers with markers and one without, then ask both how much they'd rely on specific claims. The design assumes marking extrapolation raises trust in the rest. It could plausibly do the opposite and make the whole thing feel shaky. Worth knowing which.

**Comprehension of the markers.** Does anyone read a dashed marker as "made up" when it means "reasoned from the profile"? The distinction is load-bearing and I've only tested it on myself.

**Talk to the forward-deployed engineers.** They sit with clients when this breaks and will know the failure modes that never reach a feedback form.

**Diary study on returning.** Persistence assumes people come back to interviews. Do they, and what do they need when they do? A saved transcript might need a summary at the top rather than a scroll back through it.

## Notes on scope

Mock data lives in `src/lib/fixtures/`, deterministic and typed. The survey graph and results exist as entry context rather than as a rebuild of the results view. Design system is `docs/design.md` and its tokens are in `globals.css`; both are binding on the build. `docs/decisions.md` records the calls that had a plausible alternative.

Six respondents have loaded profiles. In the product every dot would be interviewable; here the lit ones are the ones with fixtures behind them.
