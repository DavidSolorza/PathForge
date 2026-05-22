import { type ReactNode, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthService } from '@features/auth/services'
import { UserStorageService } from '@features/profile/services/UserStorageService'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    AuthService.seedDemoUser()
    UserStorageService.getStats()
    UserStorageService.getActivity()
  }, [])

  return <BrowserRouter>{children}</BrowserRouter>
}
