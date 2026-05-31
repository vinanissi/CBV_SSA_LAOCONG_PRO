import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isWorkInboxRoute } from '@/shared/routes/inboxRoutes';
import { isWorkInboxFocusRuntimeEnabled } from '@/modules/task/inbox/workInboxGroupsFeature';

export type DetailPanelContent = ReactNode | (() => ReactNode);

interface DetailContextValue {
  title: string;
  content: DetailPanelContent | null;
  contentRevision: number;
  setDetail: (title: string, content: DetailPanelContent | null) => void;
  bumpDetailContent: () => void;
  clearDetail: () => void;
}

const DetailContext = createContext<DetailContextValue | null>(null);

function renderDetailContent(content: DetailPanelContent | null): ReactNode {
  if (content == null) return null;
  if (typeof content === 'function') return content();
  return content;
}

const detailPanelRenderRef: { current: (() => ReactNode) | null } = { current: null };

export function registerDetailPanelRenderer(render: () => ReactNode) {
  detailPanelRenderRef.current = render;
}

export function invokeDetailPanelRenderer(): ReactNode {
  return detailPanelRenderRef.current?.() ?? null;
}

const STABLE_DETAIL_PANEL_INVOKER: DetailPanelContent = () => invokeDetailPanelRenderer();

export function DetailProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<DetailPanelContent | null>(null);
  const [contentRevision, setContentRevision] = useState(0);

  const bumpDetailContent = useCallback(() => {
    setContentRevision((r) => r + 1);
  }, []);

  const setDetail = useCallback((t: string, c: DetailPanelContent | null) => {
    setTitle((prev) => (prev === t ? prev : t));
    setContent((prev) => (prev === c ? prev : c));
  }, []);

  const clearDetail = useCallback(() => {
    setTitle((prev) => (prev === '' ? prev : ''));
    setContent((prev) => (prev === null ? prev : null));
  }, []);

  const value = useMemo<DetailContextValue>(
    () => ({
      title,
      content,
      contentRevision,
      setDetail,
      bumpDetailContent,
      clearDetail,
    }),
    [title, content, contentRevision, bumpDetailContent, setDetail, clearDetail],
  );

  return <DetailContext.Provider value={value}>{children}</DetailContext.Provider>;
}

export function useDetailPanel() {
  const ctx = useContext(DetailContext);
  if (!ctx) throw new Error('useDetailPanel must be used within DetailProvider');
  return ctx;
}

export function DetailPanel() {
  const ctx = useContext(DetailContext);
  const location = useLocation();

  if (!ctx) return null;

  const hideLegacyContextPanel =
    isWorkInboxRoute(location.pathname) && isWorkInboxFocusRuntimeEnabled();

  if (hideLegacyContextPanel) {
    return null;
  }

  void ctx.contentRevision;
  const rendered = renderDetailContent(ctx.content);

  return (
    <>
      <aside
        className="detail-panel-aside legacy-context-panel hidden w-detail min-w-[360px] max-w-[420px] shrink-0 flex-col xl:flex"
        data-cbv-panel="legacy-context-panel"
      >
        <div className="panel-header flex items-center justify-between gap-2">
          <span className="truncate">{ctx.title || 'Ngữ cảnh vận hành'}</span>
          {rendered && (
            <button type="button" className="btn-ghost text-xs shrink-0" onClick={ctx.clearDetail} aria-label="Đóng panel">
              ESC
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {rendered ?? (
            <p className="text-sm leading-relaxed text-slate-500">
              Chọn việc để xem ngữ cảnh vận hành — SLA, timeline, tài liệu và bước tiếp theo.
            </p>
          )}
        </div>
      </aside>
      {rendered && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto border-t border-border bg-surface-raised p-4 xl:hidden">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-white">{ctx.title || 'Chi tiết'}</span>
            <button type="button" className="btn-ghost text-sm" onClick={ctx.clearDetail}>
              Đóng
            </button>
          </div>
          {rendered}
        </div>
      )}
    </>
  );
}

export { STABLE_DETAIL_PANEL_INVOKER };
