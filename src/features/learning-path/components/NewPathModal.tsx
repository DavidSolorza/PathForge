import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Target } from 'lucide-react'
import { CATEGORIES } from '@shared/types'
import type { Category } from '@shared/types'
import { AiService } from '@features/recommendations/services/AiService'
import { usePathStore } from '@core/store'
import { Button } from '@shared/components/ui/Button'
import { cn } from '@shared/lib/utils'

interface NewPathModalProps {
  open: boolean
  onClose: () => void
}

export function NewPathModal({ open, onClose }: NewPathModalProps) {
  const [goal, setGoal] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState<'goal' | 'category' | 'generating'>('goal')
  const addPath = usePathStore((s) => s.addPath)
  const setActivePath = usePathStore((s) => s.setActivePath)
  const navigate = useNavigate()

  const handleNext = () => {
    if (!goal.trim()) return
    setStep('category')
  }

  const handleGenerate = async () => {
    if (!selectedCategory) return
    setStep('generating')
    setGenerating(true)

    const fullGoal = `Aprender ${goal.trim()}`
    const path = await AiService.generatePath(fullGoal)
    addPath(path)
    setActivePath(path)
    setGenerating(false)
    onClose()
    setGoal('')
    setSelectedCategory(null)
    setStep('goal')
    navigate('/learning-path')
  }

  const handleClose = () => {
    if (!generating) {
      setGoal('')
      setSelectedCategory(null)
      setStep('goal')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">Nueva ruta de aprendizaje</h2>
                  <p className="text-sm text-neutral-500">¿Qué deseas aprender?</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                disabled={generating}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {step === 'goal' && (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="Ej: Python, Fotografía, Guitarra, Inglés..."
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Python', 'Inglés', 'Guitarra', 'Fotografía', 'Marketing', 'Cocina'].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => { setGoal(ex); setStep('category') }}
                        className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleNext} disabled={!goal.trim()}>
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}

              {step === 'category' && (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-600">
                    ¿En qué categoría encaja <span className="font-semibold text-neutral-900">"{goal.trim()}"</span>?
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all text-left',
                          selectedCategory === cat.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
                        )}
                      >
                        <span className="text-lg">{cat.emoji}</span>
                        <span className="font-medium">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button variant="ghost" onClick={() => setStep('goal')}>
                      Atrás
                    </Button>
                    <Button onClick={handleGenerate} disabled={!selectedCategory} icon={<Sparkles className="h-4 w-4" />}>
                      Generar ruta
                    </Button>
                  </div>
                </div>
              )}

              {step === 'generating' && (
                <div className="flex flex-col items-center py-8">
                  <div className="relative mb-6">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-neutral-100 border-t-primary-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary-500" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 mb-1">Creando tu ruta personalizada</h3>
                  <p className="text-sm text-neutral-500 text-center max-w-sm">
                    La IA está analizando tu objetivo y generando etapas, temas y recursos para "{goal.trim()}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
