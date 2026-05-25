# Handoff — PHASE_RF_11 Task Write Runtime

## Write mode

Set in `workers/api/wrangler.toml`:

```toml
CBV_TASK_WRITE_MODE = "local"   # ENABLED — safe in-memory write
# CBV_TASK_WRITE_MODE = "locked"  # LOCKED — WRITE_ADAPTER_NOT_CONFIGURED
```

Production GAS write (future):

```env
CBV_GAS_WRITE_API_BASE_URL=https://...
CBV_TASK_WRITE_MODE=gas
```

## Run

```bash
cd workers/api && npm run dev
cd apps/workboard && npm run dev
```

Test role header: `VITE_CBV_ROLE=MANAGER` in FE `.env`

## FE usage

- **+ Việc** (quick bar or Tasks page) → create modal
- Task detail panel → **Cập nhật việc** form
- Locked message: “Chức năng ghi chưa được bật cho môi trường này.”

## Verify

```bash
curl -X POST http://localhost:8787/api/tasks -H "x-cbv-role: MANAGER" -H "Content-Type: application/json" -d "{\"title\":\"Test\"}"
```

## Do NOT

- Enable GAS write without reviewed safe endpoint
- Call Google Sheet from FE
- Overwrite timeline — append-only only
