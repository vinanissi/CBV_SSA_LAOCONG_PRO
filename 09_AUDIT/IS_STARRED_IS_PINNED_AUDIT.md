# Audit: IS_STARRED / IS_PINNED Blank Bug

**Ngày phát hiện:** 2026-04-06  
**Severity:** Medium  
**Status:** FIXED

## Root cause

createTask() không khởi tạo IS_STARRED=false và IS_PINNED=false. Google Sheets lưu blank. AppSheet sort Descending đọc blank > false → task mới float lên đầu sai.

## Fix đã áp dụng

- 20_TASK_SERVICE.js: thêm IS_STARRED: false, IS_PINNED: false vào record createTask()
- Thêm hàm backfillStarPin() để fix data cũ (chạy 1 lần)
- SORT_PRIORITY formula: tách status weight (x1000) khỏi DUE_DATE offset, chỉ áp DUE_DATE offset cho active tasks

## Data fix

Chạy backfillStarPin() trong GAS để fill false cho tất cả row blank hiện có.

## Verification

- [ ] backfillStarPin() đã chạy
- [ ] Tạo task mới → IS_STARRED = false, IS_PINNED = false trong sheet
- [ ] TASK_LIST hiển thị đúng thứ tự: IN_PROGRESS → NEW → WAITING → DONE → CANCELLED
