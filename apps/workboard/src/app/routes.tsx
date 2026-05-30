import { Routes, Route, Navigate } from 'react-router-dom';
import type { UserContext } from '@/api/contracts';
import { OperationalHome } from '@/components/dashboard/OperationalHome';
import { ModuleRuntimeContainer } from '@/components/dashboard/ModuleRuntimeContainer';
import { TaskInboxRoute } from '@/modules/task/TaskInboxRoute';
import { FinancePage } from '@/modules/finance/FinancePage';
import { HoSoPage } from '@/modules/hoso/HoSoPage';
import { CoordinationPage } from '@/modules/coordination/CoordinationPage';
import { ObservationPage } from '@/modules/observation/ObservationPage';
import { PluginsPage } from '@/modules/plugins/PluginsPage';
import { SearchPage } from '@/modules/task/SearchPage';
import { INBOX_ROUTE, OPERATIONAL_HOME_ROUTE } from '@/shared/routes/inboxRoutes';

interface AppRoutesProps {
  user: UserContext;
}

export function AppRoutes({ user }: AppRoutesProps) {
  const taskInboxElement = <TaskInboxRoute user={user} />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={INBOX_ROUTE} replace />} />
      <Route path={OPERATIONAL_HOME_ROUTE} element={<OperationalHome user={user} />} />
      <Route path="/m/:moduleSlug" element={<ModuleRuntimeContainer />} />
      <Route path={INBOX_ROUTE} element={taskInboxElement} />
      <Route path={`${INBOX_ROUTE}/:taskId`} element={taskInboxElement} />
      <Route path="/tasks" element={taskInboxElement} />
      <Route path="/tasks/:taskId" element={taskInboxElement} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="/hoso" element={<HoSoPage />} />
      <Route path="/coordination" element={<CoordinationPage />} />
      <Route path="/observation" element={<ObservationPage />} />
      <Route path="/plugins" element={<PluginsPage />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  );
}
