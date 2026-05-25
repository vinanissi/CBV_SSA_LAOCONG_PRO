import type { ReactNode } from 'react';

interface WorkQueueProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function WorkQueue({ title, children, actions }: WorkQueueProps) {
  return (
    <section className="panel flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <span>{title}</span>
        {actions}
      </div>
      <div className="panel-body space-y-3">{children}</div>
    </section>
  );
}
