# Prompt: Sample Coverage Audit

## Purpose

Determine whether the current sample set is sufficient and what additional data, if any, is needed.

## Prompt

I will provide a single-work seed dataset from a high-quality Xiaohongshu/RedNote serialized fiction work.

Important context:
1. The dataset comes from one author and one work.
2. This is intentional. The experiment tests whether a single high-quality work is enough for LLM playbook extraction.
3. The posts do not have independent titles; they are mostly series name + number.
4. Therefore, do not force title formula analysis. Mark title formula as out of scope for this dataset.
5. The goal is not to imitate the author. The goal is to extract transferable genre mechanisms for original fiction creation.

The sample may contain platform-coded language, euphemisms, abbreviations, or substitute words, such as “米” for money or “灰灰” for gray-market activity.

Please:
1. Preserve the original wording.
2. Infer likely meanings only when context supports it.
3. Create a coded-language glossary with confidence levels.
4. Separate platform-native flavor from risky euphemisms.
5. Do not treat all coded terms as reusable style.
6. For risky terms, analyze their narrative function but do not generate operational or instructional details.

Please do not write fiction yet.

First, perform a sample coverage audit.

Evaluate whether the current samples support analysis of:

1. Opening hooks
2. Character relationships
3. Power imbalance mechanisms
4. Canary-lit feeling
5. Luxury/class details
6. Emotional progression
7. Mid-story conflict escalation
8. Cliffhangers
9. Long-form serialized structure
10. Platform-native expression
11. Original concept generation
12. Writing the first 3 original posts

For each dimension, score 1–5 and explain the evidence.

Also output:

1. What the current samples cover well
2. What the current samples do not cover
3. Which conclusions may be author/work-specific rather than genre-level
4. Which mechanisms seem transferable
5. Whether title formula should be out of scope
6. Whether more data is needed
7. If more data is needed, specify the minimal next data request:
   - same work, more chapters
   - same genre, different work
   - title-only samples
   - high-hook opening samples
   - later-stage reversal samples
8. Risks of proceeding without more data
9. Recommendation: proceed / collect more / narrow scope

Output a clear markdown report.
