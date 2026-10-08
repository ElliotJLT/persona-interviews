# Design system — persona interviews

One page that keeps every visual and interaction decision consistent. The visual language is extracted from the platform's existing survey views so v2 reads as an evolution of the product, not a reskin. The interaction principles are the working rules this build is held to.

## Foundations

### Palette

Semantic tokens, defined in `globals.css`. Warm neutrals for surfaces, saturated accents reserved for data and actions.

| Token | Value | Use |
|---|---|---|
| `surface` | `#F7F5F1` | App background, warm off-white |
| `card` | `#FFFFFF` | Panels, message bubbles, cards |
| `border` | `#E7E4DD` | Hairlines, card edges |
| `ink` | `#1D1B17` | Primary text |
| `ink-muted` | `#8A857A` | Secondary text, timestamps, labels |
| `accent` | `#E8785A` | Primary actions (conversation coral) |
| `data-1` | `#7B68C9` | Survey option accent (purple) |
| `data-2` | `#5B6ED8` | Survey option accent (indigo) |
| `data-3` | `#E9A23B` | Survey option accent (amber) |
| `data-4` | `#D95B43` | Survey option accent (rust) |
| `grounded` | `#4C7A5C` | Citations backed by data |
| `simulated` | `#B07D2E` | Flagged extrapolation |

Data accents map one-to-one with survey options and never change meaning within a session. Grounded and simulated are the trust pair: they must stay visually distinct at a glance, including for colour-blind users (pair colour with an icon or label, never colour alone).

Dark mode is out of scope for this build.

### Type

- UI: Geist Sans. Sentence case everywhere, including buttons and labels.
- Verbatim persona quotes: italic serif (Georgia stack). Serif is reserved for words a persona actually said in the survey; it never decorates UI copy. The distinction is doing trust work, not styling work.
- Mono only for ids in debug contexts, never in product UI.

### Space, radius, elevation

- 4px spacing scale. Panel gutters 24px, card padding 16-20px, chat column max-width ~720px.
- Radius: 8px controls, 12px cards, 16px modals. Message bubbles 12px with one squared corner on the author's side.
- Elevation: borders first, shadows sparingly. One soft shadow level for overlays, none for in-flow cards.

### Motion

- Standard transitions 150-250ms ease-out. Nothing in the interface exceeds 400ms, the threshold where feedback stops feeling immediate.
- Motion communicates state change (panel in, message arrive) and is never decorative. If removing an animation loses no information, remove it.
- Respect `prefers-reduced-motion`.

## Interaction principles

### Trust

1. Status copy describes what the system is actually doing. No theatrical "thinking" states; a mocked response is staged as a realistic delay, and the persona is labelled simulated wherever it speaks.
2. Provenance is interface, not fine print. The grounded/simulated distinction sits inline where claims are read, at reading size, not buried in a tooltip or disclaimer.
3. Predictability compounds into trust. The persona keeps one voice, patterns repeat, casing and spacing never wobble between screens. Inconsistency in small things reads as carelessness in big ones.

### Conversation

4. Design for the middle and the return, not just the first message. Users leave and come back: history is always reachable, conversations resume where they ended, and a returning user can re-orient without rereading everything.
5. The system does the bookkeeping. Users never track which question they've answered, which persona they're in, or where a conversation lives. If the interface knows, the interface shows.
6. Guidance over blank boxes. A cold input is a cost the user pays; seed the conversation with questions derived from the persona's own data, offered as tappable suggestions, one rhythm-sized step at a time.
7. When context is missing, ask instead of assuming. A wrong assumption dressed as personalisation costs more trust than a question costs time.

### Structure and effort

8. Expose structure the data already has. Responses, attributes, and citations are linked records; the interface should make those links visible and navigable rather than flattening them into prose.
9. Defaults over configuration. Choose for the user wherever the system can make a better-informed choice, and make the override discoverable rather than the setup mandatory.
10. Match interaction weight to intent. A quick follow-up should cost one tap; a durable artefact (a saved interview) can justify ceremony. Never make the light thing heavy.

### Simulation and evidence

11. Fluency is not evidence. A polished conversational answer reads as true whether or not it is; the interface must carry the credibility signal separately from the prose. Provenance markers, not confident tone, are what earn belief.
12. The persona has boundaries and shows them. It can decline: outside its data, outside the survey, outside its profile. A system that visibly says "I can't speak to that" makes everything else it says worth more. No failure states means no credibility.
13. Surface the method where the doubt occurs. The simulation has an underlying basis (observed data, a constructed profile, a validated model); the interface should expose that basis at the moment a user wonders "is this made up?", not on a separate page they'll never visit.
14. This is an instrument, not a companion. No sycophancy, no rapport theatre, no pretending to type. Warmth comes from craft; credibility comes from behaving like a tool with legible limits.
15. A conversation is chronological, which makes it bad at being a record. Give the thread spatial anchors: persistent context beside it, scannable structure within it, and a way back to anything that mattered without rereading.
16. Not everything deserves to be a conversation. When the task is structured (compare, revisit, choose), give it structured UI beside the thread instead of forcing it through the composer.

### Craft

17. Every state is designed: empty states teach the feature, loading states are honest about duration, long content overflows gracefully. An unstyled edge case is an unfinished feature.
18. Confidence precedes use. Every control telegraphs what it will do before it's pressed: labels over icons alone, previews over surprises.
19. Accessibility floor, not ceiling: 4.5:1 contrast for text, visible focus states, full keyboard path through the chat, semantic landmarks for the three panels.

### Views of a population

20. Foreground and background, not add and remove. Narrowing a view pushes the chosen subset forward and fades the rest rather than deleting it, so a user can always see how much of the whole they are looking at. A filter that empties the screen destroys the context that made the filter worth applying.
21. A view where position means something is a map, not a picture. Each channel carries one variable and keeps it: position for community, colour for answer, size and glow for whether something can be acted on. A channel that carries nothing should not be varying.
22. The terrain stays put between visits. The layout is generated from a fixed seed, so a respondent sits in the same place every time and users can build familiarity with the shape rather than re-reading it on every load.
