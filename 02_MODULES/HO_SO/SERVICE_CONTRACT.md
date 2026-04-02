# SERVICE CONTRACT - HO_SO

## createHoSo(data)

### Input

**Bắt buộc**

- `HO_SO_TYPE_ID` — ref `MASTER_CODE` (group HO_SO_TYPE)
- `TITLE` hoặc `DISPLAY_NAME`

**Tùy chọn / mở rộng**

- `HO_SO_TYPE`, `CODE`, `NAME` — legacy (nếu thiếu, `HO_SO_TYPE` có thể suy từ MASTER_CODE theo `HO_SO_TYPE_ID`; `NAME` fallback từ TITLE/DISPLAY_NAME)
- `HO_SO_CODE` — thường để hệ thống sinh; không patch trực tiếp sau tạo
- `STATUS` — mặc định `NEW`
- `DON_VI_ID`, `OWNER_ID`, `HTX_ID`, `MANAGER_USER_ID`
- `RELATED_ENTITY_TYPE`, `RELATED_ENTITY_ID`
- `FULL_NAME`, `PHONE`, `EMAIL`, `ID_TYPE`, `ID_NO`, `DOB`, `ADDRESS`
- `START_DATE`, `END_DATE`
- `PRIORITY` — mặc định `TRUNG_BINH` nếu không gửi
- `SOURCE_CHANNEL`, `SUMMARY`, `NOTE`, `TAGS_TEXT`

### Validation

- `HO_SO_TYPE_ID` tồn tại và `MASTER_GROUP=HO_SO_TYPE`, `STATUS=ACTIVE`
- Nếu có `DON_VI_ID` / `OWNER_ID` / `MANAGER_USER_ID` / `HTX_ID` — ref hợp lệ (HTX_ID → HO_SO_MASTER)
- Enum: `HO_SO_STATUS`, `PRIORITY`, `RELATED_ENTITY_TYPE`, `ID_TYPE`, `SOURCE_CHANNEL`, `HO_SO_TYPE` (khi có giá trị)
- `END_DATE` ≥ `START_DATE` khi cả hai có

### Output

- `record` master đã ghi
- `HO_SO_UPDATE_LOG` action `CREATE`
- `HO_SO_LOG` action `CREATED` (nếu sheet log tồn tại)

---

## attachHoSoFile(hoSoId, fileMeta)

### Input

- `hoSoId` — `HO_SO_MASTER.ID`
- `FILE_URL` hoặc `DRIVE_FILE_ID` (ít nhất một)
- `DOC_TYPE` — enum `DOC_TYPE` (mặc định `KHAC` nếu không gửi)
- `FILE_GROUP` — enum `FILE_GROUP` (mặc định theo `DOC_TYPE` / `KHAC`)
- `FILE_NAME`, `DOC_NO`, `ISSUED_DATE`, `EXPIRY_DATE`, `NOTE`

### Validation

- Hồ sơ tồn tại
- Enum `DOC_TYPE`, `FILE_GROUP`

### Output

- Bản ghi `HO_SO_FILE` immutable (CREATED only)
- `HO_SO_LOG` action `FILE_ADDED`

---

## createHoSoRelation(data)

### Input

**Bắt buộc**

- `FROM_HO_SO_ID`, `TO_HO_SO_ID` — tồn tại trong `HO_SO_MASTER`
- `RELATION_TYPE` — enum `HO_SO_RELATION_TYPE`

**Tùy chọn**

- `STATUS` — mặc định `ACTIVE` (`HO_SO_STATUS`)
- `HO_SO_ID` — context log (mặc định = `FROM_HO_SO_ID`)
- `RELATED_TABLE`, `RELATED_RECORD_ID` — polymorphic (optional)
- `START_DATE`, `END_DATE`, `NOTE`

### Validation

- Hai đầu hồ sơ tồn tại
- Enum `HO_SO_STATUS`, `HO_SO_RELATION_TYPE`

### Output

- Bản ghi `HO_SO_RELATION` đầy đủ audit
- `HO_SO_LOG` action `RELATION_ADDED`
- `HO_SO_UPDATE_LOG` `LINK_ENTITY`
