import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Calendar, Route, Zap, Clock, Target, Save, Edit3, X, Key, Bot, Eye, EyeOff, Check, Loader2 } from 'lucide-react'
import { useAuthStore, usePathStore, useStatsStore } from '@core/store'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { AiService } from '@features/recommendations/services/AiService'
import { CATEGORIES } from '@shared/types'
import { Card, CardHeader, CardContent } from '@shared/components/ui/Card'
import { Avatar } from '@shared/components/ui/Avatar'
import { Badge } from '@shared/components/ui/Badge'
import { Progress } from '@shared/components/ui/Progress'
import { Button } from '@shared/components/ui/Button'
import { formatDate } from '@shared/lib/utils'
import { useToastStore } from '@shared/store/toastStore'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { stats, setStats } = useStatsStore()
  const { paths, setPaths } = usePathStore()
  const addToast = useToastStore((s) => s.addToast)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('pathforge_gemini_api_key') || '')
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [tested, setTested] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)

  const saveApiKey = () => {
    const key = apiKey.trim()
    if (!key) {
      localStorage.removeItem('pathforge_gemini_api_key')
      addToast('info', 'Clave API removida. Usando modo simulado.')
    } else {
      localStorage.setItem('pathforge_gemini_api_key', key)
      addToast('success', 'Clave API de Gemini guardada correctamente')
    }
  }

  const testApiKey = async () => {
    const key = apiKey.trim()
    if (!key) {
      addToast('warning', 'Ingresa una clave para probar')
      return
    }
    setTesting(true)
    setTested(true)
    try {
      const isOk = await AiService.verifyApiKey(key)
      setTestSuccess(isOk)
      if (isOk) {
        addToast('success', '¡Conexión exitosa con la IA de Gemini!')
      } else {
        addToast('error', 'Error al validar la clave API. Revisa e intenta de nuevo.')
      }
    } catch {
      setTestSuccess(false)
      addToast('error', 'Ocurrió un error inesperado al conectar')
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    try {
      setPaths(PathStorageService.getAll())
      setStats(UserStorageService.getStats())
    } catch (e) {
      console.error('Error loading profile data:', e)
    }
  }, [])

  const startEditing = () => {
    setEditName(user?.name || '')
    setEditBio(user?.bio || '')
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setEditName('')
    setEditBio('')
  }

  const saveProfile = async () => {
    if (!editName.trim()) {
      addToast('warning', 'El nombre no puede estar vacio')
      return
    }
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      updateUser({ name: editName.trim(), bio: editBio.trim() })
      addToast('success', 'Perfil actualizado')
      setEditing(false)
    } catch {
      addToast('error', 'Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const totalTopics = paths.reduce((sum, p) => sum + p.stages.flatMap((s) => s.topics).length, 0)
  const completedTopics = paths.reduce((sum, p) => sum + p.stages.flatMap((s) => s.topics).filter((t) => t.completed).length, 0)
  const favoriteCat = CATEGORIES.find((c) => c.value === stats.favoriteCategory)

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar size="xl" src={user?.avatar} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h1 className="text-2xl font-semibold text-neutral-900">{user?.name || 'Estudiante'}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    {user?.email && (
                      <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                        <Mail className="h-4 w-4" /> {user.email}
                      </span>
                    )}
                    {user?.createdAt && (
                      <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                        <Calendar className="h-4 w-4" /> Miembro desde {formatDate(user.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
                {!editing && (
                  <Button variant="outline" size="sm" icon={<Edit3 className="h-4 w-4" />} onClick={startEditing}>
                    Editar perfil
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="mt-6 space-y-4 max-w-lg">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-700">Nombre</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-700">Correo</label>
                    <input
                      value={user?.email || ''}
                      disabled
                      className="block w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-neutral-400">El correo no se puede cambiar</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-700">Biografia</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      maxLength={300}
                      className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                      placeholder="Cuenta brevemente quien eres..."
                    />
                    <p className="text-xs text-neutral-400 text-right">{editBio.length}/300</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={saveProfile} loading={saving} icon={<Save className="h-4 w-4" />}>Guardar</Button>
                    <Button variant="ghost" icon={<X className="h-4 w-4" />} onClick={cancelEditing}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                user?.bio && <p className="mt-4 text-sm text-neutral-600">{user.bio}</p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Route className="h-5 w-5" />} label="Rutas creadas" value={String(paths.length)} />
        <StatCard icon={<Zap className="h-5 w-5" />} label="Temas completados" value={String(completedTopics)} />
        <StatCard icon={<Target className="h-5 w-5" />} label="Progreso global" value={`${stats.totalProgress ?? 0}%`} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Dias activo" value={String(stats.activeDays ?? 0)} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Progreso global</h2>
        <Progress value={stats.totalProgress} size="lg" showLabel />
        <p className="text-xs text-neutral-400 mt-2">{completedTopics} de {totalTopics} temas completados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favoriteCat ? (
          <Card>
            <CardHeader>
              <Target className="h-5 w-5 text-primary-600" />
              <h2 className="text-sm font-semibold text-neutral-900">Categoría favorita</h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{favoriteCat.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{favoriteCat.label}</p>
                  <p className="text-xs text-neutral-400">Área con más rutas creadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <Target className="h-5 w-5 text-primary-600" />
              <h2 className="text-sm font-semibold text-neutral-900">Categoría favorita</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-500">Crea tu primera ruta de aprendizaje para ver tu categoría favorita aquí.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <Bot className="h-5 w-5 text-primary-600 animate-pulse" />
            <h2 className="text-sm font-semibold text-neutral-900">Configuración de Inteligencia Artificial</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-neutral-500 leading-relaxed">
              Ingresa tu clave API de Gemini para habilitar el mentor por IA en tiempo real. Consigue una clave gratis en{' '}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline font-medium"
              >
                Google AI Studio
              </a>.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-700">Clave API de Gemini</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Key className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="block w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button size="sm" onClick={saveApiKey} icon={<Save className="h-3.5 w-3.5" />}>
                Guardar clave
              </Button>
              <Button size="sm" variant="outline" onClick={testApiKey} loading={testing} icon={!testing && <Zap className="h-3.5 w-3.5" />}>
                Probar conexión
              </Button>
            </div>

            {tested && (
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                testSuccess
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                {testSuccess ? (
                  <>
                    <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Conexión exitosa. ¡La IA está lista para guiarte!</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 flex-shrink-0 text-red-600" />
                    <span>Error de conexión. Verifica la clave ingresada.</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {paths.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Rutas creadas</h2>
          <div className="space-y-3">
            {paths.map((p) => {
              const cat = CATEGORIES.find((c) => c.value === p.category)
              return (
                <Card key={p.id}>
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{cat?.emoji || '📚'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">{p.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={p.progress} size="sm" className="flex-1 max-w-[200px]" />
                        <span className="text-xs text-neutral-500">{p.progress}%</span>
                      </div>
                    </div>
                    <Badge variant={p.difficulty === 'beginner' ? 'default' : p.difficulty === 'intermediate' ? 'warning' : 'primary'} size="sm">
                      {p.difficulty === 'beginner' ? 'Principiante' : 'Intermedio'}
                    </Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">{icon}</div>
          <div>
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="text-lg font-semibold text-neutral-900">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
