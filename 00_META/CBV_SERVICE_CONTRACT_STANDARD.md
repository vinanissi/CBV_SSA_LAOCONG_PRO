# CBV SERVICE CONTRACT STANDARD

## Cấu trúc service
Mỗi service phải có:
- input contract
- validation rules
- workflow guard
- repository action
- log action
- return object chuẩn

## Return chuẩn
```javascript
{
  ok: true,
  code: "SUCCESS",
  message: "Created",
  data: {...},
  errors: []
}
```

## Quy tắc
1. Không appendRow trực tiếp từ UI layer.
2. Không viết dữ liệu nếu validation fail.
3. Mọi update trạng thái phải qua guard.
4. Mọi create/update/cancel/archive phải có log.
5. Service phải idempotent khi phù hợp.
