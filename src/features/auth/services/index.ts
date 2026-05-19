import type { AuthResponse, User } from '@shared/types'
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

export const AuthService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 600))
    const users = getUsers()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) {
      throw new Error('Credenciales inválidas')
    }
    return {
      user: found.user,
      token: 'demo_token_' + Date.now(),
      refreshToken: 'demo_refresh_' + Date.now(),
    }
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    await new Promise((r) => setTimeout(r, 600))
    const users = getUsers()
    if (users.some((u) => u.email === email)) {
      throw new Error('El correo ya está registrado')
    }
    const newUser: User = {
      id: 'u' + Date.now(),
      email,
      name,
      avatar: '',
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push({ email, password, user: newUser })
    saveUsers(users)
    return {
      user: newUser,
      token: 'demo_token_' + Date.now(),
      refreshToken: 'demo_refresh_' + Date.now(),
    }
  },

  async getProfile(): Promise<User> {
    const token = localStorage.getItem(config.auth.tokenKey)
    if (!token) throw new Error('No autenticado')
    const users = getUsers()
    return users[0]?.user || users[users.length - 1]?.user
  },

  async logout(): Promise<void> {
    return
  },
}
