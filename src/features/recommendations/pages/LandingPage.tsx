import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Route,
  BarChart3,
  Bot,
  Layers,
  ChevronRight,
  Target,
  Brain,
  Zap,
  TrendingUp,
  BookOpen,
  Code2,
  Shield,
  Cloud,
  Smartphone,
  Database,
  GitBranch,
  Container,
  ChevronDown,
  CheckCircle2,
  Star,
  Gem,
} from 'lucide-react'
import { Button } from '@shared/components/ui/Button'
import { config } from '@core/config'

const features = [
  {
    icon: Bot,
    title: 'IA que te conoce',
    description:
      'La IA analiza tu progreso, proyectos y habilidades para decirte exactamente que sigue. No mas dudas sobre tu siguiente paso.',
    items: ['Analisis de progreso en tiempo real', 'Recomendaciones personalizadas', 'Deteccion de gaps en tu conocimiento'],
  },
  {
    icon: Route,
    title: 'Rutas inteligentes',
    description:
      'Rutas de aprendizaje personalizadas que se adaptan a tu ritmo. Cada etapa construye sobre la anterior, desde cero hasta dominio.',
    items: ['4 etapas progresivas por tecnologia', 'Contenido educativo integrado', 'Recursos con URLs reales curadas'],
  },
  {
    icon: BarChart3,
    title: 'Analiza tu progreso',
    description:
      'Evalua tu estado actual, descubre si estas listo para un proyecto y recibe recomendaciones precisas para seguir avanzando.',
    items: ['Streaks diarios de estudio', 'Repeticion espaciada inteligente', 'Dashboard con metricas claras'],
  },
  {
    icon: Layers,
    title: 'Multi-stack',
    description:
      'Frontend, Backend, DevOps, IA, Ciberseguridad, Mobile... cualquier tecnologia que quieras dominar.',
    items: ['+50 tecnologias disponibles', 'Rutas separadas por tecnologia', 'Recursos curados por categoria'],
  },
]

const steps = [
  {
    icon: Target,
    title: 'Define tu meta',
    description: 'Python, React, IA, Ciberseguridad, DevOps... Tu eliges que tecnologia aprender.',
  },
  {
    icon: Brain,
    title: 'Analisis IA',
    description: 'La IA identifica tus conocimientos previos y prerrequisitos, luego construye una ruta desde cero.',
  },
  {
    icon: BookOpen,
    title: 'Sigue tu ruta',
    description: 'Etapas claras para aprender a tu ritmo con recursos y autores tech recomendados.',
  },
  {
    icon: Zap,
    title: 'Evoluciona',
    description: 'La IA responde: "Que sigue?", "Estas listo para un proyecto?", "Que tecnologia te falta?".',
  },
]

const technologies = [
  { name: 'Python', icon: Code2 },
  { name: 'JavaScript', icon: Code2 },
  { name: 'TypeScript', icon: Code2 },
  { name: 'React', icon: Code2 },
  { name: 'Node.js', icon: Code2 },
  { name: 'HTML/CSS', icon: Code2 },
  { name: 'SQL', icon: Database },
  { name: 'Docker', icon: Container },
  { name: 'Git', icon: GitBranch },
  { name: 'Ciberseguridad', icon: Shield },
  { name: 'Cloud', icon: Cloud },
  { name: 'Mobile', icon: Smartphone },
]

const testimonials = [
  {
    name: 'Carlos M.',
    role: 'Desarrollador Frontend',
    text: 'PathForge me ayudo a organizar mi aprendizaje de React. La IA me dijo exactamente que me faltaba para sentirme listo para proyectos reales.',
    rating: 5,
  },
  {
    name: 'Ana G.',
    role: 'Estudiante de Ingenieria',
    text: 'Venia saltando entre tutoriales sin rumbo. Con PathForge segui una ruta clara y en 3 meses consegui mi primer trabajo como dev.',
    rating: 5,
  },
  {
    name: 'Miguel R.',
    role: 'Autodidacta',
    text: 'Lo mejor es el asistente IA. Le pregunto "que sigue?" y siempre me da una respuesta precisa basada en mi progreso real.',
    rating: 5,
  },
]

