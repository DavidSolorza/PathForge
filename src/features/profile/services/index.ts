import { LocalDB } from '@shared/lib/db'
import type { User, Skill, UserStats } from '@shared/types'
import { config } from '@core/config'

const AUTH_USERS_KEY = 'pathforge_users'

function getUsers(): Array<{ email: string; password: string; user: User }> {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveUsers(users: Array<{ email: string; password: string; user: User }>) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users))
}

export const UserService = {
  async getProfile(): Promise<User> {
    await new Promise((r) => setTimeout(r, 200))
    const token = localStorage.getItem(config.auth.tokenKey)
    if (!token) {
      const users = getUsers()
      return users[0]?.user || {
        id: 'u1',
        email: 'demo@pathforge.ai',
        name: 'Carlos Martínez',
        avatar: '',
        bio: 'Desarrollador full-stack en formación',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    const users = getUsers()
    return users[users.length - 1]?.user || users[0]?.user
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    await new Promise((r) => setTimeout(r, 200))
    const users = getUsers()
    if (users.length > 0) {
      const idx = users.length - 1
      users[idx].user = { ...users[idx].user, ...updates, updatedAt: new Date().toISOString() }
      saveUsers(users)
      return users[idx].user
    }
    throw new Error('No user found')
  },

  async getSkills(): Promise<Skill[]> {
    await new Promise((r) => setTimeout(r, 200))
    return LocalDB.getSkills()
  },

  async updateSkill(skillId: string, updates: Partial<Skill>): Promise<void> {
    await new Promise((r) => setTimeout(r, 100))
    LocalDB.updateSkill(skillId, updates)
  },

  async getStats(): Promise<UserStats> {
    await new Promise((r) => setTimeout(r, 200))
    return LocalDB.refreshStats()
  },
}
