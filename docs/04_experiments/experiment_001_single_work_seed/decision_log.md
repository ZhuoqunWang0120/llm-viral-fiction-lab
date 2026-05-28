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
