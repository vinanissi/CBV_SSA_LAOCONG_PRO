## PHASE 80C — HOME_ALERT_OPERATIONAL_UX_RUNTIME (PROMPT LOG)

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

Repo PC: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
GitHub: `https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO`  
Branch bắt buộc: `phase/from-v2.4.1-TASK-FIN`

Tham chiếu bắt buộc: **CBV Operational Ecosystem Standard V1** — runtime-first, memory-first, append-only, manual-first → auto-later.

## MỤC TIÊU

Nâng HOME_ALERT từ raw runtime table thành **Operational Cockpit UX** cho AppSheet.

Nguyên tắc:

- GAS sinh toàn bộ display fields.
- Google Sheet lưu cột vật lý.
- AppSheet chỉ hiển thị và bấm action.
- Không dùng Virtual Column.
- Không dùng AppSheet Bot.
- Không đưa logic UX vào AppSheet formula phức tạp.
- Không sửa logic TASK/FIN.
- Không auto trigger production.

## VIỆC PHẢI LÀM

1) Precheck repo (ghi lại output):

```powershell
git status -sb
git branch --show-current
git remote -v
```

2) Cập nhật schema `HOME_ALERT` (append-only) để bổ sung UX columns:

- DISPLAY_TITLE
- DISPLAY_SUBTITLE
- DISPLAY_STATUS
- DISPLAY_BADGE
- DISPLAY_ICON
- DISPLAY_COLOR
- DISPLAY_ACTION_TEXT
- DISPLAY_PRIORITY_LABEL
- DISPLAY_TIME_AGO
- DISPLAY_ASSIGNEE
- DISPLAY_SUMMARY
- DISPLAY_FOOTER
- CARD_GROUP
- CARD_SORT
- CARD_LAYOUT
- UX_VISIBLE
- UX_GROUP_ORDER
- UX_ACTION_HINT

3) Cập nhật GAS runtime để enrich UX fields trước upsert và khi state change.

4) Cập nhật AppSheet setup doc theo hướng Deck view + dùng DISPLAY_* + CARD_*; ẩn raw fields.

5) Thêm test console riêng cho UX runtime theo chuẩn CBV Test Console V1.

6) Tạo report + handoff append-only; git commit/push.

