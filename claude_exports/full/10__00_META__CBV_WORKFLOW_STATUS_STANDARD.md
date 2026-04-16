# CBV WORKFLOW STATUS STANDARD

## Trạng thái nền
- NEW
- ACTIVE
- ASSIGNED
- IN_PROGRESS
- WAITING
- DONE
- CONFIRMED
- CANCELLED
- ARCHIVED

## Nguyên tắc
- Mỗi module chỉ dùng tập con phù hợp.
- Phải có sơ đồ chuyển trạng thái.
- Không cho nhảy trạng thái tùy ý.
- `ARCHIVED` là trạng thái kết, không dùng như hũ rác.

## Mẫu transition
- NEW -> ASSIGNED
- ASSIGNED -> IN_PROGRESS
- IN_PROGRESS -> WAITING
- WAITING -> IN_PROGRESS
- IN_PROGRESS -> DONE
- DONE -> ARCHIVED
- ANY_OPEN -> CANCELLED
