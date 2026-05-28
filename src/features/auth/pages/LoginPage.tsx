import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock } from 'lucide-react'
import { AuthService } from '../services'
import { useAuthStore } from '@core/store'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
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

  const handleQuickDemo = async () => {
    try {
      setLoading(true)
      setError(null)
      const demoResponse = await AuthService.register('Estudiante Demo', 'demo@pathforge.ai', '123456').catch(() => {
        return AuthService.login('demo@pathforge.ai', '123456')
      })
      setAuth(demoResponse.user, demoResponse.token)
      navigate('/dashboard')
    } catch {
      setError('Error al iniciar el modo demo.')
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
      <h1 className="text-2xl font-semibold text-neutral-900 text-center mb-1">
        Iniciar sesion
      </h1>
      <p className="text-sm text-neutral-500 text-center mb-8">
        Accede a tu ruta de aprendizaje
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
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

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-neutral-200"></div>
          <span className="flex-shrink mx-4 text-neutral-400 text-xs uppercase">O</span>
          <div className="flex-grow border-t border-neutral-200"></div>
        </div>

        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          Acceso rápido (Demo)
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        ¿No tienes cuenta?{' '}
        <Link
          to="/register"
          className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Registrate
        </Link>
      </p>
    </motion.div>
  )
}
