import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { syncScreenScale } from './utils/screenScale'
import { BROWSER_LANGUAGE, t } from './utils/browserLanguage'

syncScreenScale()
// Langue du document et titre d'onglet alignes sur l'interface (index.html : francais par defaut).
document.documentElement.lang = BROWSER_LANGUAGE
document.title = t('Grimoire de sorts', 'Spell grimoire')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
