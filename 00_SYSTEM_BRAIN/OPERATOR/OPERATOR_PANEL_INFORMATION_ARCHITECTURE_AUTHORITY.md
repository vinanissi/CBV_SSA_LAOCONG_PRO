# Operator Panel Information Architecture — Authority

**Status:** LOCKED (PHASE_OPERATOR_PANEL_INFORMATION_ARCHITECTURE_V1)  
**Builds on:** `OPERATOR_DESIGN_BASELINE_AUTHORITY.md`, `CHECKLIST_RIGHT_PANEL_LAYOUT_AUTHORITY.md`

---

## Top-level right panel tabs

```text
Chi tiết | Timeline | Handoff | Hồ sơ | Kỹ thuật
```

Default selected tab for operators: **Chi tiết**.

---

## Tab ownership

### Chi tiết — Operator Action Center

**Allowed only:**

- Tóm tắt nghiệp vụ
- Thao tác nghiệp vụ
- Cập nhật xử lý
- Liên hệ / Hỗ trợ
- Friendly business fields (đơn vị, loại việc, phụ trách, trạng thái, ưu tiên, hạn, SLA)

**Forbidden:**

- Timeline gần nhất / timeline lists
- Thông tin kỹ thuật / task IDs / sync diagnostics
- Debug fields

### Timeline — Operational History

- Timeline gần nhất (preview slice)
- Timeline đầy đủ (full stream)
- Operational load/error states for history

### Handoff — Transfer Context

- Existing handoff view (unchanged ownership)

### Hồ sơ — Related Dossier

- `DossierAggregatePanel` (unchanged ownership)

### Kỹ thuật — Technical Diagnostics

- Task / entity IDs, source, timestamps
- Focused checklist step ID when dual-pane focus active
- Checklist sync bridge state (read-only mirror of footer context)
- Pointer to footer Console for worker/runtime detail

---

## Implementation anchor

- `OperatorDetailPanel` — Chi tiết body only
- `OperatorPanelTimelineList` + Timeline tab in `RightContextTabs`
- `OperatorTechnicalPanel` — Kỹ thuật tab

---

## Footer boundary

Worker connection, task counts, checklist sync badge, and Console remain **footer-only** — not duplicated as primary operator workflow in Chi tiết.
