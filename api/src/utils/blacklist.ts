import { redis } from "./redis";

export async function blacklistToken(token: string, ttlSec: number) {
  await redis.set(`bl:${token}`, "1", "EX", ttlSec);
}
export async function isBlacklisted(token: string) {
  return (await redis.exists(`bl:${token}`)) === 1;
}