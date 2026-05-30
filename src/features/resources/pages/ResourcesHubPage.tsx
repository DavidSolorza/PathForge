import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search, ExternalLink, GraduationCap, BookText, Video, Code2, Newspaper, Wrench } from 'lucide-react'
import { curatedResources } from '@features/learning-path/data/curatedResources'
import { CATEGORIES } from '@shared/types'
import type { CuratedResource } from '@shared/types'
import { cn } from '@shared/lib/utils'
import { Button } from '@shared/components/ui/Button'
import { Badge } from '@shared/components/ui/Badge'
import { EmptyState } from '@shared/components/ui/EmptyState'

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
  documentation: 'Documentacion',
  practice: 'Practica',
  video: 'Video',
  article: 'Articulo',
}

function ResourceCard({ resource }: { resource: CuratedResource }) {
  const Icon = typeIcons[resource.type] || BookOpen
  const cat = CATEGORIES.find((c) => c.value === resource.category)

  return (
    <motion.a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group block rounded-xl border border-neutral-200 bg-white p-5 no-underline transition-all duration-200 hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {resource.free && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Gratis</span>
          )}
          <ExternalLink className="h-3.5 w-3.5 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">{resource.title}</h3>
      <p className="mt-1 text-xs text-neutral-500 leading-relaxed line-clamp-2">{resource.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="default" size="sm">{typeLabels[resource.type]}</Badge>
        {cat && <Badge variant="primary" size="sm">{cat.label}</Badge>}
        <Badge variant={resource.difficulty === 'beginner' ? 'default' : resource.difficulty === 'intermediate' ? 'warning' : 'primary'} size="sm">
          {resource.difficulty === 'beginner' ? 'Principiante' : resource.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
        </Badge>
        {resource.author && (
          <span className="text-[10px] text-neutral-400 ml-1">por {resource.author}</span>
        )}
      </div>
    </motion.a>
  )
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
]

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'course', label: 'Cursos' },
  { value: 'book', label: 'Libros' },
  { value: 'documentation', label: 'Documentacion' },
  { value: 'practice', label: 'Practica' },
  { value: 'video', label: 'Videos' },
  { value: 'article', label: 'Articulos' },
]

export function ResourcesHubPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [type, setType] = useState('all')

  const filtered = useMemo(() => {
    return curatedResources.filter((r) => {
      if (category !== 'all' && r.category !== category) return false
      if (type !== 'all' && r.type !== type) return false
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch = r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || (r.author?.toLowerCase().includes(q))
        if (!matchesSearch) return false
      }
      return true
    })
  }, [search, category, type])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Recursos de aprendizaje</h1>
        <p className="text-sm text-neutral-500 mt-1">Recursos gratuitos y de pago curados para tu aprendizaje autodidacta</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar recursos..."
            className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCategory(f.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                category === f.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TYPE_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={() => setType(f.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              type === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="Sin resultados"
          description={search ? 'Intenta con otros terminos de busqueda' : 'No hay recursos para esta categoria'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-400 text-center pt-4">{filtered.length} recursos encontrados</p>
    </div>
  )
}
