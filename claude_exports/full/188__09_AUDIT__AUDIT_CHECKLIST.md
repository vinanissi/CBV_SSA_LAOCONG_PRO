# AUDIT CHECKLIST

## Meta
- [ ] Có đủ file trong `00_META`
- [ ] Không có module thiếu spec

## Database
- [ ] Tồn tại đủ 9 sheet
- [ ] Header khớp manifest
- [ ] Không có cột thừa tự phát

## Runtime
- [ ] initAll chạy được
- [ ] auditSystem chạy được
- [ ] createTask chạy được
- [ ] createTransaction chạy được
- [ ] createHoSo chạy được

## AppSheet
- [ ] Key đúng
- [ ] Enum đúng
- [ ] Slice đúng
- [ ] Action không bypass workflow

## Vận hành
- [ ] Có log
- [ ] Có backup
- [ ] Có người chịu trách nhiệm
