# 108 — Phase 408 — Fix Milestone 04 action stack safety copy — Report

**Date:** 2026-05-14  
**Branch:** `phase/from-v2.4.1-TASK-FIN`

## Audit source

Drive / local reference: **`107_MILESTONE_04_OPERATION_EXECUTION_FLOW_*`** — `ACTION_STACK_SAFETY` ERROR with `hit: ["Hoàn tất"]`; `REPORT_ENVELOPE` ERROR followed from run FAIL (rule unchanged).

## Root cause

Banned token **`Hoàn tất`** was matched **case-insensitively as a substring** inside legitimate safety copy:

- `998U` — `CbvExecFlow_getOperatorPrompt_` and `CbvExecFlow_buildCognitionGuideHtml_` used phrases like **`không tự động hoàn tất`** / **`không tự hoàn tất`**, which contain **`hoàn tất`** after lowercasing.
- `WEBAPP_OPERATION_FOCUS_MODE.html` — subtitle contained **`không hoàn tất tự động`** (same substring issue).
- `998S` — Daily task card footer used **`tự hoàn tất`** (aligned wording only; not required for the original false positive but keeps operational copy consistent).

No separate “Hoàn tất” CTA button existed; the test was **correctly strict**; the **copy was unsafe relative to the scanner contract**.

## Files updated

- `05_GAS_RUNTIME/998U_WEBAPP_OPERATION_EXECUTION_FLOW.js` — operator prompt + cognition safety line wording
- `05_GAS_RUNTIME/html/WEBAPP_OPERATION_FOCUS_MODE.html` — focus subtitle wording
- `05_GAS_RUNTIME/998S_WEBAPP_DAILY_OPERATION_FLOW.js` — READ_FIRST footer line on daily card
- `05_GAS_RUNTIME/998V_MILESTONE_04_EXECUTION_FLOW_TEST_CONSOLE.js` — zoned scan (`actionStack`, `cockpit`, `focus`), `unsafeHits`, `snippetSafe`, `scannedLen`; banned list **unchanged**

## Replacement wording (summary)

| Before (problem) | After (safe) |
|------------------|--------------|
| `... hoàn tất / leo thang` | `... kết thúc task / leo thang` |
| `không tự hoàn tất` | `không tự kết thúc task` |
| `không hoàn tất tự động` | `không tự kết thúc task từ WebApp` |
| `tự hoàn tất` (Daily footer) | `tự kết thúc task` |

## Safety test

- **`ACTION_STACK_SAFETY`:** still **ERROR** if any banned substring appears in action stack HTML, execution cockpit HTML, or focus body HTML.
- **`REPORT_ENVELOPE`:** logic **unchanged** (still fails closed when structural checks fail).

## Regression

M01/M02/M03/M04 routes and behaviors not intentionally removed; Daily copy change is wording-only on an existing READ_FIRST line.

## Expected next Drive bundle

**`108_MILESTONE_04_OPERATION_EXECUTION_FLOW_*`** (sequence prefix from folder scanner + tagStem `MILESTONE_04_OPERATION_EXECUTION_FLOW`).

## Tag readiness

Do **not** tag until a real GAS run produces the **108_** bundle with `envelopeOk=true` and `ACTION_STACK_SAFETY` OK.
