import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import i18n from '@/i18n'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-900.css'
import './index.css'
import App from './App.tsx'
import { installGlobalFailureHandlers } from '@/bootstrapFailure'

installGlobalFailureHandlers()
if (import.meta.env.DEV) {
  void import('@/session/replayTools').then(({ installReplayDevTools }) => {
    installReplayDevTools()
  })
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error(i18n.t('errors.rootMissing'))
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
