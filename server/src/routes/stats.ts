import { Router, Response } from 'express'
import { StatsModel } from '../models/Stats'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await StatsModel.findOne({ userId: req.userId }).lean()
    if (!stats) {
      res.json({ totalPaths: 0, completedTopics: 0, totalProgress: 0, streak: 0, favoriteCategory: '', activeDays: 0 })
      return
    }
    res.json({
      totalPaths: stats.totalPaths,
      completedTopics: stats.completedTopics,
      totalProgress: stats.totalProgress,
      streak: stats.streak,
      favoriteCategory: stats.favoriteCategory,
      activeDays: stats.activeDays,
    })
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await StatsModel.findOneAndUpdate(
      { userId: req.userId },
      { $set: req.body },
      { upsert: true, new: true },
    ).lean()
    res.json({
      totalPaths: stats.totalPaths,
      completedTopics: stats.completedTopics,
      totalProgress: stats.totalProgress,
      streak: stats.streak,
      favoriteCategory: stats.favoriteCategory,
      activeDays: stats.activeDays,
    })
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
