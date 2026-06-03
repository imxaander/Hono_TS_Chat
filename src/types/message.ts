export type ClientAction = 'create_room' | 'join_room' | 'leave_room' | 'chat'

export interface ClientMessage {
  action: ClientAction
  room?: string
  from?: string
  text?: string
}

export type ServerMessageType = 'system' | 'chat' | 'error'

export interface ServerMessage {
  type: ServerMessageType
  room?: string
  from?: string
  text?: string
  info?: string
}