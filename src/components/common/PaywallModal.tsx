import React, { useEffect, useState } from 'react';
import { Check, Sparkles, X, ShieldCheck, Zap } from 'lucide-react';
import { subscriptionService, PLANS, SubscriptionTier } from '../../services/subscriptionService';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  featureTitle = 'Función de Preparación Pro',
  featureDescription = 'Desbloquea simulacros ponderados, temario interactivo y analíticas de estudio.',
}) => {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(subscriptionService.getTier());

  useEffect(() => {
    return subscriptionService.subscribe(tier => {
      setCurrentTier(tier);
    });
  }, []);

  if (!isOpen) return null;

  const handleSimulateUpgrade = (_planId: string) => {
    subscriptionService.setTier('premium');
    setCurrentTier('premium');
    onClose();
  };

  const handleToggleTier = () => {
    const next = subscriptionService.toggleTier();
    setCurrentTier(next);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 p-6 text-white text-center relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de planes"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="size-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="size-3.5" />
            <span>Educación Abierta Premium</span>
          </div>
          <h2 id="paywall-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {featureTitle}
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 mt-1 max-w-md mx-auto">
            {featureDescription}
          </p>
        </div>

        {/* Modal content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status and Dev testing switch */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700 dark:text-stone-300">Nivel actual de cuenta:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-xs ${
                  currentTier === 'premium'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                }`}
              >
                {currentTier === 'premium' ? 'Plan Premium Activo' : 'Acceso Gratuito (Freemium)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleTier}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
            >
              <Zap className="size-3.5" />
              <span>[Modo pruebas: Cambiar a {currentTier === 'premium' ? 'Free' : 'Premium'}]</span>
            </button>
          </div>

          {/* Plan selection grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl p-5 border transition-all ${
                  plan.highlight
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                    {plan.badge}
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                      ₡{plan.priceCRC.toLocaleString('es-CR')}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-2">{plan.description}</p>
                  <ul className="mt-4 space-y-2 text-xs text-stone-700 dark:text-stone-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => handleSimulateUpgrade(plan.id)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-98 ${
                      plan.highlight
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                        : 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white'
                    }`}
                  >
                    Elegir {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Freemium guarantee badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
            <ShieldCheck className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Garantía de contenido libre:</strong> La prueba oficial de referencia MEP (60 preguntas) y las tablas de especificaciones oficiales son y seguirán siendo 100% gratuitas.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
