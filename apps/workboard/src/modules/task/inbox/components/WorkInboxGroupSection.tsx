import type { InboxGroupBucket } from '@/modules/task/inbox/inboxGroups';
import type { TaskCardModel } from '@/modules/task/types/workInboxTypes';
import { WorkInboxTaskCardV3 } from './WorkInboxTaskCardV3';

interface WorkInboxGroupSectionProps {
  bucket: InboxGroupBucket;
  cards: TaskCardModel[];
  totalInGroup: number;
  previewLimit: number;
  compact?: boolean;
  hideOpenButton?: boolean;
  selectedTaskId?: string | null;
  onOpen: (model: TaskCardModel) => void;
  onSelect: (model: TaskCardModel) => void;
}

export function WorkInboxGroupSection({
  bucket,
  cards,
  totalInGroup,
  previewLimit,
  compact = true,
  hideOpenButton = false,
  selectedTaskId = null,
  onOpen,
  onSelect,
}: WorkInboxGroupSectionProps) {
  return (
    <section
      className="work-inbox-group rounded-md border border-border/50 bg-surface-raised/40"
      aria-labelledby={`work-inbox-group-${bucket.key}`}
    >
      <div className="work-inbox-group__header flex items-center justify-between border-b border-border/30 px-2 py-1">
        <h2 id={`work-inbox-group-${bucket.key}`} className="text-xs font-semibold text-operational-text">
          {bucket.label}
        </h2>
        <span className="text-[10px] tabular-nums text-operational-muted">{totalInGroup} việc</span>
      </div>

      {cards.length === 0 ? (
        <p className="px-2 py-2 text-[10px] text-operational-muted">Không có công việc</p>
      ) : (
        <ul className="work-inbox-group__cards flex flex-col gap-1 p-1.5">
          {cards.map((card) => (
            <li key={card.id}>
              <WorkInboxTaskCardV3
                compact={compact}
                hideOpenButton={hideOpenButton}
                model={card}
                selected={selectedTaskId === card.id}
                onOpen={onOpen}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}

      {totalInGroup > previewLimit && (
        <p className="border-t border-border/20 px-2 py-1 text-[10px] text-operational-muted">
          +{totalInGroup - previewLimit} việc khác
        </p>
      )}
    </section>
  );
}
