# AppSheet — Reference & Enum Binding Checklist (APPSHEET-REF-A)

**Audience:** Admin AppSheet triển khai sau Phase REF-A (runtime) + đọc `OPERATIONAL_REFERENCE_LAYER_DESIGN.md`.  
**Scope:** Docs-only — không bật automation mới, không AppSheet Bot, không trigger.  
**Pair with:** `APPSHEET_HOME_ALERT_INSTALL_GUIDE.md` §3A, `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md` §6B.

---

## 1. Add reference tables checklist

- [ ] `ENUM_DICTIONARY` — đã add vào Data → Tables
- [ ] `USER_DIRECTORY`
- [ ] `MASTER_CODE`
- [ ] `DON_VI`
- [ ] `TEAM_DIRECTORY`
- [ ] `ROLE_PERMISSION_MATRIX`
- [ ] `FEATURE_FLAG`
- [ ] `SYSTEM_REGISTRY`
- [ ] Đã chạy `HomeAlert_bootstrap()` / ensure schema trên spreadsheet **trước** khi sync AppSheet

---

## 2. Key / Label checklist

- [ ] `ENUM_DICTIONARY`: Key = `ID` (semantic ENUM_ID); Label = `ENUM_LABEL` hoặc `DISPLAY_TEXT`; code = `ENUM_CODE` hoặc `ENUM_VALUE`
- [ ] `USER_DIRECTORY`: Key = `USER_ID` hoặc `ID`; Label = `DISPLAY_NAME` với fallback `FULL_NAME`
- [ ] `MASTER_CODE`: Key = `MASTER_ID` hoặc `ID`; Label = `MASTER_LABEL` / alias `MASTER_CODE` / `CODE`
- [ ] `DON_VI`: Key = `DON_VI_ID` hoặc `ID`; Label = `DON_VI_NAME` hoặc `NAME`
- [ ] `TEAM_DIRECTORY`: Key = `TEAM_ID`; Label = `TEAM_NAME`

---

## 3. Slice checklist

- [ ] `MC_MODULE_CODE`, `MC_ALERT_CODE`, `MC_QUEUE_CODE`, `MC_ACTION_CODE`, `MC_POLICY_CODE`, `MC_AUTOMATION_CODE` (MASTER_CODE)
- [ ] `ENUM_SLA_STATUS`, `ENUM_ESCALATION_STATUS`, `ENUM_ALERT_STATUS`, `ENUM_PRIORITY`, `ENUM_SEVERITY`, `ENUM_ROLE_CODE`, `ENUM_USER_STATUS`
- [ ] Slice operator `HOME_ALERT_*` vẫn dùng `IS_ACTIVE` / `IS_RESOLVED` đúng install guide

---

## 4. Column type checklist

- [ ] `HOME_ALERT.ASSIGNED_TO` / `CLAIMED_BY` / …: Ref `USER_DIRECTORY` (hoặc lộ trình chuẩn hóa về `USER_ID`)
- [ ] `HOME_ALERT.ASSIGNED_TEAM`: Ref `TEAM_DIRECTORY` khi có dữ liệu `TEAM_ID`
- [ ] `HOME_ALERT.MODULE_CODE` / `ALERT_CODE` / `ACTION_TYPE`: Valid_If hoặc Ref từ slice `MASTER_CODE`
- [ ] `HOME_ALERT.STATUS`, `SLA_STATUS`, `ESCALATION_STATUS`, `ATTENTION_LEVEL`: Enum / Valid_If từ `ENUM_DICTIONARY`
- [ ] `HOME_ALERT_SLA_POLICY`: `ESCALATE_TO_TEAM` / `ESCALATE_TO_USER` Ref đúng bảng
- [ ] `HOME_ALERT_AUTOMATION_CONFIG`: flags Yes/No; `FUNCTION_NAME` read-only

---

## 5. Valid_If checklist

- [ ] Enum/Valid_If không hard-code danh sách dài lệch với sheet (ưu tiên `SELECT` từ slice)
- [ ] `MASTER_CODE`: xử lý hàng cũ thiếu `IS_ACTIVE` / cột `MASTER_CODE` rỗng (virtual column hoặc nới điều kiện — xem Formula Reference §6B)

---

## 6. Security filter checklist

- [ ] Operator: thấy alert gán cho mình — dùng **cùng kiểu** identifier với cột `ASSIGNED_TO` (`USER_ID` vs email)
- [ ] Supervisor: nhánh team (`ASSIGNED_TEAM` + `TEAM_DIRECTORY.SUPERVISOR_ID`)
- [ ] Admin: `IS_ADMIN` từ `USER_DIRECTORY`
- [ ] Không dùng `FIRST(SELECT(...))` cho row-level security khi baseline yêu cầu `ANY(SELECT(...))`

---

## 7. Operator dashboard contract checklist

- [ ] Primary header = `OPERATOR_PRIMARY_TEXT`
- [ ] Secondary header = `OPERATOR_SECONDARY_TEXT`
- [ ] Summary = `OPERATOR_META_TEXT`
- [ ] Next action = `OPERATOR_NEXT_ACTION`
- [ ] Group by = `OPERATOR_DASHBOARD_GROUP`
- [ ] Sort by = `OPERATOR_DASHBOARD_SORT` **DESC**
- [ ] **Không** bind deck operator vào `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*`

---

## 8. Admin view checklist

- [ ] `ROLE_PERMISSION_MATRIX`, `FEATURE_FLAG`, `SYSTEM_REGISTRY`: chỉ admin (Show_If + security)
- [ ] `HOME_ALERT_SLA_POLICY` / `HOME_ALERT_AUTOMATION_CONFIG`: admin hoặc policy đã phê duyệt

---

## 9. Test checklist

- [ ] Operator đăng nhập thấy đúng queue (MY / UNASSIGNED / …)
- [ ] Supervisor thấy đúng team
- [ ] Admin thấy policy + automation config
- [ ] Dropdown `MODULE_CODE` / enum chỉ hiện giá trị còn active trên reference sheet
- [ ] Không có AppSheet Bot auto đổi `STATUS` / `ASSIGNED_TO` / escalation

---

## 10. Common mistakes (tránh)

| Mistake | Why it hurts |
|---------|----------------|
| Dùng `DISPLAY_*` / `CARD_*` / `UX_*` / `DESKTOP_*` cho operator deck | Vi phạm contract `OPERATOR_*` |
| Trộn `USEREMAIL()` với cột đang lưu `USER_ID` không qua `LOOKUP` | Security filter sai, gán việc sai |
| Enum text tự do không đồng bộ `ENUM_DICTIONARY` | Drift giữa AppSheet và GAS |
| Cho operator sửa policy / `ROLE_PERMISSION_MATRIX` / `FEATURE_FLAG` | Rủi ro vận hành |
| Bật AppSheet Bot | Trái nguyên tắc CBV HOME_ALERT |
| Auto assign / auto resolve / auto escalate trong AppSheet | Trái phase 84 / ecosystem |

---

## 11. Sau khi xong

- Ghi lại ngày / người verify trên ticket nội bộ.
- Cập nhật trạng thái docs index (`HOME_ALERT_DEPLOYMENT_DOCS_INDEX.md`) nếu team có cột “validated on app”.
