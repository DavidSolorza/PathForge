import { lazy, Suspense, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'
import { AuthLayout } from '@shared/layouts/AuthLayout'
import { AppLayout } from '@shared/layouts/AppLayout'
import { LoadingState } from '@shared/components/ui/LoadingState'

const LandingPage = lazy(() =>
  import('@features/recommendations/pages/LandingPage').then((m) => ({
    default: m.LandingPage,
  })),
)

const LoginPage = lazy(() =>
  import('@features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)

const RegisterPage = lazy(() =>
  import('@features/auth/pages/RegisterPage').then((m) => ({
    default: m.RegisterPage,
  })),
)

const DashboardPage = lazy(() =>
  import('@features/learning-path/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)

const LearningPathPage = lazy(() =>
  import('@features/learning-path/pages/LearningPathPage').then((m) => ({
    default: m.LearningPathPage,
  })),
)

const SkillsPage = lazy(() =>
  import('@features/profile/pages/SkillsPage').then((m) => ({ default: m.SkillsPage })),
)

const ProjectsPage = lazy(() =>
  import('@features/projects/pages/ProjectsPage').then((m) => ({
    default: m.ProjectsPage,
  })),
)

const AIAssistantPage = lazy(() =>
  import('@features/recommendations/pages/AIAssistantPage').then((m) => ({
    default: m.AIAssistantPage,
  })),
)

const ProfilePage = lazy(() =>
  import('@features/profile/pages/ProfilePage').then((m) => ({
    default: m.ProfilePage,
  })),
)

function SuspenseWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingState message="Cargando página..." />}>
      {children}
    </Suspense>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SuspenseWrapper><LandingPage /></SuspenseWrapper>} />

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <SuspenseWrapper>
                <LoginPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/register"
            element={
              <SuspenseWrapper>
                <RegisterPage />
              </SuspenseWrapper>
            }
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <SuspenseWrapper>
                <DashboardPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/learning-path"
            element={
              <SuspenseWrapper>
                <LearningPathPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/skills"
            element={
              <SuspenseWrapper>
                <SkillsPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/projects"
            element={
              <SuspenseWrapper>
                <ProjectsPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <SuspenseWrapper>
                <AIAssistantPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/profile"
            element={
              <SuspenseWrapper>
                <ProfilePage />
              </SuspenseWrapper>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
