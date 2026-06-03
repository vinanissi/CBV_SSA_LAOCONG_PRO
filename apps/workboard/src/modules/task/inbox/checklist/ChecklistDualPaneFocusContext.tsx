import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { SmartChecklistItem } from './smartChecklistTypes';

export type ChecklistDetailSection = 'attachments' | 'links' | 'feedback' | 'history';

export interface ChecklistDualPaneOpenDetailOptions {
  autoCompose?: boolean;
  /** Immediate row snapshot so the right pane does not wait for list resync. */
  item?: SmartChecklistItem | null;
}

/** Row-level mutations registered by WorkInboxChecklistSection for the right detail pane. */
export interface ChecklistDualPaneRowActions {
  onAddFeedback?: (itemId: string, message: string) => void;
  onRegisterAttachment?: (
    itemId: string,
    input: {
      name: string;
      url?: string | null;
      mimeType?: string | null;
      size?: number | null;
      source?: string;
    },
  ) => void;
  onRegisterAttachmentFromTask?: (
    itemId: string,
    ref: { title: string; url?: string; attachmentId?: string },
  ) => void;
  onRemoveAttachment?: (itemId: string, attachmentId: string) => void;
  onUploadAttachmentFile?: (itemId: string, file: File) => void | Promise<void>;
  onRegisterLink?: (
    itemId: string,
    input: { label: string; url: string; description?: string | null },
  ) => void;
  onRegisterLinkFromTask?: (itemId: string, ref: { title: string; url?: string }) => void;
  onRemoveLink?: (itemId: string, linkId: string) => void;
  onAddManualHistoryNote?: (itemId: string, message: string) => void;
}

export interface ChecklistDualPaneFocusContextValue {
  dualPaneEnabled: boolean;
  focusedChecklistItemId: string | null;
  focusedItem: SmartChecklistItem | null;
  detailSection: ChecklistDetailSection | null;
  detailAutoCompose: boolean;
  setFocusedChecklistItemId: (id: string | null) => void;
  setFocusedItem: (item: SmartChecklistItem | null) => void;
  setDetailSection: (section: ChecklistDetailSection | null, options?: ChecklistDualPaneOpenDetailOptions) => void;
  openDetailForItem: (
    itemId: string,
    section: ChecklistDetailSection,
    options?: ChecklistDualPaneOpenDetailOptions,
  ) => void;
  registerRowActions: (actions: ChecklistDualPaneRowActions | null) => void;
  getRowActions: () => ChecklistDualPaneRowActions | null;
}

const ChecklistDualPaneFocusContext = createContext<ChecklistDualPaneFocusContextValue | null>(
  null,
);

export function ChecklistDualPaneFocusProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const [focusedChecklistItemId, setFocusedChecklistItemIdState] = useState<string | null>(null);
  const [focusedItem, setFocusedItem] = useState<SmartChecklistItem | null>(null);
  const [detailSection, setDetailSectionState] = useState<ChecklistDetailSection | null>(null);
  const [detailAutoCompose, setDetailAutoCompose] = useState(false);
  const rowActionsRef = useRef<ChecklistDualPaneRowActions | null>(null);

  const setFocusedChecklistItemId = useCallback((id: string | null) => {
    setFocusedChecklistItemIdState(id);
    if (!id) {
      setFocusedItem(null);
      setDetailSectionState(null);
      setDetailAutoCompose(false);
    }
  }, []);

  const setDetailSection = useCallback(
    (section: ChecklistDetailSection | null, options?: ChecklistDualPaneOpenDetailOptions) => {
      setDetailSectionState(section);
      setDetailAutoCompose(Boolean(options?.autoCompose && section));
    },
    [],
  );

  const openDetailForItem = useCallback(
    (itemId: string, section: ChecklistDetailSection, options?: ChecklistDualPaneOpenDetailOptions) => {
      const id = itemId.trim();
      if (!id) return;
      setFocusedChecklistItemIdState(id);
      if (options?.item) setFocusedItem(options.item);
      setDetailSectionState(section);
      setDetailAutoCompose(Boolean(options?.autoCompose));
    },
    [],
  );

  const registerRowActions = useCallback((actions: ChecklistDualPaneRowActions | null) => {
    rowActionsRef.current = actions;
  }, []);

  const getRowActions = useCallback(() => rowActionsRef.current, []);

  const value = useMemo<ChecklistDualPaneFocusContextValue>(
    () => ({
      dualPaneEnabled: enabled,
      focusedChecklistItemId,
      focusedItem,
      detailSection,
      detailAutoCompose,
      setFocusedChecklistItemId,
      setFocusedItem,
      setDetailSection,
      openDetailForItem,
      registerRowActions,
      getRowActions,
    }),
    [
      enabled,
      focusedChecklistItemId,
      focusedItem,
      detailSection,
      detailAutoCompose,
      setFocusedChecklistItemId,
      setDetailSection,
      openDetailForItem,
      registerRowActions,
      getRowActions,
    ],
  );

  return (
    <ChecklistDualPaneFocusContext.Provider value={value}>
      {children}
    </ChecklistDualPaneFocusContext.Provider>
  );
}

export function useChecklistDualPaneFocus(): ChecklistDualPaneFocusContextValue {
  const ctx = useContext(ChecklistDualPaneFocusContext);
  if (!ctx) {
    return {
      dualPaneEnabled: false,
      focusedChecklistItemId: null,
      focusedItem: null,
      detailSection: null,
      detailAutoCompose: false,
      setFocusedChecklistItemId: () => undefined,
      setFocusedItem: () => undefined,
      setDetailSection: () => undefined,
      openDetailForItem: () => undefined,
      registerRowActions: () => undefined,
      getRowActions: () => null,
    };
  }
  return ctx;
}

export function useChecklistDualPaneFocusOptional(): ChecklistDualPaneFocusContextValue | null {
  return useContext(ChecklistDualPaneFocusContext);
}
