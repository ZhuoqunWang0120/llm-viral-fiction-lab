# XHS Personal Archiver and Genre Playbook Lab

Local Node.js + Playwright tooling for small-batch personal collection of visible RedNote/Xiaohongshu post text, plus an AI-native documentation structure for genre-playbook experiments.

## What This Is

- A local archival helper for text that is visibly available in your logged-in browser UI.
- A prompt and experiment workspace for studying genre/category mechanisms.
- A reproducible repo structure for playbooks, rubrics, experiment plans, and retros.

## What This Is Not

- Not a crawler, data broker, or high-throughput scraper.
- Not a tool for private APIs, signature reverse engineering, CAPTCHA solving, login bypass, or risk-control bypass.
- Not a repository for raw collected text, cookies, tokens, browser profiles, screenshots, or page HTML.
- Not an author-imitation project. The goal is transferable genre analysis, not copying a specific writer.

## Research Question

Can an LLM use a small, high-quality, single-work seed dataset to extract a transferable genre playbook and generate original platform-native fiction concepts?

Known limitations for Experiment 001:

- The first dataset comes from one author and one work.
- This is intentional for the first experiment.
- The source posts do not have independent titles; they are mostly series name + number.
- Title formula analysis is out of scope for Experiment 001.

## Workflow Overview

1. Collect a small local dataset from visible browser UI only.
2. Convert local JSONL into local Markdown for manual review or ChatGPT input.
3. Run prompt-based audits for sample coverage and overfitting risk.
4. Extract a genre/category playbook.
5. Stress-test the playbook against original concept generation.
6. Evaluate drafts with a rubric and write a retro.

## Safety and Platform Boundaries

- Use headed browser automation by default.
- Use slow, human-like pacing and small batches.
- Stop immediately on CAPTCHA, login challenge, access restriction, abnormal traffic, blank/error pages, or other risk-control signals.
- Do not retry or bypass verification automatically.
- Do not collect hidden/private data, images, videos, comments, profile data, follower data, or account metadata beyond visible title/author/body/date/url.
- Never print or upload cookies/tokens.

## Data Privacy Policy

Raw collected text and session state are local only. They are ignored by Git:

- `storage_state.json`
- `xhs_posts.jsonl`
- `sample_posts.jsonl`
- `dry_run_candidates.jsonl`
- `failed.json`
- `run_log.md`
- `chatgpt_input.md`
- `chatgpt_sample_input.md`
- `data/raw/*`
- `data/processed/*`
- `debug/*`
- `artifacts/`

Only public mock examples and documentation templates belong in the repository.

## Local Usage

Install:

```sh
npm install
npx playwright install
```

Log in manually:

```sh
npm run login
```

Precise index mode for archival:

```sh
npm run collect -- --start 7 --end 9 --max-posts 3
npm run convert
```

Sample mode for genre/style study:

```sh
npm run collect -- --sample-mode --sample-query "芭比汤淇 顶级金丝雀的恨海情天" --dry-run --max-candidates 30
npm run collect -- --sample-mode --sample-query "芭比汤淇 顶级金丝雀的恨海情天" --max-candidates 30 --max-posts 3
npm run convert -- --input sample_posts.jsonl --output chatgpt_sample_input.md
```

Check scripts:

```sh
npm run check
```

## Repo Structure

```text
src/                         collection and conversion scripts
docs/00_project_brief/       framing, hypotheses, ethics, success criteria
docs/01_data_workflow/       schemas, SOPs, privacy policy, inventory templates
docs/02_prompts/             prompt library
docs/03_playbooks/           playbook and rubric templates
docs/04_experiments/         experiment-specific working docs
data/public_examples/        safe mock examples only
data/raw/                    local ignored raw data
data/processed/              local ignored processed data
outputs/                     local ignored generated outputs
debug/                       local ignored debug artifacts
```

## Experiment Roadmap

- Experiment 001: single-work seed dataset, extract a first genre playbook, generate original concepts, evaluate overfitting risk.
- Experiment 002: compare playbook stability across a larger or more diverse sample.
- Experiment 003: test concept generation and draft quality against the rubric.

## Run Experiment 001

1. Collect or select a small local seed sample.
2. Fill `docs/04_experiments/experiment_001_single_work_seed/sample_coverage_report.md`.
3. Run prompts from `docs/02_prompts/` in order.
4. Save the resulting playbook in `playbook_v1.md`.
5. Generate original concept options and select one.
6. Build a series bible and draft.
7. Review with `writing_rubric_template.md`.
8. Complete `retro.md`.

Raw collected text remains local and is not included in this repo.
