import type { WebSocket } from 'ws'
import type { ClientMessage, ServerMessage } from '../types/message'
import { RoomManager } from './rooms'

export function handleClientMessage(socket: WebSocket, msg: ClientMessage, rooms: RoomManager) {
  if (!msg || typeof msg.action !== 'string') {
    socket.send(JSON.stringify({ type: 'error', info: 'Missing action' } as ServerMessage))
    return
  }

  switch (msg.action) {
    case 'create_room':
      if (!msg.room) {
        socket.send(JSON.stringify({ type: 'error', info: 'Room name required' } as ServerMessage))
        return
      }
      rooms.createRoom(msg.room)
      socket.send(JSON.stringify({ type: 'system', info: `Room '${msg.room}' created` } as ServerMessage))
      break

    case 'join_room':
      if (!msg.room) {
        socket.send(JSON.stringify({ type: 'error', info: 'Room name required' } as ServerMessage))
        return
      }
      rooms.joinRoom(msg.room, socket)
      rooms.broadcast(msg.room, {
        type: 'system',
        room: msg.room,
        info: `${msg.from ?? 'Anonymous'} joined ${msg.room}`,
      } as ServerMessage)
      break

    case 'leave_room':
      if (!msg.room) {
        socket.send(JSON.stringify({ type: 'error', info: 'Room name required' } as ServerMessage))
        return
      }
      rooms.leaveRoom(msg.room, socket)
      rooms.broadcast(msg.room, {
        type: 'system',
        room: msg.room,
        info: `${msg.from ?? 'Anonymous'} left ${msg.room}`,
      } as ServerMessage)
      break

    case 'chat':
      if (!msg.room || !msg.text) {
        socket.send(JSON.stringify({ type: 'error', info: 'Room and text required' } as ServerMessage))
        return
      }
      rooms.broadcast(msg.room, {
        type: 'chat',
        room: msg.room,
        from: msg.from ?? 'Anonymous',
        text: msg.text,
      } as ServerMessage)
      break

    default:
      socket.send(JSON.stringify({ type: 'error', info: `Unknown action ${msg.action}` } as ServerMessage))
  }
}
