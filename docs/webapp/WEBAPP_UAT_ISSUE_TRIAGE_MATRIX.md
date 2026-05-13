# WebApp UAT Issue Triage Matrix

Classification rules for every feedback row captured in Phase 95. Source of truth: `CbvWebAppUat_getIssueTriageMatrix()`.

---

## 1. Severity ladder

| Severity | Signoff impact | Action rule |
|----------|----------------|-------------|
| `BLOCKER` | **Blocks pilot signoff.** | Must be fixed before signoff. **No waiver allowed.** |
| `HIGH` | Conditional. | Must be fixed before signoff, **or** explicitly waived in the signoff template. Max **2 waived per pilot**. |
| `MEDIUM` | Non-blocking. | Tracked follow-up. Documented in the signoff appendix. |
| `LOW` | Non-blocking. | Logged for backlog. No immediate action required. |
| `OBSERVATION` | Informational. | Captured for future polish. Not actionable in pilot. |

## 2. Examples

### 2.1 BLOCKER

- A route returns HTTP 500 or a white screen on any supported breakpoint.
- A secret / token / API key is rendered in plain text.
- A user email appears in full (not masked) anywhere in `/admin/reference`.
- A drag-drop save handler actually fires in Kanban (any save behaviour, even no-op).
- A mutation button (Edit / Delete / Toggle / Save / Assign / Resolve / Escalate) is visible.
- A production-ready claim appears in any UI / report / handoff text.
- The Phase 94 safety footer (base 4 phrases) is missing from any operational route.
- Operator cannot complete the My Queue core workflow at all.

### 2.2 HIGH

- One of the four base safety phrases is reworded (e.g. "No autoassign" instead of "No auto assign") — still incorrect but the page works.
- Warning state encodes status by colour only (no text).
- Mobile critical text is clipped at 360px.
- Supervisor cannot identify breached SLA without zooming in.
- Operator misreads "next action" wording on ≥30% of cards.

### 2.3 MEDIUM

- Card title wraps awkwardly on tablet.
- Badge wording is ambiguous but understood with one re-read.
- Tooltip is missing where it would help; not present anywhere else either.
- Page header chip overlaps with the route chip at narrow widths.

### 2.4 LOW

- Padding slightly inconsistent between cards on desktop.
- Capitalisation drift in a sub-section heading.
- Minor alignment quirk in the safety footer.

### 2.5 OBSERVATION

- "I think this icon would help" — no functional defect.
- "Could we add a refresh button?" — feature request, deferred to a later mutation/feature phase.
- "Colour scheme feels formal" — subjective preference.

## 3. Classification rules

1. **Default to the more severe level** if you are unsure between two adjacent levels.
2. **One row per issue.** If a step exposes two issues, log two rows.
3. **A row's `IS_BLOCKER` field is `true` iff `SEVERITY = BLOCKER`.** No exceptions.
4. **Cluster duplicates after the trial**, not during capture. Always keep the originals.
5. **OBSERVATION rows are never lifted to actionable severity later** without a fresh row recorded by a reviewer.

## 4. Waiver rules (HIGH only)

A waiver is recorded **only** in `WEBAPP_PILOT_SIGNOFF_TEMPLATE.md`. Each waiver must include:

1. The HIGH issue (route, scenario, severity).
2. Why it is acceptable to ship the pilot with this issue open.
3. The mitigation in the meantime (operator-side workaround, supervisor-side check).
4. The planned fix window (target phase or sprint).
5. The signoff signatures (UAT lead + Phase 95 owner).

Maximum **2 waivers** per pilot. A third HIGH issue forces a `NO_GO` outcome unless one of the existing waivers is rescinded by recording an append-only correction.

## 5. Signoff impact summary

- **BLOCKER count = 0** is required for any GO / GO_WITH_WARNINGS outcome.
- **HIGH count ≤ 2 with waivers** is required for GO_WITH_WARNINGS.
- **MEDIUM / LOW / OBSERVATION** do not block signoff.

See `WEBAPP_PILOT_GO_NO_GO_CRITERIA.md` for the decision rules.
