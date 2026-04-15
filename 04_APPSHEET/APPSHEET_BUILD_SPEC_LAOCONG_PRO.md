# APPSHEET BUILD SPEC - LAOCONG PRO

## 1. Tables
Add tables:
- HO_SO_MASTER
- HO_SO_FILE
- HO_SO_RELATION
- TASK_MAIN
- TASK_CHECKLIST
- TASK_UPDATE_LOG
- TASK_ATTACHMENT
- FINANCE_TRANSACTION
- FINANCE_LOG
- FINANCE_ATTACHMENT

## 2. Key / Label
- Key luôn là `ID`
- Label:
  - HO_SO_MASTER -> `NAME`
  - TASK_MAIN -> `TITLE`
  - FINANCE_TRANSACTION -> `TRANS_CODE`
  - FINANCE_ATTACHMENT -> ID (key); TITLE (label)

## 3. Editable rules
- Các bảng log: read-only
- `STATUS` không editable trực tiếp trên bảng chính
- Các action chuyển trạng thái dùng grouped actions hoặc BOT/GAS callback tùy chiến lược triển khai
- FINANCE_ATTACHMENT: CREATED_AT, CREATED_BY = readonly; thêm qua attachEvidence()

## 4. Suggested views
- dashboard theo module
- list view
- detail view
- form view
- queue view cho item cần xử lý

## 5. Security filters gợi ý
- ADMIN: TRUE
- OPERATOR: `[OWNER_ID] = USEREMAIL()` hoặc cùng đơn vị
- VIEWER: chỉ record mở quyền xem
