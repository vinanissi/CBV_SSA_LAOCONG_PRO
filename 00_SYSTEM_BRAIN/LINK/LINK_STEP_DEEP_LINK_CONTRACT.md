# Checklist Step Deep Link Contract

**Phase:** `PHASE_LINK_01_STEP_DEEP_LINK`  
**Status:** ACTIVE

---

## URL shape

```text
/inbox/{taskId}?step={checklistItemId}
```

Query key: `CHECKLIST_STEP_QUERY_KEY` = `step`

Legacy `/tasks/{taskId}?step=` may resolve via inbox alias routes but canonical share links use `/inbox/`.

---

## Operations (UI-only)

| Operation | Description |
|-----------|-------------|
| buildChecklistStepDeepLinkHref | Absolute URL for clipboard |
| parseChecklistStepIdFromSearchParams | Read `step` on focus load |
| consumeChecklistStepDeepLink | Publish `DossierFocusRequest` with `source: step_deep_link` |
| clearChecklistStepFromSearchParams | Remove `step` after consume (replace navigation) |
| copyChecklistStepLinkToClipboard | Row action **Copy link bước** |

---

## Cross-focus reuse

Step deep links reuse **PHASE_DOSSIER_04** bus:

- `publishDossierCrossFocus` via `requestDossierCrossFocus`
- `useChecklistCrossFocusListener` — scroll, expand, highlight
- DOM id: `cbv-checklist-item-{checklistItemId}`

---

## Rules

- Stale `step` id: warn via `validateDossierFocusRequest`; do not scroll; still clear query param.
- No Sheet/Drive/API writes for link build or consume.
- `step` param cleared after first consume per task+step key (replace URL).

---

## Next

`PHASE_LINK_02_STEP_DEEP_LINK_UAT` (operator smoke, optional dossier “Copy link bước”)
