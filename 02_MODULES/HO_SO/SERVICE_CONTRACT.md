# SERVICE CONTRACT - HO_SO

## createHoSo(data)
### Input
- HO_SO_TYPE
- CODE
- NAME
- optional fields

### Validation
- type hợp lệ
- code unique
- name có giá trị

### Output
- record created
- log CREATED

## attachHoSoFile(hoSoId, fileMeta)
### Validation
- hồ sơ tồn tại
- file group hợp lệ
- file url hoặc drive id có giá trị
