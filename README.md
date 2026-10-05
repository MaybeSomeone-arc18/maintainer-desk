# Maintainer Desk

Triage help for open-source maintainers, by Scrap Builders for Hack Sprint's AI Automation with n8n track. It has two parts: a working n8n workflow, and a front-end review screen.

## What works now

### 1. n8n workflow (`workflows/maintainer-desk-triage.workflow.json`)

Import it into n8n (Workflows > Import from file), publish it, and POST a GitHub `issues` webhook payload to `/webhook/maintainer-desk-issue`.

Flow: webhook -> normalize and validate the event -> search related issues with the GitHub search API -> rank them by keyword overlap -> build a triage card -> return the card for human review.

The card has a recommendation, confidence, up to 3 related issues with scores, missing details (repro steps, version, failing command) and a suggested reply. Events that are not opened/edited/reopened issues are ignored.

Nothing is posted back to GitHub. A maintainer decides.

Tested locally in n8n 2.35 on 4 payloads:
- possible duplicate (against a mock GitHub search API)
- no close match (mock)
- non-issue event, ignored (mock)
- made-up issue in a public repo against the live GitHub search API: returned a missing-details card with 3 related issues

GitHub search is unauthenticated by default, so it is rate limited. Set `GITHUB_API_BASE` to point the workflow at another API host (used for the mock tests).

### 2. Review screen (`index.html`)

Open `index.html` in a browser. No build or install.

- Three clearly labeled **sample** issues can be selected in the queue.
- Each shows a written triage rationale, context to check and an editable suggested reply.
- The draft can be reset, and an issue can be marked reviewed in the current browser session only.

The sample issues and replies are authored fixtures. The screen is not connected to the workflow yet.

## Not built yet

- LLM reasoning step (the ranking today is keyword overlap, so paraphrased duplicates can be missed or ranked low)
- Documentation retrieval
- Approved write-back (n8n posting the edited comment or label)
- Connecting the review screen to the workflow output
- Measured accuracy or time savings. No such numbers exist yet.
