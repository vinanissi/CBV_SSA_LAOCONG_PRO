# CBV GOVERNANCE HIERARCHY

## 1. Vai trò
- ADMIN: toàn quyền cấu hình, dữ liệu, audit, bootstrap.
- OPERATOR: thao tác nghiệp vụ hằng ngày.
- VIEWER: chỉ xem.

## 2. Nguyên tắc
1. Quyền nhìn thấy dữ liệu không đồng nghĩa quyền sửa dữ liệu.
2. Quyền sửa master data phải chặt hơn quyền tạo giao dịch.
3. Finance phải audit được ai tạo, ai xác nhận, khi nào xác nhận.
4. Không có role "mơ hồ".

## 3. Phân vùng dữ liệu
- Toàn hệ
- Theo đơn vị
- Theo người phụ trách
- Theo record ownership

## 4. Quy tắc bền vững
- Role ít nhưng rõ.
- Không làm permission bằng cảm tính.
- AppSheet chỉ phản ánh permission, không tự định nghĩa logic riêng.
