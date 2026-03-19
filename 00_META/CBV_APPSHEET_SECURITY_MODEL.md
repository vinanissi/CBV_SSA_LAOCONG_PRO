# CBV APPSHEET SECURITY MODEL

## Nguyên tắc
1. AppSheet là lớp UI, không phải nơi phát minh business rule.
2. Slice theo role và nhu cầu thao tác.
3. Security Filter dùng để giới hạn dữ liệu nhìn thấy.
4. Action visibility không thay thế validation ở GAS.

## Mẫu phân quyền
- ADMIN: thấy toàn bộ
- OPERATOR: thấy record mình phụ trách hoặc cùng đơn vị
- VIEWER: thấy dữ liệu đã cho phép xem

## Không làm
- Không show raw table cho người dùng cuối nếu không cần.
- Không cho inline edit bừa bãi ở bảng nghiệp vụ chính.
