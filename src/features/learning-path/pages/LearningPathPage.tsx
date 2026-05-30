import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
  Trash2,
  Plus,
  Bot,
  StickyNote,
  ArrowRight,
  Target,
  Zap,
  ExternalLink,
  Library,
  Search,
} from 'lucide-react'
import { usePathStore } from '@core/store'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { ReviewService } from '@features/learning-path/services/ReviewService'
import { AiService } from '@features/recommendations/services/AiService'
import { CATEGORIES } from '@shared/types'
import type { Topic } from '@shared/types'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Progress } from '@shared/components/ui/Progress'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { MessageContent } from '@shared/components/common/MessageContent'
import { getRelatedResources } from '@shared/lib/topicResources'
import { useToastStore } from '@shared/store/toastStore'
import { cn } from '@shared/lib/utils'

function TopicItem({
  topic,
  pathId,
  stageId,
  onToggle,
}: {
  topic: Topic
  pathId: string
  stageId: string
  onToggle: (pathId: string, stageId: string, topicId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(topic.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const realResources = topic.resources.filter((r) => r.url && r.url !== '#')
  const relatedResources = getRelatedResources(topic.name, 3)

  const expandedByContent = topic.content || realResources.length > 0 || topic.completed

  const saveNotes = async (value: string) => {
    setSavingNotes(true)
    const path = await PathStorageService.getById(pathId)
    if (!path) return
    for (const stage of path.stages) {
      if (stage.id !== stageId) continue
      const t = stage.topics.find((t) => t.id === topic.id)
      if (t) t.notes = value
      break
    }
    await PathStorageService.update(pathId, path)
    setSavingNotes(false)
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveNotes(value), 800)
  }

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border transition-all duration-200 shadow-xs',
        topic.completed
          ? 'border-green-200/60 bg-gradient-to-r from-green-50/50 to-green-50/30'
          : 'border-neutral-200/70 bg-white hover:border-neutral-300/70 hover:shadow-sm'
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
        <button
          onClick={() => onToggle(pathId, stageId, topic.id)}
          className="flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-90"
        >
          {topic.completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 drop-shadow-xs" />
          ) : (
            <Circle className="h-5 w-5 text-neutral-300 hover:text-gold transition-colors duration-200" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <span className={cn('text-xs sm:text-sm font-medium transition-all', topic.completed ? 'text-green-700 line-through' : 'text-neutral-800')}>
            {topic.name}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {topic.notes && <StickyNote className="h-3.5 w-3.5 text-gold" />}
          <Badge variant={topic.difficulty === 'easy' ? 'default' : topic.difficulty === 'medium' ? 'warning' : 'primary'} size="sm">
            <span className="hidden sm:inline">{topic.difficulty === 'easy' ? 'Facil' : topic.difficulty === 'medium' ? 'Media' : 'Dificil'}</span>
            <span className="sm:hidden">{topic.difficulty === 'easy' ? 'F' : topic.difficulty === 'medium' ? 'M' : 'D'}</span>
          </Badge>
          {expandedByContent && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-neutral-400 hover:text-gold transition-colors duration-200"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100/80 px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5 sm:space-y-3">
              {topic.content && (
                <div className="bg-white rounded-lg border border-neutral-100/80 p-2.5 sm:p-3.5 overflow-x-auto">
                  <MessageContent content={topic.content} role="assistant" />
                </div>
              )}
              {relatedResources.length > 0 && (
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-1.5">
                    <Library className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gold" />
                    Documentacion relacionada
                  </p>
                  <div className="space-y-1 sm:space-y-1.5">
                    {relatedResources.map((r) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary-600 hover:text-gold-dark transition-colors no-underline rounded-lg border border-transparent hover:border-gold/20 hover:bg-gold/[0.02] px-1.5 sm:px-2 py-1 sm:py-1.5 -mx-1.5 sm:-mx-2"
                      >
                        <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 text-neutral-400 group-hover:text-gold transition-colors" />
                        <span className="flex-1 truncate">{r.title}</span>
                        <span className="text-[9px] sm:text-[10px] text-neutral-400 flex-shrink-0">{r.free ? 'Gratis' : 'Pago'}</span>
                        <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <p className="text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mis apuntes</p>
                  {savingNotes && <span className="text-[9px] sm:text-[10px] text-neutral-400 animate-pulse-soft">Guardando...</span>}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Tus apuntes, resumen o preguntas sobre este tema..."
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-neutral-700 placeholder:text-neutral-400 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15 resize-y transition-all duration-200"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function LearningPathPage() {
  const { paths, activePath, setPaths, setActivePath } = usePathStore()
  const [aiAdvice, setAiAdvice] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const loaded = await PathStorageService.getAll()
        if (cancelled) return
        if (loaded.length > 0 && !activePath) {
          setActivePath(loaded[0])
        }
        setPaths(loaded)
      } catch (err) {
        console.error('LearningPath init error:', err)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleToggle = async (pathId: string, stageId: string, topicId: string) => {
    const path = await PathStorageService.getById(pathId)
    if (!path) return
    const stage = path.stages.find((s) => s.id === stageId)
    if (!stage) return
    const topic = stage.topics.find((t) => t.id === topicId)
    if (!topic) return
    const newCompleted = !topic.completed
    const updated = await PathStorageService.updateTopic(pathId, stageId, topicId, newCompleted)
    if (updated) {
      setPaths(await PathStorageService.getAll())
      setActivePath(updated)
      await UserStorageService.updateStats((prev) => ({
        ...prev,
        completedTopics: prev.completedTopics + (newCompleted ? 1 : -1),
        totalProgress: updated.progress,
      }))
      if (newCompleted) {
        await UserStorageService.addActivity({
          id: `act_${Date.now()}`,
          type: 'topic_completed',
          title: `Completaste: ${topic.name}`,
          pathName: updated.title,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  const handleDelete = async (pathId: string) => {
    await PathStorageService.remove(pathId)
    const remaining = await PathStorageService.getAll()
    setPaths(remaining)
    if (activePath?.id === pathId) {
      setActivePath(remaining.length > 0 ? remaining[0] : null)
    }
    setConfirmDelete(null)
    addToast('success', 'Ruta eliminada')
  }

  const handleAskAI = async () => {
    if (!activePath) return
    setAiAdvice('Consultando...')
    const advice = await AiService.recommendNext(activePath.id)
    setAiAdvice(advice)
  }

  if (paths.length === 0) {
    return (
      <EmptyState
        icon={<Map className="h-10 w-10" />}
        title="Sin rutas de aprendizaje"
        description="Crea tu primera ruta desde el asistente IA"
        action={<Button icon={<Bot className="h-4 w-4" />} onClick={() => navigate('/ai-assistant?new=path')}>Nueva ruta con IA</Button>}
      />
    )
  }

  const displayPath = activePath || paths[0]
  const category = CATEGORIES.find((c) => c.value === displayPath.category)

  const filteredStages = useMemo(() => {
    if (!searchQuery.trim()) return displayPath.stages
    const q = searchQuery.toLowerCase()
    return displayPath.stages
      .map((stage) => ({
        ...stage,
        topics: stage.topics.filter(
          (t) => t.name.toLowerCase().includes(q) || (t.content && t.content.toLowerCase().includes(q))
        ),
      }))
      .filter((stage) => stage.topics.length > 0)
  }, [displayPath.stages, searchQuery])

  const allTopics = displayPath.stages.flatMap((s) => s.topics)
  const completedCount = allTopics.filter((t) => t.completed).length
  const totalCount = allTopics.length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center justify-between flex-wrap gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-base sm:text-lg font-semibold text-primary-600 shadow-xs flex-shrink-0">
            {category?.label.charAt(0) || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary-700 via-primary-600 to-gold bg-clip-text text-transparent truncate">
                {displayPath.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="default" size="sm">{category?.label || displayPath.category}</Badge>
              <Badge variant={displayPath.difficulty === 'beginner' ? 'default' : displayPath.difficulty === 'intermediate' ? 'warning' : 'primary'} size="sm">
                {displayPath.difficulty === 'beginner' ? 'Principiante' : displayPath.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" icon={<Sparkles className="h-4 w-4" />} onClick={handleAskAI}>
            <span className="hidden sm:inline">Consejo </span>IA
          </Button>
          <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/ai-assistant?new=path')}>
            <span className="hidden sm:inline">Nueva </span>ruta
          </Button>
          {displayPath && (
            confirmDelete === displayPath.id ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5"
              >
                <span className="text-sm text-red-600 font-medium">Eliminar?</span>
                <button onClick={() => handleDelete(displayPath.id)} className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">Si</button>
                <button onClick={() => setConfirmDelete(null)} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">No</button>
              </motion.div>
            ) : (
              <button
                onClick={() => setConfirmDelete(displayPath.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                title="Eliminar ruta"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </motion.div>

      {paths.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1"
        >
          {paths.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePath(p)}
              className={cn(
                'flex-shrink-0 rounded-xl border px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap',
                activePath?.id === p.id
                  ? 'border-gold/40 bg-gold/5 text-gold-dark shadow-xs'
                  : 'border-neutral-200/70 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
              )}
            >
              {p.title} — {p.progress}%
            </button>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Target className="h-3.5 w-3.5 text-gold" />
              <span>Progreso general</span>
            </div>
            <span className="text-xs text-neutral-400 ml-auto">{displayPath.progress}%</span>
          </div>
          <Progress value={displayPath.progress} size="md" />
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-neutral-500 bg-neutral-50 rounded-xl px-3.5 py-2 border border-neutral-200/60">
          <Zap className="h-4 w-4 text-gold" />
          <span className="font-medium text-neutral-700">{completedCount}</span>
          <span className="text-neutral-400">/ {totalCount} temas</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {aiAdvice && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/5 to-gold/[0.02] p-4 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
              <div className="text-sm text-neutral-800 whitespace-pre-wrap flex-1">{aiAdvice}</div>
            </div>
            <button
              onClick={() => setAiAdvice(null)}
              className="mt-2 text-xs text-gold hover:text-gold-dark font-medium transition-colors ml-8"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 sm:px-3.5 py-2 sm:py-2.5 shadow-xs">
        <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar temas en esta ruta..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-xs sm:text-sm text-neutral-700 placeholder-neutral-400 bg-transparent border-none outline-none ring-0 focus:ring-0 min-w-0"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-gold hover:text-gold-dark font-medium transition-colors flex-shrink-0"
          >
            Limpiar
          </button>
        )}
        {searchQuery && (
          <span className="text-[10px] text-neutral-400 flex-shrink-0 hidden sm:inline">
            {filteredStages.reduce((acc, s) => acc + s.topics.length, 0)} resultados
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-5 sm:left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/30 via-primary-200 to-neutral-200 hidden md:block" />

        <div className="space-y-4 sm:space-y-6">
          {searchQuery && filteredStages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-10 w-10 text-neutral-300 mb-3" />
              <p className="text-sm font-medium text-neutral-600">No se encontraron temas</p>
              <p className="text-xs text-neutral-400 mt-1">Prueba con otra palabra clave</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs font-medium text-gold hover:text-gold-dark transition-colors"
              >
                Limpiar busqueda
              </button>
            </div>
          ) : filteredStages.map((stage, si) => {
            const stageTopics = stage.topics
            const stageCompleted = stageTopics.filter((t) => t.completed).length
            const stageProgress = stageTopics.length > 0 ? Math.round((stageCompleted / stageTopics.length) * 100) : 0

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: si * 0.1, duration: 0.4, ease: 'easeOut' }}
                className="relative flex gap-3 sm:gap-6"
              >
                <div className="hidden md:flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className={cn(
                      'flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-xs',
                      stage.status === 'completed' ? 'border-green-400 bg-green-50 text-green-500' :
                      stage.status === 'in_progress' ? 'border-gold bg-gold/10 text-gold-dark' :
                      'border-neutral-200 bg-neutral-50 text-neutral-300',
                    )}
                  >
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    ) : (
                      <span className="text-xs sm:text-sm font-bold">{si + 1}</span>
                    )}
                  </motion.div>
                  {si < filteredStages.length - 1 && (
                    <div className="flex-1 w-0.5 bg-gradient-to-b from-gold/20 via-primary-100 to-neutral-200 min-h-[2rem]" />
                  )}
                </div>

                <Card className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-neutral-900 truncate">{stage.name}</h3>
                      <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">{stageTopics.length} temas &middot; {stageProgress}% completado</p>
                    </div>
                    <Badge variant={stage.status === 'completed' ? 'success' : stage.status === 'in_progress' ? 'warning' : 'default'} size="sm">
                      <span className="hidden sm:inline">{stage.status === 'completed' ? 'Completado' : stage.status === 'in_progress' ? 'En progreso' : 'Pendiente'}</span>
                      <span className="sm:hidden">{stage.status === 'completed' ? 'OK' : stage.status === 'in_progress' ? '...' : '-'}</span>
                    </Badge>
                  </div>

                  <div className="mb-2 sm:mb-3">
                    <Progress value={stageProgress} size="sm" />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {stageTopics.map((topic) => (
                      <TopicItem
                        key={topic.id}
                        topic={topic}
                        pathId={displayPath.id}
                        stageId={stage.id}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>
            )
          })}

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: displayPath.stages.length * 0.1 + 0.2 }}
            className="flex justify-center"
          >
            <button
              onClick={() => navigate('/ai-assistant?new=path')}
              className="group inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-neutral-300/70 px-5 py-3 text-sm font-medium text-neutral-500 hover:border-gold/40 hover:text-gold-dark hover:bg-gold/5 transition-all duration-200"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:scale-110 duration-200" />
              Agregar nueva ruta
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 duration-200" />
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
