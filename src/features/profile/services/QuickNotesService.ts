import type { QuickNote } from '@shared/types'

const STORAGE_KEY = 'pathforge_quick_notes'

function load(): QuickNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(notes: QuickNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export const QuickNotesService = {
  getAll(): QuickNote[] {
    return load().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  create(content: string): QuickNote {
    const notes = load()
    const newNote: QuickNote = {
      id: 'note_' + Date.now(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    notes.push(newNote)
    save(notes)
    return newNote
  },

  update(id: string, content: string): QuickNote | undefined {
    const notes = load()
    const note = notes.find(n => n.id === id)
    if (!note) return undefined

    note.content = content.trim()
    note.updatedAt = new Date().toISOString()
    save(notes)
    return note
  },

  remove(id: string): boolean {
    const notes = load()
    const filtered = notes.filter(n => n.id !== id)
    if (filtered.length === notes.length) return false

    save(filtered)
    return true
  },

  search(query: string): QuickNote[] {
    const q = query.toLowerCase()
    return this.getAll().filter(note =>
      note.content.toLowerCase().includes(q)
    )
  }
}
