import { redis } from "../utils/redis";

const TTL = 30;

export async function getCached<T>(key: string, miss: () => Promise<T>): Promise<T> {
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit) as T;

  const data = await miss();
  await redis.set(key, JSON.stringify(data), "EX", TTL);
  return data;
}

export async function invalidate(keyPattern: string) {
  const keys = await redis.keys(keyPattern);
  if (keys.length) await redis.del(...keys);
}
