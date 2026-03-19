# SERVICE CONTRACT - TASK_CENTER

## completeTask(taskId, note)
### Validation
- task tồn tại
- task đang ở trạng thái mở
- mọi checklist required đã done

### Side effects
- set DONE
- set DONE_AT
- ghi TASK_UPDATE_LOG

## assignTask(taskId, ownerId)
### Validation
- owner hợp lệ
- task không ở trạng thái kết
