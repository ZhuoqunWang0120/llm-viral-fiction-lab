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

## Glossary

| Term | Category | Likely Meaning | Confidence | Example Context | Generation Guidance |
|---|---|---|---:|---|---|
| 米 | platform-coded | 钱 / 金额 | High | “多少米” | Can use sparingly for platform flavor |
| 灰灰 | risky-coded | 灰产 / 灰色产业 | Medium | Context-dependent | Analyze, but avoid operational detail |
