import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import { usePathStore } from '@core/store'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { ReviewService } from '@features/learning-path/services/ReviewService'
import { AiService } from '@features/recommendations/services/AiService'
import { CATEGORIES } from '@shared/types'
import type { LearningPath, Topic } from '@shared/types'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Progress } from '@shared/components/ui/Progress'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/ui/EmptyState'
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
    <div className={cn('rounded-lg border transition-all', topic.completed ? 'border-green-200 bg-green-50/50' : 'border-neutral-200 bg-white')}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => onToggle(pathId, stageId, topic.id)}
          className="flex-shrink-0 transition-colors hover:scale-110 active:scale-95"
        >
          {topic.completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-neutral-300 hover:text-primary-400" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <span className={cn('text-sm font-medium', topic.completed ? 'text-green-700 line-through' : 'text-neutral-800')}>
            {topic.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {topic.notes && <StickyNote className="h-3.5 w-3.5 text-amber-400" />}
          <Badge variant={topic.difficulty === 'easy' ? 'default' : topic.difficulty === 'medium' ? 'warning' : 'primary'} size="sm">
            {topic.difficulty === 'easy' ? 'Facil' : topic.difficulty === 'medium' ? 'Media' : 'Dificil'}
          </Badge>
          {expandedByContent && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-neutral-100 px-4 py-3 space-y-3">
          {topic.content && (
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Contenido</p>
              <div className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{topic.content}</div>
            </div>
          )}
          {realResources.length > 0 && (
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Documentacion</p>
              <div className="space-y-1.5">
                {realResources.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors no-underline"
                  >
                    <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{r.title}</span>
                    <Badge variant="default" size="sm">
                      {r.type === 'documentation' ? 'Doc' : r.type === 'video' ? 'Video' : 'Articulo'}
                    </Badge>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Mis apuntes</p>
              {savingNotes && <span className="text-[10px] text-neutral-400">Guardando...</span>}
            </div>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Tus apuntes, resumen o preguntas sobre este tema..."
              rows={3}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-y transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function LearningPathPage() {
  const { paths, activePath, setPaths, setActivePath } = usePathStore()
  const [aiAdvice, setAiAdvice] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-lg font-semibold text-primary-600">
            {category?.label.charAt(0) || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-neutral-900">{displayPath.title}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" size="sm">{category?.label || displayPath.category}</Badge>
              <Badge variant={displayPath.difficulty === 'beginner' ? 'default' : displayPath.difficulty === 'intermediate' ? 'warning' : 'primary'} size="sm">
                {displayPath.difficulty === 'beginner' ? 'Principiante' : displayPath.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Sparkles className="h-4 w-4" />} onClick={handleAskAI}>
            Consejo IA
          </Button>
          <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/ai-assistant?new=path')}>
            Nueva ruta
          </Button>
          {displayPath && (
            confirmDelete === displayPath.id ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
                <span className="text-sm text-red-600">Eliminar?</span>
                <button onClick={() => handleDelete(displayPath.id)} className="text-sm font-medium text-red-600 hover:text-red-700">Si</button>
                <button onClick={() => setConfirmDelete(null)} className="text-sm text-neutral-500 hover:text-neutral-700">No</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(displayPath.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Eliminar ruta"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </div>

      {paths.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {paths.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePath(p)}
              className={cn(
                'flex-shrink-0 rounded-lg border px-3 py-2 text-sm transition-all',
                activePath?.id === p.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
              )}
            >
              {p.title} — {p.progress}%
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Progress value={displayPath.progress} size="md" showLabel />
        </div>
        <span className="text-sm text-neutral-500">
          {displayPath.stages.flatMap((s) => s.topics).filter((t) => t.completed).length}/
          {displayPath.stages.flatMap((s) => s.topics).length} temas
        </span>
      </div>

      {aiAdvice && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary-200 bg-primary-50 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-primary-800 whitespace-pre-wrap">{aiAdvice}</div>
          </div>
          <button onClick={() => setAiAdvice(null)} className="mt-2 text-xs text-primary-500 hover:text-primary-700 transition-colors">
            Cerrar
          </button>
        </motion.div>
      )}

      <div className="relative">
        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-neutral-200 hidden md:block" />

        <div className="space-y-6">
          {displayPath.stages.map((stage, si) => {
            const stageTopics = stage.topics
            const stageCompleted = stageTopics.filter((t) => t.completed).length
            const stageProgress = stageTopics.length > 0 ? Math.round((stageCompleted / stageTopics.length) * 100) : 0

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: si * 0.1, duration: 0.4 }}
                className="relative flex gap-6"
              >
                <div className="hidden md:flex flex-col items-center">
                  <div className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all',
                    stage.status === 'completed' ? 'border-green-400 bg-green-50 text-green-500' :
                    stage.status === 'in_progress' ? 'border-primary-400 bg-primary-50 text-primary-500' :
                    'border-neutral-200 bg-neutral-50 text-neutral-300',
                  )}>
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <span className="text-sm font-bold">{si + 1}</span>
                    )}
                  </div>
                  {si < displayPath.stages.length - 1 && (
                    <div className="flex-1 w-0.5 bg-neutral-200 min-h-[2rem]" />
                  )}
                </div>

                <Card className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900">{stage.name}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">{stageTopics.length} temas • {stageProgress}% completado</p>
                    </div>
                    <Badge variant={stage.status === 'completed' ? 'success' : stage.status === 'in_progress' ? 'warning' : 'default'} size="sm">
                      {stage.status === 'completed' ? 'Completado' : stage.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <Progress value={stageProgress} size="sm" />
                  </div>

                  <div className="space-y-2">
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
        </div>
      </div>
    </div>
  )
}
