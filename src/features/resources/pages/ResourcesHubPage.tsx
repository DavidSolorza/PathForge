import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search, ExternalLink, GraduationCap, BookText, Video, Code2, Newspaper, Sparkles, X, Filter, BookMarked, Library, Heart } from 'lucide-react'
import { curatedResources } from '@features/learning-path/data/curatedResources'
import { CATEGORIES } from '@shared/types'
import type { CuratedResource } from '@shared/types'
import { cn } from '@shared/lib/utils'
import { Badge } from '@shared/components/ui/Badge'
import { EmptyState } from '@shared/components/ui/EmptyState'

const BOOKMARKS_KEY = 'pathforge_resource_bookmarks'

function getBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveBookmarks(ids: Set<string>) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...ids]))
}

const typeIcons: Record<string, typeof BookOpen> = {
  course: GraduationCap,
  book: BookText,
  documentation: BookOpen,
  practice: Code2,
  video: Video,
  article: Newspaper,
}

const typeLabels: Record<string, string> = {
  course: 'Curso',
  book: 'Libro',
  documentation: 'Doc',
  practice: 'Practica',
  video: 'Video',
  article: 'Articulo',
}

const typeColors: Record<string, string> = {
  course: 'bg-blue-50 text-blue-700 border-blue-200',
  book: 'bg-purple-50 text-purple-700 border-purple-200',
  documentation: 'bg-teal-50 text-teal-700 border-teal-200',
  practice: 'bg-orange-50 text-orange-700 border-orange-200',
  video: 'bg-rose-50 text-rose-700 border-rose-200',
  article: 'bg-cyan-50 text-cyan-700 border-cyan-200',
}

function ResourceCard({ resource, bookmarked, onToggleBookmark }: { resource: CuratedResource; bookmarked: boolean; onToggleBookmark: (id: string) => void }) {
  const Icon = typeIcons[resource.type] || BookOpen
  const cat = CATEGORIES.find((c) => c.value === resource.category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { type: 'spring' as const, stiffness: 400, damping: 20 } }}
      className="group relative block rounded-xl border border-neutral-200/80 bg-white p-4 sm:p-5 no-underline transition-all duration-200 hover:shadow-lg hover:border-gold/30 hover:shadow-gold/5 overflow-hidden"
    >
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block no-underline">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-50/50 text-primary-600 flex-shrink-0 shadow-xs group-hover:from-gold/10 group-hover:to-gold/5 group-hover:text-gold-dark transition-all duration-200">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {resource.free && (
              <span className="inline-flex items-center gap-1 rounded-full border border-green-200/60 bg-green-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-700">
                <Sparkles className="h-2.5 w-2.5" />
                Gratis
              </span>
            )}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:bg-gold/10">
              <ExternalLink className="h-3.5 w-3.5 text-gold-dark" />
            </div>
          </div>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-neutral-900 group-hover:text-gold-dark transition-colors duration-200 line-clamp-2">{resource.title}</h3>
        <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed line-clamp-2">{resource.description}</p>
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1 sm:gap-1.5">
          <span className={cn('inline-flex items-center rounded-md border px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium', typeColors[resource.type] || 'bg-neutral-100 text-neutral-600 border-neutral-200')}>
            {typeLabels[resource.type]}
          </span>
          {cat && (
            <span className="inline-flex items-center rounded-md border border-primary-200/60 bg-primary-50 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-primary-700">
              {cat.label}
            </span>
          )}
          <span className={cn(
            'inline-flex items-center rounded-md border px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium',
            resource.difficulty === 'beginner' ? 'bg-green-50 text-green-700 border-green-200' :
            resource.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-red-50 text-red-700 border-red-200'
          )}>
            {resource.difficulty === 'beginner' ? 'Principiante' : resource.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
          </span>
          {resource.author && (
            <span className="text-[9px] sm:text-[10px] text-neutral-400 ml-0.5 truncate max-w-[100px] sm:max-w-[120px]">
              por <span className="text-gold-dark font-medium">{resource.author}</span>
            </span>
          )}
        </div>
      </a>
      <button
        onClick={(e) => { e.preventDefault(); onToggleBookmark(resource.id) }}
        className={cn(
          'absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 active:scale-90',
          bookmarked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-neutral-300 bg-white/80 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100'
        )}
      >
        <Heart className={cn('h-3.5 w-3.5', bookmarked && 'fill-red-500')} />
      </button>
    </motion.div>
  )
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos', icon: Library },
  ...CATEGORIES.map((c) => ({ value: c.value, label: c.label, icon: BookMarked })),
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos', icon: Filter },
  { value: 'course', label: 'Cursos', icon: GraduationCap },
  { value: 'book', label: 'Libros', icon: BookText },
  { value: 'documentation', label: 'Documentacion', icon: BookOpen },
  { value: 'practice', label: 'Practica', icon: Code2 },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'article', label: 'Articulos', icon: Newspaper },
]

