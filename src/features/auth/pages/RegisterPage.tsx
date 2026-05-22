import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, User } from 'lucide-react'
import { AuthService } from '../services'
import { useAuthStore } from '@core/store'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'

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
      <h1 className="text-2xl font-semibold text-neutral-900 text-center mb-1">
        Crear cuenta
      </h1>
      <p className="text-sm text-neutral-500 text-center mb-8">
        Comienza a construir tu ruta de aprendizaje
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
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

        <Button type="submit" loading={loading} fullWidth>
          <UserPlus className="h-4 w-4" />
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Inicia sesion
        </Link>
      </p>
    </motion.div>
  )
}
