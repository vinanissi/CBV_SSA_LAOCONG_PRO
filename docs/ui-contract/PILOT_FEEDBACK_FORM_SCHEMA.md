# Pilot feedback form schema

Simple append-only feedback capture (Google Form, Sheet, or external tool). Column names are **suggestions**—align headers if you use a Sheet.

| Column | Type | Notes |
|--------|------|--------|
| `FEEDBACK_ID` | string | Unique id per row (e.g. `FB_` + timestamp or UUID). |
| `PILOT_DATE` | date | Local date of test session. |
| `TESTER_EMAIL` | string | `USEREMAIL()` equivalent at capture time. |
| `TESTER_ROLE` | string | e.g. `ADMIN`, `SUPERVISOR`, `OPERATOR`. |
| `SCREEN_CODE` | string | From `CBV_UI_CONTRACT.SCREEN_CODE`. |
| `CHANNEL` | string | `APPSHEET`, `WEBAPP`, or `BOTH`. |
| `TASK_SCENARIO` | string | Short label (e.g. `CLAIM_UNASSIGNED`, `RESOLVE_MY_QUEUE`). |
| `RESULT` | string | `PASS`, `WARN`, or `FAIL`. |
| `SPEED_RATING` | number | 1–5 (optional). |
| `USABILITY_RATING` | number | 1–5 (optional). |
| `CONFUSION_POINT` | text | What confused the tester. |
| `ERROR_MESSAGE` | text | Exact error text if any. |
| `SUGGESTED_FIX` | text | Tester’s suggestion. |
| `IS_BLOCKER` | boolean / Yes-No | Stops pilot if true. |
| `CREATED_AT` | datetime | Append-only timestamp. |

**Rules:** append-only rows; do not delete prior feedback during pilot. Redact secrets before sharing externally.
