type CachedValue<T> = {
  data: T;
  expiresAt: number;
};

const values = new Map<string, CachedValue<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

/** Cache public reads in memory and deduplicate concurrent remounts. */
export function requestPublic<T>(key: string, request: () => Promise<T>, ttlMs: number): Promise<T> {
  const cached = values.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.data as T);
  }

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const next = request()
    .then((data) => {
      values.set(key, { data, expiresAt: Date.now() + ttlMs });
      return data;
    })
    .finally(() => {
      if (inFlight.get(key) === next) inFlight.delete(key);
    });

  inFlight.set(key, next);
  return next;
}

