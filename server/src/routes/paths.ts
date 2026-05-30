import { Router, Response } from 'express'
import { LearningPathModel } from '../models/LearningPath'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

// GET /api/paths
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const paths = await LearningPathModel.find({ userId: req.userId }).sort({ createdAt: -1 }).lean()
    const mapped = paths.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      goal: p.goal,
      category: p.category,
      difficulty: p.difficulty,
      progress: p.progress,
      stages: p.stages.map((s: any) => ({
        id: s._id.toString(),
        name: s.name,
        description: s.description,
        order: s.order,
        status: s.status,
        topics: s.topics.map((t: any) => ({
          id: t._id.toString(),
          name: t.name,
          content: t.content,
          difficulty: t.difficulty,
          completed: t.completed,
          completedAt: t.completedAt?.toISOString(),
          resources: t.resources.map((r: any) => ({
            id: r._id.toString(),
            title: r.title,
            type: r.type,
            url: r.url,
          })),
        })),
      })),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
    res.json(mapped)
  } catch (error) {
    console.error('[PATHS] Get all error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// POST /api/paths
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const path = await LearningPathModel.create({ ...req.body, userId: req.userId })
    res.status(201).json({ id: path._id.toString() })
  } catch (error) {
    console.error('[PATHS] Create error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// PUT /api/paths/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const updated = await LearningPathModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true },
    )
    if (!updated) {
      res.status(404).json({ error: 'Ruta no encontrada' })
      return
    }
    res.json({ id: updated._id.toString() })
  } catch (error) {
    console.error('[PATHS] Update error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// DELETE /api/paths/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await LearningPathModel.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!deleted) {
      res.status(404).json({ error: 'Ruta no encontrada' })
      return
    }
    res.json({ success: true })
  } catch (error) {
    console.error('[PATHS] Delete error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
