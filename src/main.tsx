import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import i18n from '@/i18n'
import './index.css'
import App from './App.tsx'
import { installGlobalFailureHandlers } from '@/bootstrapFailure'
import { installReplayDevTools } from '@game/replay-run'

installGlobalFailureHandlers()
installReplayDevTools()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error(i18n.t('errors.rootMissing'))
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
