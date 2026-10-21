const rooms = new Map()
export const store = {
    async get(code) {
        return rooms.get(code) ?? null;
    },
    async set(room) { rooms.set(room.code, room) },
    async delete(code) { rooms.delete(code) },
    async exists(code) { return rooms.has(code) },
}