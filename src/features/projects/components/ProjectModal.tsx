import { motion, AnimatePresence } from 'framer-motion'
import { X, FolderGit2, Save } from 'lucide-react'
import { ProjectStorageService } from '../services/ProjectStorageService'
import { useProjectStore } from '../store'
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
  const refresh = useProjectStore((s) => s.refresh)
  const addToast = useToastStore((s) => s.addToast)

  const isEditing = !!editId
  const existing = editId ? ProjectStorageService.getById(editId) : null

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'in_progress' | 'completed' | 'archived'>('draft')
  const [repoUrl, setRepoUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [techInput, setTechInput] = useState('')
  const [technologies, setTechnologies] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (existing) {
        setName(existing.name)
        setDescription(existing.description)
        setStatus(existing.status)
        setRepoUrl(existing.repoUrl || '')
        setDemoUrl(existing.demoUrl || '')
        setTechnologies(existing.technologies)
      } else {
        setName('')
        setDescription('')
        setStatus('draft')
        setRepoUrl('')
        setDemoUrl('')
        setTechnologies([])
      }
      setTechInput('')
      setErrors({})
    }
  }, [open, editId])

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
        ProjectStorageService.update(editId, {
          name: name.trim(),
          description: description.trim(),
          technologies,
          status,
          repoUrl: repoUrl.trim() || undefined,
          demoUrl: demoUrl.trim() || undefined,
        })
        addToast('success', 'Proyecto actualizado')
      } else {
        ProjectStorageService.create({
          name: name.trim(),
          description: description.trim(),
          technologies,
          status,
          repoUrl: repoUrl.trim() || undefined,
          demoUrl: demoUrl.trim() || undefined,
        })
        addToast('success', 'Proyecto creado')
      }
      refresh()
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
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
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
                  className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
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
                    className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTech}>Agregar</Button>
                </div>
                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {technologies.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                        {t}
                        <button type="button" onClick={() => removeTech(t)} className="text-neutral-400 hover:text-neutral-600">&times;</button>
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
                  className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                >
                  <option value="draft">Borrador</option>
                  <option value="in_progress">En progreso</option>
                  <option value="completed">Completado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="URL del repositorio" placeholder="https://github.com/..." value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
                <Input label="URL demo" placeholder="https://..." value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
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
