# REPO INVENTORY — `D:\Workspace\projects`

**Ngày quét:** 2026-05-11. **Nơi lưu báo cáo:** `CBV_SSA_LAOCONG_PRO/00_SYSTEM_BRAIN/REPO_INVENTORY.md`.

## Cảnh báo bảo mật (P0)

| Phát hiện | Hành động đề xuất |
|-----------|-------------------|
| Nhiều remote `origin` từng chứa PAT trong URL; báo cáo **không** ghi token. | `git remote set-url origin https://github.com/OWNER/REPO.git`; rotate PAT; không commit credential. |

## Tổng quan
- **Số thư mục cấp 1:** 149
- **Có `.git`:** 138 | **Không `.git`:** 11
- **Heuristic:** `package.json` depth≤4, `appsscript.json` depth≤5, `supabase/**/config.toml` depth≤6.

## Bảng đầy đủ

| Tên | Loại | package.json | .git | Branch | Remote (đã làm sạch) | #appsscript | #clasp | #supabase | Sẵn sàng |
|-----|------|--------------|------|--------|----------------------|------------|--------|------------|----------|
| `.cbv` | CHƯA_XÁC_MINH | Không | Không | `` | `` | 0 | 0 | 0 | LAB |
| `.cbv_control` | CHƯA_XÁC_MINH | Không | Không | `` | `` | 0 | 0 | 0 | LAB |
| `.chatgpt` | CHƯA_XÁC_MINH | Không | Không | `` | `` | 0 | 0 | 0 | LAB |
| `.cursor` | CHƯA_XÁC_MINH | Không | Không | `` | `` | 0 | 0 | 0 | LAB |
| `.docs` | CHƯA_XÁC_MINH | Không | Không | `` | `` | 0 | 0 | 0 | LAB |
| `00_CBV_MAIN_SMALL` | Mixed | Không | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `ACP_BACKEND_API` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `ACP_DASHBOARD_UI` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `ADMIN_CONTROL_PANEL` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `Admin-Xu-Ly-Hoa-Don-Dau-Vao` | Apps Script | Không | Có | `dev` | `git@github.com:vinanissi/Admin-Xu-Ly-Hoa-Don-Dau-Vao.git` | 2 | 2 | 0 | LAB |
| `BGV-DASHBOARD` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `BOT_TONG-HOP-DAU-VAO_V2025` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 3 | 2 | 0 | LAB |
| `BOT_hoa-don-dau-vao` | Apps Script | Không | Có | `dev` | `https://github.com/vinanissi/BOT_hoa-don-dau-vao.git` | 1 | 1 | 0 | LAB |
| `BRANCH_xu-ly-hoa-don-dau-vao` | Apps Script | Không | Có | `dev` | `https://github.com/vinanissi/BRANCH_xu-ly-hoa-don-dau-vao.git` | 1 | 1 | 0 | LAB |
| `BRAVE-HUB-AI` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CALENDAR_SYSTEM` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV-QUAN-LY-VAN-BAN` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV-QUAN-LY-VAN-BAN-2026` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV-TONG-HOP-HOA-DON` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_AI_GOVERNANCE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_ASK_BOSS_FORM` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_BACKUP_MANAGER` | Apps Script | Không | Có | `feature/delta-mirror-dashboard-l3` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_BAN_GIAO` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_CASEFLOW` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_CHECKIN` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 2 | 2 | 0 | LAB |
| `CBV_CONTROL_PANEL` | Apps Script | Không | Có | `dev` | `https://github.com/vinanissi/CBV_CONTROL_PANEL.git` | 1 | 1 | 0 | LAB |
| `CBV_CONTROL_PLANE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_DINH_GIA_CONG_VIEC` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_DRIVE_DIRECTORY-QUAN_LY_LINK_DRIVE_DON_VI` | Apps Script | Không | Có | `dev` | `https://github.com/vinanissi/CBV_DRIVE_DIRECTORY-QUAN_LY_LINK_DRIVE_D...` | 3 | 3 | 0 | LAB |
| `CBV_DRIVE_GOVERNANCE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_DRIVE_OS` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_DebugLib` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_EMAIL_REGISTRY` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_Email_Router` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_FE` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_FINA` | Mixed | Không | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_FINANCE` | Mixed | Không | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_FINANCE_1` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_FINANCE_2` | Mixed | Không | Có | `HEAD` | `` | 0 | 0 | 0 | LAB |
| `CBV_FINANCE_CONTROL_CENTER` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_FINANCE_DNTT` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_FINANCE_DNTT_V1` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_FINANCE_FLOW` | Apps Script | Không | Có | `dev_CONTROL_PANEL` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_FINANCE_SIMPLE` | Mixed | Không | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_GAS_CORE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_GAS_GATEWAY` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_GAS_UI_VIEWER` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_HOA_DON_INBOX_AI` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 2 | 2 | 0 | LAB |
| `CBV_HO_SO` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_HO_SO_HTX` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 2 | 3 | 0 | LAB |
| `CBV_HO_SO_HTX_1` | Mixed | Không | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_HUMAN_GOVERNANCE` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_HUMAN_GOVERNANCE-GAS` | Mixed | Có | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_INTAKE` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_INTAKE_FILE_PROCESSOR` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_INTAKE_FILE_ROUTER` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_INTAKE_OCR_MVP` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_InvoiceLib` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_LAOKONG_LOVA` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_LAOKONG_VEHICLE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_LEVEL_CONTROL` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_MEMBER_ENGINE_PC` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_MOD_INVOICE_DRAFT_API` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_OCS` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_OPERATION_ASSISTANT` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_OPS_ORCHESTRATION` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_PC_CORE` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_PERSONAL_FINANCE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_PROMPT_CONTROL_PANEL` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_QL_CONG_VIEC` | Apps Script | Không | Có | `staging` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_QL_DRIVE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_QL_FILES` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_QUAN_LY_VAN_BAN_V2+` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_SCHOOL_BE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_SCHOOL_FE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_SCHOOL_V2` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_SETTLEMENT (Đối soát & Thanh toán xã viên)` | Mixed | Không | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_SO_DIEU_PHOI_VIEC` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_SSA` | Apps Script | Không | Không | `` | `` | 1 | 1 | 0 | LAB |
| `CBV_SSA_CKS` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_SSA_IRI_INVOICE_REQUEST_INTAKE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_SSA_LAOCONG_MAIN` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_SSA_LAOCONG_PRO` | Apps Script | Không | Có | `feature/main-control-v2.1` | `github.com (credential stripped)` | 6 | 2 | 0 | PRO |
| `CBV_SSA_LAOCONG_VOS` | Apps Script | Không | Có | `feature/task-runtime-integration` | `github.com (credential stripped)` | 2 | 2 | 0 | PILOT |
| `CBV_SSA_TASK+NAV` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_SSA_v1` | Apps Script | Không | Không | `` | `` | 3 | 0 | 0 | LAB |
| `CBV_SYNC_DAEMON` | Node/React | Có | Không | `` | `` | 0 | 0 | 0 | LAB |
| `CBV_SYNC_ROOT` | Mixed | Không | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_SYSTEM_CONTROL_CENTER` | Mixed | Không | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CBV_SYSTEM_HUB` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_TASK_SPLITTER_ASSIGNER` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_TC_TTXV Thanh Toan Xa Vien` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_THU_CHI` | Apps Script | Không | Có | `DEV` | `github.com (credential stripped)` | 3 | 3 | 0 | LAB |
| `CBV_TIEP_NHAN_XA_VIEN` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_UI_ENGINE` | Mixed | Có | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_UPLOAD` | Apps Script | Không | Có | `intake` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `CBV_VAN_HANH_S` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 3 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_VH_DNTT` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `CBV_XAVIEN_ROOT` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 3 | 0 | 0 | LAB |
| `CONTRIBUTOR_SYSTEM` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `CRM_HTX_CSKH-TELESALE_COORDINATION` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `DEC_DECISION_ENGINE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `DEV.G.HCM_HTX-hoa-don-dau-vao` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 2 | 1 | 0 | PILOT_CANDIDATE |
| `DEV_G-TRO-LY-V2` | Apps Script | Không | Có | `staging` | `github.com (credential stripped)` | 1 | 2 | 0 | LAB |
| `DEV_G-htxdthcm-tra-cuu-hoi-dap` | Mixed | Có | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `DEV_Gmail-Hoa-Don-Dien-Tu` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `DRIVE_SHARE_CHECKER` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `FINANCE_INVOICE_PIPELINE` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 2 | 2 | 0 | PILOT_CANDIDATE |
| `HCM-xu-ly-hoa-don-dau-vao` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `HOSO-SEARCH` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `HTX-Frontend-Installer` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `HUB-AI-PC-APP` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `IDP` | Mixed | Có | Có | `main` | `git@github.com:vinanissi/idp.git` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `IDP_InvoiceEngine_PC` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `IDP_Tools_PC` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `INTAKE_GATE_AI` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `INVOICE_OCR_SYSTEM` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `INVOICE_QUEUE_DB` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `InvoiceLIB` | Mixed | Có | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `InvoiceLib_v2` | Apps Script | Không | Có | `dev` | `git@github.com:vinanissi/InvoiceLib_v2.git` | 2 | 1 | 0 | LAB |
| `KPI_MANAGEMENT` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `LAOCONG_VOS_PLATFORM` | Node/React | Có | Có | `phase/004-database-bootstrap` | `git@github.com:vinanissi/laocong-vos-platform.git` | 0 | 0 | 0 | PILOT |
| `LEAVE MANAGEMENT` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `MOD_INVOICE_DRAFT_UI_Cloudflare_Worker+Pages` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `MVP-xu-ly-hoa-don-dau-vao` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `NCC.HD_HOA_DON_DIEN_THOAI_THE_SIM` | Apps Script | Không | Có | `staging` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `NCC.TheSim-hoa-don-dau-vao` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `NCC_TheSim-hoa-don` | Apps Script | Không | Có | `staging` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `NHIEM-VU_GIAO-NHAN-KPI` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `New folder` | CHƯA_XÁC_MINH | Không | Không | `` | `` | 0 | 0 | 0 | LAB |
| `OCR_WORKER_PC` | Mixed | Có | Có | `dev` | `github.com (credential stripped)` | 5 | 5 | 0 | LAB |
| `ONLINE_TELESALE` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `PCS-WEBAPP` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `PCS-WIKI-ENGINE` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `PROD-THU-CHI-PLUS` | Mixed | Có | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `QUAN-LY-VAN-BAN-V3` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `TAI_FILE_HOA_DON_NHAN_VIEN` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `TASK_CONTROL_CENTER (TCC)` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `Testers` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `UI_TC_TTXV THANH TOAN XA VIEN - HOA DON DAU VAO` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `V2-Tro-Ly-AI` | Mixed | Có | Không | `` | `` | 3 | 3 | 0 | LAB |
| `V2-UI_TC_TTXV THANH TOAN XA VIEN - HOA DON DAU VAO` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `VAN-HANH-FE` | Apps Script | Không | Có | `lean` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `VH-HTX-PHAN-HOI-PHAP-LY` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `VOS_Vi_OPERATIONAL_SYSTEM` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `VP54_THANH-CONG_DAU-VAO` | Apps Script | Không | Có | `main` | `github.com (credential stripped)` | 1 | 1 | 0 | PILOT_CANDIDATE |
| `_DEV_SANBOX` | Apps Script | Không | Có | `dev` | `github.com (credential stripped)` | 1 | 1 | 0 | LAB |
| `cbv_qlvt_scraper` | Node/React | Có | Có | `main` | `github.com (credential stripped)` | 0 | 0 | 0 | PILOT_CANDIDATE |
| `quan-ly-van-ban` | Apps Script | Không | Không | `` | `` | 1 | 1 | 0 | LAB |

## Repo trọng tâm (CBV / LaoCong)

| Repo | File / module quan trọng | Ghi chú |
|------|---------------------------|---------|
| `CBV_SSA_LAOCONG_PRO` | `README.md`, `05_GAS_RUNTIME/`, `apps-script/*`, `04_APPSHEET/`, `06_DATABASE/`, `09_AUDIT/`, `07_TEST/` | **PRO** — baseline; Cursor rule TASK_MAIN. |
| `CBV_SSA_LAOCONG_VOS` | Multi clasp Apps Script | VOS / task integration. |
| `LAOCONG_VOS_PLATFORM` | Node/React monorepo | **PILOT** — VOS platform. |
| `CBV_SSA_LAOCONG_MAIN` | clasp + GAS | Biến thể MAIN. |

## Dữ liệu máy đọc

- `_inventory_rows.csv` — sinh cùng lần quét (không chứa token sau sanitize).
