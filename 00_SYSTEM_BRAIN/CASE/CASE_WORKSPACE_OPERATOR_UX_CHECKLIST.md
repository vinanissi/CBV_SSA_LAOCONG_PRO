# Case Workspace — Operator UX Checklist

**Phase:** `PHASE_CASE_REFACTOR_03_CASE_WORKSPACE`  
**Enable:** `VITE_CASE_WORKSPACE_ENABLED=true`

---

## Identification

- [ ] Operator sees **"Case đang xử lý"** and case title immediately
- [ ] Case type and workflow state badges visible
- [ ] Responsible shown honestly (or "Chưa gán phụ trách")
- [ ] Raw canonical `caseKey` not dominant (displayKey only if shown)

## Current task

- [ ] Section **"Công việc trong Case"** shows focus task as **Đang thực hiện**
- [ ] Hint shown when only single-task mode (multi-task deferred)

## Checklist

- [ ] Checklist section labeled **Checklist (Case)**
- [ ] Toggle/add still works (existing runtime)

## Documents

- [ ] Document links from read model when bundle loaded
- [ ] Attachment section still works (upload/manage)

## Timeline & Handoff

- [ ] Timeline preview shows recent entries (or honest empty)
- [ ] Handoff preview or honest empty
- [ ] Hints point to right panel for full detail

## Actions

- [ ] FocusActionBar complete/assign/pause/forward still work
- [ ] Right panel tabs (Detail/Timeline/Handoff/Documents) still work

## Compactness

- [ ] No debug dump of raw JSON
- [ ] Warnings only for WARNING/ERROR diagnostics

## Rollback

- [ ] Flag OFF → legacy Focus layout (no Case header block)
- [ ] No broken empty region where workspace was

---

*UAT evidence: `PHASE_CASE_REFACTOR_04_OPERATOR_UAT`.*
