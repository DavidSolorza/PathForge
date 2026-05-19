import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, User } from 'lucide-react'
import { useRecommendationStore } from '@core/store'
import { GeminiService } from '../services'
import type { ChatMessage } from '@shared/types'
import { Card } from '@shared/components/ui/Card'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { MessageContent } from '@shared/components/common/MessageContent'

export function AIAssistantPage() {
  const { chatMessages, loading, addChatMessage } = useRecommendationStore()
  const [query, setQuery] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, localLoading])

  const handleSend = async () => {
    if (!query.trim() || localLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
    }
    addChatMessage(userMessage)
    setQuery('')
    setLocalLoading(true)

    try {
      const response = await GeminiService.chat(userMessage.content)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }
      addChatMessage(assistantMessage)
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu consulta. Intenta de nuevo.',
        timestamp: new Date().toISOString(),
      }
      addChatMessage(errorMessage)
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Asistente IA</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Consulta tu ruta de aprendizaje con inteligencia artificial
        </p>
      </div>

      <Card className="flex flex-col h-[calc(100vh-16rem)]">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {chatMessages.length === 0 && !localLoading && (
            <EmptyState
              icon={<Bot className="h-10 w-10" />}
              title="¿En qué puedo ayudarte?"
              description="Pregúntame sobre tu ruta de aprendizaje, qué aprender después, o qué habilidades necesitas"
            />
          )}

          {chatMessages.map((msg) => (
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
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                <MessageContent content={msg.content} role={msg.role} />
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-neutral-600 flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}

          {localLoading && (
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

        <div className="border-t border-neutral-200 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-3"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: Aprendí funciones y listas ¿qué sigue?"
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              disabled={localLoading}
            />
            <button
              type="submit"
              disabled={!query.trim() || localLoading}
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
