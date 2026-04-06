# SHEET DICTIONARY - HO_SO

## HO_SO_MASTER
- HO_SO_TYPE_ID: ref → MASTER_CODE.ID (MASTER_GROUP=HO_SO_TYPE, STATUS=ACTIVE) — required
- TAGS_TEXT: text tags tìm kiếm, phân cách dấu phẩy (thay thế TAGS)
- HO_SO_TYPE: enum {HTX, XA_VIEN, XE, TAI_XE} (legacy; đồng bộ với loại MASTER)
- STATUS: enum {NEW, ACTIVE, INACTIVE, ARCHIVED}
- HTX_ID: ref → HO_SO_MASTER.ID where HO_SO_TYPE=HTX
- OWNER_ID: user or staff id
- DON_VI_ID: đơn vị gắn hồ sơ
- MANAGER_USER_ID: người phụ trách chính (USER_DIRECTORY)
- ID_TYPE: loại giấy tờ định danh (enum ID_TYPE)
- PRIORITY: mức ưu tiên xử lý (enum PRIORITY, gồm CAO / TRUNG_BINH / THAP và các giá trị hệ thống)
- SOURCE_CHANNEL: kênh tiếp nhận (enum SOURCE_CHANNEL)
- RELATED_ENTITY_TYPE: loại thực thể liên kết đa hình
- ID_NO: CCCD / GPLX / biển số tùy loại

## HO_SO_FILE
- FILE_GROUP: enum {CCCD, GPLX, DANG_KY_XE, HOP_DONG, KHAC}
- STATUS: enum {ACTIVE, ARCHIVED}
- DOC_TYPE: loại chứng tờ chi tiết (enum DOC_TYPE)
- DOC_NO: số hiệu giấy tờ
- ISSUED_DATE: ngày cấp
- EXPIRY_DATE: ngày hết hạn

## HO_SO_RELATION
- HO_SO_ID: ngữ cảnh hồ sơ chính (thường trùng FROM)
- RELATED_TABLE: tên bảng đích khi ref ngoài
- RELATED_RECORD_ID: ID bản ghi trong RELATED_TABLE
