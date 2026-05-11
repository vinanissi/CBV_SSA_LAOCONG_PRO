# REPO_DESIGN_RECOMMENDATION

**Mục tiêu:** cấu trúc chuẩn, dễ bàn giao, dễ làm việc với AI/Cursor — **không** bắt buộc big-bang move; ưu tiên add-only và tài liệu hoá.

---

## 1. Cấu trúc đề xuất (mục tiêu)

```
/apps-script
  /main-control
  /task
  /hoso
  /finance
  /invoice-member

/apps
  /admin-web
  /staff-web
  /member-web

/database
  /schema
  /migrations
  /supabase

/docs
  /architecture
  /runbooks
  /handoff
  /testing

/00_SYSTEM_BRAIN
  /decisions
  /phase-reports
  /ai-handoff
  /runtime-contracts

/tools
  /scripts
  /repo-audit
  /deploy
```

---

## 2. So sánh với `CBV_SSA_LAOCONG_PRO` hiện tại

| Nhóm đề xuất | Thực tế hiện tại | Khuyến nghị |
|----------------|------------------|-------------|
| `/apps-script/*` | Đã có `apps-script/main-control`, `hoso`, `task`, `finance`, `core-runtime-lib` | **Giữ**; thêm `invoice-member` **chỉ khi** tách được contract; đừng đổi tên đột ngột. |
| `/apps/*` | React/Vercel **không** nằm trong repo này; có thể ở `LAOCONG_VOS_PLATFORM`, `CBV_FE` | **Tách đúng** — liên kết qua `SYSTEM_MAP` + URL repo; không nhét frontend lớn vào pack Sheets trừ khi có chiến lược monorepo. |
| `/database` | `06_DATABASE/`, `01_SCHEMA/` | **Giữ** tên hiện tại trong giai đoạn chuyển; có thể **gom** symlink hoặc copy script sinh vào `database/schema` dần dần. |
| `/docs` | Rải rác `00_META`, `02_MODULES`, `04_APPSHEET`, `docs/` | **Gom dần** tài liệu “handoff” vào `docs/handoff` hoặc `00_SYSTEM_BRAIN/ai-handoff` — **add-only**, giữ path cũ cho link cũ. |
| `/00_SYSTEM_BRAIN` | Vừa tạo trong audit này | **Giữ** làm chỉ mục não hệ; bổ sung `decisions/` (ADR), `phase-reports/`, `runtime-contracts/` khi có nội dung. |
| `/tools` | `99_TOOLS/` (Python), `scripts/` (PS) | **Giữ** `99_TOOLS` (đã tham chiếu README); **gom** script vận hành mới vào `tools/scripts` hoặc `tools/repo-audit` — không xóa `99_TOOLS`. |

---

## 3. Nên giữ (đừng đụng kiểu “refactor vô căn”)

| Hạng mục | Lý do |
|----------|--------|
| `05_GAS_RUNTIME/` | Nguồn mirror/production copy flow hiện có; nhiều audit tham chiếu. |
| `04_APPSHEET/` | Ràng buộc slice/security đang vận hành. |
| `06_DATABASE/schema_manifest.json` + generator | Chuỗi sinh CSV / đồng bộ GAS bootstrap. |
| `.cursor/rules/*.mdc` | Ràng buộc AI đã cam kết (TASK_MAIN PRO, naming). |
| `apps-script/*` đa clasp | Đã đầu tư tách project — chỉ chỉnh khi có kế hoạch clasp. |

---

## 4. Nên gom (dần dần, có kế hoạch)

| Nội dung | Gợi ý |
|----------|--------|
| Tài liệu “handoff” rải (`_handoff/`, `docs/TASK_*`, `09_AUDIT`) | Một chỉ mục trong `00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/` + link ngược (không duplicate nội dung dài). |
| Script PowerShell ở `scripts/` | Thư mục `tools/scripts` mirror + README mapping — **sau** khi đồng thuận. |

---

## 5. Nên tách (ranh giới rõ)

| Ranh giới | Chi tiết |
|-----------|----------|
| Business runtime vs test | File `99_DEBUG_*`, `*TEST_MOCK*` chỉ trong project dev hoặc nhánh menu “Developer”. |
| Repo PRO vs repo LAB | Dùng `REPO_INVENTORY.md` + tag git; không merge nhầm LAB vào deploy PRO. |
| Supabase / SQL vs Sheets | Nếu `LAOCONG_VOS_PLATFORM` dùng Supabase: contract sync với Sheets **manual-first**, không auto sync hai chiều khi chưa test. |

---

## 6. Chưa nên đụng (CHƯA_XÁC_MINH hoặc rủi ro cao)

| Hạng mục | Lý do |
|----------|--------|
| Đổi tên sheet/cột đang production | Cần migration doc + freeze window. |
| Xóa bớt repo con trong `D:\Workspace\projects` | Vi phạm nguyên tắc user; archive bằng tài liệu. |
| Gộp 100+ repo CBV_* thành một mono-repo | Chi phí git history + CI — không khuyến nghị không chuẩn bị. |

---

## 7. Bước chuyển add-only (thứ tự đề xuất)

1. Duy trì `00_SYSTEM_BRAIN/` làm cổng vào; cập nhật `CHANGELOG` khi thêm quyết định.
2. Dùng `tools/repo-audit/repo-audit.ps1` cho hygiene workspace.
3. Khi có ADR đầu tiên: tạo file trong `00_SYSTEM_BRAIN/decisions/` (thư mục có thể tạo sau).
