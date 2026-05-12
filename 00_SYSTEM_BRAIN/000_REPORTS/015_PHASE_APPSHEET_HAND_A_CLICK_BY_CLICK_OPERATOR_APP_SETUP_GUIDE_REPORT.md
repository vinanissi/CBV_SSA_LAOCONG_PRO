# 015 — PHASE APPSHEET_HAND_A — CLICK_BY_CLICK_OPERATOR_APP_SETUP — REPORT

**Date:** 2026-05-12  
**Branch:** `phase/from-v2.4.1-TASK-FIN`  
**Scope:** Documentation only (APPSHEET-HAND-A).

## FILES CREATED

- `00_SYSTEM_BRAIN/000_PROMPTS/015_PHASE_APPSHEET_HAND_A_CLICK_BY_CLICK_OPERATOR_APP_SETUP_GUIDE_PROMPT.md`
- `docs/appsheet/CLICK_BY_CLICK_HOME_ALERT_SETUP.md`
- `docs/appsheet/CLICK_BY_CLICK_TABLES_AND_COLUMNS.md`
- `docs/appsheet/CLICK_BY_CLICK_SLICES.md`
- `docs/appsheet/CLICK_BY_CLICK_VIEWS_AND_DASHBOARD.md`
- `docs/appsheet/CLICK_BY_CLICK_ACTIONS_SECURITY.md`
- `00_SYSTEM_BRAIN/000_REPORTS/015_PHASE_APPSHEET_HAND_A_CLICK_BY_CLICK_OPERATOR_APP_SETUP_GUIDE_REPORT.md`
- `00_SYSTEM_BRAIN/001_HANDOFF/015_PHASE_APPSHEET_HAND_A_CLICK_BY_CLICK_OPERATOR_APP_SETUP_GUIDE_HANDOFF.md`

## FILES UPDATED

- `docs/HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md`

## DOC COVERAGE

| Topic | File |
|-------|------|
| Tạo app, preview, mobile | `CLICK_BY_CLICK_HOME_ALERT_SETUP.md` |
| Tables, regenerate, Key/Label, Ref types | `CLICK_BY_CLICK_TABLES_AND_COLUMNS.md` |
| HOME_ALERT + MASTER + ENUM slices | `CLICK_BY_CLICK_SLICES.md` |
| Views, deck mapping OPERATOR_*, format rules | `CLICK_BY_CLICK_VIEWS_AND_DASHBOARD.md` |
| Actions, security filter, cấm bot/auto | `CLICK_BY_CLICK_ACTIONS_SECURITY.md` |

## TABLE SETUP COVERAGE

13 tables listed; Key/Label cho `HOME_ALERT`, `USER_DIRECTORY`, `TEAM_DIRECTORY`; Ref examples `ASSIGNED_TO`, `ASSIGNED_TEAM`; types `SLA_STATUS`, `ENABLED`.

## SLICE COVERAGE

8 `HOME_ALERT_*` slices + `MC_MODULE_CODE` + `ENUM_SLA_STATUS` with copy-paste filters; notes for `IS_DELETED` / USER_ID.

## VIEW/DASHBOARD COVERAGE

9 named views; deck mapping table for `OPERATOR_*`; legacy column ban; format rule example `SLA_BREACHED_RED`.

## ACTION/SECURITY COVERAGE

5 `ACT_*` names; sample CLAIM set columns; Show_If pointer; operator security OR example; supervisor pointer; anti-bot/auto list.

## WARNINGS

- AppSheet UI labels (**Create app**, **Regenerate**) có thể thay đổi theo phiên bản — user follows English/Vietnamese menu tương đương.  
- `ACT_CLAIM_ALERT` sample assumes **email** in columns — Ref `USER_ID` deployments need `LOOKUP` or webhook.  
- `HOME_ALERT_SLA_DASHBOARD` widget layout not fully specified (admin discretion).

## ERRORS

- None (static docs).

## NEXT STEP

Pilot user walks through all five files on staging app; align action implementation with team webhook policy.

## PRODUCTION READINESS

Docs ready for non-technical operators with admin support; no code deploy required.

## AI HANDOFF SUMMARY

HAND-A adds **five click-by-click** AppSheet guides + index pointer; no runtime. Keep **OPERATOR_*** deck mapping; no **DISPLAY_*/CARD_*/UX_*/DESKTOP_*** on operator deck; no Bot/auto assign/resolve/escalate.

## GIT STATUS

_(After commit.)_

## COMMIT / PUSH / TAG STATUS

_(After git.)_
