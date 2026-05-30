import { UserRepository } from '@shared/services/UserRepository'
import type { AuthResponse, User } from '@shared/types'

export const AuthService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 400))
    const user = await UserRepository.login(email, password)
    if (!user) throw new Error('Credenciales invalidas')
    return { user, token: 'tok_' + Date.now(), refreshToken: 'ref_' + Date.now() }
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 400))
    const existing = await UserRepository.findByEmail(email)
    if (existing) throw new Error('El correo ya esta registrado')
    const user = await UserRepository.register(name, email, password)
    return { user, token: 'tok_' + Date.now(), refreshToken: 'ref_' + Date.now() }
  },

  async seedDemoUser(): Promise<User> {
    return await UserRepository.seedDemoUser()
  },

  async logout(): Promise<void> { return },
}
