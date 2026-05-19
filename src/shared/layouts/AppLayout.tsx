import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
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
} from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { config } from '@core/config'
import { useAuthStore } from '@core/store'
import { Avatar } from '@shared/components/ui/Avatar'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Mi Ruta', path: '/learning-path', icon: Map },
  { label: 'Habilidades', path: '/skills', icon: Zap },
  { label: 'Proyectos', path: '/projects', icon: FolderGit2 },
  { label: 'Asistente IA', path: '/ai-assistant', icon: Bot },
  { label: 'Perfil', path: '/profile', icon: User },
]

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="flex h-svh bg-neutral-50">
      <AnimatePresence mode="wait">
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
          sidebarOpen ? 'w-64' : 'w-16',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-neutral-100 px-4',
            sidebarOpen ? 'justify-between' : 'justify-center',
          )}
        >
          {sidebarOpen && (
            <a href="/" className="flex items-center gap-2 no-underline">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-xs font-bold text-white">P</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">
                {config.app.name}
              </span>
            </a>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:block transition-colors"
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                !sidebarOpen && 'rotate-180',
              )}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:hidden transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 no-underline',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                  !sidebarOpen && 'justify-center px-2',
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-100 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <Avatar size="sm" src={user?.avatar} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user?.name || 'Usuario'}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar size="sm" src={user?.avatar} />
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-4 border-b border-neutral-200 bg-white px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <button
            onClick={logout}
            className="rounded-lg px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
