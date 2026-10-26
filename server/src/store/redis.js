import Redis from 'ioredis'

const url = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(url)
export const pubClient = new Redis(url)
export const subClient = new Redis(url)

redis.on('error', (e) => console.error('redis error:', e.message))