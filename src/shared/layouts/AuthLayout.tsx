import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { config } from '@core/config'

export function AuthLayout() {
  return (
    <div className="flex min-h-svh">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <a href="/" className="inline-flex items-center gap-2 no-underline">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="text-lg font-semibold text-neutral-900">
                {config.app.name}
              </span>
            </a>
          </motion.div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
