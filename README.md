# Maintainer Desk

Triage help for open-source maintainers, by Scrap Builders for Hack Sprint's AI Automation with n8n track. Two parts: an n8n workflow and a review screen that shows what the workflow returns. Built and tested on 2026-10-05.

## What works (tested)

### n8n workflow (`workflows/maintainer-desk-triage.workflow.json`)

Import it into n8n (Workflows > Import from file), publish it, and POST a GitHub `issues` webhook payload to `/webhook/maintainer-desk-issue`. n8n 2.x needs `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` because the workflow reads optional settings from env vars.

Flow: webhook -> normalize and validate -> search related issues (two short title queries, because GitHub search ANDs every word) -> rank by keyword overlap -> fetch the repo's `CONTRIBUTING.md` -> pick a passage -> optional LLM step -> triage card -> returned for human review.

The card has a recommendation, confidence, up to 3 related issues with scores, missing details, a suggested reply, and (when found) a cited passage from the contributing guide. Events that are not opened/edited/reopened issues are ignored. Nothing is posted to GitHub.

Optional LLM step: set `LLM_API_KEY` (and optionally `LLM_API_BASE`, default Groq's OpenAI-compatible URL, and `LLM_MODEL`). The model only judges the candidates the search found. Its answer is rejected if it is not valid JSON or names an issue that was not a candidate, and the workflow then falls back to keyword ranking. Issue text is passed as untrusted data. Without a key the step is skipped.

Tests (`tests/`): 4 LLM paths (good answer, made-up issue number, garbage, endpoint down), the ignored-event path, and the keyword-only path, all against a local mock API. Also 4 real issues from `n8n-io/n8n` run through the workflow against the live GitHub search API (`examples/`).

### Review screen (`index.html`)

Open it in a browser. No build or install. It shows 4 real workflow cards (`examples/`). You can paste another card, or enter your n8n webhook URL plus a GitHub issue payload and click Run workflow (tested against a local n8n). Edit the reply, copy it, mark it reviewed. The page cannot post to GitHub; "mark reviewed" lives in the tab only.

## Measured result (small, one repo)

On 30 closed `n8n-io/n8n` issues that maintainers marked as duplicates, the true original was in the top 3 for 2 of 30 (it was 1 of 30 before the query change). That is weak. See `eval/README.md`. Search recall is the limit.

## Not built / not verified

- The LLM step has only run against a mock endpoint, never a real model.
- No semantic (embedding) search, so reworded duplicates are usually missed.
- The contributing-guide step is a keyword pick of a bug-report passage. On `n8n-io/n8n` it found nothing useful, so the 4 real cards have no doc citation. It was tested on the mock guide only.
- No write-back. A maintainer copies the reply and posts it by hand. This is deliberate for now.
- No time-saved or accuracy numbers beyond the eval above.
