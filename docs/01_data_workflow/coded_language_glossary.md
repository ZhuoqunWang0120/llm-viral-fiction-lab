# Coded Language Glossary

## Purpose

This file tracks platform-coded language, euphemisms, abbreviations, and genre-specific terms found in the sample dataset.

The goal is to help LLMs understand the text and separate:

1. platform-native expression,
2. genre/trope vocabulary,
3. potentially risky euphemisms.

This glossary should not be used to bypass platform moderation or generate harmful/illegal instructions.

## Handling Principles

1. Preserve original text in raw samples.
2. Do not automatically normalize euphemisms in the dataset.
3. Annotate likely meanings separately.
4. Track confidence level.
5. Mark risky terms clearly.
6. Use risky terms only for literary analysis, not operational detail.

## Glossary v0

| Original Term | Category | Initial Annotation | Confidence | Generation Guidance |
|---|---|---|---:|---|
| 米 | platform-coded | Usually refers to money, cash, or funds. | High | Can be analyzed as platform-native flavor; use sparingly and only where context supports it. |
| cash | platform / finance | Directly available cash, often contrasted with gifts, assets, or nominal wealth. | High | Safe as ordinary finance vocabulary. |
| money | platform / finance | Money; also part of Chinese-English platform voice. | High | Safe as ordinary finance vocabulary. |
| rich | platform / class | Rich / wealthy; often used in a satirical platform tone. | High | Can inform class texture, but do not over-copy voice. |
| A11 / A12 | coded / wealth tier | Likely refers to wealth or asset level. Preserve as-is; do not force exact expansion. | Medium | Analyze cautiously; avoid presenting as verified classification. |
| GLD | risky-coded / finance | In context, appears related to liquidity/funds for listed companies or gray financial operations. Preserve and annotate cautiously. | Medium | Analyze narrative function only; do not generate operational detail. |
| HH | risky-coded / sensitive abbreviation | Likely a sensitive event or abbreviation. Context relates to private entrepreneurs becoming low-profile and preparing to leave. Preserve and annotate cautiously. | Low-medium | Do not expand confidently; avoid operational detail. |
| red二代 | political / class-coded | Second-generation elite with political/power-family background. | High | Can be analyzed as power-background signal; avoid real-person targeting. |
| 失quan | platform-coded | Substitute form for losing power/status. | High | Can be analyzed as platform avoidance and status-loss marker. |
| yan | platform-coded | Smoke/cigarette. | High | Low risk; preserve context. |
| alcohol / 无alcohol | platform-coded | Alcohol; Chinese-English mixing or mild platform avoidance. | High | Low risk; preserve context. |
| 2M | finance-coded | Two million / 200w depending on context. In the sample, appears as a penalty amount. | High | Safe as amount notation. |
| 8w / 8个 | finance-coded | 80,000. | High | Safe as amount notation. |
| million | finance-coded | Million-level amount; mixed with Chinese money expressions. | High | Safe as amount notation. |
| 白P | risky-coded / sexual-economic | Likely substitute for “白嫖,” meaning getting sexual/emotional/gendered resources without paying. | High | Analyze power and gender economics; avoid crude operational framing. |
| FAKE | platform / authenticity | Fake goods. | High | Safe as authenticity/class marker. |
| xx | masking | Masked or omitted sensitive wording. | High | Preserve as masking; do not infer beyond context. |
| 不能播 | platform-risk marker | Indicates sensitive, not-publicly-shareable history. | High | Treat as a signal of withheld context; do not reconstruct hidden details. |
| 局 | social-circle term | A resource/social/elite gathering, not just a normal dinner. | High | Useful for social-circle mechanics. |
| 大哥 | power / patron term | A powerful or resource-rich man; may be a patron, boss, or circle center. | High | Transfer as archetype only, not source-specific phrasing. |
| 金主爸爸 | patron / resource term | A man or funder who provides money/resources; used with platform-style irony. | High | Analyze as patronage trope; avoid overusing the exact phrase. |
| 下海 | risky-coded / social-economic | In this context, likely entering an influencer, escort-adjacent, social-climbing, or gray monetization track. | Medium-high | Analyze narrative risk and social mobility function; do not generate operational detail. |
| 灰灰 | risky-coded / watch item | Mentioned as a possible coded word by the project owner; not clearly present in current samples. | To verify | Keep as watch item; do not use unless supported by context. |

## Notes

- This is a v0 glossary based on a 13-post single-work seed dataset.
- Do not treat all coded terms as reusable style.
- Separate platform-native flavor from risky euphemisms.
- For risky terms, analyze narrative function but do not generate operational or instructional details.
