import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Map,
  Zap,
  FolderGit2,
  Bot,
  User,
  Menu,
  X,
  ChevronLeft,
  BookOpen,
} from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { config } from '@core/config'
import { useAuthStore, useUIStore } from '@core/store'
import { useToastStore } from '@shared/store/toastStore'
import { ToastContainer } from '@shared/components/ui/Toast'
import { Avatar } from '@shared/components/ui/Avatar'
import { BackgroundAnimation } from '@shared/components/ui/BackgroundAnimation'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Mi Ruta', path: '/learning-path', icon: Map },
  { label: 'Recursos', path: '/resources', icon: BookOpen },
  { label: 'Habilidades', path: '/skills', icon: Zap },
  { label: 'Proyectos', path: '/projects', icon: FolderGit2 },
  { label: 'Asistente IA', path: '/ai-assistant', icon: Bot },
  { label: 'Perfil', path: '/profile', icon: User },
]

export function AppLayout() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const prevPath = useRef('')
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { toasts, dismissToast } = useToastStore()
  const location = useLocation()

  useEffect(() => {
    if (prevPath.current && prevPath.current !== location.pathname) {
      setNavigating(true)
      const timer = setTimeout(() => setNavigating(false), 600)
      return () => clearTimeout(timer)
    }
    prevPath.current = location.pathname
  }, [location.pathname])

  return (
    <div className="flex h-svh bg-neutral-50 text-neutral-900 relative">
      <BackgroundAnimation />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className={cn('fixed top-0 left-0 right-0 z-[60] h-0.5 transition-opacity duration-200', navigating ? 'opacity-100' : 'opacity-0')}>
        <div className="h-full w-full bg-primary-500 animate-nav-bar" />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-neutral-200 bg-white transition-all duration-300 lg:static',
          sidebarOpen ? 'w-56 sm:w-64' : 'w-14 sm:w-16',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-neutral-100 px-4', sidebarOpen ? 'justify-between' : 'justify-center')}>
          {sidebarOpen && (
            <a href="/" className="flex items-center gap-2 no-underline">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-xs font-bold text-white">P</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{config.app.name}</span>
            </a>
          )}
          <button onClick={toggleSidebar} className="hidden rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:block transition-colors">
            <ChevronLeft className={cn('h-4 w-4 transition-transform duration-200', !sidebarOpen && 'rotate-180')} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:hidden transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 sm:space-y-1 p-2 sm:p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 no-underline',
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                  !sidebarOpen && 'justify-center px-2',
                )
              }
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-100 p-3 space-y-2">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <Avatar size="sm" src={user?.avatar} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-neutral-400 truncate">{user?.email || ''}</p>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 sm:h-16 items-center gap-3 sm:gap-4 border-b border-neutral-200 bg-white px-3 sm:px-4 lg:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:hidden transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <button onClick={logout} className="rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
            <span className="hidden sm:inline">Cerrar sesion</span>
            <span className="sm:hidden">Salir</span>
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-8 lg:px-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
