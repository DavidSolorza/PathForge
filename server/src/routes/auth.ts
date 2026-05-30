import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { UserModel } from '../models/User'
import { StatsModel } from '../models/Stats'
import { config } from '../config'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

function generateToken(userId: string): string {
  const opts: SignOptions = { expiresIn: config.jwtExpiresIn as any }
  return jwt.sign({ userId }, config.jwtSecret, opts)
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password y nombre son requeridos' })
      return
    }

    const existing = await UserModel.findOne({ email })
    if (existing) {
      res.status(409).json({ error: 'El email ya esta registrado' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await UserModel.create({ email, password: hashedPassword, name })
    await StatsModel.create({ userId: user._id.toString() })

    const token = generateToken(user._id.toString())
    const refreshToken = generateToken(user._id.toString()) // simplified

    res.status(201).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        favoriteCategories: [],
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      token,
      refreshToken,
    })
  } catch (error) {
    console.error('[AUTH] Register error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email y password son requeridos' })
      return
    }

    const user = await UserModel.findOne({ email })
    if (!user) {
      res.status(401).json({ error: 'Credenciales invalidas' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ error: 'Credenciales invalidas' })
      return
    }

    const token = generateToken(user._id.toString())
    const refreshToken = generateToken(user._id.toString())

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        favoriteCategories: user.favoriteCategories,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      token,
      refreshToken,
    })
  } catch (error) {
    console.error('[AUTH] Login error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.userId)
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }

    res.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      favoriteCategories: user.favoriteCategories,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[AUTH] Me error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
