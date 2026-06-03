# Checklist Step Deep Link Authority

**Phase:** `PHASE_LINK_01_STEP_DEEP_LINK`  
**Status:** ACTIVE

---

## Authority Scope

This authority governs governance-only packaging of `PHASE_LINK_01_STEP_DEEP_LINK` checklist step deep links:

- URL query consumption: `?step={checklistItemId}` on `/inbox/:taskId`
- Consume behavior: publish cross-focus focus request to reuse `PHASE_DOSSIER_04` bus
- UI affordance: row action **Copy link bước**

This authority does not define persistence semantics; it only bounds allowed changes.

## Runtime Boundaries

Runtime boundaries that must remain preserved:

- Deep-link generation, parsing, and navigation behavior in the Work Inbox frontend
- Dossier cross-focus bus usage (`useChecklistCrossFocusListener`, `requestDossierCrossFocus`, DOM id `cbv-checklist-item-{id}`)
- No Sheet/Drive/API writes introduced for deep-link focus/copy affordances

---

## Authority

| Concern | Owner |
|---------|--------|
| Query param name `step` | `apps/workboard/src/modules/task/inbox/link/stepDeepLinkTypes.ts` |
| URL build/parse | `stepDeepLink.ts` |
| Focus consume | `stepDeepLinkNavigation.ts` → dossier cross-focus bus |
| UI copy affordance | `SmartChecklistItemRow` + `WorkInboxChecklistSection` |
| Contract | `00_SYSTEM_BRAIN/LINK/LINK_STEP_DEEP_LINK_CONTRACT.md` |

---

## Boundaries

- Does not replace dossier **Đi tới bước** (in-panel navigation).
- Does not persist deep-link state server-side.
- Does not change TASK_MAIN / Sheet schema.

## Allowed Changes

For `PHASE_LINK_01_STEP_DEEP_LINK` and its governance closeout (`PHASE_LINK_01A_GOVERNANCE_CLOSEOUT`), allowed changes are limited to:

- Governance artifacts: reports, handoffs, authority docs, ADRs, and test-evidence writeups
- Append-only evidence improvements and traceability documentation
- Static-code review validation steps (no runtime behavior modification)

## Forbidden Changes

The following changes are forbidden for this phase/family:

- No business logic change
- No workflow change (no new user journey steps)
- No persistence change (no Sheet/Drive writes)
- No schema change

---

## Rollback

Remove `useChecklistStepDeepLinkConsumer` wiring and row **Copy link bước** button; dossier cross-focus remains unchanged.

## Governance Requirements

Governance must ensure:

- The deep-link contract exists (`LINK_STEP_DEEP_LINK_CONTRACT.md`)
- Authority artifact exists and explicitly bounds runtime behavior
- Evidence exists for generation, parsing, consume behavior, invalid/missing step handling, URL cleanup, and copy-link behavior
- Evidence is explicitly marked as Verified / Partially Verified / Not Verified per test item

## Evidence Requirements

Evidence must be traceable and non-fabricated:

- Browser-only DOM scroll/highlight/clipboard success must be marked Partially Verified or Not Verified if not executed in a browser/UAT session
- Static checks and code review evidence are acceptable for non-browser items

## Completion Requirements

Completion is satisfied only when:

- Required governance artifacts for `PHASE_LINK_01_STEP_DEEP_LINK` and `PHASE_LINK_01A_GOVERNANCE_CLOSEOUT` exist
- Runtime boundaries remain preserved (deep-link behavior unchanged)
