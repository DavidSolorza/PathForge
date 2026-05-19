import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Route,
  BarChart3,
  Bot,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { config } from '@core/config'

const features = [
  {
    icon: Bot,
    title: 'Recomendaciones IA',
    description:
      'Análisis inteligente de tu progreso para sugerir los siguientes pasos más relevantes.',
  },
  {
    icon: Route,
    title: 'Rutas dinámicas',
    description:
      'Roadmaps personalizados que se adaptan a tu ritmo y objetivos de aprendizaje.',
  },
  {
    icon: BarChart3,
    title: 'Progreso inteligente',
    description:
      'Visualiza tu evolución con métricas claras y seguimiento detallado de habilidades.',
  },
  {
    icon: Layers,
    title: 'Proyectos prácticos',
    description:
      'Aplica lo aprendido con proyectos guiados que refuerzan tu conocimiento.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Define tu objetivo',
    description: 'Elige qué quieres aprender: Python, IA, Ciberseguridad y más.',
  },
  {
    number: '02',
    title: 'Sigue tu ruta',
    description: 'Recibe un roadmap personalizado con etapas claras y recursos.',
  },
  {
    number: '03',
    title: 'Construye proyectos',
    description: 'Aplica conocimientos con proyectos prácticos y reales.',
  },
  {
    number: '04',
    title: 'Evoluciona',
    description: 'La IA analiza tu progreso y ajusta tu camino constantemente.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-svh bg-white">
      <header className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2 no-underline">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="text-lg font-semibold text-neutral-900">
                {config.app.name}
              </span>
            </a>
            <nav className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors no-underline"
              >
                Iniciar sesión
              </Link>
              <Link to="/register">
                <Button size="sm">Empezar gratis</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-neutral-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700"
              >
                <Sparkles className="h-4 w-4" />
                Tu guía de aprendizaje con IA
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
                {config.app.tagline}
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-neutral-500 max-w-2xl mx-auto">
                PathForge AI analiza tu progreso, habilidades y proyectos para
                construir rutas de aprendizaje inteligentes y personalizadas.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link to="/register">
                  <Button size="lg">
                    Empezar ahora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Explorar rutas
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary-50/50 blur-3xl" />
            <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-primary-50/30 blur-3xl" />
          </div>
        </section>

        <section className="py-24 border-b border-neutral-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Cómo funciona
              </h2>
              <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">
                Cuatro pasos simples para transformar tu aprendizaje
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  <span className="text-5xl font-bold text-primary-100">
                    {step.number}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-neutral-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 border-b border-neutral-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Todo lo que necesitas
              </h2>
              <p className="mt-4 text-lg text-neutral-500 max-w-2xl mx-auto">
                Una plataforma completa para tu desarrollo profesional
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 hover:shadow-lg hover:border-neutral-300 transition-all duration-300">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600 mb-4">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                ¿Estás listo para transformar tu aprendizaje?
              </h2>
              <p className="mt-4 text-lg text-neutral-500">
                Únete a PathForge AI y descubre un camino más inteligente para
                alcanzar tus metas profesionales.
              </p>
              <div className="mt-10">
                <Link to="/register">
                  <Button size="lg">
                    Comenzar gratis
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-100 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-400">
              &copy; {new Date().getFullYear()} {config.app.name}. Todos los derechos
              reservados.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors no-underline"
              >
                Términos
              </a>
              <a
                href="#"
                className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors no-underline"
              >
                Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
