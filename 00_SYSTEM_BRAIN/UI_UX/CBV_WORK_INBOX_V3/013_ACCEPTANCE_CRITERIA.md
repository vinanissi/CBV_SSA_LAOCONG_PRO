# Acceptance Criteria

**Contract:** CBV_WORK_INBOX_V3

---

## UI Must Pass

- [ ] User nhìn thấy việc cần làm trong **2 giây**
- [ ] Không quá **5** tab/filter chính trên màn hình Inbox
- [ ] Có nhóm **Cần làm ngay**
- [ ] Có trạng thái **Quá hạn**
- [ ] Có trạng thái **Cần làm hôm nay**
- [ ] Có trạng thái **Chờ xử lý**
- [ ] Có trạng thái **Hoàn thành**
- [ ] Có nút **Mở xử lý** rõ ràng
- [ ] Có **Focus Mode** (single task)
- [ ] Có **deep-link** sang module liên quan
- [ ] Có **responsive mobile** layout
- [ ] Có trạng thái **loading / error / empty**
- [ ] Default route `/` → `/inbox`
- [ ] Role-based visibility enforced

---

## UI Must Fail If

- Cognition hiển thị mặc định cho Operator
- Runtime internals hiển thị mặc định cho Operator
- Có hơn **7** filter trên màn hình chính
- Cần hơn **3 click** để mở task
- Inbox không phải default screen
- Không có Focus Mode
- Không có route contract
- Không có role-based visibility

---

## Design contract phase (this phase)

| Check | Status |
|-------|--------|
| All spec files created | Required |
| Wireframes created | Required |
| Report created | Required |
| Frontend implementation | **Out of scope** |

---

## Implementation phase gate (future)

`PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_IMPLEMENTATION`:

- `npm run build` PASS
- Route redirects `/tasks` → `/inbox`
- UAT checklist above all PASS
- No regression on TASK_MAIN visibility baseline
