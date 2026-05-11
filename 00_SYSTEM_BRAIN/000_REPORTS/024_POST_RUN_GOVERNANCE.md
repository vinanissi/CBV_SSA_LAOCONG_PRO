---
doc: 024_POST_RUN_GOVERNANCE
phase: PHASE_B_LIVE_STAGING_OPERATOR_RUN_PREP
purpose: When to call green, warn, fail, freeze, and how to handle drift/incidents/secrets
generatedAt: 2026-05-11T23:00:00+07:00
---

# Post-run governance — TASK_OBS staging

## 1. When “green” may be declared

- **All** REQUIRED gates in `023_LIVE_STAGING_EXECUTION_GATE_CHECKLIST.md` are **Y**.
- Health and self-test outcomes **acceptable** to product owner for staging (no unresolved BLOCKER per org policy).
- **TASK_MAIN** mutation check **PASS**; append-only check **PASS**.

## 2. When only `GO_WITH_WARNINGS`

- Optional MAIN_CONTROL URL/token missing but TASK OBS paths OK.
- Non-zero WARN counts in self-test but **no** ERROR/BLOCKER and no data integrity concern.
- Cosmetic schema warnings already tracked with owner + date.

## 3. FAIL conditions

- Any **BLOCKER** not mitigated same day.
- **TASK_MAIN** changed or row count drift unexplained.
- Destructive operation detected (mass clear, wrong sheet deleted).
- Evidence shows run against **wrong** spreadsheet id.

## 4. Rollback conditions

- Bootstrap or self-test ran against **non-intended** file — use Drive version history; document incident in `ERROR_LEARNING_LOG` (append-only).
- Wrong code pushed to staging script — redeploy previous Apps Script version; Git revert **only** per normal dev process (no force push).

## 5. When production planning is allowed

- **Only** after: staging green declared + governance sign-off + separate **production** change request (outside this phase).
- Never “slip” prod deploy because staging passed.

## 6. When to freeze

- Incident open on wrong-environment run.
- Drift between vendored OBS and core-runtime-lib unresolved and blocks trust.
- Security review pending on optional webapp token usage.

## 7. Drift handling policy

- Track vendoring version in `DECISION_LOG` when bumping `250/251/255` from `core-runtime-lib`.
- Monolith `05_GAS_RUNTIME` gap: explicit doc per `docs/TASK_OBS_RUNTIME_VENDORING.md` — no silent merge.

## 8. Incident handling

- Append-only entry: date, severity, summary (no secrets), link to vault ticket.
- Rotate tokens if any secret appeared in logs.

## 9. Secret handling

- Never commit Script Properties values.
- If accidental commit: remove from history **only** per org security process (out of scope here); rotate credentials regardless.
