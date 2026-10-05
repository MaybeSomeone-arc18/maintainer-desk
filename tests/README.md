# Tests (run on 2026-10-05, n8n 2.35.7, local)

`mock-api.js` is a small fake of the GitHub search API, the contents API and an OpenAI-style chat endpoint. It lets the workflow run without network or keys. `results/` holds the outputs of these runs.

Start the mock (`LLM_MODE=good|bad_number|garbage|fail node tests/mock-api.js`), start n8n with `N8N_BLOCK_ENV_ACCESS_IN_NODE=false GITHUB_API_BASE=http://127.0.0.1:9001 LLM_API_BASE=http://127.0.0.1:9001/v1 LLM_API_KEY=test`, import and publish the workflow, then POST `payload-duplicate.json` to `/webhook/maintainer-desk-issue`.

What the runs cover:
- `llm-good.json`: model answer accepted, card mode `llm+heuristic`.
- `llm-bad_number.json`: model cites an issue that was not a candidate, answer rejected, falls back to keyword ranking.
- `llm-garbage.json`: model returns non-JSON, falls back.
- `llm-fail.json`: LLM endpoint returns 500, falls back.
- `ignored.json`: a `closed` event is ignored.
- With no `LLM_API_KEY` the LLM step is skipped and the card is keyword-only.

The LLM step was tested only against this mock, never against a real model. See the main README.
