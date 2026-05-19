import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, User } from 'lucide-react'
import { registerSchema, type RegisterInput } from '../schemas'
import { AuthService } from '../services'
import { useAuthStore } from '@core/store'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      setError(null)
      const response = await AuthService.register(data.name, data.email, data.password)
      setAuth(response.user, response.token)
      navigate('/dashboard')
    } catch {
      setError('Error al registrar. Intenta de nuevo.')
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 animate-fade-in">
            {error}
          </div>
        )}

        <Input
          label="Nombre completo"
          placeholder="Tu nombre"
          icon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

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

        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" loading={isSubmitting} fullWidth>
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
          Inicia sesión
        </Link>
      </p>
    </motion.div>
  )
}
