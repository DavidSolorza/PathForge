import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, Plus, Trash2, Search, X } from 'lucide-react'
import { QuickNotesService } from '@features/profile/services/QuickNotesService'
import type { QuickNote } from '@shared/types'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { cn } from '@shared/lib/utils'

export function QuickNotes() {
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setNotes(QuickNotesService.getAll())
  }, [])

  const handleCreate = () => {
    const newNote = QuickNotesService.create('')
    setNotes(QuickNotesService.getAll())
    setEditingId(newNote.id)
    setEditContent('')
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const handleSave = (id: string) => {
    if (editContent.trim()) {
      QuickNotesService.update(id, editContent)
    } else {
      QuickNotesService.remove(id)
    }
    setNotes(QuickNotesService.getAll())
    setEditingId(null)
    setEditContent('')
  }

  const handleDelete = (id: string) => {
    QuickNotesService.remove(id)
    setNotes(QuickNotesService.getAll())
    if (editingId === id) {
      setEditingId(null)
      setEditContent('')
    }
  }

  const handleEdit = (note: QuickNote) => {
    setEditingId(note.id)
    setEditContent(note.content)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  const filteredNotes = searchQuery
    ? QuickNotesService.search(searchQuery)
    : notes

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-dark">
            <StickyNote className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Notas Rápidas</h2>
            <p className="text-xs text-neutral-500">{notes.length} notas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showSearch ? 'bg-gold/10 text-gold-dark' : 'text-neutral-400 hover:bg-neutral-100'
            )}
          >
            <Search className="h-4 w-4" />
          </button>
          <Button size="sm" variant="outline" icon={<Plus className="h-4 w-4" />} onClick={handleCreate}>
            Nueva
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar notas..."
                className="w-full pl-9 pr-9 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-sm text-neutral-400">
            {searchQuery ? 'No se encontraron notas' : 'No tienes notas aún'}
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="group"
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      ref={textareaRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Escribe tu nota..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          handleSave(note.id)
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSave(note.id)}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setEditingId(null)
                        setEditContent('')
                      }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleEdit(note)}
                    className="p-3 rounded-lg border border-neutral-200 hover:border-gold/30 hover:bg-gold/5 cursor-pointer transition-all"
                  >
                    <p className="text-sm text-neutral-700 line-clamp-2 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-neutral-400">
                        {new Date(note.updatedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(note.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {notes.length > 0 && (
        <p className="text-[10px] text-neutral-400 mt-3 text-center">
          Ctrl+Enter para guardar
        </p>
      )}
    </Card>
  )
}
