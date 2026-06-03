/**
 * Checklist local→Sheet migration UI — developer/admin only
 * (PHASE_CHECKLIST_MIGRATION_TOOL_DEV_ONLY).
 */
export function canShowChecklistMigrationTools(): boolean {
  return (
    import.meta.env.VITE_CBV_DEV_MODE === 'true' ||
    import.meta.env.VITE_CBV_DEBUG_MODE === 'true' ||
    import.meta.env.VITE_CBV_ADMIN_TOOLS_ENABLED === 'true'
  );
}
