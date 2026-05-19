import { z } from 'zod'

export const createPathSchema = z.object({
  goal: z.string().min(1, 'Selecciona un objetivo'),
})

export type CreatePathInput = z.infer<typeof createPathSchema>
