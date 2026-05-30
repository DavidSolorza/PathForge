import { Router, Response } from 'express'
import { ActivityModel } from '../models/Activity'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const activities = await ActivityModel.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean()

    res.json(activities.map((a) => ({
      id: a._id.toString(),
      type: a.type,
      title: a.title,
      pathName: a.pathName,
      timestamp: a.timestamp.toISOString(),
    })))
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const activity = await ActivityModel.create({ ...req.body, userId: req.userId })
    res.status(201).json({ id: activity._id.toString() })
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
