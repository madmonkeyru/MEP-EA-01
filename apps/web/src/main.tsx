import { StrictMode } from 'react'
import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource-variable/outfit'
import '@fontsource-variable/plus-jakarta-sans'
import './ui-quality.css'
import { ThemeProvider } from './context/ThemeContext'
import { AppErrorBoundary } from './components/common/AppErrorBoundary'

// Sole production learner foundation entrypoint
const FoundationApp = lazy(() => import('./foundation/FoundationApp').then(m => ({ default: m.FoundationApp })));

// Quarantined legacy POC shell for reference / backward compatibility
const LegacyApp = lazy(() => import('./App.tsx').then(m => ({ default: m.App })));

const isLegacyRoute = typeof window !== 'undefined' && (
  window.location.pathname.startsWith('/legacy') || window.location.hash.startsWith('#legacy')
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><ThemeProvider>
      <Suspense fallback={<p className="p-6 text-slate-500">Cargando…</p>}>
        {isLegacyRoute ? <LegacyApp /> : <FoundationApp />}
      </Suspense>
    </ThemeProvider></AppErrorBoundary>
  </StrictMode>,
)
