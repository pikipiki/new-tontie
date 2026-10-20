import { AppErrorBoundary } from '@components/AppErrorBoundary'
import { SkipToGameLink } from '@components/Tontie3D/SkipToGameLink'
import { AppProvider } from '@/providers/AppProvider'
import { GamePage } from '@pages/GamePage/GamePage'

function App() {
  return (
    <AppErrorBoundary>
      <AppProvider>
        <SkipToGameLink />
        <GamePage />
      </AppProvider>
    </AppErrorBoundary>
  )
}

export default App
