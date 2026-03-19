# BUSINESS SPEC - TASK_CENTER

## 1. Tạo task
- Title bắt buộc.
- Owner bắt buộc.
- Priority bắt buộc.
- Due date có thể rỗng nhưng nên có.

## 2. Workflow chặt
- Không cho DONE nếu checklist required chưa hoàn tất.
- Không cho CANCELLED rồi quay lại IN_PROGRESS bằng tay.
- Mọi đổi trạng thái đều ghi log.

## 3. Checklist
- Checklist là cấu phần chính, không phải ghi chú phụ.
- Có `IS_REQUIRED`.
- Một số task có thể xong mà không cần checklist, nhưng nếu đã có required checklist thì phải hoàn tất.

## 4. Quan hệ
- Task có thể gắn với hồ sơ, giao dịch, hoặc thực thể khác.
- Dùng `RELATED_ENTITY_TYPE` + `RELATED_ENTITY_ID`.

## 5. Lâu bền
- Không xóa task vật lý.
- Task đóng rồi vẫn tra cứu được.
