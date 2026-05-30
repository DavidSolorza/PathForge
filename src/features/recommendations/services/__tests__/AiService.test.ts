import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AiService } from '@features/recommendations/services/AiService'
import { LocalStorageService } from '@shared/services/LocalStorageService'

describe('AiService', () => {
  beforeEach(() => {
    LocalStorageService.clear()
    vi.restoreAllMocks()
  })

  describe('generatePath', () => {
    it('creates a path for Python', async () => {
      const path = await AiService.generatePath('aprender python')
      expect(path.title).toBe('Python')
      expect(path.goal).toBe('aprender python')
      expect(path.category).toBe('tecnologia')
      expect(path.stages.length).toBeGreaterThan(0)
      expect(path.progress).toBe(0)
    })

    it('creates a path for JavaScript', async () => {
      const path = await AiService.generatePath('aprender javascript')
      expect(path.title).toBe('Javascript')
      expect(path.category).toBe('tecnologia')
    })

    it('generates dynamic title based on input', async () => {
      const path = await AiService.generatePath('quiero aprender react')
      expect(path.title).toBe('React')
    })

    it('extracts clean topic from non-standard input', async () => {
      const path = await AiService.generatePath('typescript avanzado')
      expect(path.title).toBe('Typescript avanzado')
    })
  })

  describe('verifyApiKey', () => {
    it('returns false on error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))
      const result = await AiService.verifyApiKey('fake-key')
      expect(result).toBe(false)
    })
  })

  describe('chat fallback (offline mode)', () => {
    it('returns Python fallback for python question', async () => {
      const msg = await AiService.chat('explicame python')
      expect(msg.role).toBe('assistant')
      expect(msg.content).toContain('Python')
      expect(msg.id).toMatch(/^msg_/)
    })

    it('greets on hello', async () => {
      const msg = await AiService.chat('hola')
      expect(msg.content).toContain('mentor')
    })

    it('thanks response', async () => {
      const msg = await AiService.chat('gracias')
      expect(msg.content).toContain('constancia')
    })

    it('returns generic fallback for unknown topic', async () => {
      const msg = await AiService.chat('explícame la teoría de cuerdas')
      expect(msg.content).toContain('Fundamentos')
      expect(msg.content).toContain('Plan de aprendizaje')
    })

    it('includes programming-specific fallback for docker', async () => {
      const msg = await AiService.chat('docker compose')
      expect(msg.content).toContain('Docker')
    })

    it('includes programming-specific fallback for SQL', async () => {
      const msg = await AiService.chat('sql queries')
      expect(msg.content).toContain('SQL')
    })
  })
})
