# PHASE_TASK_GS_05 — Operator Cognition Runtime — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Phase ID:** `PHASE_TASK_GS_05_OPERATOR_COGNITION_RUNTIME`  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Baseline:** GS_04 operational visual compression (GO)

## Problem

Runtime usable nhưng operator gặp:
- Warning fatigue (stale 9000+ ngày, mọi signal ngang nhau)
- Attention overload
- Khó biết "làm gì tiếp theo"
- Coordination load cao

## Goal

Biến CBV TASK thành **Operational Cognition Runtime** — FE-only, rule-based:
- Attention prioritization (ACTION NOW → BACKGROUND)
- Next-action engine (1 action/card)
- Queue cognition grouping
- Warning suppression
- Working memory panel
- Resume/recent context (session/local)
- Runtime signal filtering

## Constraints

- Không AI/ML, không DB change, không websocket
- Không rewrite runtime backend
- Lightweight deterministic utils
- React.memo preserved

## Deliverables

| Priority | Deliverable |
|----------|-------------|
| P1 | `taskAttention.ts` — 4-level hierarchy + styles |
| P2 | `taskNextAction.ts` — rule-based next action |
| P3 | `taskCognitionGrouping.ts` — cognitive workflow groups |
| P4 | `taskSignalFiltering.ts` — stale suppression, runtime warning filter |
| P5 | `TaskCard.tsx` — action-first layout |
| P6 | `OperationalContextPanel.tsx` — working memory order |
| P7 | `recentContext.ts` + `RecentContextBar.tsx` |
| P8 | Throughput: quick actions on card (accept/complete) |
| J | Runtime signal filtering in TasksPage |
| L | `taskOperatorObservation.ts` — session append-only |
| N | `taskGs05Checks.ts` |
| O | prompt, report, handoff |

## Acceptance

1. Warning fatigue giảm rõ
2. Next action visible trên card + panel
3. Cognition grouping toggle (default cognition)
4. Historical stale không spam badge
5. Recent/resume context hoạt động
6. FE build PASS
