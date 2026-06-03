# OCMS Case Strip Layout Authority — V0

**Version:** 0.1  
**Status:** Design authority (layout spec)  
**Phase:** `PHASE_OCMS_02B_CASE_STRIP_LAYOUT_AUTHORITY`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md`  
**Visibility:** `OCMS_CASE_STRIP_VISIBILITY_RULES.md`  
**Flag:** `OCMS_CASE_STRIP_ENABLED`

---

## 1. Purpose

Define **placement, size, and interaction** of the Case Context Strip in Work Inbox Focus Mode — complementing OCMS_02A (what to show).

---

## 2. Placement decision

| Decision | Value |
|----------|-------|
| **Region** | Focus **Main Area** (left / center content column) |
| **Position** | Directly **below** `CompactTaskHeader` |
| **Above** | AI Summary (compact), Checklist, Attachments, Action Bar |
| **Not in** | Right Panel (default for OCMS_03) |

### 2.1 Why Main Area, not Right Panel

- Operator reads **task first** (header), then **case context**, then **work** (checklist).
- Right Panel already hosts Chi tiết / Timeline / Handoff / Tài liệu — case context would compete or hide when panel collapsed/tab away.
- Case context must appear **near task** without switching tabs.

### 2.2 Future (out of OCMS_03)

Right Panel tab **"Case"** allowed only with new ADR — may duplicate summary, not replace Main Area strip in v1.

---

## 3. Layout anatomy

```text
┌─────────────────────────────────────────────────────────┐
│ Focus Main Area                                         │
├─────────────────────────────────────────────────────────┤
│ CompactTaskHeader                          (unchanged)  │
├─────────────────────────────────────────────────────────┤
│ CaseContextStrip                           (OCMS_03)    │
│  visibility: MINIMAL | STANDARD | EXPANDED | hidden     │
├─────────────────────────────────────────────────────────┤
│ AI Summary / Case summary compact        (unchanged)    │
├─────────────────────────────────────────────────────────┤
│ Checklist                                  (unchanged)  │
├─────────────────────────────────────────────────────────┤
│ Attachments / Activity Feed                (unchanged)  │
├─────────────────────────────────────────────────────────┤
│ Action Bar                                 (unchanged)  │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐
│ Right Panel      │  ← NO Case Strip in OCMS_03
│ Chi tiết         │
│ Timeline         │
│ Handoff          │
│ Tài liệu         │
└──────────────────┘
```

---

## 4. Height budget by visibility level

| Level | Max height | Rows | Notes |
|-------|------------|------|-------|
| **HIDDEN** | 0 | 0 | No DOM node; no margin reserve |
| **MINIMAL** | 28–36px | 1 | Chips + optional warning |
| **STANDARD** | 48–72px | 1–2 | Primary relation + 1 memory line |
| **EXPANDED** | 96–128px | 3–5 | HO_SO/FINANCE; collapse control required |

**CSS guidance (OCMS_03):** `max-height` + `overflow: hidden` + optional fade at bottom when clamped — **no inner scroll** in v1.

---

## 5. Responsive / density behavior

| Condition | Behavior |
|-----------|----------|
| Desktop (default) | Full width within main content card |
| Narrow width | Wrap chips to second line; still respect max-height |
| Low Focus viewport height | Prefer STANDARD over EXPANDED; clamp EXPANDED → STANDARD |
| Density polish phases | Strip uses same spacing tokens as Focus cards |

**Forbidden OCMS_03:** strip-only scroll container, modal, new drawer.

---

## 6. Collapse / expand behavior

| Rule | Detail |
|------|--------|
| Default UI level | From `resolveStripVisibility()` — not layout ADR |
| Operator collapse | EXPANDED → STANDARD; STANDARD → MINIMAL optional (future) |
| Persist collapse | Optional `localStorage` key per task or global — not required v1 |
| Re-fetch on toggle | **No** — use existing CaseReadModel subset |
| Permanent EXPANDED | **Forbidden** if operator collapsed |

---

## 7. Interaction rules

1. Strip is **read-only** — no complete/assign/status buttons.
2. **Deep links** on relation labels when `permissions.canOpenRelated === true`.
3. **No link** when `canOpenRelated === false` — plain text only.
4. Collapse/expand is **local UI** — no task snapshot reload.
5. Click targets ≥ 44px where interactive (accessibility).
6. No fetch on expand if visibility spec fields already in model.

---

## 8. Main Area boundary

| Element | OCMS_03 rule |
|---------|--------------|
| CompactTaskHeader | Unchanged position/content ownership |
| CaseContextStrip | New slot only when flag on |
| AI Summary | Not removed; may visually follow strip |
| Checklist | Primary work — strip max heights enforced |
| Attachments | Unchanged flow |
| Action Bar | Unchanged |

---

## 9. Right Panel boundary

**OCMS_03 must not:**

- Add "Case" tab
- Move Timeline / Handoff / Tài liệu
- Change tab order or labels
- Render full `CaseReadModel` in panel

---

## 10. Field placement examples

### MINIMAL (28–36px)

```text
[Vận hành] [Đang xử lý] [Chưa xác định thực thể chính]
```

### STANDARD (48–72px)

```text
Hồ sơ gia nhập — Nguyễn X
[Hồ sơ] [Chờ duyệt] [HS-2026-001] · Gần nhất: Bổ sung giấy tờ
```

### EXPANDED (96–128px)

```text
Hồ sơ gia nhập — Nguyễn X
[Hồ sơ] [Chờ duyệt] [Chưa có kết quả]
Hồ sơ: HS-2026-001 · Xã viên: Nguyễn X
Phụ trách: Cán bộ hồ sơ · Duyệt: Trưởng phòng
Gần nhất: Bổ sung giấy tờ CMND                                    [Thu gọn]
```

### FINANCE privacy (STANDARD/EXPANDED)

```text
[Tài chính] [Chờ duyệt] Một số thông tin tài chính bị ẩn.
```

Field eligibility per `OCMS_CASE_STRIP_VISIBILITY_RULES.md` §5.

---

## 11. Accessibility notes

- Strip region: `role="region"` + `aria-label="Ngữ cảnh case"` (or similar Vietnamese).
- Collapse button: `aria-expanded`, keyboard operable.
- Color chips must not be sole lifecycle indicator — include text label.
- Warning lines: `aria-live="polite"` if dynamic.

---

## 12. Anti-patterns

| Pattern | Reject |
|---------|--------|
| Strip replaces task header | Header owns task identity |
| Strip in Right Panel (OCMS_03) | ADR placement |
| Strip > 128px without scroll ADR | Height cap |
| Mutation buttons in strip | Read-only |
| Placeholder gap when HIDDEN | Zero footprint |
| Debug JSON in strip | Visibility rules |

---

## 13. OCMS_03 implementation notes

1. **Mount point:** In `FocusTaskWorkspace` (or equivalent) after `CompactTaskHeader`, before summary/checklist blocks.
2. **Component:** `WorkInboxCaseContextStrip.tsx` — props: `{ level, lines, links, onCollapse, warnings }`.
3. **Styles:** BEM or existing Focus tokens; subtle border/background — secondary visual weight vs header.
4. **Flag guard:** if `!OCMS_CASE_STRIP_ENABLED` → do not mount (no empty div).
5. **Visibility + layout:** `resolveStripVisibility(model)` → level; layout authority → max-height + template.
6. **Tests:** Snapshot per level with fixed width; assert max-height classes.

---

## 14. Document map

| Document | Role |
|----------|------|
| `ADR_OCMS_CASE_STRIP_LAYOUT_AUTHORITY.md` | ADR |
| `OCMS_CASE_STRIP_VISIBILITY_RULES.md` | §14 layout binding |
| `OCMS_READ_MODEL_CONTRACT.md` | §13 layout usage |

---

*Append-only layout authority.*
