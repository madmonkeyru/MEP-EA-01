import { StrictMode } from 'react'
import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource-variable/outfit'
import '@fontsource-variable/plus-jakarta-sans'
import './ui-quality.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { AppErrorBoundary } from './components/common/AppErrorBoundary'

const FoundationApp = lazy(() => import('./foundation/FoundationApp').then(m => ({ default: m.FoundationApp })));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><ThemeProvider>
      <Suspense fallback={<p>Cargando…</p>}>
        {window.location.pathname === '/foundation' ? <FoundationApp /> : <App />}
      </Suspense>
    </ThemeProvider></AppErrorBoundary>
  </StrictMode>,
)
