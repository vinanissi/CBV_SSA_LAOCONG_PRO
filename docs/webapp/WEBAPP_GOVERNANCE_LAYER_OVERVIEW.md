# WebApp Governance Layer — Overview

The Governance Layer is the third read-first surface in the WebApp:

1. Pilot Pages (Phase 90/91) — operational workspace
2. Observability (Phase 92) — `/runtime/health`, `/reports`
3. **Governance (Phase 93)** — `/admin/reference`

It exists to answer the question *“what does the system think the rules are?”* — without giving the WebApp the ability to change those rules.

---

## 1. Why the Governance Layer exists

Operators frequently need to audit:

- which enum values are valid;
- who is in `USER_DIRECTORY` and what role / team / status they hold;
- which feature flags are enabled and who owns them;
- which UI contracts exist and which are pilot-ready;
- which routes are registered and whether they are read-first.

Historically this audit happens by directly opening the Google Sheet (database). That is brittle (operators see secrets), unsafe (someone may type into a cell), and inconsistent across pilot tenants. The Governance Layer normalizes the audit experience while preserving the **manual-first** principle for mutation.

## 2. Relation to the Observability Layer (Phase 92)

| Aspect | Observability (Phase 92) | Governance (Phase 93) |
|--------|--------------------------|------------------------|
| Question | “Is the system healthy *right now*?” | “What is the system configured to do?” |
| Sources | `PropertiesService` last reports, `SYSTEM_HEALTH_LOG`, `CBV_TEST_REPORTS` | Reference sheets + UI contract + route registry |
| Mutation | None (no auto-heal) | None (no edit / no toggle) |
| Routes | `/runtime/health`, `/reports` | `/admin/reference` |
| Failure mode | Missing report sheet → `GO_WITH_WARNINGS` | Missing reference sheet → warning row |

Both layers share the same envelope shape (`{ ok, data, warnings, errors, checkedAt }`) and the same CBV_TCS_V1 Test Console envelope. The Phase 93 mutation validator extends the Phase 91.1 / Phase 92 pattern (namespace-scoped, verb-at-start, allowlist + render-helper safelist).

## 3. Relation to the AppSheet / WebApp split

The CBV Operational Ecosystem Standard V1 defines:

- **Sheets/GAS** = operational database + runtime.
- **WebApp** = operational workspace (Phase 89–93).
- **AppSheet** = lightweight operator shell.

Mutation lives **outside the WebApp**. Operators perform manual-first actions in AppSheet (with security filters + slice scoping). Bulk / scripted mutation is done via GAS services with their own audit trail. The WebApp — including the Governance Layer — is intentionally **read-first** to keep the audit trail clean.

| Action | Where it happens |
|--------|------------------|
| Toggle feature flag | Manual edit on `FEATURE_FLAG` sheet (with audit), **not** in WebApp |
| Update permissions | Manual edit on `ROLE_PERMISSION_MATRIX`, **not** in WebApp |
| Create user | Operator flow in AppSheet + supervisor approval, **not** in WebApp |
| Edit UI contract | Phase 85 admin tools / sheet edit, **not** in WebApp |
| Add route | Code change + clasp push (Phase 89), **not** in WebApp |

## 4. What remains manual-first

- Feature flag toggling, role grants/revocations, user creation, permission changes.
- ENV-A handling (no token / secret rendered in any UI; values stored only in Script Properties or sealed configuration).
- Production certification (Phase 93 explicitly does **not** claim production readiness; pilot tag only after UAT).
- Any “fix” that touches actionable state — those go through GAS services or AppSheet workflows.

## 5. Pilot tags & versioning

- Phase 89: `v2.4.7-webapp-skeleton` (skeleton).
- Phase 90: `v2.4.8-webapp-pilot-pages`.
- Phase 91: `v2.4.8a-webapp-timeline-kanban`.
- Phase 92: `v2.4.9-webapp-observability` (optional pilot tag).
- **Phase 93 (this doc):** optional pilot tag `v2.4.10-webapp-admin-reference` after UAT.
- Phase 94 (planned): WebApp UI Foundation Freeze / UAT Hardening.

## 6. Safety summary

- Read-first. No edit / toggle / delete / permission change.
- Secrets / tokens / API keys / private keys / passwords masked — only column names + warning.
- Missing reference sheets → warning only, no auto-create.
- No auto assign / auto resolve / auto escalate.
- No production claim.

## 7. Forward look

Phase 94 will freeze the WebApp UI foundation (state machine, layout shell, navigation contract) and harden UAT. After Phase 94, the WebApp is a candidate for production sign-off; until then, every page (including `/admin/reference`) is **pilot only**.
