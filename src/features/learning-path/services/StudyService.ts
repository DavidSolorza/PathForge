import type { StudySession, LearningGoal, UserStats } from '@shared/types'

const STORAGE_KEY = 'pathforge_study'
const GOALS_KEY = 'pathforge_goals'

interface StudyData {
  sessions: StudySession[]
  lastCheckIn: string | null
}

function load(): StudyData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { sessions: [], lastCheckIn: null }
  } catch {
    return { sessions: [], lastCheckIn: null }
  }
}

function save(data: StudyData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const StudyService = {
  checkIn(topicsStudied: string[] = []) {
    const data = load()
    const today = new Date().toISOString().split('T')[0]
    const existing = data.sessions.find((s) => s.date === today)
    if (existing) {
      existing.duration += 25
      existing.topicsStudied = [...new Set([...existing.topicsStudied, ...topicsStudied])]
    } else {
      data.sessions.push({ date: today, duration: 25, topicsStudied })
    }
    data.lastCheckIn = today
    save(data)
  },

  getSessions(): StudySession[] {
    return load().sessions
  },

  getStreak(): number {
    try {
      const sessions = load().sessions
      if (!Array.isArray(sessions) || sessions.length === 0) return 0
      const dates = [...new Set(sessions.map((s) => s.date))].filter(Boolean).sort().reverse()
      let streak = 0
      const today = new Date()
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date(today)
        expected.setDate(expected.getDate() - i)
        const expectedStr = expected.toISOString().split('T')[0]
        if (dates[i] === expectedStr) {
          streak++
        } else {
          break
        }
      }
      return streak
    } catch { return 0 }
  },

  getLongestStreak(): number {
    try {
      const sessions = load().sessions
      if (!Array.isArray(sessions) || sessions.length === 0) return 0
      const dates = [...new Set(sessions.map((s) => s.date))].filter(Boolean).sort()
      let longest = 1
      let current = 1
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1])
        const curr = new Date(dates[i])
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        if (diff === 1) {
          current++
          longest = Math.max(longest, current)
        } else {
          current = 1
        }
      }
      return longest
    } catch { return 0 }
  },

  getTodayMinutes(): number {
    const today = new Date().toISOString().split('T')[0]
    const session = load().sessions.find((s) => s.date === today)
    return session?.duration || 0
  },

  getWeekMinutes(): number {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const sessions = load().sessions.filter((s) => {
      const d = new Date(s.date)
      return d >= startOfWeek && d <= now
    })
    return sessions.reduce((sum, s) => sum + s.duration, 0)
  },

  getGoals(): LearningGoal[] {
    try {
      const raw = localStorage.getItem(GOALS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  setGoals(goals: LearningGoal[]) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  },

  updateGoalProgress() {
    const goals = this.getGoals()
    const weekStart = this.getWeekStart()
    const topicsDone = this.getSessions()
      .filter((s) => s.date >= weekStart)
      .reduce((sum, s) => sum + s.topicsStudied.length, 0)
    const sessionsDone = this.getSessions()
      .filter((s) => s.date >= weekStart)
      .length
    const updated = goals.map((g) => {
      if (g.weekStart !== weekStart) {
        return { ...g, current: 0, weekStart }
      }
      return {
        ...g,
        current: g.type === 'weekly_topics' ? topicsDone : g.type === 'weekly_sessions' ? sessionsDone : g.current,
      }
    })
    this.setGoals(updated)
    return updated
  },

  getTotalMinutes(): number {
    return load().sessions.reduce((sum, s) => sum + s.duration, 0)
  },

  getWeekStart(): string {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    return start.toISOString().split('T')[0]
  },

  async syncStats(stats: UserStats): Promise<UserStats> {
    const streak = this.getStreak()
    const activeDays = this.getSessions().length
    const longestStreak = this.getLongestStreak()
    return { ...stats, streak, activeDays, longestStreak }
  },
}
