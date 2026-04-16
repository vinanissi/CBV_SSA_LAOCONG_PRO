# BUSINESS SPEC - HO_SO

## 1. Tạo hồ sơ
- Bắt buộc chọn loại hồ sơ.
- CODE phải unique trong cùng loại.
- NAME không được rỗng.
- Không cho tạo trùng hồ sơ nếu cùng loại + cùng số định danh quan trọng.

## 2. File hồ sơ
- File không lưu trực tiếp trong ô Sheet.
- File phải nằm trong thư mục đúng loại hồ sơ.
- Sheet chỉ lưu link và file id.
- Mỗi file phải có FILE_GROUP để phân nhóm.

## 3. Quan hệ hồ sơ
- Xe phải có thể liên kết với HTX và tài xế.
- Tài xế có thể đổi xe theo thời gian, không ghi đè mất lịch sử.
- Quan hệ dùng bảng `HO_SO_RELATION`, không nhét lung tung vào cột text.

## 4. Lưu ý lâu bền
- Không xóa vật lý hồ sơ.
- Hồ sơ hết hiệu lực dùng END_DATE hoặc STATUS.
- Record cũ phải truy được.
