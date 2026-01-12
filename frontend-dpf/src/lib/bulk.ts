export type BulkRunResult<TId extends string | number> = {
  succeeded: TId[];
  failed: { id: TId; error: unknown }[];
};

export const runWithConcurrency = async <TId extends string | number>(
  ids: TId[],
  concurrency: number,
  worker: (id: TId) => Promise<void>
): Promise<BulkRunResult<TId>> => {
  const poolSize = Math.max(1, Math.floor(concurrency || 1));
  const queue = [...ids];
  const succeeded: TId[] = [];
  const failed: { id: TId; error: unknown }[] = [];

  const runner = async () => {
    while (queue.length) {
      const id = queue.shift() as TId;
      try {
        await worker(id);
        succeeded.push(id);
      } catch (error) {
        failed.push({ id, error });
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(poolSize, ids.length) }, () => runner()));
  return { succeeded, failed };
};

