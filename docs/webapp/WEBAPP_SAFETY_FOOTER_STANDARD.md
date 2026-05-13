# WebApp Safety Footer Standard (Phase 94)

The safety footer is the single, frozen signal to operators / supervisors / admins that the WebApp surface is read-first and that no automation runs in the background. Phrasing is **exact** and must not be reworded.

---

## 1. Required exact phrases (every operational route)

Every operational route renders a final `cbv-card` containing **all four** phrases:

- `No auto assign`
- `No auto resolve`
- `No auto escalate`
- `No production claim`

Recommended rendering:

```
Safety: No auto assign · No auto resolve · No auto escalate · No production claim.
```

A separator (`·`, `|`, line break) is acceptable, but the phrases themselves must be identical and complete.

## 2. Additional phrase for Timeline + Kanban

Timeline (`/home-alert/timeline`) and Kanban (`/home-alert/kanban`) also include:

- `No drag-drop save`

Recommended rendering:

```
Safety: No auto assign · No auto resolve · No auto escalate · No production claim · No drag-drop save.
```

## 3. Allowed embellishment

It is acceptable to combine the safety phrases with the page-specific notes (e.g. Admin Reference adds `Secrets masked`). Page-specific notes must come **after** the four base phrases and must not contradict them. Example:

```
Read-first governance. Safety: No edit · No toggle · No delete ·
No feature flag toggle · No permission change · Secrets masked ·
No production claim.
```

The Phase 93 footer above is compliant because `No production claim` is present and `No edit / no toggle / no delete` strengthens (does not contradict) the base phrases.

## 4. Forbidden in any footer / report / handoff

- Any phrase that **claims** production readiness (e.g. `production ready`, `prod ready`).
- Any phrase that **recommends** auto-heal (e.g. `recommend auto-heal`, `enable auto-heal`, `auto-heal enabled`).
- Any phrase that **recommends** mutation / write action (e.g. `recommend mutation`, `enable write action`).
- Any phrase that **recommends** drag-drop save (e.g. `recommend drag-drop save`, `enable drag-drop save`).

The Phase 94 Test Console scans the handoff text for the above and fails with severity `CRITICAL` if any is found.

## 5. Why exact phrasing matters

Operators screenshot the WebApp UI and reports. Exact phrasing makes audit trails machine-readable:

1. Auditors `grep` for the canonical phrases in screenshots / OCR.
2. Test Console `addCheck()` calls compare phrases verbatim.
3. The mutation validator never relaxes its rule based on "spirit" — only literal text.

## 6. Per-route phrase requirements

| Route | Base 4 phrases | Drag-drop save | Page-specific add-ons (allowed) |
|-------|----------------|----------------|---------------------------------|
| `/workspace` | Required | — | — |
| `/home-alert/my-queue` | Required | — | — |
| `/home-alert/sla` | Required | — | — |
| `/home-alert/timeline` | Required | **Required** | — |
| `/home-alert/kanban` | Required | **Required** | — |
| `/runtime/health` | Required | — | `No auto-heal` (Phase 92) |
| `/reports` | Required | — | `No delete report` / `No edit report` (Phase 92) |
| `/admin/reference` | Required | — | `No edit · No toggle · No delete · Secrets masked` (Phase 93) |

## 7. Validation

Run `🧪 CBV Test Console → Phase 94 — UI Freeze / UAT → Run UI Freeze Health Check`. The console returns `OK` for `SAFETY_BASE_*` checks per base phrase and `SAFETY_TK_NO_DRAG_DROP`. Any `ERROR` here must be fixed before pilot tag.
