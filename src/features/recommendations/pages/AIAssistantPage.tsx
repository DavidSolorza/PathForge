import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, Send, User, Trash2, Route, MessageSquare, Loader2, Clock, BookOpen, BarChart3, FolderKanban, Sparkles, ChevronRight, Zap, Target } from 'lucide-react'
import { usePathStore } from '@core/store'
import { AiService } from '@features/recommendations/services/AiService'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { RecommendationStorageService } from '@features/recommendations/services/RecommendationStorageService'
import { ProjectStorageService } from '@features/projects/services/ProjectStorageService'
import { StudyService } from '@features/learning-path/services/StudyService'
import type { ChatMessage, PathPreferences, AiUserContext } from '@shared/types'
import { MessageContent } from '@shared/components/common/MessageContent'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { useToastStore } from '@shared/store/toastStore'
import { cn } from '@shared/lib/utils'
import { config } from '@core/config'

type Mode = 'chat' | 'generator'

const WEEKLY_HOURS: { value: PathPreferences['weeklyHours']; label: string }[] = [
  { value: '<3', label: '< 3 horas' },
  { value: '3-5', label: '3-5 horas' },
  { value: '5-10', label: '5-10 horas' },
  { value: '10+', label: '10+ horas' },
]

const LEARNING_METHODS: { value: PathPreferences['learningMethod']; label: string; desc: string }[] = [
  { value: 'lectura', label: 'Lectura', desc: 'Documentacion y articulos' },
  { value: 'video', label: 'Video', desc: 'Tutoriales y cursos' },
  { value: 'practica', label: 'Practica', desc: 'Proyectos directos' },
  { value: 'mixto', label: 'Mixto', desc: 'Todo combinado' },
]

const LEVELS: { value: PathPreferences['currentLevel']; label: string }[] = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
]

const PROJECT_TYPES: { value: PathPreferences['projectPreference']; label: string }[] = [
  { value: 'cortos', label: 'Cortos (1-2 dias)' },
  { value: 'medianos', label: 'Medianos (1 semana)' },
  { value: 'largos', label: 'Largos (2+ semanas)' },
]

const quickSuggestions = [
  { text: 'Que deberia aprender despues?', icon: ChevronRight },
  { text: 'Estoy listo para un proyecto?', icon: Zap },
  { text: 'Que me falta para mi objetivo?', icon: Target },
]

