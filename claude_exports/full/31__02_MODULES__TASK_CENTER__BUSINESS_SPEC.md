# BUSINESS SPEC - TASK_CENTER

**Model:** Task belongs to HTX; users are shared across the system.

---

## 1. Tạo task

- Title bắt buộc.
- Owner bắt buộc.
- Priority bắt buộc.
- HTX_ID bắt buộc (task thuộc HTX).
- Due date có thể rỗng nhưng nên có.

---

## 2. Workflow chặt

- Không cho DONE nếu checklist required chưa hoàn tất.
- Không cho CANCELLED rồi quay lại IN_PROGRESS bằng tay.
- Mọi đổi trạng thái đều ghi log (TASK_UPDATE_LOG).

---

## 3. Checklist

- Checklist là cấu phần chính, không phải ghi chú phụ.
- Có `IS_REQUIRED`.
- Một số task có thể xong mà không cần checklist, nhưng nếu đã có required checklist thì phải hoàn tất.
- DONE_BY → USER_DIRECTORY (shared user).

---

## 4. Quan hệ

- Task thuộc HTX (HTX_ID → ACTIVE_HTX).
- Task có thể gắn với hồ sơ, giao dịch, hoặc thực thể khác (RELATED_ENTITY_TYPE + RELATED_ENTITY_ID).
- Users shared — cùng user có thể own task nhiều HTX khác nhau.

---

## 5. Lâu bền

- Không xóa task vật lý (soft delete: IS_DELETED).
- Task đóng rồi vẫn tra cứu được.

---

## 6. Attachments và Log

- Attachments lưu trong TASK_ATTACHMENT, không lưu trực tiếp trong TASK_MAIN.
- Conversation/log lưu trong TASK_UPDATE_LOG (UPDATE_TYPE, CONTENT), không lưu trực tiếp trong TASK_MAIN.
