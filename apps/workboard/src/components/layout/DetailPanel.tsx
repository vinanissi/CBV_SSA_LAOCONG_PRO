import { createContext, useContext, useState, type ReactNode } from 'react';

interface DetailContextValue {
  title: string;
  content: ReactNode | null;
  setDetail: (title: string, content: ReactNode | null) => void;
  clearDetail: () => void;
}

const DetailContext = createContext<DetailContextValue | null>(null);

export function DetailProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ReactNode | null>(null);

  const value: DetailContextValue = {
    title,
    content,
    setDetail: (t, c) => {
      setTitle(t);
      setContent(c);
    },
    clearDetail: () => {
      setTitle('');
      setContent(null);
    },
  };

  return <DetailContext.Provider value={value}>{children}</DetailContext.Provider>;
}

export function useDetailPanel() {
  const ctx = useContext(DetailContext);
  if (!ctx) throw new Error('useDetailPanel must be used within DetailProvider');
  return ctx;
}

export function DetailPanel() {
  const ctx = useContext(DetailContext);
  if (!ctx) return null;

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l border-border bg-surface-raised xl:flex">
      <div className="panel-header">{ctx.title || 'Chi tiết'}</div>
      <div className="flex-1 overflow-y-auto p-4">
        {ctx.content ?? (
          <p className="text-sm text-slate-500">Chọn một mục để xem chi tiết, lịch sử và tệp liên quan.</p>
        )}
      </div>
    </aside>
  );
}
