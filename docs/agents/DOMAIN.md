# Domain Docs

How engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- `GLOSSARY.md` at the repo root. If `GLOSSARY-MAP.md` exists, read each glossary relevant to the topic.
- Relevant decisions in `docs/adr/`.

If these files don't exist, proceed silently. Don't flag their absence or suggest creating them upfront; the domain-modeling workflow can create them when terms or decisions are resolved.

## Layout: single-context

- `GLOSSARY.md` at the repo root
- `docs/adr/` for architecture decision records
- `src/` for application code

## Use the glossary's vocabulary

When naming a domain concept, use the term as defined in `GLOSSARY.md`. If a needed concept isn't there yet, reconsider the wording or note the gap for domain modeling.

## Flag ADR conflicts

If a proposed change contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it.
