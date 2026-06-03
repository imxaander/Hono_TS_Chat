import http from 'http'
import { Hono } from 'hono'
import { WebSocketServer, type WebSocket } from 'ws'
import { RoomManager } from './ws/rooms'
import { handleClientMessage } from './ws/messages'
import { serveStatic } from '@hono/node-server/serve-static'


const app = new Hono()
const rooms = new RoomManager()
const wss = new WebSocketServer({ noServer: true })
const port = 3000

app.get('/', (c) => c.text('WebSocket chat server is running'))
app.get('/rooms', (c) => c.json({ rooms: rooms.listRooms() }))
app.use('/demo', serveStatic({ path: './src/public/index.html' }))
app.use('/demo.js', serveStatic({ path: './src/public/demo.js' }))

wss.on('connection', (socket: WebSocket) => {
  socket.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString())
      handleClientMessage(socket, parsed, rooms)
    } catch (error) {
      socket.send(JSON.stringify({ type: 'error', info: 'Invalid JSON' }))
    }
  })

  socket.on('close', () => {
    rooms.removeSocketFromAll(socket)
  })
})

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '', `http://${req.headers.host}`)
    const request = new Request(url.toString(), {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
    })

    const response = await app.fetch(request)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    const buffer = Buffer.from(await response.arrayBuffer())
    res.end(buffer)
  } catch (error) {
    res.statusCode = 500
    res.end('Server error')
  }
})

server.on('upgrade', (req, socket, head) => {
  const pathname = new URL(req.url || '', `http://${req.headers.host}`).pathname
  if (pathname === '/ws' || pathname === '/wss') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req)
    })
  } else {
    socket.destroy()
  }
})

server.listen(port, () => {
  console.log(`[SERVER]: Started on port: ${port}`)
  console.log(`[SERVER]: WebSocket endpoint is ws://localhost:${port}/ws or ws://localhost:${port}/wss`)
})