# SYSTEM DATA FLOW MASTER

## Luồng nền
Người dùng -> AppSheet Form/View -> GAS Service -> Repository -> Google Sheets DB -> Log -> AppSheet refresh

## Luồng HO_SO
1. Tạo hồ sơ
2. Validate type/code
3. Ghi `HO_SO_MASTER`
4. Nếu có file thì ghi `HO_SO_FILE`
5. Nếu có quan hệ thì ghi `HO_SO_RELATION`
6. Ghi log

## Luồng TASK_CENTER
1. Tạo task
2. Validate owner / priority
3. Ghi `TASK_MAIN`
4. Nếu có checklist thì ghi `TASK_CHECKLIST`
5. Khi đổi trạng thái -> guard -> update -> ghi `TASK_UPDATE_LOG`

## Luồng FINANCE
1. Tạo draft transaction
2. Validate amount/category/type
3. Ghi `FINANCE_TRANSACTION` status = NEW
4. Xác nhận -> set CONFIRMED -> ghi `FINANCE_LOG`
5. Không sửa amount sau CONFIRMED

## Nguyên tắc
- Không cho AppSheet ghi tắt business logic.
- Không được bỏ qua log.
- Không được phá soft delete.
