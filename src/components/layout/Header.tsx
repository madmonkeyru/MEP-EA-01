import { useEffect, useRef, useState } from 'react';
import type { User } from '../../types';
import { dataService } from '../../services/dataService';
import { storageService } from '../../services/storageService';
import { AuthModal } from '../auth/AuthModal';
import { ThemeToggle } from '../common/ThemeToggle';
export function Header({ currentUser, onUserChanged, onNavigateHome, currentView = 'landing', onProgramChange, onOpenHelper }: {
  currentUser: User | null; onUserChanged: (user: User | null) => void; onNavigateHome: () => void;
  currentView?: string; onProgramChange?: (id: string) => void; onOpenHelper?: () => void;
}) {
  const [profile, setProfile] = useState(false);
  const [program, setProgram] = useState(dataService.getCurrentProgramId());
  const header = useRef<HTMLElement>(null);
  useEffect(() => dataService.subscribe(() => setProgram(dataService.getCurrentProgramId())), []);
  useEffect(() => {
    const measure = () => document.documentElement.style.setProperty('--app-header-height', (header.current?.getBoundingClientRect().height || 80) + 'px');
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }
    const observer = new ResizeObserver(measure); if (header.current) observer.observe(header.current); return () => observer.disconnect();
  }, []);
  return <><header ref={header} className="ui-header app-header"><div className="page-width flex flex-wrap items-center justify-between gap-2 py-1">
    <a href="#/" onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey) { event.preventDefault(); onNavigateHome(); } }} className="brand-link"><img className="brand-logo" src="/logo_yiguirro_cr_high_fidelity.svg" alt="Yigüirro de Costa Rica" /><div><strong>MEP-EA-01</strong><span>Educación Abierta Digital</span></div></a>
    <nav aria-label="Navegación principal" className="action-row">
      {['framework', 'hub', 'resources', 'results'].includes(currentView) && <label className="header-program"><select title="Cambiar programa de estudio" value={program} onChange={event => onProgramChange?.(event.target.value)}>{dataService.getPrograms().map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
      <a href="#/programas" className="header-link">Programas</a>
      {onOpenHelper && <button onClick={onOpenHelper} className="header-link">Guía y recursos</button>}
      <ThemeToggle />
      {currentUser ? <><span className="text-sm">{currentUser.name} · Perfil local</span><button className="header-link" onClick={() => { if (storageService.setCurrentUser(null)) onUserChanged(null); }}>Usar modo invitado</button></> : <button className="header-link" onClick={() => setProfile(true)}>Perfil local opcional</button>}
    </nav>
  </div></header><AuthModal isOpen={profile} onClose={() => setProfile(false)} onUserChanged={onUserChanged} /></>;
}
