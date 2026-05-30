import { Router, Response } from 'express'
import { ProjectModel } from '../models/Project'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await ProjectModel.find({ userId: req.userId }).sort({ createdAt: -1 }).lean()
    res.json(projects.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      technologies: p.technologies,
      status: p.status,
      repoUrl: p.repoUrl,
      demoUrl: p.demoUrl,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })))
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const project = await ProjectModel.create({ ...req.body, userId: req.userId })
    res.status(201).json({ id: project._id.toString() })
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const updated = await ProjectModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true },
    )
    if (!updated) { res.status(404).json({ error: 'Proyecto no encontrado' }); return }
    res.json({ id: updated._id.toString() })
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await ProjectModel.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
