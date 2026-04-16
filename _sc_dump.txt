# SERVICE CONTRACT - FINANCE

## confirmTransaction(id, note)
### Validation
- record tồn tại
- status = NEW
- amount > 0
- category hợp lệ

### Side effects
- set CONFIRMED
- set CONFIRMED_AT
- set CONFIRMED_BY
- ghi FINANCE_LOG

## updateDraftTransaction(id, patch)
### Validation
- chỉ cho phép khi status = NEW
- không cho patch trái schema
