# Duplicate-finding check

Question: for issues that maintainers already closed as duplicates, does the workflow put the original issue in its top 3?

Data: 30 closed issues in `n8n-io/n8n` where a comment says "Duplicate of #N" (newest first on 2026-10-05; the original is N). GitHub unauthenticated search, so the script sleeps between calls.

| Version | Original in search results | Original in top 3 | Original ranked #1 |
|---|---|---|---|
| Before (one 6-word query, `baseline-results.json`, `run-eval.js`) | 2 / 30 | 1 / 30 | 1 / 30 |
| Now (two short title queries, `variant-B.json`, `variants.js B`) | 5 / 30 | 2 / 30 | 2 / 30 |

Read this plainly: it finds a true duplicate about 1 time in 15. GitHub search matches keywords, and many duplicates are worded very differently from the original, so the real limit is search recall, not ranking. A semantic search step is the next thing to build. The numbers are small-sample and for one repo.

`run-eval.js` runs the workflow's own Normalize and Rank code as it was in the first version. `variants.js` re-runs the same pairs with the shipped query strategy (it re-implements that strategy in JS, same as the Normalize node).
