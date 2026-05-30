import { mapInboxItemToTaskCardModel } from '@/modules/task/adapters/workInboxAdapter';
import type { InboxGroupBucket } from '@/modules/task/inbox/inboxGroups';
import type { TaskCardModel } from '@/modules/task/types/workInboxTypes';

/** InboxItem → TaskCardModel for V3 cards (adapter layer only). */
export function mapInboxGroupBucketToCardModels(
  bucket: InboxGroupBucket,
  limit: number,
): TaskCardModel[] {
  const cap = Math.max(0, limit);
  return bucket.items.slice(0, cap).map((item) => mapInboxItemToTaskCardModel(item));
}

/** All cards in fixed group order (need_action → … → completed) for Focus Mode V3. */
export function collectOrderedCardModelsFromBuckets(buckets: InboxGroupBucket[]): TaskCardModel[] {
  return buckets.flatMap((bucket) => bucket.items.map((item) => mapInboxItemToTaskCardModel(item)));
}
