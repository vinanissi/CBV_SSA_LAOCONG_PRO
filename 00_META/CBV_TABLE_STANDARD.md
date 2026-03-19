# CBV TABLE STANDARD

## Cột chuẩn bắt buộc
- ID
- CREATED_AT
- CREATED_BY
- UPDATED_AT
- UPDATED_BY
- IS_DELETED

## Quy tắc cột
- Header dùng UPPERCASE.
- Enum không viết tự do.
- Date dùng ISO string hoặc Date object chuẩn hóa.
- Số tiền lưu numeric, không lưu chuỗi có dấu chấm phẩy.

## Quy tắc key
- Mỗi bảng có 1 khóa chính duy nhất.
- Không dùng row number làm key.
- Ref phải trỏ đến ID thật.

## Soft delete
- Không xóa vật lý trừ trường hợp backup/cleanup có kiểm soát.
- Dùng `IS_DELETED = TRUE` và nếu cần `DELETED_AT`, `DELETED_BY`.
