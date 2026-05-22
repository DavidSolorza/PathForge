import { LocalStorageService } from '@shared/services/LocalStorageService'
import { UserRepository } from '@shared/services/repositories/UserRepository'
import type { AuthResponse, User } from '@shared/types'

interface AuthUser {
  email: string
  password: string
  user: User
}

const AUTH_KEY = 'auth_users'

export const AuthService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 400))
    const user = UserRepository.login(email, password)
    if (!user) throw new Error('Credenciales invalidas')
    return { user, token: 'tok_' + Date.now(), refreshToken: 'ref_' + Date.now() }
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 400))
    const existing = UserRepository.findByEmail(email)
    if (existing) throw new Error('El correo ya esta registrado')
    const user = UserRepository.register(name, email, password)
    return { user, token: 'tok_' + Date.now(), refreshToken: 'ref_' + Date.now() }
  },

  seedDemoUser(): User {
    return UserRepository.seedDemoUser()
  },

  async logout(): Promise<void> { return },
}
