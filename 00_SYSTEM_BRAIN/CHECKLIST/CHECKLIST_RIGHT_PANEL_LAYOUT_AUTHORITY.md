# Checklist Right Panel Layout — UX Authority

**Status:** LOCKED (PHASE_CHECKLIST_RIGHT_PANEL_FULL_REMOVE_QUICK_SUMMARY)  
**Builds on:** `CHECKLIST_INLINE_CENTER_PANEL_AUTHORITY.md`, `CHECKLIST_RIGHT_PANEL_DEDUP_AUTHORITY.md` (superseded for summary UI)

---

## UX rule

```text
CENTER = Checklist execution area
RIGHT PANEL = Supplementary context only (no checklist quick-action UI)
```

### CENTER (only place for checklist quick actions)

- Checklist rows
- Tick / Complete
- Phản hồi (inline)
- Tài liệu (inline)
- Liên kết (inline)
- Lịch sử (inline)

### RIGHT PANEL (allowed)

- **Chi tiết** — operator action center only (PHASE_OPERATOR_PANEL_INFORMATION_ARCHITECTURE_V1)
- **Timeline** — operational history (recent + full)
- **Handoff** — transfer context
- **Hồ sơ** — dossier / documents
- **Kỹ thuật** — technical diagnostics (not default tab)

### Chi tiết tab (action center only)

1. Tóm tắt nghiệp vụ  
2. Thao tác nghiệp vụ  
3. Cập nhật xử lý  
4. Liên hệ / Hỗ trợ  

**Not in Chi tiết:** timeline lists, technical IDs, sync diagnostics — see `OPERATOR_PANEL_INFORMATION_ARCHITECTURE_AUTHORITY.md`.

### RIGHT PANEL (forbidden)

- Checklist quick-action editors
- Checklist quick-action summaries
- Checklist quick-action counts / badges
- Instructional text directing operators to open quick actions on the right

`FocusedChecklistStepDetailPanel` MUST NOT render in the RIGHT column when dual-pane is enabled.

---

## Implementation anchor

- `RightContextTabs` — no `FocusedChecklistStepDetailPanel` mount
- `FocusedChecklistStepDetailPanel` — stub returns `null`
- `SmartChecklistItemRow` — `syncRightPaneFocus()` may update focus context for CENTER highlighting only

---

## Regression guard

Do not re-mount checklist step summary blocks above RIGHT tabs.
