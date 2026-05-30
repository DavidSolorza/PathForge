import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { config } from './config'
import { connectDB } from './db'
import authRoutes from './routes/auth'
import pathRoutes from './routes/paths'
import projectRoutes from './routes/projects'
import chatRoutes from './routes/chat'
import activityRoutes from './routes/activity'
import statsRoutes from './routes/stats'

const app = express()
const httpServer = createServer(app)

const io = new SocketServer(httpServer, {
  cors: { origin: config.corsOrigin, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
})

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/paths', pathRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/stats', statsRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Socket.io — notify on data changes for real-time sync
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string
  if (userId) {
    socket.join(`user:${userId}`)
  }

  socket.on('disconnect', () => {
    // cleanup handled by socket.io
  })
})

export function notifyUser(userId: string, event: string, data: unknown): void {
  io.to(`user:${userId}`).emit(event, data)
}

async function start() {
  await connectDB()

  httpServer.listen(config.port, () => {
    console.log(`[Server] PathForge API corriendo en http://localhost:${config.port}`)
    console.log(`[Server] WebSocket habilitado para sync en tiempo real`)
  })
}

start().catch((err) => {
  console.error('[Server] Error al iniciar:', err)
  process.exit(1)
})
