import { AppProviders } from '@core/providers'
import { AppRouter } from '@core/routes'
import { ErrorBoundary } from '@shared/components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App
