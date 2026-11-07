import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource-variable/outfit'
import '@fontsource-variable/plus-jakarta-sans'
import './ui-quality.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { AppErrorBoundary } from './components/common/AppErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><ThemeProvider>
      <App />
    </ThemeProvider></AppErrorBoundary>
  </StrictMode>,
)
