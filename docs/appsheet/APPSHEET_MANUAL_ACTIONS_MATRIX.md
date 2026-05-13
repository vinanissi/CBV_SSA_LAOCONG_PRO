# AppSheet manual actions matrix (pilot)

Every action below is **manual tap only**: no AppSheet Bot, no automatic trigger, no auto assign / auto resolve / auto escalate.

| actionCode | actionName | Target table | Applies to | Confirmation | Audit expectation |
|------------|------------|--------------|------------|----------------|-------------------|
| ACK | Acknowledge | `HOME_ALERT` | Queue / detail | Optional | Update acknowledgement / seen fields; log via existing action column or webhook |
| CLAIM | Claim | `HOME_ALERT` | Unassigned queue | **Yes** | Set assignee; `CLAIMED_AT` / `CLAIMED_BY` if present |
| IN_PROGRESS | Mark In Progress | `HOME_ALERT` | My queue | No | Workflow `STATUS` only |
| WAITING_RESPONSE | Waiting Response | `HOME_ALERT` | My queue | No | Workflow `STATUS` only |
| ESCALATE | Escalate | `HOME_ALERT` | Allowed screens | **Yes** | `ESCALATION_*` fields; human decision |
| RESOLVE | Resolve | `HOME_ALERT` | My queue / policy | **Yes** | Terminal status; audit |
| RELEASE | Release | `HOME_ALERT` | My queue | **Yes** | Clear assignee or return to pool |

## Implementation rules

1. **Condition (Valid If):** Use normal AppSheet expressions—**no** leading `=`.
2. **No Bot:** Do not attach these to schedules, “on add” bots, or ML.
3. **Audit trail:** Prefer columns already synced by GAS / Apps Script webhook; any new audit column must be explicitly approved (append-only pattern).
4. **Effect:** Each action should map to one clear column set; document in your runbook.

## Prohibited in pilot

- AppSheet Bot executing these actions.
- Auto-assign from Unassigned.
- Auto-resolve on timer.
- Auto-escalate on SLA breach without human confirmation (SLA visibility is allowed; automation is not in this phase).
