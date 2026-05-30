import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { config } from '@core/config'
import { Sparkles, Shield, Cloud, Code2, Database, Container, GitBranch, Smartphone, Gem } from 'lucide-react'

const bgIcons = [Code2, Database, Container, GitBranch, Smartphone, Shield, Cloud, Sparkles]

export function AuthLayout() {
  return (
    <div className="flex min-h-svh">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-gold-light/5 blur-2xl" />
          {bgIcons.map((Icon, i) => (
            <div
              key={i}
              className="absolute text-gold-light/15 animate-float"
              style={{
                top: `${10 + (i * 12) % 80}%`,
                left: `${10 + (i * 15) % 80}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <Icon size={32 + (i * 8) % 24} />
            </div>
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 backdrop-blur-sm group-hover:bg-gold/30 transition-colors">
              <span className="text-lg font-bold text-gold-light">P</span>
            </div>
            <span className="text-xl font-semibold text-white">
              {config.app.name}
            </span>
          </Link>
          <div className="space-y-6">
            <blockquote className="text-white/80 text-lg leading-relaxed italic">
              "PathForge AI me ayudo a organizar mi aprendizaje y conseguir mi primer trabajo como desarrollador."
            </blockquote>
            <div>
              <div className="text-white font-medium">Carlos M.</div>
              <div className="text-white/50 text-sm">Desarrollador Frontend</div>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-4 w-4 fill-gold text-gold" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Gem className="h-3.5 w-3.5 text-gold" />
              Gratis para siempre. Sin tarjetas.
            </div>
          </div>
          <div className="text-white/30 text-sm">
            <p>Sin tarjeta de credito. Gratis para siempre.</p>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 bg-neutral-50">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 lg:hidden"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 no-underline"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="text-lg font-semibold text-neutral-900">
                {config.app.name}
              </span>
            </Link>
          </motion.div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
