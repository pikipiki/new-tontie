import { AppProvider } from '@/providers/AppProvider'
import { GamePage } from '@pages/GamePage/GamePage'

function App() {
  return (
    <AppProvider>
      <GamePage />
    </AppProvider>
  )
}

export default App
