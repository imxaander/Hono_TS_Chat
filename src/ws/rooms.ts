import { WebSocket } from 'ws'

export class RoomManager {
  private rooms = new Map<string, Set<WebSocket>>()

  createRoom(roomName: string) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set())
    }
  }

  joinRoom(roomName: string, socket: WebSocket) {
    this.createRoom(roomName)
    this.rooms.get(roomName)!.add(socket)
  }

  leaveRoom(roomName: string, socket: WebSocket) {
    const room = this.rooms.get(roomName)
    if (!room) return
    room.delete(socket)
    if (room.size === 0) {
      this.rooms.delete(roomName)
    }
  }

  broadcast(roomName: string, message: unknown) {
    const room = this.rooms.get(roomName)
    if (!room) return
    const payload = JSON.stringify(message)
    for (const client of room) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload)
      }
    }
  }

  removeSocketFromAll(socket: WebSocket) {
    for (const [roomName, clients] of this.rooms.entries()) {
      if (clients.delete(socket) && clients.size === 0) {
        this.rooms.delete(roomName)
      }
    }
  }

  listRooms() {
    return Array.from(this.rooms.keys())
  }
}


