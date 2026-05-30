import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, Gem, Route, TrendingUp } from 'lucide-react'
import { AuthService } from '../services'
import { useAuthStore } from '@core/store'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { useToastStore } from '@shared/store/toastStore'

const highlights = [
  { icon: Route, text: 'Rutas con IA' },
  { icon: TrendingUp, text: 'Progreso real' },
  { icon: Gem, text: 'Recursos curados' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { addToast } = useToastStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Completa todos los campos')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const response = await AuthService.login(email.trim(), password)
      setAuth(response.user, response.token)
      navigate('/dashboard')
    } catch {
      setError('Credenciales invalidas. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const simulatedLogin = async (provider: string) => {
    try {
      setLoading(true)
      setError(null)
      addToast('info', `Iniciando sesion con ${provider}...`)
      const demoResponse = await AuthService.register(`Usuario ${provider}`, `${provider.toLowerCase()}@pathforge.ai`, '123456').catch(() => {
        return AuthService.login(`${provider.toLowerCase()}@pathforge.ai`, '123456')
      })
      setAuth(demoResponse.user, demoResponse.token)
      addToast('success', 'Sesion iniciada correctamente')
      navigate('/dashboard')
    } catch {
      setError(`Error al iniciar sesion con ${provider}.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="text-center mb-5">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
          Iniciar sesion
        </h1>
        <p className="text-sm text-neutral-500">
          Accede a tu ruta de aprendizaje
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-6">
        {highlights.map((h, i) => {
          const Icon = h.icon
          return (
            <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Icon className="h-3 w-3 text-gold" />
              <span className="hidden sm:inline">{h.text}</span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-2.5 mb-5">
        <button
          type="button"
          onClick={() => simulatedLogin('GitHub')}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-surface px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Continuar con GitHub
        </button>
        <button
          type="button"
          onClick={() => simulatedLogin('Google')}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-surface px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>
      </div>

      <div className="relative flex py-2 items-center mb-5">
        <div className="flex-grow border-t border-neutral-200" />
        <span className="flex-shrink mx-4 text-neutral-400 text-xs uppercase">O con email</span>
        <div className="flex-grow border-t border-neutral-200" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}

        <Input
          label="Correo electronico"
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
        />

        <Input
          label="Contrasena"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="h-4 w-4" />}
        />

        <Button type="submit" loading={loading} fullWidth>
          <LogIn className="h-4 w-4" />
          Iniciar sesion
        </Button>

        <button
          type="button"
          onClick={() => simulatedLogin('Demo')}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-transparent px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 transition-all cursor-pointer disabled:opacity-50"
        >
          Acceso rapido sin registro (Demo)
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-neutral-500">
        No tienes cuenta?{' '}
        <Link
          to="/register"
          className="font-medium text-gold hover:text-gold-dark transition-colors"
        >
          Registrate
        </Link>
      </p>
    </motion.div>
  )
}
