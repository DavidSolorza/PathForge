import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Code2, Database, Cloud, Shield, Brain } from 'lucide-react'
import { useUserStore } from '@core/store'
import { UserService } from '../services'
import type { Skill } from '@shared/types'
import { Card, CardHeader, CardContent } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Progress } from '@shared/components/ui/Progress'
import { LoadingState } from '@shared/components/ui/LoadingState'
import { ErrorState } from '@shared/components/ui/ErrorState'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Button } from '@shared/components/ui/Button'

const skillIcons: Record<string, typeof Code2> = {
  python: Code2,
  node: Code2,
  javascript: Code2,
  typescript: Code2,
  mongodb: Database,
  postgresql: Database,
  sql: Database,
  docker: Cloud,
  aws: Cloud,
  kubernetes: Cloud,
  security: Shield,
  machine_learning: Brain,
  deep_learning: Brain,
  tensorflow: Brain,
  pytorch: Brain,
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const Icon = skillIcons[skill.name.toLowerCase()] || Code2

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card hover>
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 capitalize">
              {skill.name}
            </h3>
            <p className="text-xs text-neutral-400 capitalize">
              {skill.category}
            </p>
          </div>
          <Badge
            variant={
              skill.level === 'expert'
                ? 'success'
                : skill.level === 'advanced'
                  ? 'primary'
                  : skill.level === 'intermediate'
                    ? 'warning'
                    : 'default'
            }
          >
            {skill.level}
          </Badge>
        </CardHeader>
        <CardContent>
          <Progress value={skill.progress} size="sm" showLabel />
          <p className="text-xs text-neutral-400 mt-1">
            {skill.experience} horas de experiencia
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function SkillsPage() {
  const { skills, loading, setSkills, setLoading } = useUserStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await UserService.getSkills()
        setSkills(data)
      } catch {
        setError('Error al cargar habilidades')
      } finally {
        setLoading(false)
      }
    }
    fetchSkills()
  }, [])

  if (loading) return <LoadingState message="Cargando habilidades..." />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  if (skills.length === 0) {
    return (
      <EmptyState
        icon={<Zap className="h-8 w-8" />}
        title="Sin habilidades registradas"
        description="Agrega tus habilidades para recibir recomendaciones personalizadas"
        action={<Button>Agregar habilidad</Button>}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Habilidades</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {skills.length} habilidades registradas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills
          .sort((a, b) => b.progress - a.progress)
          .map((skill, index) => (
            <SkillCard key={skill.id} skill={skill} index={index} />
          ))}
      </div>
    </div>
  )
}
