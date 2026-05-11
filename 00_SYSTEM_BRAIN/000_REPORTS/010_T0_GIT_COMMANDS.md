---
doc: 010_T0_GIT_COMMANDS
purpose: Proposed Git command sequence for T0 brain bootstrap commit/tag (push manual)
generatedAt: 2026-05-11T19:30:00+07:00
---

# T0 Git commands (proposed)

Do **not** push until operator confirms remote is credential-safe and review is complete.

## 1. Kiểm tra trước commit

```bash
git status --short
git remote -v
git branch --show-current
```

## 2. Stage đúng phạm vi

```bash
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN
git add 00_SYSTEM_BRAIN/PHASE_T0_TASK_BINDING_BRAIN_BOOTSTRAP
git add 00_SYSTEM_BRAIN/000_PROMPTS
git add 00_SYSTEM_BRAIN/000_REPORTS
```

## 3. Kiểm tra staged files

```bash
git diff --cached --name-only
git diff --cached --stat
```

Confirm: no `.clasp.json` (real), no tokens, only the four subtrees above.

## 4. Commit theo ngữ cảnh

```bash
git commit -m "docs(brain): bootstrap T0 task binding AI work brain"
```

## 5. Tạo tag local theo ngữ cảnh

```bash
git tag -a t0-task-binding-brain-bootstrap-v0.1 -m "T0 bootstrap: task binding prep and AI work brain scaffold"
```

Run only after commit succeeds. If the tag already exists, use a new patch suffix or delete the local tag intentionally (not done in this prep).

## 6. Push branch sau khi operator xác nhận

```bash
git push origin phase/t0-task-binding-brain-bootstrap
```

## 7. Push tag sau khi operator xác nhận

```bash
git push origin t0-task-binding-brain-bootstrap-v0.1
```

## Notes

- Không tự chạy push nếu chưa được operator xác nhận.
- Không tự chạy tag nếu commit chưa thành công.
- Không push tag nếu branch chưa push ổn.
