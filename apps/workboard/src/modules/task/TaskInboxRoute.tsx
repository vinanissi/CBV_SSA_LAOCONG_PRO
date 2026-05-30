import type { UserContext } from '@/api/contracts';
import { WorkInboxShell } from '@/components/inbox/WorkInboxShell';
import { TasksPage } from '@/modules/task/TasksPage';

interface TaskInboxRouteProps {
  user: UserContext;
}

/** Single route element for /inbox and /tasks — WorkInboxLayoutProvider is in App.tsx. */
export function TaskInboxRoute({ user }: TaskInboxRouteProps) {
  return (
    <WorkInboxShell>
      <TasksPage user={user} />
    </WorkInboxShell>
  );
}
