# 006 — Common Misread Guardrails

**Read first.** Nếu vi phạm → dừng và đọc lại `000_AUTHORITY_INDEX.md`.

---

## MISREAD #1 — "V3 = code hiện tại"

| Sai | Đúng |
|-----|------|
| "CBV_WORK_INBOX_V3 đã implement xong" | V3 là **design authority**; code vẫn largely `/tasks` era |
| Sửa doc cho khớp code và gọi là V3 done | Implementation phase riêng |

---

## MISREAD #2 — "/tasks là route chính thức V3"

| Sai | Đúng |
|-----|------|
| Implement feature only on `/tasks` without alias plan | Target là `/inbox`; `/tasks` là **legacy AS-IS** |
| Đổi redirect `/` → `/tasks` khi user yêu cầu V3 | `/` → `/inbox` theo target |

**Runtime today:** `/tasks` ✓  
**V3 target:** `/inbox` ✓  
**Both can be true during migration.**

---

## MISREAD #3 — "cognition grouping = thiết kế cuối"

| Sai | Đúng |
|-----|------|
| Document V3 using `?group=cognition` as default | Cognition là **runtime AS-IS**, ẩn với Operator trong TO-BE |
| Giữ cognition tab cho Operator vì "đã có sẵn" | V3 groups: Need Action / Waiting / … |

---

## MISREAD #4 — "archive folder = spec chính"

| Sai | Đúng |
|-----|------|
| Đọc `_archive_runtime_baseline_20260529/` làm implementation guide cho V3 mới | Archive = **historical** snapshot |
| Xóa archive để "dọn repo" | Append-only — giữ archive |

---

## MISREAD #5 — "focusQueueMode = V3 Focus Mode"

| Sai | Đúng |
|-----|------|
| Rename toggle và gọi là V3 Focus done | Hành vi khác: dim nhiều card vs **1 task** |
| Single-task UI mà không ẩn filter/nav | Xem `010_FOCUS_MODE_SPEC.md` |

---

## MISREAD #6 — "report pass 1 = source of truth"

| Report | Hiểu đúng |
|--------|-----------|
| `CBV_WORK_INBOX_V3_DESIGN_CONTRACT_PACK_REPORT.md` | Lịch sử: lúc đó doc mô tả **runtime** |
| `PHASE_UI_CBV_WORK_INBOX_V3_DESIGN_CONTRACT_REPORT.md` | Lịch sử: tạo **target** + archive |

**Governance:** `AUTHORITY/` + `README.md` điều phối.

---

## MISREAD #7 — "design contract = permission to rewrite AppShell"

| Sai | Đúng |
|-----|------|
| Big-bang rewrite AppShell trong một PR | Minimal invasive; aliases; feature flags |
| Xóa RuntimeStatusBar / DetailPanel | Không phá runtime (ecosystem rule) |

---

## MISREAD #8 — "Operator thấy SLA/trace/debug"

| Sai | Đúng |
|-----|------|
| Hiển thị traceId mặc định trên card | Error path / admin only |
| SLA raw fields trên card | Operator labels only |

---

## MISREAD #9 — "authority phase = implement FE"

| Sai | Đúng |
|-----|------|
| Tạo `/inbox` route trong authority phase | **DOC ONLY** — no `apps/workboard` changes |
| Commit without user ask | User rule |

---

## MISREAD #10 — "search replaces inbox"

| Sai | Đúng |
|-----|------|
| Biến `/search` thành home | Inbox default; search phụ |
| Bỏ filter vì "có search rồi" | V3 vẫn có grouped inbox |

---

## Quick self-test (agent)

Trả lời bằng một dòng trước khi code:

```text
Task class: [AS-IS-FIX | TO-BE-IMPL | DOC-ONLY | AUTHORITY]
Default route I am targeting: [/tasks | /inbox | N/A-doc]
Grouping I am targeting: [cognition | V3-groups | N/A]
```

Nếu không chắc → **DOC-ONLY** và hỏi user.
