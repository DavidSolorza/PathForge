import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock } from 'lucide-react'
import { loginSchema, type LoginInput } from '../schemas'
import { AuthService } from '../services'
import { useAuthStore } from '@core/store'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null)
      const response = await AuthService.login(data.email, data.password)
      setAuth(response.user, response.token)
      navigate('/dashboard')
    } catch {
      setError('Credenciales inválidas. Intenta de nuevo.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h1 className="text-2xl font-semibold text-neutral-900 text-center mb-1">
        Iniciar sesión
      </h1>
      <p className="text-sm text-neutral-500 text-center mb-8">
        Accede a tu ruta de aprendizaje
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 animate-fade-in">
            {error}
          </div>
        )}

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" loading={isSubmitting} fullWidth>
          <LogIn className="h-4 w-4" />
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        ¿No tienes cuenta?{' '}
        <Link
          to="/register"
          className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Regístrate
        </Link>
      </p>
    </motion.div>
  )
}
