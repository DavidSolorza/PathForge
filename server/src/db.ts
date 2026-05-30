import mongoose from 'mongoose'
import { config } from './config'
import { initDb } from './initDb'

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri)
    console.log('[DB] Conectado a MongoDB Atlas (pathforge)')
    await initDb()
  } catch (error) {
    console.error('[DB] Error de conexion:', error)
    process.exit(1)
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] Desconectado de MongoDB')
  })

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Error en conexion:', err)
  })
}
