import { useEffect, useRef, useState } from 'react';
import type { User } from '../../types';
import { programManifest } from '../../services/programCatalog';
import { storageService } from '../../services/storageService';
import { subscriptionService, type SubscriptionTier } from '../../services/subscriptionService';
import { AuthModal } from '../auth/AuthModal';
import { ThemeToggle } from '../common/ThemeToggle';
import { CustomSelect } from '../common/CustomSelect';
import { PaywallModal } from '../common/PaywallModal';
import { Sparkles, Crown } from 'lucide-react';

export function Header({ currentUser, onUserChanged, onNavigateHome, currentView = 'landing', programId = programManifest.default_program, onProgramChange, onOpenHelper }: {
  currentUser: User | null; onUserChanged: (user: User | null) => void; onNavigateHome: () => void;
  currentView?: string; programId?: string; onProgramChange?: (id: string) => void; onOpenHelper?: () => void;
}) {
  const [profile, setProfile] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
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

  const programOptions = programManifest.programs.map(p => ({
    value: p.id,
    label: p.name,
    badge: !p.calculatorAllowed ? 'Sin Calc' : undefined,
  }));

  return (
    <>
      <header ref={header} className="ui-header app-header shadow-xs sticky top-0 z-40">
        <div className="page-width flex flex-wrap items-center justify-between gap-2.5 py-1.5 sm:py-2">
          <a
            href="#/"
            onClick={event => {
              if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
                event.preventDefault();
                onNavigateHome();
              }
            }}
            className="brand-link group flex items-center gap-2.5"
          >
            <img className="brand-logo h-8 sm:h-9 w-auto transition-transform duration-200 group-hover:scale-105" src="/logo_yiguirro_cr_high_fidelity.svg" alt="Yigüirro de Costa Rica" />
            <div>
              <div className="flex items-center gap-1.5">
                <strong className="tracking-wide text-sm sm:text-base font-bold text-stone-100 font-['Outfit']">MEP-EA-01</strong>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">PROTOTIPO</span>
              </div>
              <span className="text-xs text-stone-400 font-medium">Educación Abierta Digital · Preparación independiente</span>
            </div>
          </a>

          <nav aria-label="Navegación principal" className="action-row flex flex-wrap items-center gap-1.5 sm:gap-2">
            {['framework', 'hub', 'resources', 'results'].includes(currentView) && (
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
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                tier === 'premium'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-600/50'
              }`}
              title="Gestionar plan de estudio y funciones avanzadas"
            >
              {tier === 'premium' ? (
                <>
                  <Crown className="size-3 text-amber-400" />
                  <span>PRO</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3 text-indigo-400" />
                  <span className="hidden sm:inline">Planes</span> Pro
                </>
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
        </div>
      </header>
      <AuthModal isOpen={profile} onClose={() => setProfile(false)} onUserChanged={onUserChanged} />
      <PaywallModal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
}
