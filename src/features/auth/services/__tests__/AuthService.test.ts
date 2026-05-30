import { describe, it, expect, beforeEach } from 'vitest'
import { AuthService } from '@features/auth/services'
import { LocalStorageService } from '@shared/services/LocalStorageService'

describe('AuthService', () => {
  beforeEach(() => {
    LocalStorageService.clear()
  })

  describe('register', () => {
    it('registers a new user and returns AuthResponse', async () => {
      const res = await AuthService.register('Ana', 'ana@test.com', '123456')
      expect(res.user.name).toBe('Ana')
      expect(res.user.email).toBe('ana@test.com')
      expect(res.token).toMatch(/^tok_/)
      expect(res.refreshToken).toMatch(/^ref_/)
    })

    it('rejects duplicate email', async () => {
      await AuthService.register('Ana', 'dup@test.com', '123456')
      await expect(AuthService.register('Otro', 'dup@test.com', '123456')).rejects.toThrow(
        'El correo ya esta registrado',
      )
    })
  })

  describe('login', () => {
    it('logs in with correct credentials', async () => {
      await AuthService.register('Bob', 'bob@test.com', 'pass123')
      const res = await AuthService.login('bob@test.com', 'pass123')
      expect(res.user.email).toBe('bob@test.com')
    })

    it('rejects wrong password', async () => {
      await AuthService.register('Bob', 'bob@test.com', 'pass123')
      await expect(AuthService.login('bob@test.com', 'wrong')).rejects.toThrow('Credenciales invalidas')
    })

    it('rejects unregistered email', async () => {
      await expect(AuthService.login('no@exists.com', '123')).rejects.toThrow('Credenciales invalidas')
    })
  })

  describe('seedDemoUser', () => {
    it('seeds demo user', async () => {
      const user = await AuthService.seedDemoUser()
      expect(user.email).toBe('demo@pathforge.ai')
      expect(user.name).toBe('Usuario Demo')
    })
  })
})
