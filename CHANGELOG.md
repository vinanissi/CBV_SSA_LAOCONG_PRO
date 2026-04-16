# CHANGELOG

## laocong-pro-1.0.0

- **Docs & manifests:** Tham chiếu runtime GAS thống nhất sang `*.js` (cùng `clasp` / `build_manifest.json`, tài liệu, audit, `claude_exports`, rule Cursor, snapshot trong `claude/` / `07_TEST`). Đổi tên file snapshot `claude_exports/**` và `07_TEST/*.gs` → `*.js`.

- **[FEATURE] Pending Action Registry** — Refactor `withTaskFeedback` thành generic `withPendingFeedback` + `ACTION_REGISTRY`; đăng ký 3 Finance actions (`finConfirm` / `finCancel` / `finArchive`); router webhook dispatch tự động qua `getRegisteredAction`.

- Khóa lại full tài liệu meta
- Bổ sung business spec sâu cho HO_SO / TASK_CENTER / FINANCE
- Bổ sung AppSheet build mapping master
- Bổ sung GAS runtime chuẩn service/repository/log/validation
- Bổ sung schema CSV và sample data generator
- Bổ sung audit checklist và manifest builder
