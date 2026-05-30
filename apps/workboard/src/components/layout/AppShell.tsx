import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserContext } from '@/api/contracts';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { RuntimeStatusBar } from '@/components/runtime/RuntimeStatusBar';
import { DetailPanel } from './DetailPanel';
import { FocusStrip } from '@/components/ui/FocusStrip';
import { useWorkInboxLayout } from '@/modules/task/inbox/WorkInboxLayoutContext';
import { RIGHT_CONTEXT_ROOT_ID } from '@/modules/task/inbox/rightContextPortal';

interface AppShellProps {
  user: UserContext;
  children?: ReactNode;
  onLogout?: () => void;
}

export function AppShell({ user, children, onLogout }: AppShellProps) {
  const navigate = useNavigate();
  const { suppressGlobalDetailPanel, useThreeRegionFocusLayout } = useWorkInboxLayout();

  return (
    <div
      className="app-shell flex h-screen min-w-[1366px] flex-col bg-surface operational-runtime"
      data-cbv-shell="app-shell"
    >
      <TopBar user={user} onSearchNavigate={(q) => navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')} onLogout={onLogout} />

      <div className="app-shell__body flex min-h-0 flex-1">
        <Sidebar user={user} />

        <main
          className={
            useThreeRegionFocusLayout
              ? 'work-inbox-v3-main flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-50/60'
              : 'flex min-w-0 flex-1 flex-col overflow-hidden bg-surface'
          }
        >
          {useThreeRegionFocusLayout ? (
            <div
              className="cbv-workspace-layout workspace-layout flex min-h-0 flex-1 overflow-hidden overflow-x-hidden"
              data-cbv-layout="workspace-layout"
            >
              <div
                className="focus-workspace flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-2"
                data-cbv-region="focus-workspace"
              >
                <div className="main-canvas main-canvas--focus min-h-0">{children}</div>
              </div>
              <div
                id={RIGHT_CONTEXT_ROOT_ID}
                className="right-context-tabs right-context-tabs-outer shrink-0 overflow-y-auto overflow-x-hidden border-l border-slate-200 bg-white"
                data-cbv-region="right-context-tabs"
                data-cbv-panel="right-context-tabs-outer"
              />
            </div>
          ) : (
            <div className="flex min-h-0 flex-1">
              <div className="operational-main-scroll min-w-0 flex-1 overflow-y-auto px-5 py-4">
                <FocusStrip />
                <div className="main-canvas">{children}</div>
              </div>
              {!suppressGlobalDetailPanel && <DetailPanel />}
            </div>
          )}
        </main>
      </div>

      <RuntimeStatusBar user={user} />
    </div>
  );
}
