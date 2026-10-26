import { randomUUID } from 'node:crypto'
import { redis } from './redis.js'

const RELEASE = `
if redis.call('get', KEYS[1]) == ARGV[1] then
 return redis.call('del', KEYS[1])
end 
return 0 `

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function withRoomLock(code, fn, { ttlMs = 5000, waitMs = 3000 } = {}) {
    const key = `lock:${code}`;
    const token = randomUUID();
    const started = Date.now();

    while (!(await redis.set(key, token, 'PX', ttlMs, 'NX'))) {
        if (Date.now() - started > waitMs) throw new Error('Room is busy, try again');
        await sleep(20 + Math.random() * 30);
    }

    try {
        return await fn();
    } finally {
        await redis.eval(RELEASE, 1, key, token);
    }
}