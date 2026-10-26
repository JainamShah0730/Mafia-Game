import { redis } from './redis.js';

const key = (code) => `room:${code}`;
const TTL_SECONDS = 6 * 60 * 60; // abandoned rooms disappear on their own

export const store = {
    async get(code) {
        const raw = await redis.get(key(code));
        return raw ? JSON.parse(raw) : null;
    },
    async set(room) {
        await redis.set(key(room.code), JSON.stringify(room), 'EX', TTL_SECONDS);
    },
    // NX = only create if the key does not exist, so two servers can't pick the same code
    async create(room) {
        const res = await redis.set(key(room.code), JSON.stringify(room), 'EX', TTL_SECONDS, 'NX');
        return res === 'OK';
    },
    async delete(code) {
        await redis.del(key(code));
    },
};