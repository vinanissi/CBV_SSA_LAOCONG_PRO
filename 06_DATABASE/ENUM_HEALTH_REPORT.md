# ENUM Health Report — CBV_SSA_LAOCONG_PRO

## Overview

`enumHealthCheck()` returns a structured report combining registry integrity and usage audit.

## Return Structure

```javascript
{
  ok: true | false,
  enumRegistryValid: true | false,
  enumUsageValid: true | false,
  status: "PASS" | "WARN" | "FAIL",
  missingGroups: [...],
  missingValues: { GROUP: ["VAL1", "VAL2"] },
  duplicateRows: [{ group, value, row }],
  blankDisplayText: [{ group, value, row }],
  invalidBusinessUsage: [{ category, severity, table, column, enumGroup, invalidValue, rowCount, sampleRowNumbers, suggestedFix }],
  summary: {
    duplicateCount: number,
    missingGroupCount: number,
    blankDisplayCount: number,
    invalidUsageCount: number
  }
}
```

## Status Logic

- **PASS** — Registry valid and usage valid
- **WARN** — One of registry or usage has issues
- **FAIL** — Both registry and usage have critical issues

## Finding Categories

| Category | Severity | Description |
|----------|----------|-------------|
| VALUE_NOT_IN_REGISTRY | HIGH | Value used in business table but not in ENUM_DICTIONARY |
| INACTIVE_ENUM_IN_USE | MEDIUM | Value exists but enum row is inactive |
| BLANK_REQUIRED | HIGH | Blank value in required enum-bound column |
| ENUM_DUPLICATE_VALUE | HIGH | Duplicate ENUM_GROUP+ENUM_VALUE in registry |
| ENUM_MISSING_GROUP | HIGH | Required group missing from ENUM_DICTIONARY |

## Example Outputs

### getEnumValues("TASK_STATUS")

```javascript
["NEW", "ASSIGNED", "IN_PROGRESS", "WAITING", "DONE", "CANCELLED", "ARCHIVED"]
```

### getEnumDisplayMap("TASK_PRIORITY")

```javascript
{
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn cấp"
}
```

### repairEnumSafely({ dryRun: true })

```javascript
{
  ok: true,
  dryRun: true,
  planned: [
    { action: "CREATE", group: "TASK_STATUS", value: "NEW", displayText: "Mới tạo" },
    { action: "FILL_DISPLAY", group: "ROLE", value: "ADMIN", row: 5 }
  ],
  applied: []
}
```
