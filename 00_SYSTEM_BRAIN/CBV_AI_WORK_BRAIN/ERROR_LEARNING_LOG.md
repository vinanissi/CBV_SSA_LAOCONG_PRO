---
doc: ERROR_LEARNING_LOG
module: CBV_AI_WORK_BRAIN
purpose: Capture learnings from failures, near-misses, and drill-downs
doctrine: Append-only dated entries; never delete prior lessons
updated: 2026-05-11
---

# ERROR_LEARNING_LOG

## How to add an entry

Use a dated subsection per incident or class of error. Include: symptom, root cause (once known), fix, prevention.

## 2026-05-11 — Credential hygiene (audit finding)

- **Symptom:** Git remote configured with token-in-URL pattern.
- **Root cause:** Credential embedded directly in `origin` URL (operator configuration).
- **Fix:** Rotate token; `git remote set-url` to credential-free URL; use OS credential store or SSH.
- **Prevention:** Block PAT-in-URL in onboarding checklist; periodic `git remote -v` review.

_No production incidents recorded in this scaffold._
