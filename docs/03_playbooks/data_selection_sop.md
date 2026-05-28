# Data Selection SOP

## Principle

Collect the smallest amount of data needed to answer the current experiment question.

## Experiment 001: Single-work seed

Use a single high-quality work as the initial seed dataset.

Use this when:
- One work is clearly stronger than alternatives.
- The goal is to test whether a strong single seed is sufficient.
- The main target is body text, emotional engine, and serialized structure.

Known limitations:
- High overfitting risk.
- Cannot separate genre-wide rules from source-work-specific choices.
- Cannot analyze title formula if the source posts do not have independent titles.

## When to collect more from the same work

Collect more chapters from the same work if:
- Long-form arc is unclear.
- Mid-stage conflict escalation is unclear.
- Late-stage reversal and fatigue handling are unclear.
- The LLM specifically identifies missing story-stage coverage.

## When to collect different works

Collect other works if:
- Generated concepts are too similar to the source work.
- The playbook feels author-specific.
- The LLM cannot distinguish genre mechanism from work-specific pattern.
- Cross-work generalization is the next research question.

## When to collect title-only samples

Collect title samples if:
- Drafts have weak clickability.
- The source work has no independent post titles.
- Title formula becomes a bottleneck.
