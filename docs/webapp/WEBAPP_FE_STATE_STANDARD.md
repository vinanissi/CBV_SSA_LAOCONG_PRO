# WebApp FE State Standard (Phase 90)

## State types

- **loading**: data request started; show skeleton/loading block.
- **empty**: request ok but no rows/items to show.
- **warning**: data partially available or missing columns/sheets; show page + warning banner.
- **error**: unexpected exception; show error block (read-first).
- **ready**: full data available.
- **partial**: placeholder preview (Timeline/Kanban) with limited data, not full UX.

## Rules

- Do not crash rendering when data missing; show warnings.
- No write actions in Phase 90 pages.
- Always show safety footer:
  - No auto assign
  - No auto resolve
  - No auto escalate
  - No production claim

