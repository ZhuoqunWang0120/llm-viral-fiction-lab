# Decision Log

## Decision 001: Use single-work seed first

We will start with one high-quality work instead of collecting many works.

Reason:
- The work is clearly stronger than alternatives.
- The experiment specifically tests whether a single strong seed is enough.
- This keeps data collection small and focused.

Risk:
- Overfitting to one author/work.

Mitigation:
- Add overfitting risk audit.
- Require the LLM to separate transferable mechanisms from author-specific features.
- Add cross-work data only if needed.

## Decision 002: Mark title formula as out of scope

The source posts mostly use series name + number, not independent titles.

Reason:
- The dataset cannot support title formula analysis.

Mitigation:
- Treat title generation as a separate future experiment.
- Collect title-only samples only if title clickability becomes a bottleneck.

## Decision 003: Playbook before drafting

We will not ask the LLM to directly write fiction first.

Reason:
- The project goal is reusable workflow and best practices.
- Playbook is more important than one viral post.

Workflow:
sample coverage audit → overfitting audit → playbook → stress test → series bible → MVP drafts → rubric review → retro.

## Decision: Proceed to Single-Work Seed Playbook v0

Based on the sample coverage audit, the current 13-post dataset is strong enough to support a narrow-scope mechanism hypothesis playbook.

We will proceed without collecting more samples for now.

Scope:
- Single-work mechanism extraction
- Platform expression observation
- Character relationship / power-gap framework
- Emotional-engine hypothesis
- Initial coded-language glossary
- Original-generation constraint principles

Out of scope:
- Genre-wide rulemaking
- Title formula analysis
- Cross-author style conclusions
- Viral-causality claims
- Complete long-form architecture

Reason:
The audit recommends “Proceed, but narrow scope.” The dataset has strong coverage for openings, power gaps, canary-lit feeling, emotional progression, platform expression, and coded language, but weak cross-work generalization and incomplete long-form structure.

## Decision: Proceed to Original Concept Pack v0

Based on Single-Work Seed Playbook v0, the project will proceed to a playbook stress test before generating full drafts.

Reason:
- The playbook has enough mechanism-level structure for concept generation.
- Direct prose generation may increase overfitting risk.
- The next key question is whether the playbook can generate original concepts with similar category appeal.

Next artifact:
- docs/04_experiments/experiment_001_single_work_seed/concept_options.md

Success criteria:
- Generate 8 distinct original concepts.
- At least 2 concepts score high on viral potential, originality, and sustainability.
- Concepts should preserve mechanism-level canary-lit appeal without copying source-specific characters, scenes, or relationships.

## Decision: Run two-concept mini bible stress test

Original Concept Pack v0 shows sufficient diversity and originality, but also reveals a substitute/proxy bias.

Before drafting prose, we will test two contrasting concepts:

1. 《她替老板养云》 — high originality, AI-native, strong personal fit
2. 《候鸟太太俱乐部》 — stronger platform fit, long-series potential, female-network structure

The goal is to compare whether the playbook supports both a niche high-originality concept and a broader platform-native concept.