export function AIAssistantPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isNewPath = searchParams.get('new') === 'path'
  const { setPaths, setActivePath } = usePathStore()
  const addToast = useToastStore((s) => s.addToast)

  const [mode, setMode] = useState<Mode>(isNewPath ? 'generator' : 'chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [preferences, setPreferences] = useState<PathPreferences>({
    weeklyHours: '5-10',
    learningMethod: 'mixto',
    currentLevel: 'beginner',
    projectPreference: 'medianos',
  })


  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<ChatMessage[]>(messages)

  useEffect(() => { messagesRef.current = messages }, [messages])

  const saveCurrent = useCallback(async (msgs: ChatMessage[]) => {
    if (mode === 'chat') {
      await RecommendationStorageService.setChatHistory(msgs)
    } else {
      await RecommendationStorageService.setGeneratorHistory(msgs)
    }
  }, [mode])

  const loadHistory = useCallback(async (m: Mode): Promise<ChatMessage[]> => {
    return m === 'chat'
      ? await RecommendationStorageService.getChatHistory()
      : await RecommendationStorageService.getGeneratorHistory()
  }, [])

  useEffect(() => {
    (async () => {
      setMessages(await loadHistory(mode))
    })()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const switchMode = async (m: Mode) => {
    if (m === mode) return
    await saveCurrent(messages)
    setMode(m)
    setMessages(await loadHistory(m))
  }

  const addMsg = async (msg: ChatMessage) => {
    const updated = [...messagesRef.current, msg]
    messagesRef.current = updated
    setMessages(updated)
    if (mode === 'chat') {
      await RecommendationStorageService.addChatMessage(msg)
    } else {
      await RecommendationStorageService.addGeneratorMessage(msg)
    }
  }

  const buildAiContext = useCallback(async (): Promise<AiUserContext> => {
    const allPaths = await PathStorageService.getAll()
    const allProjects = await ProjectStorageService.getAll()
    return {
      paths: allPaths.map((p) => {
        const allT = p.stages.flatMap((s) => s.topics)
        return { title: p.title, progress: p.progress, completed: allT.filter((t) => t.completed).length, total: allT.length, category: p.category }
      }),
      projects: allProjects.map((pr) => ({ name: pr.name, status: pr.status, technologies: pr.technologies })),
      stats: {
        totalMinutes: StudyService.getTotalMinutes(),
        streak: StudyService.getStreak(),
        completedTopics: allPaths.reduce((acc, p) => acc + p.stages.flatMap((s) => s.topics).filter((t) => t.completed).length, 0),
        totalPaths: allPaths.length,
      },
    }
  }, [])

  const handleSend = async () => {
    if (!query.trim() || loading) return

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
    }
    await addMsg(userMsg)
    setQuery('')
    setLoading(true)

    try {
      const context = await buildAiContext()
      const current = messagesRef.current
      const response = await AiService.chat(userMsg.content, current, context)
      await addMsg(response)
    } catch {
      await addMsg({
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: 'Lo siento, ocurrio un error. Intenta de nuevo.',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    setMessages([])
    if (mode === 'chat') {
      await RecommendationStorageService.clearChat()
    } else {
      await RecommendationStorageService.clearGenerator()
    }
    addToast('info', `Historial limpiado`)
  }

  const handleGeneratePath = async () => {
    const userMessages = messages.filter((m) => m.role === 'user')
    let topic = userMessages.length > 0
      ? userMessages.map((m) => m.content).join('. ')
      : query.trim()

    const chatHistory = await RecommendationStorageService.getChatHistory()
    if (chatHistory.length > 0) {
      const chatUserMessages = chatHistory.filter((m) => m.role === 'user')
      if (chatUserMessages.length > 0) {
        const chatContext = chatUserMessages.slice(-5).map((m) => m.content).join('. ')
        topic = topic ? `${topic}. Contexto adicional del chat: ${chatContext}` : chatContext
      }
    }

    if (!topic) {
      addToast('info', 'Escribe que quieres aprender primero')
      return
    }

    setGenerating(true)
    try {
      const context = await buildAiContext()
      const combinedMessages = [...chatHistory, ...messages]
      const path = await AiService.generatePath(topic, combinedMessages, preferences, context)
      setPaths(await PathStorageService.getAll())
      setActivePath(path)
      addToast('success', `Ruta creada: ${path.title}`)
      navigate('/learning-path')
    } catch {
      addToast('error', 'Error al crear la ruta')
    } finally {
      setGenerating(false)
    }
  }

  const getTopicHint = (): string => {
    if (mode === 'generator' && query.trim()) return query.trim()
    const userMessages = messages.filter((m) => m.role === 'user')
    if (userMessages.length > 0) return userMessages[userMessages.length - 1].content
    return query
  }

  const hasApiKey = !!localStorage.getItem('pathforge_gemini_api_key') || !!config.gemini.apiKey

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const msgVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
    },
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center justify-between flex-wrap gap-3 sm:gap-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary-700 via-primary-600 to-gold bg-clip-text text-transparent truncate">
              {mode === 'generator' ? 'Generador de rutas' : 'Asistente IA'}
            </h1>
            <span className={cn(
              "inline-flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-0.5 text-[10px] sm:text-xs font-medium border transition-all duration-300 flex-shrink-0",
              hasApiKey
                ? "bg-green-50 text-green-700 border-green-200/60 shadow-xs"
                : "bg-amber-50 text-amber-700 border-amber-200/60 shadow-xs"
            )}>
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-75",
                  hasApiKey ? "bg-green-500 animate-ping" : "bg-amber-500"
                )} />
                <span className={cn(
                  "relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full",
                  hasApiKey ? "bg-green-500" : "bg-amber-500"
                )} />
              </span>
              {hasApiKey ? 'IA en vivo' : 'IA Simulada'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 sm:mt-1.5 ml-0.5">
            {mode === 'generator'
              ? 'Describe que quieres aprender y genera una ruta personalizada'
              : 'Pregunta lo que quieras sobre tu aprendizaje'}
            {!hasApiKey && (
              <span className="block text-[10px] sm:text-xs text-neutral-400 mt-1">
                Modo simulacion activo. Conecta tu clave en tu{' '}
                <button onClick={() => navigate('/profile')} className="font-medium text-gold hover:text-gold-dark underline-offset-2 hover:underline transition-all cursor-pointer">
                  Perfil
                </button>{' '}
                para usar IA real en vivo.
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl border border-neutral-200 p-0.5 bg-neutral-50/50 shadow-xs">
            <button
              onClick={() => switchMode('chat')}
              className={cn(
                'flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200',
                mode === 'chat'
                  ? 'bg-white text-primary-700 shadow-sm border border-primary-200'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50',
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Chat </span>normal
            </button>
            <button
              onClick={() => switchMode('generator')}
              className={cn(
                'flex items-center gap-1 sm:gap-1.5 rounded-lg px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200',
                mode === 'generator'
                  ? 'bg-gold text-white shadow-sm border border-gold-dark'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50',
              )}
            >
              <Route className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Generador </span>rutas
            </button>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={handleClear}>
              <span className="hidden sm:inline">Limpiar</span>
            </Button>
          )}
        </div>
      </motion.div>

      {mode === 'generator' && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="rounded-xl border border-primary-200/60 bg-gradient-to-br from-primary-50 to-primary-50/50 px-5 py-4 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-white shadow-xs flex-shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-800">Que quieres aprender?</p>
              <p className="text-sm text-primary-600 mt-1 leading-relaxed">Escribe tu meta y luego ajustaremos la ruta a tu ritmo. Ej: "Quiero aprender Python desde cero", "React para frontend"</p>
            </div>
          </div>
        </motion.div>
      )}

      <Card className="flex flex-col h-[calc(100vh-14rem)] sm:h-[calc(100vh-16rem)] overflow-hidden p-0 border-neutral-200/80 shadow-sm">
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {messages.length === 0 && !loading && (
            <EmptyState
              icon={
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Bot className="h-10 w-10" />
                </motion.div>
              }
              title={mode === 'generator' ? 'Que quieres aprender?' : 'En que puedo ayudarte?'}
              description={mode === 'generator' ? 'Describe el tema y genera una ruta personalizada' : 'Pregunta sobre tus rutas, progreso o recursos'}
            />
          )}

          {messages.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  variants={msgVariants}
                  layout
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 flex-shrink-0 shadow-xs mt-0.5">
                      <Bot className="h-[18px] w-[18px]" />
                    </div>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed transition-shadow duration-200 ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white shadow-sm rounded-tr-md'
                      : 'bg-neutral-50 text-neutral-800 border border-neutral-200/60 shadow-xs rounded-tl-md'
                  }`}>
                    <MessageContent content={msg.content} role={msg.role} />
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-200/70 text-neutral-600 flex-shrink-0 mt-0.5">
                      <User className="h-[18px] w-[18px]" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 shadow-xs">
                <Bot className="h-[18px] w-[18px]" />
              </div>
              <div className="rounded-2xl bg-neutral-50 border border-neutral-200/60 px-5 py-4 shadow-xs rounded-tl-md">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.2s' }} />
                  <span className="h-2.5 w-2.5 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.2s' }} />
                  <span className="h-2.5 w-2.5 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.2s' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-neutral-200/80 bg-neutral-50/30 p-3 sm:p-4 space-y-3">
          {mode === 'generator' && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-4 sm:space-y-5 rounded-xl border border-neutral-200/80 bg-white p-3 sm:p-5 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-gold" />
                <span className="text-xs sm:text-sm font-semibold text-neutral-800">Personaliza tu ruta</span>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-neutral-600 mb-2 sm:mb-2.5">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold" />
                  Tiempo disponible por semana
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  {WEEKLY_HOURS.map((h) => (
                    <button
                      key={h.value}
                      onClick={() => setPreferences(p => ({ ...p, weeklyHours: h.value }))}
                      className={cn(
                        'rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium border transition-all duration-200',
                        preferences.weeklyHours === h.value
                          ? 'border-gold bg-gold/10 text-gold-dark shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
                      )}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-neutral-600 mb-2 sm:mb-2.5">
                  <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold" />
                  Como prefieres aprender?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  {LEARNING_METHODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setPreferences(p => ({ ...p, learningMethod: m.value }))}
                      className={cn(
                        'rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium border transition-all duration-200',
                        preferences.learningMethod === m.value
                          ? 'border-gold bg-gold/10 text-gold-dark shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-neutral-600 mb-2 sm:mb-2.5">
                  <BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold" />
                  Tu nivel actual
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setPreferences(p => ({ ...p, currentLevel: l.value }))}
                      className={cn(
                        'rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium border transition-all duration-200',
                        preferences.currentLevel === l.value
                          ? 'border-gold bg-gold/10 text-gold-dark shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-neutral-600 mb-2 sm:mb-2.5">
                  <FolderKanban className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold" />
                  Tipo de proyectos
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      onClick={() => setPreferences(prev => ({ ...prev, projectPreference: pt.value }))}
                      className={cn(
                        'rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium border transition-all duration-200',
                        preferences.projectPreference === pt.value
                          ? 'border-gold bg-gold/10 text-gold-dark shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
                      )}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGeneratePath}
                disabled={generating}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-dark px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:from-gold-dark hover:to-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm active:scale-[0.98]"
              >
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110 duration-200" />
                )}
                {generating ? 'Generando...' : 'Generar ruta personalizada'}
              </button>
            </motion.div>
          )}

          {mode === 'chat' && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-1.5 sm:gap-2"
            >
              {quickSuggestions.map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => { setQuery(suggestion.text) }}
                  className="group inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-neutral-200/80 bg-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-neutral-600 hover:border-gold/40 hover:text-gold-dark hover:bg-gold/5 hover:shadow-xs transition-all duration-200"
                >
                  <suggestion.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-neutral-400 group-hover:text-gold transition-colors duration-200" />
                  {suggestion.text}
                </button>
              ))}
            </motion.div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex gap-2 sm:gap-3"
          >
            <div className="relative flex-1 min-w-0">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={mode === 'generator' ? "Ej: Quiero aprender Python desde cero" : "Ej: Que sigue despues de esta ruta?"}
                className="w-full rounded-xl border border-neutral-200/80 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15 focus:bg-white transition-all duration-200 shadow-xs"
                disabled={loading || generating}
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading || generating}
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-white hover:from-gold-dark hover:to-gold-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-90 shadow-sm hover:shadow-md flex-shrink-0"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}
