# Golden Dataset Spec

## Purpose
- AppSheet table setup
- View testing
- Workflow testing
- Demo without harming production data

## Prefix
All golden records use `SAMPLE_` prefix in CODE/TRANS_CODE/TASK_CODE.

## Contents

### HO_SO_MASTER
| Type    | Code         | Name                    |
|---------|--------------|-------------------------|
| HTX     | SAMPLE_HTX001| HTX Lao Cộng Demo       |
| XA_VIEN | SAMPLE_XV001 | Xã viên Nguyễn Văn A    |
| XA_VIEN | SAMPLE_XV002 | Xã viên Trần Thị B      |
| XE      | SAMPLE_XE001 | Xe 51C-12345            |
| TAI_XE  | SAMPLE_TX001 | Tài xế Lê Văn C         |

XA_VIEN records reference HTX via HTX_ID when created after HTX.

### TASK_MAIN
| Code         | Title                        | Priority |
|--------------|------------------------------|----------|
| SAMPLE_TK001 | Kiểm tra hồ sơ ban đầu       | HIGH     |
| SAMPLE_TK002 | Xác nhận giao dịch tháng     | MEDIUM   |

### FINANCE_TRANSACTION
| Code         | Type   | Category | Amount   |
|--------------|--------|----------|----------|
| SAMPLE_TR001 | EXPENSE| VAN_HANH | 500000   |
| SAMPLE_TR002 | INCOME | THU_KHAC | 1000000  |

## Seeding
- Run `seedGoldenDataset()` from GAS
- Idempotent: skips if record exists (by CODE/TRANS_CODE/TASK_CODE)
- Does not delete or overwrite existing records

## Safety
- Clearly separated from production by SAMPLE_ prefix
- Re-runnable safely
- No collision with real production records
