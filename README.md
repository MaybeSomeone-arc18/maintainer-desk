# Maintainer Desk

A working front-end prototype for Hack Sprint's AI Automation with n8n track, by Scrap Builders. Open `index.html` in any modern browser. No build, install, credentials or external service are needed.

## What works now

- Three clearly labeled **sample** issues can be selected in the queue.
- Each shows a written triage rationale, context to check and an editable suggested reply.
- The draft can be reset, and an issue can be marked reviewed **in the current browser session only**. Nothing is sent to GitHub.
- The layout adapts to narrower screens.

The sample issues, explanations and suggested replies are authored fixture content. They are not results from a live model, retrieval system, or GitHub repository.

## Proposed next build

1. Use a GitHub issue webhook as the n8n trigger; validate and normalize event fields.
2. Fetch related issues and project documentation through an authenticated service, then rank candidate context.
3. Draft a recommendation with linked evidence, surface it for human review, and keep all public write actions behind approval.
4. After approval, have n8n post the edited reply or apply a label with an audit trail.
5. Test on seeded issues before claiming accuracy or time savings.

This repository currently contains **only a front-end prototype**. It does not include an n8n workflow, API integration, model inference, real issue ingestion, measured results, or live automation. The round-two deck's architecture and data-flow diagram describe the intended system, not completed functionality.
