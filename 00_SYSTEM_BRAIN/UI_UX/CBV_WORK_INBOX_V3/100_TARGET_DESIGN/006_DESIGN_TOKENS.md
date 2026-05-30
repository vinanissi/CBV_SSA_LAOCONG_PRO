# Design Tokens

**Contract:** CBV_WORK_INBOX_V3

---

## Color Tokens

```yaml
color:
  primary: "#2563EB"
  primaryHover: "#1D4ED8"
  danger: "#DC2626"
  warning: "#F59E0B"
  success: "#16A34A"
  info: "#3B82F6"
  neutralText: "#0F172A"
  mutedText: "#64748B"
  border: "#E2E8F0"
  surface: "#FFFFFF"
  surfaceSoft: "#F8FAFC"
  background: "#F1F5F9"
```

### Status chip mapping

| Semantic | Token |
|----------|-------|
| Quá hạn | `danger` |
| Cần làm hôm nay | `warning` |
| Chờ xử lý | `warning` (muted) |
| Theo dõi | `info` |
| Hoàn thành | `success` |

---

## Spacing

```yaml
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
```

---

## Radius

```yaml
radius:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
```

---

## Typography

```yaml
font:
  family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
  size:
    xs: 12px
    sm: 14px
    md: 16px
    lg: 20px
    xl: 28px
```

---

## Tailwind bridge (implementation)

When implementing in `apps/workboard`, map tokens to `tailwind.config.ts` extend — do not fork ad-hoc hex in components. Existing operational theme may coexist during migration; V3 tokens take precedence for Inbox surfaces after decision note.

---

## Coexistence with runtime baseline

Current workboard uses `surface`, `operational.text`, etc. (`_archive_runtime_baseline_20260529/006_DESIGN_TOKENS.md`).  
Phase implementation should merge tokens, not duplicate conflicting palettes.
