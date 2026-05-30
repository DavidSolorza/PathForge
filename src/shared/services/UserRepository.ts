import type { DbAdapter } from './DbAdapter'
import { LocalStorageAdapter } from './LocalStorageAdapter'
import type { User } from '@shared/types'

const AUTH_KEY = 'auth_users'
let _adapter: DbAdapter = LocalStorageAdapter

export function setUserRepositoryAdapter(adapter: DbAdapter): void {
  _adapter = adapter
}

interface AuthUser {
  email: string
  password: string
  user: User
}

export const UserRepository = {
  async getAll(): Promise<AuthUser[]> {
    return (await _adapter.get<AuthUser[]>(AUTH_KEY)) || []
  },

  async saveAll(users: AuthUser[]): Promise<void> {
    await _adapter.set(AUTH_KEY, users)
  },

  async findByEmail(email: string): Promise<AuthUser | undefined> {
    const all = await this.getAll()
    return all.find((u) => u.email === email)
  },

  async login(email: string, password: string): Promise<User | null> {
    const found = await this.findByEmail(email)
    if (!found || found.password !== password) return null
    return found.user
  },

  async register(name: string, email: string, password: string): Promise<User> {
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
    const users = await this.getAll()
    users.push(authUser)
    await this.saveAll(users)
    return newUser
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const users = await this.getAll()
    const idx = users.findIndex((u) => u.user.id === userId)
    if (idx === -1) return undefined
    users[idx].user = { ...users[idx].user, ...updates, updatedAt: new Date().toISOString() }
    await this.saveAll(users)
    return users[idx].user
  },

  async getUserById(userId: string): Promise<User | undefined> {
    const all = await this.getAll()
    return all.find((u) => u.user.id === userId)?.user
  },

  async seedDemoUser(): Promise<User> {
    const existing = await this.findByEmail('demo@pathforge.ai')
    if (existing) return existing.user
    return this.register('Usuario Demo', 'demo@pathforge.ai', '123456')
  },
}
