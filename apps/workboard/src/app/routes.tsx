import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/modules/task/HomePage';
import { TasksPage } from '@/modules/task/TasksPage';
import { FinancePage } from '@/modules/finance/FinancePage';
import { HoSoPage } from '@/modules/hoso/HoSoPage';
import { CoordinationPage } from '@/modules/coordination/CoordinationPage';
import { ObservationPage } from '@/modules/observation/ObservationPage';
import { PluginsPage } from '@/modules/plugins/PluginsPage';
import { SearchPage } from '@/modules/task/SearchPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/tasks/:taskId" element={<TasksPage />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="/hoso" element={<HoSoPage />} />
      <Route path="/coordination" element={<CoordinationPage />} />
      <Route path="/observation" element={<ObservationPage />} />
      <Route path="/plugins" element={<PluginsPage />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  );
}
