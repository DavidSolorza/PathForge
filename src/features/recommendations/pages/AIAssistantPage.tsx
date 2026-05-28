import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, Send, User, Trash2, Route, Plus, MessageSquare, Loader2 } from 'lucide-react'
import { usePathStore } from '@core/store'
import { AiService } from '@features/recommendations/services/AiService'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { RecommendationStorageService } from '@features/recommendations/services/RecommendationStorageService'
import type { ChatMessage } from '@shared/types'
import { MessageContent } from '@shared/components/common/MessageContent'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { useToastStore } from '@shared/store/toastStore'
import { cn } from '@shared/lib/utils'

type Mode = 'chat' | 'generator'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<ChatMessage[]>(messages)

  useEffect(() => { messagesRef.current = messages }, [messages])

  const saveCurrent = useCallback((msgs: ChatMessage[]) => {
    if (mode === 'chat') {
      RecommendationStorageService.clearChat()
      msgs.forEach((m) => RecommendationStorageService.addChatMessage(m))
    } else {
      RecommendationStorageService.clearGenerator()
      msgs.forEach((m) => RecommendationStorageService.addGeneratorMessage(m))
    }
  }, [mode])

  const loadHistory = useCallback((m: Mode): ChatMessage[] => {
    return m === 'chat'
      ? RecommendationStorageService.getChatHistory()
      : RecommendationStorageService.getGeneratorHistory()
  }, [])

  useEffect(() => {
    setMessages(loadHistory(mode))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const switchMode = (m: Mode) => {
    if (m === mode) return
    saveCurrent(messages)
    setMode(m)
    setMessages(loadHistory(m))
  }

  const addMsg = (msg: ChatMessage) => {
    const updated = [...messagesRef.current, msg]
    messagesRef.current = updated
    setMessages(updated)
    if (mode === 'chat') {
      RecommendationStorageService.addChatMessage(msg)
    } else {
      RecommendationStorageService.addGeneratorMessage(msg)
    }
  }

  const handleSend = async () => {
    if (!query.trim() || loading) return

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
    }
    addMsg(userMsg)
    setQuery('')
    setLoading(true)

    try {
      const current = messagesRef.current
      const response = await AiService.chat(userMsg.content, current)
      addMsg(response)
    } catch {
      addMsg({
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: 'Lo siento, ocurrio un error. Intenta de nuevo.',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    if (mode === 'chat') {
      RecommendationStorageService.clearChat()
    } else {
      RecommendationStorageService.clearGenerator()
    }
    addToast('info', `Historial limpiado`)
  }

  const handleGeneratePath = async () => {
    const userMessages = messages.filter((m) => m.role === 'user')
    const topic = userMessages.length > 0
      ? userMessages[userMessages.length - 1].content
      : query.trim()

    if (!topic) {
      addToast('info', 'Escribe que quieres aprender primero')
      return
    }

    setGenerating(true)
    try {
      const path = await AiService.generatePath(topic, messages)
      setPaths(PathStorageService.getAll())
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
    const userMessages = messages.filter((m) => m.role === 'user')
    if (userMessages.length > 0) return userMessages[userMessages.length - 1].content
    return query
  }

  const hasApiKey = !!localStorage.getItem('pathforge_gemini_api_key')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-neutral-900">
              {mode === 'generator' ? 'Generador de rutas' : 'Chat normal'}
            </h1>
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
              hasApiKey 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-amber-50 text-amber-700 border border-amber-200"
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full", hasApiKey ? "bg-green-500" : "bg-amber-500 animate-pulse")} />
              {hasApiKey ? 'IA en vivo' : 'IA Simulada (offline)'}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {mode === 'generator'
              ? 'Describe que quieres aprender y genera una ruta personalizada'
              : 'Pregunta lo que quieras sobre tu aprendizaje'}
            {!hasApiKey && (
              <span className="block text-xs text-neutral-400 mt-0.5">
                Modo simulación activo. Conecta tu clave en tu{' '}
                <button onClick={() => navigate('/profile')} className="underline text-primary-600 hover:text-primary-700 cursor-pointer">
                  Perfil
                </button>{' '}
                para usar IA real en vivo.
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-neutral-200 p-0.5">
            <button
              onClick={() => switchMode('chat')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                mode === 'chat' ? 'bg-primary-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              <MessageSquare className="h-4 w-4" />
              Chat normal
            </button>
            <button
              onClick={() => switchMode('generator')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                mode === 'generator' ? 'bg-primary-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700',
              )}
            >
              <Route className="h-4 w-4" />
              Generador rutas
            </button>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={handleClear}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {mode === 'generator' && messages.length === 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary-200 bg-primary-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 flex-shrink-0">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-800">Dime que quieres aprender</p>
              <p className="text-sm text-primary-600 mt-1">Ej: "Quiero aprender Python desde cero", "Ayudame con ingles basico", "Guitarra para principiantes"</p>
            </div>
          </div>
        </motion.div>
      )}

      <Card className="flex flex-col h-[calc(100vh-24rem)]">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && !loading && (
            <EmptyState
              icon={<Bot className="h-10 w-10" />}
              title={mode === 'generator' ? 'Que quieres aprender?' : 'En que puedo ayudarte?'}
              description={mode === 'generator' ? 'Describe el tema y genera una ruta personalizada' : 'Pregunta sobre tus rutas, progreso o recursos'}
            />
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-800'
              }`}>
                <MessageContent content={msg.content} role={msg.role} />
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-neutral-600 flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-xl bg-neutral-100 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-neutral-200 p-4 space-y-3">
          {mode === 'generator' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <button
                onClick={handleGeneratePath}
                disabled={generating || loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Route className="h-4 w-4" />
                )}
                {generating ? 'Generando ruta...' : `Generar ruta${getTopicHint() ? `: ${getTopicHint().slice(0, 40)}${getTopicHint().length > 40 ? '...' : ''}` : ' con IA'}`}
              </button>
            </motion.div>
          )}

          {mode === 'chat' && messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setQuery('Que deberia aprender despues?'); }}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                Que deberia aprender despues?
              </button>
              <button
                onClick={() => { setQuery('Estoy listo para un proyecto?'); }}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                Estoy listo para un proyecto?
              </button>
              <button
                onClick={() => { setQuery('Que me falta para alcanzar mi objetivo?'); }}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                Que me falta para mi objetivo?
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex gap-3"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === 'generator' ? "Ej: Quiero aprender Python desde cero" : "Ej: Que sigue despues de esta ruta?"}
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              disabled={loading || generating}
            />
            <button
              type="submit"
              disabled={!query.trim() || loading || generating}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}
