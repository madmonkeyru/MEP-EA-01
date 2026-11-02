import { useEffect, useRef, useState } from 'react';
import type { User } from '../../types';
import { dataService } from '../../services/dataService';
import { storageService } from '../../services/storageService';
import { AuthModal } from '../auth/AuthModal';
import { ThemeToggle } from '../common/ThemeToggle';
import { CustomSelect } from '../common/CustomSelect';

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

  const programOptions = dataService.getPrograms().map(p => ({
    value: p.id,
    label: p.name,
    badge: !p.calculatorAllowed ? 'Sin Calc' : undefined,
  }));

  return (
    <>
      <header ref={header} className="ui-header app-header shadow-xs">
        <div className="page-width flex flex-wrap items-center justify-between gap-3 py-2">
          <a
            href="#/"
            onClick={event => {
              if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
                event.preventDefault();
                onNavigateHome();
              }
            }}
            className="brand-link group"
          >
            <img className="brand-logo transition-transform duration-200 group-hover:scale-105" src="/logo_yiguirro_cr_high_fidelity.svg" alt="Yigüirro de Costa Rica" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="tracking-wide text-base font-bold text-stone-100 font-['Outfit']">MEP-EA-01</strong>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">PROTOTIPO</span>
              </div>
              <span className="text-xs text-stone-400 font-medium">Educación Abierta Digital · Preparación independiente</span>
            </div>
          </a>

          <nav aria-label="Navegación principal" className="action-row flex items-center gap-2.5">
            {['framework', 'hub', 'resources', 'results'].includes(currentView) && (
              <div className="header-program min-w-[190px] max-w-[240px]">
                <CustomSelect
                  title="Cambiar programa de estudio"
                  aria-label="Programa"
                  label="Programa"
                  value={program}
                  options={programOptions}
                  onChange={val => {
                    setProgram(val);
                    onProgramChange?.(val);
                  }}
                  buttonClassName="!bg-stone-800/80 !border-stone-700 !text-stone-100 hover:!border-indigo-400 !py-2 !min-h-[40px] text-xs font-semibold"
                />
              </div>
            )}
            <a href="#/programas" className="header-link px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-800/70 transition">Programas</a>
            {onOpenHelper && <button onClick={onOpenHelper} className="header-link px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-stone-800/70 transition">Guía y recursos</button>}
            <ThemeToggle />
            {currentUser ? (
              <div className="flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700 text-xs text-stone-200">
                <span className="font-semibold">{currentUser.name}</span>
                <span className="text-stone-400">·</span>
                <button
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 cursor-pointer"
                  onClick={() => {
                    if (storageService.setCurrentUser(null)) onUserChanged(null);
                  }}
                >
                  Usar modo invitado
                </button>
              </div>
            ) : (
              <button
                className="header-link px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition"
                onClick={() => setProfile(true)}
              >
                Perfil local opcional
              </button>
            )}
          </nav>
        </div>
      </header>
      <AuthModal isOpen={profile} onClose={() => setProfile(false)} onUserChanged={onUserChanged} />
    </>
  );
}
