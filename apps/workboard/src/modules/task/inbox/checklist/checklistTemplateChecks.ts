/**
 * PHASE_CHECKLIST_07_TEMPLATE_RUNTIME — static diagnostics.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getChecklistTemplateById, listActiveChecklistTemplates } from './checklistTemplateLibrary';

const __dir = dirname(fileURLToPath(import.meta.url));

function readLocal(name: string): string {
  return readFileSync(join(__dir, name), 'utf8');
}

export function runChecklistTemplateRuntimeChecks(): {
  suite: string;
  status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL';
  checks: { id: string; pass: boolean }[];
  warnings: string[];
} {
  const checks: { id: string; pass: boolean }[] = [];
  const warnings: string[] = [];
  const push = (id: string, pass: boolean) => checks.push({ id, pass });

  const section = readLocal('WorkInboxChecklistSection.tsx');
  const toolbar = readLocal('ChecklistListToolbar.tsx');
  const panel = readLocal('ChecklistTemplatePanel.tsx');
  const library = readLocal('checklistTemplateLibrary.ts');

  const active = listActiveChecklistTemplates();
  const tpl = getChecklistTemplateById('tpl-ho-so-xa-vien');

  push('TEMPLATE_LIBRARY_ACTIVE', active.length >= 4);
  push('TEMPLATE_INACTIVE_HIDDEN', !active.some((t) => t.id === 'tpl-inactive-demo'));
  push('TEMPLATE_PREVIEW_UI', panel.includes('Mẫu:') && panel.includes('Áp dụng vào checklist'));
  push('TEMPLATE_TOOLBAR', toolbar.includes('Áp dụng mẫu'));
  push('TEMPLATE_SECTION_WIRED', section.includes('applyChecklistTemplateAppend'));
  push('TEMPLATE_APPEND_ONLY', readLocal('checklistTemplateApply.ts').includes("mode: 'append'"));
  push('TEMPLATE_NO_DELETE_EXISTING', !readLocal('checklistTemplateApply.ts').includes('deleteItem'));
  push('TEMPLATE_HISTORY', section.includes('Áp dụng mẫu'));
  push('TEMPLATE_NO_WORKFLOW', !panel.includes('workflowEngine') && !library.includes('CHECKLIST_TEMPLATE_TABLE'));
  push('TEMPLATE_ITEMS_SEED', (tpl?.items.length ?? 0) >= 5);

  push('TEMPLATE_STATIC_READ_MODEL', library.includes('CHECKLIST_TEMPLATE_LIBRARY'));

  const failed = checks.filter((c) => !c.pass);
  const status: 'GO' | 'GO_WITH_WARNINGS' | 'FAIL' =
    failed.length > 0 ? 'FAIL' : 'GO_WITH_WARNINGS';

  warnings.push('Templates are static in-bundle seed data; no server template API');
  warnings.push('Apply mode is append-only; existing checklist items are preserved');
  warnings.push('Manual browser template UAT recommended');

  return { suite: 'PHASE_CHECKLIST_07_TEMPLATE_RUNTIME', status, checks, warnings };
}
