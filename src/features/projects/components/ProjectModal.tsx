import { motion, AnimatePresence } from 'framer-motion'
import { X, FolderGit2, Save } from 'lucide-react'
import { ProjectStorageService } from '../services/ProjectStorageService'
import { useProjectStore } from '@core/store'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { useToastStore } from '@shared/store/toastStore'
import { useState, useEffect } from 'react'

interface ProjectModalProps {
  open: boolean
  onClose: () => void
  editId?: string
}

export function ProjectModal({ open, onClose, editId }: ProjectModalProps) {
  const setProjects = useProjectStore((s) => s.setProjects)
  const addToast = useToastStore((s) => s.addToast)

  const isEditing = !!editId

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'in_progress' | 'completed' | 'archived'>('draft')
  const [progress, setProgress] = useState(0)
  const [repoUrl, setRepoUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [techInput, setTechInput] = useState('')
  const [technologies, setTechnologies] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      ;(async () => {
        setTechInput('')
        setErrors({})
        if (editId) {
          const existing = await ProjectStorageService.getById(editId)
          if (existing) {
            setName(existing.name)
            setDescription(existing.description)
            setStatus(existing.status)
            setProgress(existing.progress ?? 0)
            setRepoUrl(existing.repoUrl || '')
            setDemoUrl(existing.demoUrl || '')
            setTechnologies(existing.technologies)
            setNotes(existing.notes || '')
          } else {
            resetForm()
          }
        } else {
          resetForm()
        }
      })()
    }
  }, [open, editId])

  const resetForm = () => {
    setName('')
    setDescription('')
    setStatus('draft')
    setProgress(0)
    setRepoUrl('')
    setDemoUrl('')
    setTechnologies([])
    setNotes('')
  }

  const addTech = () => {
    const t = techInput.trim()
    if (t && !technologies.includes(t)) {
      setTechnologies([...technologies, t])
      setTechInput('')
    }
  }

  const removeTech = (t: string) => {
    setTechnologies(technologies.filter((x) => x !== t))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!description.trim()) newErrors.description = 'La descripcion es obligatoria'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      if (isEditing && editId) {
        await ProjectStorageService.update(editId, {
          name: name.trim(),
          description: description.trim(),
          technologies,
          status,
          progress,
          repoUrl: repoUrl.trim() || undefined,
          demoUrl: demoUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        })
        addToast('success', 'Proyecto actualizado')
      } else {
        await ProjectStorageService.create({
          name: name.trim(),
          description: description.trim(),
          technologies,
          status,
          progress,
          repoUrl: repoUrl.trim() || undefined,
          demoUrl: demoUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        })
        addToast('success', 'Proyecto creado')
      }
      setProjects(await ProjectStorageService.getAll())
      onClose()
    } catch {
      addToast('error', 'Error al guardar el proyecto')
    } finally {
      setSaving(false)
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
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 text-gold-dark">
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {isEditing ? 'Editar proyecto' : 'Nuevo proyecto'}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {isEditing ? 'Actualiza los datos del proyecto' : 'Describe tu proyecto'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <Input
                label="Nombre del proyecto"
                placeholder="Mi proyecto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">Descripcion</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripcion del proyecto"
                  rows={3}
                  className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15 transition-all"
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">Tecnologias</label>
                <div className="flex gap-2">
                  <input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }}
                    placeholder="React, Node, Python..."
                    className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15 transition-all"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTech}>Agregar</Button>
                </div>
                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {technologies.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-md bg-gold/5 border border-gold/20 px-2 py-1 text-xs font-medium text-gold-dark">
                        {t}
                        <button type="button" onClick={() => removeTech(t)} className="text-gold-dark/60 hover:text-gold-dark">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15 transition-all"
                >
                  <option value="draft">Borrador</option>
                  <option value="in_progress">En progreso</option>
                  <option value="completed">Completado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">Progreso: {progress}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-neutral-100 accent-gold [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="URL del repositorio" placeholder="https://github.com/..." value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
                <Input label="URL demo" placeholder="https://..." value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">Apuntes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Apuntes, ideas o recursos sobre este proyecto..."
                  rows={3}
                  className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/15 transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button type="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
                  {isEditing ? 'Guardar cambios' : 'Crear proyecto'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
