# OCMS Case Strip — Real Operator UAT Script

**Phase:** `PHASE_OCMS_03B_REAL_OPERATOR_UAT`  
**Surface:** Work Inbox Focus → Case Context Strip  
**Prerequisite flags (`.env.local`):**

```env
VITE_OCMS_CASE_STRIP_ENABLED=true
VITE_OCMS_UAT_TELEMETRY=true
```

---

## Session setup

1. Clear prior counters: DevTools console → `sessionStorage.removeItem('cbv_ocms_strip_uat_v1')`
2. Open `/inbox` Focus on ≥5 varied tasks (see scenarios)
3. End session: console → `copy(window.__OCMS_UAT_EXPORT__())` — paste JSON into UAT evidence

---

## Scenarios (O1–O8)

| ID | Task profile | Observe | Pass criteria |
|----|--------------|---------|---------------|
| O1 | Task-only | Strip below header, type **Vận hành** | Context without duplicating task title |
| O2 | Task + `relatedHoSoId` | EXPANDED-cap strip, HO_SO relation | Faster hồ sơ context vs header alone |
| O3 | Finance ref, STAFF role | Privacy warning line | No raw amounts; warning visible |
| O4 | Missing/unreadable anchor | Diagnostic warning | No fake HO_SO/FINANCE data |
| O5 | EXPANDED strip | Click **Thu gọn** | Collapses to STANDARD; checklist still visible without excessive scroll |
| O6 | Relation deep link | Click relation `<a>` | Navigation intent clear (may 404 if route unwired) |
| O7 | Flag OFF restart | Remove strip flag, reload | Zero strip DOM; layout unchanged |
| O8 | Right Panel | Chi tiết / Timeline / Handoff / Tài liệu | No Case tab added |

---

## Operator feedback (free text)

Record per session:

- Did strip help understand case context? (1–5)
- Did strip confuse task vs case? (Y/N + note)
- Was checklist pushed too far down? (Y/N)
- Were diagnostics understandable? (Y/N)

**Do not invent scores** — leave blank until real operators complete script.

---

## Metrics (from `__OCMS_UAT_EXPORT__`)

| Metric | Formula |
|--------|---------|
| stripUsageRate | stripImpressions / focusTaskViews |
| collapseRate | collapseClicks / stripImpressions |
| relationClickRate | relationLinkClicks / stripImpressions |
| diagnosticFrequency | diagnosticLineImpressions / stripImpressions |
| discoverySuccessRate | discoveryResolved / stripImpressions |

---

## Governance

- Read-only strip — no complete/assign actions on strip
- No CASE_MAIN / write API
- Telemetry: sessionStorage only — not production analytics

---

*Operator-maintained UAT script for OCMS_03B.*
