import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './presentation/App'
import { BrowserAudio } from './infrastructure/audio/browserAudio'
import './presentation/i18n'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App audio={new BrowserAudio()} />
  </StrictMode>,
)
