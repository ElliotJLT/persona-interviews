@AGENTS.md

# Persona interviews

An interview screen for a synthetic research platform. Clients run simulated surveys; every respondent is an AI persona they can interview 1:1. This repo is the chat experience only. The survey graph and results view exist as mocked entry context.

## Product rules

- Every feature answers one of the five client complaints mapped in README.md. If a change doesn't serve one, question it.
- Provenance is the headline feature: persona replies separate data-grounded claims from simulated extrapolation, with citations back to the survey response or profile attributes.
- The chat is mocked, no LLM calls. Mock content is a design surface: canned replies must demonstrate the citation system, not fill space.

## Engineering

- Domain types in `src/lib/types.ts` are shaped the way the production schema would be: one type per table, references as foreign keys, normalised.
- Mock data lives in `src/lib/fixtures/`. Deterministic and typed, no faker.
- Small components over clever ones. No abstractions before the second use. No error handling for states a mocked app can't reach.

## Design

- The system lives in `docs/design.md`; tokens in `globals.css`. Both are binding: no colours, spacing, or motion outside them.
- Keep the established language: warm neutrals, clean cards, italic serif reserved for verbatim persona quotes, saturated accents reserved for data and actions.
- Never default to generic AI aesthetics: no Inter-on-white sameness, no purple gradients, no cookie-cutter card grids. Micro-interactions only where they earn their place.
- Design every state: empty, loading, and long-content overflow.

## Verify

- Run the flow in the browser before calling anything done.
- Before a screen ships, critique it against docs/design.md: heuristic pass (system status visible, consistency, recognition over recall) plus a generic-AI-pattern check (gradient text, purple-on-white, nested cards, uniform card grids). If it reads as template output, it isn't done.
- `npm run build` and `npm run lint` pass before every commit.
