# Focus Mode Wireframe

**Route:** `/inbox?focus=1` or dedicated focus route (decision note in implementation)

```text
┌────────────────────────────┐
│ Focus Mode        X        │
├────────────────────────────┤
│ 1 / N                      │
│                            │
│ Task Title                 │
│ Task Code                  │
│ Status Chip                │
│ Due Date                   │
│ Assignee                   │
│                            │
│ [Hoàn thành]               │
│ [Chuyển tiếp] [Tạm dừng]   │
│                            │
│ [Việc trước] [Việc tiếp]   │
└────────────────────────────┘
```

**X** → quay lại Inbox (không auto-complete).
