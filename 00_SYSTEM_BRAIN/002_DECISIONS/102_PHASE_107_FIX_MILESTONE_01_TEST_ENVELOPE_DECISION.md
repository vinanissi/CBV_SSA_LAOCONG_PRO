# Decision log — Phase 107 (Milestone 01 test console envelope)

**Append-only.**

## Decision

Adopt **strict finalization**: `envelopeOk=false` or any ERROR/CRITICAL check ⇒ top-level `FAIL` / `ok=false`; never emit `GO` with a false envelope.

## Drive bundle

Serialize **one** consistent report object to all six files: build `exportDraft` with `DRIVE_SIX_FILE_BUNDLE` and reconciled `REPORT_ENVELOPE` **before** append-only `createFile` calls. Do not rely on a second pass that mutates in-memory state after JSON is written.

## UX shell markers

Prefer **raw template** (`HtmlTemplate.getCode()`) marker substring checks over `createHtmlOutputFromFile` parsing where Apps Script `<? ... ?>` breaks HTML evaluation.

## Tagging

No release tag for Milestone 01 from Phase 107 alone; requires verified new Drive bundle (`102_*`) per runbook.
