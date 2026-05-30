import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, User, CheckCircle2, Gem } from 'lucide-react'
import { AuthService } from '../services'
import { useAuthStore } from '@core/store'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'

const benefits = [
  'Rutas personalizadas con IA',
  'Progreso y streaks diarios',
  'Repeticion espaciada inteligente',
  'Recursos curados sin publicidad',
  'Asistente IA para tus dudas',
]

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Completa todos los campos')
      return
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const response = await AuthService.register(name.trim(), email.trim(), password)
      setAuth(response.user, response.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar. Intenta de nuevo.')
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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">
          Crear cuenta
        </h1>
        <p className="text-sm text-neutral-500">
          Comienza a construir tu ruta de aprendizaje
        </p>
      </div>

      <div className="mb-8 space-y-2 bg-primary-50/50 rounded-xl border border-primary-100 p-4">
        {benefits.map((b) => (
          <div key={b} className="flex items-center gap-2 text-xs text-neutral-600">
            <Gem className="h-3.5 w-3.5 text-gold shrink-0" />
            {b}
          </div>
        ))}
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
          label="Nombre completo"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="h-4 w-4" />}
        />

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

        <Input
          label="Confirmar contrasena"
          type="password"
          placeholder="********"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="h-4 w-4" />}
        />

        <Button type="submit" loading={loading} fullWidth className="bg-gold text-neutral-900 hover:bg-gold-dark">
          <UserPlus className="h-4 w-4" />
          Crear cuenta gratis
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="font-medium text-gold hover:text-gold-dark transition-colors"
        >
          Inicia sesion
        </Link>
      </p>
    </motion.div>
  )
}
