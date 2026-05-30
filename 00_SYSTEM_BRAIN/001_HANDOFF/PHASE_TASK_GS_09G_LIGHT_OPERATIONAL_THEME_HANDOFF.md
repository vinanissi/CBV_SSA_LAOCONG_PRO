# PHASE_TASK_GS_09G — Handoff

**From:** Light operational workspace theme  
**Status:** GO

## Delivered

1. **Light gray default** — workspace `#f3f4f6`, cards `#ffffff`, borders `#d7dce5`
2. **Operational text tokens** — primary `#111827`, secondary `#4b5563`, muted `#6b7280`
3. **Soft signal colors** — escalation/warning/critical without neon saturation
4. **GS_09F contrast hierarchy** preserved via borders + soft shadows
5. **Dark theme optional** — `theme-dark.css` + toggle persists in `localStorage`
6. **`runTaskGs09gChecks()`** validation suite

## Verify

```bash
cd apps/workboard && npm run dev
```

- [ ] App loads **light** by default (gray workspace, white cards)
- [ ] `/tasks` — queue readable, selected card has blue ring
- [ ] Escalation labels visible (violet/amber, not neon)
- [ ] `[Xử lý]` primary blue; `[Xong]` muted passive
- [ ] Toggle **☾ Tối** → dark cockpit; **☀ Sáng** → back to light
- [ ] Refresh preserves theme (`cbv_theme_mode` in localStorage)

```bash
cd apps/workboard && npm run build
```

Dev console:

```typescript
import { runTaskGs09gChecks } from '@/modules/task/taskGs09gChecks';
runTaskGs09gChecks();
```

## Key files

| Area | Path |
|------|------|
| Tokens | `apps/workboard/tailwind.config.ts` |
| Light CSS | `apps/workboard/src/styles/index.css` |
| Dark CSS | `apps/workboard/src/styles/theme-dark.css` |
| Runtime | `apps/workboard/src/runtime/themeRuntime.ts` |
| Toggle | `apps/workboard/src/components/ThemeToggle.tsx` |

## Do NOT

- Revert default to dark without product decision
- Add rainbow status colors or glassmorphism
- Reduce task list density

## Migration note

Users with existing `cbv_theme_mode=dark` in localStorage keep dark until they toggle or clear storage. New users get light by default.
