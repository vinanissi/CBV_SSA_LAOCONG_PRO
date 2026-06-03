import { useCallback, useMemo, useState } from 'react';
import { getChecklistTemplateById, listActiveChecklistTemplates } from './checklistTemplateLibrary';
import type { ChecklistTemplate } from './checklistTemplateTypes';

export function useChecklistTemplateRuntime() {
  const templates = useMemo(() => listActiveChecklistTemplates(), []);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const selectedTemplate: ChecklistTemplate | null = useMemo(() => {
    if (!selectedTemplateId) return null;
    return getChecklistTemplateById(selectedTemplateId);
  }, [selectedTemplateId]);

  const selectTemplate = useCallback((templateId: string | null) => {
    setSelectedTemplateId(templateId?.trim() || null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTemplateId(null);
  }, []);

  return {
    templates,
    selectedTemplate,
    selectedTemplateId,
    applying,
    setApplying,
    selectTemplate,
    clearSelection,
  };
}
