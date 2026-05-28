# Prompt: Overfitting Risk Audit

## Purpose

Identify which findings may be too specific to the source work or author.

## Prompt

Based on the provided single-work seed dataset, perform an overfitting risk audit.

The goal is to separate:

1. Transferable genre mechanisms
2. Platform-native writing patterns
3. Work-specific plot choices
4. Author-specific expression or personal style
5. Elements that should not be copied

Please output:

- Transferable mechanisms
- Likely source-work-specific features
- Likely author-specific features
- Elements that must be avoided in original generation
- Risks if we generate directly from this dataset
- How to constrain future prompts to avoid imitation
- Whether additional cross-work samples are needed

Do not write fiction yet.
