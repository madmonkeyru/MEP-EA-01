import { useEffect, useRef, useState } from 'react';
import { Menu, UserRound } from 'lucide-react';
import type { User } from '../../types';
import { programManifest } from '../../services/programCatalog';
import { storageService } from '../../services/storageService';
import { AuthModal } from '../auth/AuthModal';
import { ThemeToggle } from '../common/ThemeToggle';
import { CustomSelect } from '../common/CustomSelect';
import { PaywallModal } from '../common/PaywallModal';
import { Dialog } from '../common/Dialog';
import { useTheme, type Theme } from '../../context/ThemeContext';

export function Header({ currentUser, onUserChanged, onNavigateHome, currentView = 'landing', programId = programManifest.default_program, onProgramChange, onOpenHelper }: {
  currentUser: User | null; onUserChanged: (user: User | null) => void; onNavigateHome: () => void;
  currentView?: string; programId?: string; onProgramChange?: (id: string) => void; onOpenHelper?: () => void;
}) {
  const [profile, setProfile] = useState(false);
  const [account, setAccount] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    const measure = () => document.documentElement.style.setProperty('--app-header-height', (header.current?.getBoundingClientRect().height || 64) + 'px');
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }
    const observer = new ResizeObserver(measure); if (header.current) observer.observe(header.current); return () => observer.disconnect();
  }, []);
  const showProgramSelect = ['framework', 'hub', 'learning', 'resources', 'results'].includes(currentView);
  const programOptions = programManifest.programs.map(p => ({ value: p.id, label: p.name }));
  const links = <>
    <a href="#/programas" aria-current={currentView === 'welcome' || currentView === 'framework' ? 'page' : undefined} className="header-link" onClick={() => setSidebarOpen(false)}>Programas</a>
    <a href="#/calendario" aria-current={currentView === 'calendar' ? 'page' : undefined} className="header-link" onClick={() => setSidebarOpen(false)}>Calendario</a>
    {onOpenHelper && <button className="header-link" onClick={() => { setSidebarOpen(false); onOpenHelper(); }}>Guía y recursos</button>}
  </>;
  return <>
    <header ref={header} className="ui-header app-header">
      <div className="page-width flex items-center justify-between gap-3 py-2">
        <a href="#/" className="brand-link min-w-0" onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) { event.preventDefault(); onNavigateHome(); } }}>
          <img className="brand-logo" src="/logo_yiguirro_cr_high_fidelity.svg" alt="Yigüirro de Costa Rica" />
          <div className="min-w-0"><strong className="text-sm">MEP-EA-01</strong><span className="truncate">Educación Abierta Digital</span></div>
        </a>
        <nav aria-label="Navegación principal" className="hidden md:!flex items-center gap-1">{links}</nav>
        <div className="flex items-center gap-1">
          <div className="hidden lg:block"><ThemeToggle /></div>
          <button className="header-link account-trigger" aria-label={currentUser ? `Perfil: ${currentUser.name}` : 'Perfil'} aria-haspopup="dialog" onClick={() => setAccount(true)}><UserRound size={18} aria-hidden="true" /><span className="hidden sm:inline truncate max-w-28">{currentUser?.name || 'Perfil'}</span></button>
          <button className="header-link mobile-menu-trigger" aria-label="Abrir menú" aria-haspopup="dialog" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(true)}><Menu size={20} aria-hidden="true" /></button>
        </div>
      </div>
    </header>
    {sidebarOpen && <Dialog title="Menú de navegación" onClose={() => setSidebarOpen(false)}>
      <nav className="mobile-nav" aria-label="Enlaces de navegación">{links}</nav>
      {showProgramSelect && <CustomSelect title="Cambiar programa de estudio" aria-label="Programa" label="Programa" value={programId} options={programOptions} onChange={id => { onProgramChange?.(id); setSidebarOpen(false); }} />}
      <button className="secondary-button" onClick={() => { setSidebarOpen(false); setAccount(true); }}>Perfil y preferencias</button>
    </Dialog>}
    {account && <Dialog title="Perfil y preferencias" onClose={() => setAccount(false)}>
      <div className="account-summary"><UserRound size={28} aria-hidden="true" /><div><h3 className="font-semibold">{currentUser?.name || 'Tu perfil todavía no está configurado'}</h3><p className="muted">{currentUser ? 'Tu preparación en este dispositivo' : 'Puedes estudiar como invitado o crear un perfil.'}</p></div></div>
      <p className="muted">El progreso se guarda en este navegador. Los perfiles permiten mantener historiales separados; no se sincronizan entre dispositivos.</p>
      {showProgramSelect && <CustomSelect title="Cambiar programa de estudio" aria-label="Programa" label="Programa" value={programId} options={programOptions} onChange={id => { onProgramChange?.(id); setAccount(false); }} />}
      {programId === 'bxm' && currentView === 'learning' && <a className="text-link" href="#/programas/bxm/matematicas?convocatoria=2026-c2&pantalla=aprendizaje&seccion=progress" onClick={() => setAccount(false)}>Ver mi progreso en Matemáticas BXM</a>}
      <label>Tema<select aria-label="Tema" value={theme} onChange={event => setTheme(event.target.value as Theme)}><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Oscuro</option></select></label>
      <div className="action-row"><button className="primary-button" onClick={() => { setAccount(false); setProfile(true); }}>{currentUser ? 'Cambiar perfil' : 'Crear perfil'}</button><button className="text-link" onClick={() => { setAccount(false); setPaywallOpen(true); }}>Ver planes</button></div>
      {currentUser && <button className="text-link" onClick={() => { if (storageService.setCurrentUser(null)) { onUserChanged(null); setAccount(false); } }}>Usar modo invitado</button>}
    </Dialog>}
    <AuthModal isOpen={profile} onClose={() => setProfile(false)} onUserChanged={onUserChanged} />
    <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
  </>;
}
