---
doc: 024_SANITIZED_RUNTIME_GIT_FLOW
phase: PHASE_B_LIVE_STAGING_OPERATOR_RUN_PREP
purpose: What may enter Git after a real staging RUN — redaction rules and example commands
generatedAt: 2026-05-11T23:00:00+07:00
---

# Sanitized runtime Git flow

## 1. Files **allowed** to commit after a real RUN

- New **sanitized** markdown under `00_SYSTEM_BRAIN/000_REPORTS/RUN_<timestamp>/` (recommended) **or** a single redacted summary file.
- Updated **gate checklist** (PDF/MD) with **no** URLs containing ids.
- Governance docs (`024_*`, `023_*`) if edited without embedding secrets.
- `DECISION_LOG` / `RUNTIME_OBSERVATION_LOG` entries that reference **“RUN completed YYYY-MM-DD”** without raw RUN_ID if policy forbids.

## 2. Files **never** commit

- `.clasp.json` (real).
- Any file containing **Spreadsheet ID**, **Script ID**, **PAT**, **webhook token**, **OAuth client secret**.
- Full Apps Script **project export** zip with `appsscript.json` containing deployment secrets.
- Unredacted screenshots with browser URL bar.

## 3. Redact RUN report

- Replace spreadsheet id with `REDACTED_STAGING_ID`.
- Replace script id with `REDACTED_SCRIPT_ID`.
- RUN_ID: keep full id **only** if policy allows; otherwise use `RUN_<first4>…<last4>` or hash `sha256(RUN_ID)` stored in vault map.

## 4. Redact screenshot

- Crop to sheet content; blur URL bar and file menu if needed.
- Remove grid lines showing row 1 formula bar if it contains id.

## 5. Redact Apps Script transcript

- Delete lines matching `PropertyService`, `getProperty`, token values.
- Replace URLs with `https://script.google.com/REDACTED`.

## 6. Commit runtime evidence (sanitized)

```bash
# Example: new RUN folder with only sanitized files
git add 00_SYSTEM_BRAIN/000_REPORTS/RUN_2026MMDD_HHMMSS/STAGING_RUN_SUMMARY_SANITIZED.md
git status --short
```

## 7. Tag runtime milestone

```bash
git commit -m "docs(runtime): record TASK_OBS staging green run evidence"
git tag -a phase-b-live-green-run-v0.1 -m "TASK_OBS staging green runtime evidence"
```

**Tag naming:** align with org; bump `v0.2` if tag exists.

## Pre-commit self-check

Manually review `git diff --cached` (or use your org’s secret scanner) for:

- Token prefixes (`ghp_`, `github_pat_`, etc.)
- Long alphanumeric strings matching spreadsheet / script ids
- `CBV_TASK_DB_ID=` with a value on the same line

If any appear → **unstage** and redact again.
