---
doc: 010_T0_GIT_COMMIT_TAG_PUSH_PREP_PROMPT
purpose: Archived operator prompt for Git commit/tag/push prep (T0 bootstrap)
savedAt: 2026-05-11T19:30:00+07:00
---

# Original prompt (verbatim request)

BỐI CẢNH

Repo:
D:\Workspace\projects\CBV_SSA_LAOCONG_PRO

Branch hiện tại:
phase/t0-task-binding-brain-bootstrap

Mục tiêu:
Chuẩn bị bộ lệnh Git để ghi nhận phase bootstrap hiện tại, tạo commit/tag theo ngữ cảnh khi đủ điều kiện, nhưng KHÔNG push nếu còn rủi ro.

==================================================
YÊU CẦU BẮT BUỘC TRƯỚC KHI THỰC HIỆN
==================================================

1. Hãy lưu chính prompt này vào thư mục:

.\00_SYSTEM_BRAIN\000_PROMPTS\

Tên file bắt đầu bằng số 000–999 theo ngữ cảnh, ví dụ:

010_T0_GIT_COMMIT_TAG_PUSH_PREP_PROMPT.md

2. Khi kết thúc, tạo report mới trong thư mục:

.\00_SYSTEM_BRAIN\000_REPORTS\

Tên file bắt đầu bằng số 000–999 theo ngữ cảnh, ví dụ:

010_T0_GIT_COMMIT_TAG_PUSH_PREP_REPORT.md

3. Nếu hai thư mục trên chưa tồn tại thì tạo mới.

4. Không xóa file.
5. Không rewrite history.
6. Không force push.
7. Không push nếu còn nghi ngờ secret/token/PAT.
8. Không deploy Apps Script.
9. Không sửa runtime nghiệp vụ.

==================================================
PHẦN A — PRECHECK GIT
==================================================

Chạy và ghi nhận:

git status --short
git branch --show-current
git remote -v
git log --oneline --decorate -n 8
git diff --stat
git diff --name-only

Kiểm tra:
- branch hiện tại có đúng phase/t0-task-binding-brain-bootstrap không
- remote origin có sạch không
- có ghp_ / token / secret trong remote không
- có file .clasp.json thật bị staged không
- có file credential/token/key không

Nếu phát hiện secret:
- DỪNG
- không commit
- ghi FAIL vào report

==================================================
PHẦN B — CHUẨN BỊ DANH SÁCH FILE ĐƯỢC COMMIT
==================================================

Chỉ được đưa vào commit các file thuộc nhóm:

1. 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/**
2. 00_SYSTEM_BRAIN/PHASE_T0_TASK_BINDING_BRAIN_BOOTSTRAP/**
3. 00_SYSTEM_BRAIN/000_PROMPTS/**
4. 00_SYSTEM_BRAIN/000_REPORTS/**

Không stage:
- .clasp.json thật
- token/secret
- runtime business files nếu không được yêu cầu
- Apps Script production files ngoài phạm vi bootstrap

Chạy dry-run:

git add --dry-run 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN
git add --dry-run 00_SYSTEM_BRAIN/PHASE_T0_TASK_BINDING_BRAIN_BOOTSTRAP
git add --dry-run 00_SYSTEM_BRAIN/000_PROMPTS
git add --dry-run 00_SYSTEM_BRAIN/000_REPORTS

Ghi kết quả vào report.

==================================================
PHẦN C — TẠO BỘ LỆNH GIT ĐỀ XUẤT
==================================================

Tạo file trong report folder:

010_T0_GIT_COMMANDS.md

Nội dung gồm bộ lệnh đề xuất:

# 1. Kiểm tra trước commit
git status --short
git remote -v
git branch --show-current

# 2. Stage đúng phạm vi
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN
git add 00_SYSTEM_BRAIN/PHASE_T0_TASK_BINDING_BRAIN_BOOTSTRAP
git add 00_SYSTEM_BRAIN/000_PROMPTS
git add 00_SYSTEM_BRAIN/000_REPORTS

# 3. Kiểm tra staged files
git diff --cached --name-only
git diff --cached --stat

# 4. Commit theo ngữ cảnh
git commit -m "docs(brain): bootstrap T0 task binding AI work brain"

# 5. Tạo tag local theo ngữ cảnh
git tag -a t0-task-binding-brain-bootstrap-v0.1 -m "T0 bootstrap: task binding prep and AI work brain scaffold"

# 6. Push branch sau khi operator xác nhận
git push origin phase/t0-task-binding-brain-bootstrap

# 7. Push tag sau khi operator xác nhận
git push origin t0-task-binding-brain-bootstrap-v0.1

Lưu ý:
- Không tự chạy push nếu chưa được operator xác nhận.
- Không tự chạy tag nếu commit chưa thành công.
- Không push tag nếu branch chưa push ổn.

==================================================
PHẦN D — NẾU ĐƯỢC PHÉP COMMIT LOCAL
==================================================

Nếu precheck sạch và chỉ có file trong phạm vi cho phép:

1. Stage đúng phạm vi.
2. Commit local với message:

docs(brain): bootstrap T0 task binding AI work brain

3. Tạo tag local:

t0-task-binding-brain-bootstrap-v0.1

Message tag:

T0 bootstrap: task binding prep and AI work brain scaffold

4. KHÔNG push tự động.

Nếu có file ngoài phạm vi:
- Không stage file đó.
- Ghi warning vào report.

==================================================
PHẦN E — REPORT CUỐI
==================================================

Tạo report:

.\00_SYSTEM_BRAIN\000_REPORTS\010_T0_GIT_COMMIT_TAG_PUSH_PREP_REPORT.md

Report phải có:

1. checkedAt
2. branch
3. remote status
4. PAT/secret check
5. files staged hoặc proposed staged
6. commit hash nếu đã commit
7. tag nếu đã tạo
8. push status: NOT_PUSHED
9. warnings
10. errors
11. next recommended command

Kết luận report dùng một trong ba trạng thái:

GO
GO_WITH_WARNINGS
FAIL

==================================================
ĐIỀU KIỆN DỪNG
==================================================

Dừng ngay nếu:
- phát hiện PAT/token/secret
- branch sai
- .clasp.json thật bị stage
- file runtime nghiệp vụ bị stage ngoài yêu cầu
- git working tree có thay đổi nguy hiểm chưa phân loại

Không deploy.
Không push production.
Không force push.
Không sửa runtime.
