# MODULE MAP MASTER

## HO_SO
Cung cấp master data cho:
- TASK_CENTER (gắn task vào hồ sơ)
- FINANCE (gắn giao dịch vào hồ sơ hoặc đơn vị)

## TASK_CENTER
Liên kết:
- nhận input từ HO_SO
- có thể tạo task liên quan finance
- có thể sinh nhắc việc quá hạn

## FINANCE
Liên kết:
- dùng HO_SO để biết đơn vị/đối tượng
- dùng TASK_CENTER để theo dõi xử lý nghiệp vụ tài chính

## Shared dependency
- ENUM_DICTIONARY
- SHEET_DICTIONARY_MASTER
- GOVERNANCE / ROLE
- LOG STANDARD
