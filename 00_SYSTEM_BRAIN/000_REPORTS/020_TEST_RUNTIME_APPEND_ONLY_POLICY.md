---
doc: 020_TEST_RUNTIME_APPEND_ONLY_POLICY
phase: PHASE_B_TEST_RUNTIME
purpose: Policy for test/OBS runtime artifacts and logs
---

# TEST RUNTIME — append-only policy

## Applies to

- OBS sheet rows written by `CBV_Obs_append*` / TASK_OBS self-test / health.
- Markdown / JSON reports under `00_SYSTEM_BRAIN/000_REPORTS/` for phase audits.
- `DECISION_LOG`, `ERROR_LEARNING_LOG`, `RUNTIME_OBSERVATION_LOG` in `CBV_AI_WORK_BRAIN/`.

## Rules

1. **New facts = new rows or new sections** with date/time — do not delete prior audit conclusions to “rewrite history”.
2. **Corrections** are added as a **new** dated entry that references the prior entry (supersede by addition, not erasure).
3. **Sheet data:** avoid in-place mass `clear()` on OBS history tables; use new RUN_ID for a new test run row rather than editing finished run rows.
4. **JSON reports:** prefer new file or new array element in a run-scoped document; avoid destructive overwrite of signed-off baselines.

## Exceptions (operator-only, documented)

- PII redaction in exported copies (duplicate file with redacted values; keep original sealed per retention policy).
- GDPR/legal hold — out of scope here; follow org policy.
