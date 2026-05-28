import { LocalStorageService } from './LocalStorageService'
import type { User } from '@shared/types'

const AUTH_KEY = 'auth_users'

interface AuthUser {
  email: string
  password: string
  user: User
}

export const UserRepository = {
  getAll(): AuthUser[] {
    return LocalStorageService.get<AuthUser[]>(AUTH_KEY) || []
  },

  saveAll(users: AuthUser[]): void {
    LocalStorageService.set(AUTH_KEY, users)
  },

  findByEmail(email: string): AuthUser | undefined {
    return this.getAll().find((u) => u.email === email)
  },

  login(email: string, password: string): User | null {
    const found = this.findByEmail(email)
    if (!found || found.password !== password) return null
    return found.user
  },

  register(name: string, email: string, password: string): User {
    const now = new Date().toISOString()
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      avatar: '',
      bio: '',
      favoriteCategories: [],
      createdAt: now,
      updatedAt: now,
    }
    const authUser: AuthUser = { email, password, user: newUser }
    const users = this.getAll()
    users.push(authUser)
    this.saveAll(users)
    return newUser
  },

  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const users = this.getAll()
    const idx = users.findIndex((u) => u.user.id === userId)
    if (idx === -1) return undefined
    users[idx].user = { ...users[idx].user, ...updates, updatedAt: new Date().toISOString() }
    this.saveAll(users)
    return users[idx].user
  },

  getUserById(userId: string): User | undefined {
    return this.getAll().find((u) => u.user.id === userId)?.user
  },

  seedDemoUser(): User {
    const existing = this.findByEmail('demo@pathforge.ai')
    if (existing) return existing.user
    return this.register('Usuario Demo', 'demo@pathforge.ai', '123456')
  },
}
