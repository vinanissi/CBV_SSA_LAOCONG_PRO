# BUSINESS SPEC - FINANCE

## 1. Tạo giao dịch
- Bắt buộc TRANS_TYPE.
- Bắt buộc CATEGORY.
- Bắt buộc AMOUNT > 0.
- Nên có TRANS_DATE.
- Có thể chưa confirmed ngay.

## 2. Xác nhận
- Sau khi CONFIRMED, không cho sửa số tiền và loại giao dịch.
- Nếu nhập sai phải tạo nghiệp vụ điều chỉnh/cancel theo rule, không sửa lịch sử.

## 3. Chứng từ
- Khuyến nghị có EVIDENCE_URL.
- Không nhét file binary vào sheet.
- Mỗi transaction cần truy ra chứng từ hoặc giải trình.

## 4. Hủy
- Không xóa vật lý.
- Dùng CANCELLED.
- Log phải giữ before/after.

## 5. Liên kết
- Có thể gắn với task, hồ sơ, đơn vị.
