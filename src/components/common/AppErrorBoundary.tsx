import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Reload also clears React.lazy's cached rejection after a failed chunk download. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application render failed', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="page-width py-8" role="alert">
      <h1>No pudimos abrir esta página</h1>
      <p>Reintenta la carga. Tu historial guardado se conserva en este navegador.</p>
      <div className="action-row">
        <button type="button" className="primary-button" onClick={() => window.location.reload()}>Reintentar carga</button>
        <a className="secondary-button" href="#/" onClick={event => { event.preventDefault(); window.location.hash = '/'; window.location.reload(); }}>Volver al inicio</a>
      </div>
    </main>;
  }
}