export function ResourcesHubPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [type, setType] = useState('all')
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(getBookmarks())
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  useEffect(() => { saveBookmarks(bookmarkedIds) }, [bookmarkedIds])

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    return curatedResources.filter((r) => {
      if (category !== 'all' && r.category !== category) return false
      if (type !== 'all' && r.type !== type) return false
      if (onlyFavorites && !bookmarkedIds.has(r.id)) return false
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch = r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || (r.author?.toLowerCase().includes(q))
        if (!matchesSearch) return false
      }
      return true
    })
  }, [search, category, type, onlyFavorites, bookmarkedIds])

  const freeCount = useMemo(() => filtered.filter((r) => r.free).length, [filtered])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary-700 via-primary-600 to-gold bg-clip-text text-transparent">
            Recursos de aprendizaje
          </h1>
          <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/5 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium text-gold-dark">
            {curatedResources.length} recursos
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1 sm:mt-1.5 ml-0.5">
          Recursos gratuitos y de pago curados para tu aprendizaje autodidacta
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo, descripcion o autor..."
            className="w-full rounded-xl border border-neutral-200/80 bg-white py-2.5 sm:py-3 pl-9 sm:pl-10 pr-9 sm:pr-10 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15 transition-all duration-200 shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider sm:mr-1">Categoria</span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {FILTER_OPTIONS.map((f) => {
              const FIcon = f.icon
              return (
                <button
                  key={f.value}
                  onClick={() => { setCategory(f.value); setOnlyFavorites(false) }}
                  className={cn(
                    'inline-flex items-center gap-1 sm:gap-1.5 rounded-xl px-2.5 sm:px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                    category === f.value && !onlyFavorites
                      ? 'bg-gold text-white shadow-xs border border-gold-dark'
                      : 'bg-white text-neutral-600 border border-neutral-200/80 hover:border-gold/30 hover:text-gold-dark hover:bg-gold/5',
                  )}
                >
                  <FIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">{f.label}</span>
                  <span className="sm:hidden">{f.label.substring(0, 3)}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => { setOnlyFavorites((prev) => !prev); if (onlyFavorites) setCategory('all') }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border',
              onlyFavorites
                ? 'bg-red-50 text-red-600 border-red-200 shadow-xs'
                : 'bg-white text-neutral-600 border-neutral-200/80 hover:border-red-200 hover:text-red-500 hover:bg-red-50/50',
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', onlyFavorites && 'fill-red-500')} />
            Favoritos ({bookmarkedIds.size})
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mr-1">Tipo</span>
        <div className="flex flex-wrap gap-1.5">
          {TYPE_OPTIONS.map((f) => {
            const TIcon = f.icon
            return (
              <button
                key={f.value}
                onClick={() => setType(f.value)}
                className={cn(
                  'inline-flex items-center gap-1 sm:gap-1.5 rounded-xl px-2.5 sm:px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                  type === f.value
                    ? 'bg-primary-600 text-white shadow-xs border border-primary-700'
                    : 'bg-white text-neutral-600 border border-neutral-200/80 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/50',
                )}
              >
                <TIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{f.label}</span>
                <span className="sm:hidden">{f.label.substring(0, 4)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <EmptyState
            icon={
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <BookOpen className="h-10 w-10" />
              </motion.div>
            }
            title="Sin resultados"
            description={search ? 'Intenta con otros terminos de busqueda' : 'No hay recursos para esta categoria'}
          />
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            {filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} bookmarked={bookmarkedIds.has(r.id)} onToggleBookmark={toggleBookmark} />
            ))}
          </motion.div>

          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-neutral-400">
            <span>{filtered.length} recursos</span>
            <span className="text-neutral-300">|</span>
            <span className="text-green-600">{freeCount} gratuitos</span>
            <span className="text-neutral-300">|</span>
            <span>{filtered.length - freeCount} de pago</span>
          </div>
        </>
      )}
    </motion.div>
  )
}
