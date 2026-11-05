import { useEffect, useRef, useState } from 'react';
import type { User } from '../../types';
import { programManifest } from '../../services/programCatalog';
import { storageService } from '../../services/storageService';
import { subscriptionService, type SubscriptionTier } from '../../services/subscriptionService';
import { AuthModal } from '../auth/AuthModal';
import { ThemeToggle } from '../common/ThemeToggle';
import { CustomSelect } from '../common/CustomSelect';
import { PaywallModal } from '../common/PaywallModal';

export function Header({ currentUser, onUserChanged, onNavigateHome, currentView = 'landing', programId = programManifest.default_program, onProgramChange, onOpenHelper }: {
  currentUser: User | null; onUserChanged: (user: User | null) => void; onNavigateHome: () => void;
  currentView?: string; programId?: string; onProgramChange?: (id: string) => void; onOpenHelper?: () => void;
}) {
  const [profile, setProfile] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier>(subscriptionService.getTier());
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    return subscriptionService.subscribe(newTier => {
      setTier(newTier);
    });
  }, []);

  useEffect(() => {
    const measure = () => document.documentElement.style.setProperty('--app-header-height', (header.current?.getBoundingClientRect().height || 80) + 'px');
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }
    const observer = new ResizeObserver(measure); if (header.current) observer.observe(header.current); return () => observer.disconnect();
  }, []);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const programOptions = programManifest.programs.map(p => ({
    value: p.id,
    label: p.name,
    badge: !p.calculatorAllowed ? 'Sin Calc' : undefined,
  }));

  const showProgramSelect = ['framework', 'hub', 'resources', 'results'].includes(currentView);

  return (
    <>
      <header ref={header} className="ui-header app-header shadow-xs sticky top-0 z-40">
        <div className="page-width flex items-center justify-between gap-2.5 py-1.5 sm:py-2">
          {/* Brand Logo & Name */}
          <a
            href="#/"
            onClick={event => {
              if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
                event.preventDefault();
                onNavigateHome();
              }
            }}
            className="brand-link flex items-center gap-2 sm:gap-2.5 min-w-0"
          >
            <img className="brand-logo h-8 sm:h-9 w-auto rounded-xl shadow-xs shrink-0" src="/logo_yiguirro_cr_high_fidelity.svg" alt="Yigüirro de Costa Rica" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <strong className="tracking-wide text-sm sm:text-base font-bold text-stone-100 font-['Outfit'] truncate">MEP-EA-01</strong>
              </div>
              <span className="text-xs text-stone-400 font-medium truncate block max-w-[200px] sm:max-w-none">Educación Abierta Digital </span>
            </div>
          </a>

          {/* Desktop Navigation (visible on md: and up) */}
          <nav aria-label="Navegación principal" className="hidden md:!flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {showProgramSelect && (
              <div className="header-program min-w-[150px] sm:min-w-[190px] max-w-[240px]">
                <CustomSelect
                  title="Cambiar programa de estudio"
                  aria-label="Programa"
                  label="Programa"
                  value={programId || 'bxm'}
                  options={programOptions}
                  onChange={onProgramChange || (() => {})}
                  buttonClassName="!bg-stone-800/80 !border-stone-700 !text-stone-100 hover:!border-indigo-400 !py-1.5 sm:!py-2 !min-h-[36px] sm:!min-h-[40px] text-xs font-semibold"
                />
              </div>
            )}
            <a href="#/programas" className="header-link px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium hover:bg-stone-800/70 transition">Programas</a>
            <a href="#/calendario" className="header-link px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium hover:bg-stone-800/70 transition">Calendario</a>
            {onOpenHelper && <button onClick={onOpenHelper} className="header-link px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium hover:bg-stone-800/70 transition">Guía y recursos</button>}

            {/* Subscription Tier Badge & Upgrade Button */}
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className={`flex items-center px-2.5 py-1 rounded text-xs font-black tracking-wider transition uppercase cursor-pointer ${
                tier === 'premium'
                  ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-2xs'
                  : 'bg-stone-800 text-stone-300 border border-stone-700 hover:border-amber-400 hover:text-stone-100'
              }`}
              title="Gestionar plan de estudio y funciones avanzadas"
            >
              {tier === 'premium' ? (
                <span>PRO</span>
              ) : (
                <span>Planes Pro</span>
              )}
            </button>

            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-800/80 px-2.5 py-1 rounded-xl border border-stone-700 text-xs text-stone-200">
                <span className="font-semibold max-w-[80px] sm:max-w-none truncate">{currentUser.name}</span>
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
                className="header-link px-2.5 sm:px-3 py-1 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-semibold transition"
                onClick={() => setProfile(true)}
              >
                Perfil local opcional
              </button>
            )}
          </nav>

          {/* Mobile Actions Bar: PRO badge, ThemeToggle, and Hamburger Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaywallOpen(true)}
              className={`flex items-center px-2 py-1 rounded text-[11px] font-black tracking-wider uppercase transition cursor-pointer ${
                tier === 'premium'
                  ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-2xs'
                  : 'bg-stone-800 text-stone-300 border border-stone-700 hover:border-amber-400 hover:text-stone-100'
              }`}
              title="Gestionar plan de estudio y funciones avanzadas"
            >
              <span>{tier === 'premium' ? 'PRO' : 'PRO'}</span>
            </button>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={sidebarOpen}
              className="p-1.5 text-stone-300 hover:text-stone-100 hover:bg-stone-800/70 rounded-lg transition inline-flex items-center justify-center cursor-pointer min-w-[36px] min-h-[36px]"
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer / Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer slide-in panel */}
          <aside
            role="dialog"
            aria-label="Menú de navegación"
            aria-modal="true"
            className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-stone-900 border-l border-stone-800 text-stone-100 h-full flex flex-col p-5 shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-right duration-250"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <img className="h-7 w-auto rounded-lg" src="/logo_yiguirro_cr_high_fidelity.svg" alt="" />
                <span className="font-bold text-stone-100 font-['Outfit'] text-sm tracking-wide">MEP-EA-01</span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">PROTOTIPO</span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Cerrar menú"
                className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Program Switcher in mobile drawer if on applicable views */}
            {showProgramSelect && (
              <div className="py-4 border-b border-stone-800">
                <p className="text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wider">Programa actual</p>
                <CustomSelect
                  title="Cambiar programa de estudio"
                  aria-label="Programa"
                  label="Programa"
                  value={programId || 'bxm'}
                  options={programOptions}
                  onChange={newProgram => {
                    onProgramChange?.(newProgram);
                    setSidebarOpen(false);
                  }}
                  buttonClassName="!bg-stone-800 !border-stone-700 !text-stone-100 hover:!border-indigo-400 !py-2 !min-h-[42px] text-xs font-semibold w-full"
                />
              </div>
            )}

            {/* Navigation links */}
            <nav className="py-4 flex flex-col gap-1 border-b border-stone-800" aria-label="Enlaces de navegación">
              <a
                href="#/programas"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:text-white hover:bg-stone-800 transition"
              >
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Programas
              </a>

              <a
                href="#/calendario"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:text-white hover:bg-stone-800 transition"
              >
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendario
              </a>

              {onOpenHelper && (
                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    onOpenHelper();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-200 hover:text-white hover:bg-stone-800 transition text-left cursor-pointer w-full"
                >
                  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Guía y recursos
                </button>
              )}
            </nav>

            {/* Pro Access & Subscription */}
            <div className="py-4 border-b border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  setPaywallOpen(true);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition uppercase cursor-pointer ${
                  tier === 'premium'
                    ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-2xs'
                    : 'bg-stone-800 text-stone-200 border border-stone-700 hover:border-amber-400'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  {tier === 'premium' ? 'Plan Pro Activo' : 'Planes de Estudio Pro'}
                </span>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  {tier === 'premium' ? 'Activo' : 'Ver Planes'}
                </span>
              </button>
            </div>

            {/* User Profile / Guest State */}
            <div className="mt-auto pt-4">
              {currentUser ? (
                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-200 truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-stone-400 bg-stone-700 px-1.5 py-0.5 rounded">Perfil</span>
                  </div>
                  <button
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 text-left cursor-pointer"
                    onClick={() => {
                      if (storageService.setCurrentUser(null)) {
                        onUserChanged(null);
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    Usar modo invitado
                  </button>
                </div>
              ) : (
                <button
                  className="w-full text-center px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs font-semibold transition cursor-pointer"
                  onClick={() => {
                    setSidebarOpen(false);
                    setProfile(true);
                  }}
                >
                  Perfil local opcional
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      <AuthModal isOpen={profile} onClose={() => setProfile(false)} onUserChanged={onUserChanged} />
      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}
