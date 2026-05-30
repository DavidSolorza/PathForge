import { Router, Response } from 'express'
import { ChatHistoryModel } from '../models/ChatHistory'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

// GET /api/chat/:mode — get chat history by mode
router.get('/:mode', async (req: AuthRequest, res: Response) => {
  try {
    const history = await ChatHistoryModel.findOne({
      userId: req.userId,
      mode: req.params.mode,
    }).lean()

    if (!history) {
      res.json({ messages: [] })
      return
    }

    res.json({
      messages: history.messages.map((m: any) => ({
        id: `msg_${m.timestamp?.getTime() || Date.now()}`,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp?.toISOString() || new Date().toISOString(),
      })),
    })
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// PUT /api/chat/:mode — replace all messages for that mode
router.put('/:mode', async (req: AuthRequest, res: Response) => {
  try {
    await ChatHistoryModel.findOneAndUpdate(
      { userId: req.userId, mode: req.params.mode },
      { $set: { messages: req.body.messages } },
      { upsert: true },
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
