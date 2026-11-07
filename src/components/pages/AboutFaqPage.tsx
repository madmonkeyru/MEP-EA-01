import React, { useMemo, useState } from 'react';
import {
  Search,
  HelpCircle,
  BookOpen,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ExternalLink,
  ArrowRight,
  Calculator,
  Calendar,
  Layers,
  FileText,
  X,
} from 'lucide-react';
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  PLATFORM_INFO,
  PROGRAMS_OVERVIEW,
} from '../../data/aboutFaqData';
import { readRoute, type AppRoute } from '../../services/navigation';

interface AboutFaqPageProps {
  onNavigate?: (route: AppRoute) => void;
}

export const AboutFaqPage: React.FC<AboutFaqPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const inQuestion = item.question.toLowerCase().includes(q);
      const inAnswer = item.answer.toLowerCase().includes(q);
      const inKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));
      return inQuestion || inAnswer || inKeywords;
    });
  }, [searchQuery, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    for (const item of filteredFaqs) {
      next[item.id] = true;
    }
    setOpenItems(next);
  };

  const collapseAll = () => {
    setOpenItems({});
  };

  const handleInternalClick = (e: React.MouseEvent<HTMLAnchorElement>, destination: string) => {
    if (!onNavigate || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate(readRoute(destination));
  };

  return (
    <div className="about-faq-page page-width py-8 space-y-12 text-stone-900 dark:text-stone-100">
      {/* Hero Section */}
      <header className="rounded-3xl p-6 sm:p-10 border border-stone-200/80 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/50 backdrop-blur-xs space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Información Oficial y Preguntas Frecuentes</span>
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 tabIndex={-1} className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
            Acerca de MEP-EA-01 y Preguntas Frecuentes
          </h1>
          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
            {PLATFORM_INFO.subtitle}
          </p>
        </div>

        <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 max-w-3xl leading-relaxed">
          {PLATFORM_INFO.description}
        </p>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {PLATFORM_INFO.pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800/70 space-y-2 shadow-2xs"
            >
              <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                0{idx + 1}
              </div>
              <h2 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                {pillar.title}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer Box */}
        <div className="rounded-2xl p-4 sm:p-5 border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5 text-amber-900 dark:text-amber-300">
              Deslinde de Responsabilidad e Independencia Institucional
            </strong>
            <span>{PLATFORM_INFO.disclaimer}</span>
          </div>
        </div>
      </header>

      {/* Program Summary Cards */}
      <section className="space-y-6" aria-labelledby="programas-educacion-abierta">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Estructura Académica
            </span>
            <h2 id="programas-educacion-abierta" className="text-2xl font-bold tracking-tight">
              Los 4 Programas de Educación Abierta del MEP
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md">
            Conoce los requisitos clave, esquemas de evaluación y normativas de calculadora para cada programa oficial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROGRAMS_OVERVIEW.map((prog) => (
            <article
              key={prog.id}
              className="rounded-3xl p-6 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 flex flex-col justify-between space-y-5 shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                    {prog.id.toUpperCase().replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Nota mínima: {prog.passingScore}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {prog.name}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                  {prog.tagline}
                </p>

                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <div className="flex items-start gap-2 text-stone-600 dark:text-stone-400">
                    <GraduationCap className="size-4 shrink-0 text-indigo-500 mt-0.5" />
                    <span><strong>Población:</strong> {prog.targetAudience}</span>
                  </div>
                  <div className="flex items-start gap-2 text-stone-600 dark:text-stone-400">
                    <Layers className="size-4 shrink-0 text-indigo-500 mt-0.5" />
                    <span><strong>Niveles:</strong> {prog.levels}</span>
                  </div>
                  <div className="flex items-start gap-2 text-stone-600 dark:text-stone-400">
                    <Calculator className="size-4 shrink-0 text-indigo-500 mt-0.5" />
                    <span><strong>Calculadora:</strong> {prog.calculatorRules}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  {prog.subjects.length} materias obligatorias
                </span>
                <a
                  href={`#/programas/${prog.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  <span>Explorar programa</span>
                  <ArrowRight className="size-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ Interactive Search & Category Section */}
      <section className="space-y-6" aria-labelledby="preguntas-frecuentes-titulo">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Centro de Respuestas
            </span>
            <h2 id="preguntas-frecuentes-titulo" className="text-2xl font-bold tracking-tight">
              Preguntas Frecuentes (FAQ)
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Encuentra respuestas claras sobre requisitos, convocatorias, uso de calculadora y más.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-stone-400 pointer-events-none" />
          <input
            type="search"
            aria-label="Buscar en preguntas frecuentes"
            placeholder="Buscar por palabra clave (ej. calculadora, nota mínima, convalidación, BXM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Borrar búsqueda"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Categories Bar & Accordion Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorías de preguntas">
            {FAQ_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer min-h-[38px] ${
                    active
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-stone-500 dark:text-stone-400 mr-2">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'resultado' : 'preguntas'}
            </span>
            <button
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium cursor-pointer"
            >
              Expandir todo
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium cursor-pointer"
            >
              Colapsar
            </button>
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
            <HelpCircle className="size-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-semibold">No se encontraron preguntas coincidentes</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Intenta con otros términos como &quot;edad&quot;, &quot;calculadora&quot;, &quot;matrícula&quot; o selecciona la categoría &quot;Todas las preguntas&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-white dark:bg-stone-900 overflow-hidden transition shadow-2xs"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base cursor-pointer hover:bg-stone-50/80 dark:hover:bg-stone-850/80 transition"
                  >
                    <span className="text-stone-900 dark:text-stone-100 flex-1">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`size-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                      }`}
                    />
                  </button>

                  <div
                    id={`faq-answer-${faq.id}`}
                    hidden={!isOpen}
                    className="px-4 pb-5 sm:px-5 pt-1 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-850 space-y-3"
                  >
                    {isOpen && (
                      <>
                        <div className="whitespace-pre-line">{faq.answer}</div>

                        {(faq.officialLink || faq.internalLink) && (
                          <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-stone-100 dark:border-stone-850">
                            {faq.internalLink && (
                              <a
                                href={faq.internalLink.routeHash}
                                onClick={(e) => handleInternalClick(e, faq.internalLink!.routeHash)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                <span>{faq.internalLink.label}</span>
                                <ArrowRight className="size-3.5" />
                              </a>
                            )}
                            {faq.officialLink && (
                              <a
                                href={faq.officialLink.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <span>{faq.officialLink.label}</span>
                                <ExternalLink className="size-3.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Action Navigation Strip */}
      <section className="rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-850/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl font-bold">¿Listo para comenzar a practicar?</h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl">
            Realiza el simulador de 60 preguntas oficial de Matemáticas BXM, explora el temario con lecciones interactivas o revisa las fechas de matrícula en el calendario oficial.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href="#/programas/bxm/matematicas?convocatoria=2026-c2&pantalla=aprendizaje"
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer shadow-xs min-h-[44px] flex items-center gap-2"
          >
            <BookOpen className="size-4" />
            <span>Matemáticas BXM</span>
          </a>
          <a
            href="#/calendario"
            className="px-5 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-xs transition cursor-pointer shadow-xs min-h-[44px] flex items-center gap-2"
          >
            <Calendar className="size-4" />
            <span>Calendario DGEC</span>
          </a>
          <a
            href="#/ayuda"
            className="px-5 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-xs transition cursor-pointer shadow-xs min-h-[44px] flex items-center gap-2"
          >
            <FileText className="size-4" />
            <span>Trámites y Formularios</span>
          </a>
        </div>
      </section>

      {/* Official Directory Contacts */}
      <footer className="border-t border-stone-200 dark:border-stone-800 pt-6 pb-2 text-xs text-stone-500 dark:text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <strong className="text-stone-800 dark:text-stone-200 block">
            Dirección de Gestión y Evaluación de la Calidad (DGEC - MEP)
          </strong>
          <span>Sede Central: Paseo Colón, San José, Costa Rica • Correo consultas: dgec.consultas@mep.go.cr</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://dgec.mep.go.cr/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-stone-900 dark:hover:text-stone-100 underline"
          >
            Sitio Web DGEC
          </a>
          <a
            href="https://portaldgec.mep.go.cr/yo_aplico/Login"
            target="_blank"
            rel="noreferrer"
            className="hover:text-stone-900 dark:hover:text-stone-100 underline"
          >
            Portal Yo Aplico
          </a>
        </div>
      </footer>
    </div>
  );
};
