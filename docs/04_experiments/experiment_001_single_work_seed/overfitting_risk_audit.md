# Overfitting Risk Audit

**Experiment:** Experiment 001: Single-Work Seed Dataset  
**Dataset:** `dataset_v0_13_sample_posts`  
**Post count:** 13

## Overall Risk

Overfitting risk is **high** because the dataset comes from a single author and a single work. The sample is useful for mechanism hypotheses, but not sufficient to prove genre-wide rules.

## Likely Source-Work or Author-Specific Features

These should be treated cautiously and should not be generalized too quickly:

| Potential Overfitting Point | Why It May Be Author- or Work-Specific |
|---|---|
| Strong reality-gossip voice | The work reads like a hybrid of semi-documentary, social gossip, and class observation. This may be the author’s personal advantage. |
| Heavy use of historical/economic context | References to business cycles, liquidity pressure, rankings, agencies, and expansion may be central to this specific work’s style. |
| Dense class satire | The work repeatedly satirizes rich people, second-generation elites, intellectual families, elite universities, agencies, and social climbing. |
| Chinese-English mixing and substitute-word density | The density of English and platform substitute words may not generalize. |
| Highly rationalized female characters | Female characters often evaluate men and resources like investment decisions. This is a strong feature, but may not be universal. |
| Reality-adjacent event references | The text approaches real events and social circles. This raises transfer and safety risk. |
| Sharp narrator judgment sentences | Distinctive judgment lines could cause stylistic overfitting if copied too closely. |

## Transferable Mechanisms

These are more likely to be transferable category mechanisms if original names, settings, scenes, and wording are changed:

| Transferable Mechanism | Explanation |
|---|---|
| Power gap as a compound structure | The gap is not just money. It combines money, identity, information, circle access, age, reputation, family background, and mobility. |
| Canary character with risk judgment | A strong “金丝雀” figure is not only beautiful or passive. She evaluates stability, resource quality, future return, and personal safety. |
| Material details with plot function | Luxury goods, tuition, office space, cars, cash, and assets should signal relationship temperature, class position, and power shifts. |
| Male characters differentiated by resource type | Rich but stingy, generous but unsophisticated, fallen elite, young but cash-poor, high-status but unsafe, and broker-like men create different conflicts. |
| Female contrast pairs | Different female strategies, risks, beauty types, and identity routes create strong narrative tension. |
| Each post ends with a new variable | A new character, crisis, hidden fact, resource, reversal, or strategic question creates follow-up momentum. |
| Historical/social context increases realism | Macro context can make dramatic plots feel like social slices rather than pure melodrama. |
| Mixed emotional engine | The appeal combines pleasure, cruelty, clarity, gossip, envy, and strategic survival. |
| Being seen / displayed / priced | The canary feeling depends on being evaluated, displayed, invested in, compared, and repriced. |

## Risks If Proceeding Without More Data

| Risk | Severity | Explanation |
|---|---:|---|
| Mistaking author style for category mechanism | High | Sharp social satire, reality-gossip tone, and Chinese-English mixing may be author-specific. |
| Incomplete long-form structure | High | Skipped posts prevent confident analysis of full character arcs and foreshadowing/payoff. |
| Original generation too close to this work | Medium-high | The model may reproduce narrative posture, character configurations, and power structures too closely. |
| Playbook over-indexes on realistic elite gossip | Medium-high | It may ignore sweeter, more melodramatic, revenge-oriented, or female-growth variants. |
| Coded language overinterpretation | Medium | Some abbreviations cannot be confidently defined from one work alone. |
| Weak platform generalization | Medium | Without comments or engagement data, we cannot know which mechanisms truly drive distribution. |

## Generation Guardrails

- Do not imitate the author’s sentence-level style.
- Do not reuse source character names, scenes, social circles, relationship configurations, or distinctive judgment lines.
- Treat the playbook as a mechanism hypothesis, not a formula to copy.
- Require original characters, original setting, original plot, and new conflict architecture.
- Mark title formula as out of scope for this playbook version.
- Include an overfitting check before any generated concept is selected.
- Treat coded or risky language as analysis material, not a reusable style default.

## Additional Data Recommendation

Cross-work samples are not required for a narrow **Single-Work Seed Playbook v0**, but they are required before claiming genre-wide transferability.

Recommended next data only if needed:

1. Posts 1 and 2 from the same work for cold-start coverage.
2. Three to five continuous middle posts for escalation structure.
3. Five to eight same-category posts from another author/work for cross-work validation.

## Final Judgment

Proceed with a narrow playbook, but label it clearly:

> Single-Work Seed Playbook v0: 金丝雀文学机制假设版

Do not treat it as a complete category playbook yet.