const faqs = [
  {
    q: 'Como funciona la generacion de rutas?',
    a: 'Solo escribis que queres aprender (ej: "React con TypeScript") y la IA construye una ruta personalizada con etapas, topicos, contenido educativo y recursos reales. Opcionalmente podes ajustar tu tiempo semanal, nivel y preferencia de proyectos.',
  },
  {
    q: 'Necesito conocimientos previos?',
    a: 'No. La IA se adapta a tu nivel actual, ya seas principiante total o desarrollador avanzado. Cada ruta se construye desde tu punto de partida.',
  },
  {
    q: 'Es realmente gratuito?',
    a: 'Si. PathForge AI es completamente gratuito. Solo necesitas una clave de Gemini API (gratuita tambien) para usar la IA en vivo, o podes usar el modo simulacion offline sin clave.',
  },
  {
    q: 'Puedo aprender varias tecnologias a la vez?',
    a: 'Si. Podes generar rutas separadas para cada tecnologia y alternar entre ellas. El dashboard te muestra el progreso general de todas tus rutas activas.',
  },
  {
    q: 'Que son los streaks y revisiones?',
    a: 'Los streaks registran tu consistencia diaria de estudio. Las revisiones usan repeticion espaciada (1, 3, 7, 14, 30 dias) para que repases topicos clave en el momento optimo y no los olvides.',
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-gold text-gold" />
      ))}
    </div>
  )
}

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-svh bg-surface">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-2 no-underline group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 group-hover:bg-primary-700 transition-colors">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="text-lg font-semibold text-neutral-900">
                {config.app.name}
              </span>
            </a>
            <nav className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors no-underline"
              >
                Iniciar sesion
              </Link>
              <Link to="/register">
                <Button size="sm">Empezar gratis</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-neutral-200 pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mx-auto max-w-4xl text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-gold-light/60 bg-gold-light/20 px-4 py-1.5 text-sm font-medium text-gold-dark"
              >
                <Gem className="h-4 w-4" />
                Tu guia de programacion con IA
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
                Construye tu ruta.{' '}
                <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
                  Evoluciona tus habilidades.
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-neutral-500 max-w-3xl mx-auto">
                {config.app.name} genera rutas inteligentes de aprendizaje personalizadas con IA,
                analiza tu progreso en tiempo real y te dice exactamente que sigue.
                Deja de saltar entre tutoriales sin rumbo.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link to="/register">
                  <Button size="lg" className="bg-gold text-neutral-900 hover:bg-gold-dark shadow-lg shadow-gold/20 hover:shadow-gold/30">
                    Empezar ahora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-neutral-300 hover:border-primary-300 hover:text-primary-700">
                    Explorar rutas
                  </Button>
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-8 text-sm text-neutral-400 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-primary-500" />
                Sin registro de tarjeta. Gratis para siempre.
              </motion.p>
            </motion.div>
          </div>

          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary-50/60 blur-3xl animate-pulse-soft" style={{ animationDelay: '0s' }} />
            <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-gold-light/20 blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-primary-100/30 blur-3xl animate-float" />
            <div className="absolute top-2/3 right-1/4 h-48 w-48 rounded-full bg-gold-light/15 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '50+', label: 'Tecnologias soportadas' },
                { value: '4', label: 'Etapas por ruta' },
                { value: '20', label: 'Topicos por tecnologia' },
                { value: '100%', label: 'Gratuito' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  <div className="text-3xl sm:text-4xl font-bold text-primary-600">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 border-b border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Como funciona
              </h2>
              <p className="mt-3 text-lg text-neutral-500 max-w-2xl mx-auto">
                Cuatro pasos simples para transformar tu aprendizaje
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="relative text-center group"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-3 group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-neutral-900 shadow-md">
                        0{i + 1}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-b border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Todo lo que necesitas
              </h2>
              <p className="mt-3 text-lg text-neutral-500 max-w-2xl mx-auto">
                Una plataforma completa para tu desarrollo profesional como programador
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
                    <div className="group rounded-xl border border-neutral-200 bg-surface p-5 hover:shadow-xl hover:border-gold-light/60 hover:-translate-y-1 transition-all duration-300 h-full">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600 group-hover:bg-gold-light/30 group-hover:text-gold-dark transition-colors duration-300 mb-3">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-neutral-500 leading-relaxed mb-3">
                        {feature.description}
                      </p>
                      <ul className="space-y-1.5">
                        {feature.items.map((item) => (
                          <li key={item} className="flex items-center gap-1.5 text-xs text-neutral-400">
                            <CheckCircle2 className="h-3 w-3 text-primary-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Why PathForge vs Traditional */}
        <section className="py-16 border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Tutorial Hell vs PathForge
              </h2>
              <p className="mt-3 text-lg text-neutral-500 max-w-2xl mx-auto">
                Deja de saltar entre cursos sin rumbo
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-xl border border-red-200 bg-red-50/50 p-5"
              >
                <h3 className="text-base font-semibold text-red-700 mb-3">Tutorial Hell</h3>
                <ul className="space-y-2">
                  {[
                    'Saltas entre cursos sin progresar',
                    'No sabes que aprender despues',
                    'Olvidas lo que viste la semana pasada',
                    'Sin retroalimentacion sobre tu avance',
                    'Recursos desorganizados y sin curacion',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-red-600">
                      <span className="mt-0.5 text-red-400 font-bold">x</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-xl border border-primary-200 bg-primary-50/50 p-5"
              >
                <h3 className="text-base font-semibold text-primary-700 mb-3">PathForge AI</h3>
                <ul className="space-y-2">
                  {[
                    'Ruta personalizada generada por IA',
                    'Siguiente paso siempre claro',
                    'Repeticion espaciada para no olvidar',
                    'Analisis de progreso en tiempo real',
                    'Recursos curados con URLs reales',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-primary-600">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technologies grid */}
        <section className="py-16 border-b border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Tecnologias disponibles
              </h2>
              <p className="mt-3 text-lg text-neutral-500 max-w-2xl mx-auto">
                Elige entre mas de 50 tecnologias para aprender
              </p>
            </motion.div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3">
              {technologies.map((tech, i) => {
                const Icon = tech.icon
                return (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-surface p-3 hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-md transition-all duration-200"
                  >
                    <Icon className="h-5 w-5 text-primary-500" />
                    <span className="text-xs font-medium text-neutral-700">{tech.name}</span>
                  </motion.div>
                )
              })}
            </div>
            <p className="mt-6 text-center text-sm text-neutral-400">
              Y muchas mas... +50 tecnologias entre Frontend, Backend, DevOps, IA, Ciberseguridad, Cloud y Mobile
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Lo que dicen los usuarios
              </h2>
              <p className="mt-3 text-lg text-neutral-500 max-w-2xl mx-auto">
                Estudiantes como vos ya estan usando PathForge AI
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="rounded-xl border border-neutral-200 bg-surface p-5 hover:shadow-lg hover:border-gold-light/50 transition-all duration-300"
                >
                  <StarRating count={t.rating} />
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                    "{t.text}"
                  </p>
                  <div className="mt-3 pt-3 border-t border-neutral-200">
                    <div className="text-sm font-semibold text-neutral-900">{t.name}</div>
                    <div className="text-xs text-neutral-400">{t.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 border-b border-neutral-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                Preguntas frecuentes
              </h2>
              <p className="mt-3 text-lg text-neutral-500">
                Todo lo que necesitas saber sobre PathForge AI
              </p>
            </motion.div>

            <div className="space-y-2.5">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="rounded-xl border border-neutral-200 bg-surface overflow-hidden hover:border-neutral-300 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    {faq.q}
                    <ChevronDown
                      className={`h-4 w-4 text-neutral-400 transition-all duration-200 shrink-0 ${
                        openFaq === i ? 'rotate-180 text-gold' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3.5 text-sm text-neutral-500 leading-relaxed border-t border-neutral-200 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <div className="rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-10 sm:p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-gold-light/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary-500/20 blur-3xl" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    Estas listo para transformar tu aprendizaje?
                  </h2>
                  <p className="mt-3 text-lg text-primary-100">
                    Unete a PathForge AI y descubre un camino mas inteligente para
                    alcanzar tus metas profesionales.
                  </p>
                  <div className="mt-8">
                    <Link to="/register">
                      <Button
                        size="lg"
                        className="bg-gold text-neutral-900 hover:bg-gold-dark shadow-lg shadow-gold/20"
                      >
                        Comenzar gratis
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <a href="/" className="flex items-center gap-2 no-underline mb-3 group">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 group-hover:bg-primary-700 transition-colors">
                  <span className="text-xs font-bold text-white">P</span>
                </div>
                <span className="text-base font-semibold text-neutral-900">
                  {config.app.name}
                </span>
              </a>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tu guia IA para dominar programacion. Rutas personalizadas, progreso en tiempo real y recursos curados.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-900 mb-3 uppercase tracking-wider">Plataforma</h4>
              <ul className="space-y-1.5">
                {['Dashboard', 'Mi Ruta', 'Asistente IA', 'Recursos'].map((item) => (
                  <li key={item}>
                    <Link to="/login" className="text-xs text-neutral-400 hover:text-primary-600 transition-colors no-underline">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-900 mb-3 uppercase tracking-wider">Tecnologias</h4>
              <ul className="space-y-1.5">
                {['Python', 'JavaScript', 'React', 'TypeScript', 'Node.js'].map((item) => (
                  <li key={item}>
                    <Link to="/register" className="text-xs text-neutral-400 hover:text-primary-600 transition-colors no-underline">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-neutral-900 mb-3 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-1.5">
                {['Terminos', 'Privacidad', 'Contacto'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs text-neutral-400 hover:text-primary-600 transition-colors no-underline">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-neutral-400">
                &copy; {new Date().getFullYear()} {config.app.name}. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Gem className="h-3 w-3 text-gold" />
                  Hecho para autodidactas
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span>Sin tarjetas</span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span>Gratis siempre</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
