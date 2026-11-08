import { useEffect, useState } from 'react';
import type { DomainArea, PracticeConfig } from '../../types';
import { knowledgeService } from '../../services/knowledgeService';
import { dataService } from '../../services/dataService';
import { normalizeSearch } from '../../services/resourceCatalog';
import { TextRenderer } from '../common/TextRenderer';
import { CustomSelect } from '../common/CustomSelect';

export function TermsDictionary({ onPractice }: { onPractice?: (config: PracticeConfig) => void }) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<DomainArea | 'all'>('all');
  const terms = knowledgeService.getTerms('', area).filter(term => normalizeSearch(term.term + ' ' + term.definition).includes(normalizeSearch(query)));
  useEffect(() => { const id = new URLSearchParams(window.location.hash.split('?')[1]).get('concepto'); const target = id ? document.getElementById('concept-' + id) as HTMLDetailsElement | null : null; if (target) target.open = true; }, []);
  const conceptHref = (id: string) => { const params = new URLSearchParams(window.location.hash.split('?')[1]); params.set('concepto', id); return (window.location.hash.split('?')[0] || '#/programas/bxm/matematicas') + '?' + params; };

  const areaOptions = [
    { value: 'all', label: 'Todas las áreas' },
    { value: 'geometry', label: 'Geometría' },
    { value: 'functions', label: 'Relaciones y álgebra' },
    { value: 'statistics', label: 'Estadística y probabilidad' },
  ];

  return <section className="space-y-5"><h2 className="text-xl font-semibold">Diccionario de términos y conceptos matemáticos</h2><p className="muted">Material de apoyo para {dataService.getCurrentProgram()?.name}. Abre un concepto para ver sus fórmulas, ejemplos y práctica disponible.</p>
    <div className="resource-filters">
      <label>Buscar concepto
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar concepto: circunferencia, cuartiles…" />
      </label>
      <label>Área del concepto
        <CustomSelect label="Área del concepto" value={area} options={areaOptions} onChange={val => setArea(val as DomainArea | 'all')} />
      </label>
    </div>
    <div className="action-row"><p role="status">{terms.length} conceptos encontrados</p><button className="secondary-button" onClick={() => { setQuery(''); setArea('all'); }}>Limpiar búsqueda</button></div>
    <nav aria-label="Índice de conceptos" className="action-row">{terms.map(term => <a key={term.id} className="text-link" href={conceptHref(term.id)} onClick={event => { if (event.ctrlKey || event.metaKey) return; event.preventDefault(); window.history.replaceState(null, '', conceptHref(term.id)); const target = document.getElementById('concept-' + term.id) as HTMLDetailsElement | null; if (target) { target.open = true; target.scrollIntoView?.({ block: 'start' }); target.querySelector<HTMLElement>('summary')?.focus(); } }}>{term.term}</a>)}</nav>
    {!terms.length && <p role="status">No se encontraron términos. Prueba otra palabra o limpia los filtros.</p>}
    {terms.map(term => { const ids = dataService.getAllItems().filter(item => item.concept_id === term.id || item.linked_concepts?.includes(term.id)).map(item => item.id); return <details key={term.id} id={'concept-' + term.id} className="ui-surface p-5 rounded-2xl"><summary>{term.term} · {term.blockName}</summary><div className="space-y-4 py-3"><p><TextRenderer content={term.definition} /></p>{term.keyFormulas?.map((formula, index) => <p key={index}><TextRenderer content={'$' + formula + '$'} /></p>)}{term.examples?.length ? <><h3 className="font-semibold">Ejemplos de aplicación</h3>{term.examples.map((example, index) => <p key={index}><TextRenderer content={example} /></p>)}</> : null}
      {onPractice && <button className="secondary-button" disabled={!ids.length} onClick={() => onPractice({ mode: 'concept_drilldown', conceptId: term.id, itemIds: ids, itemCount: ids.length, enableTimer: false, timerDurationMinutes: 30 })}>{ids.length ? 'Practicar este concepto · ' + ids.length + ' preguntas' : 'Práctica de este concepto en preparación'}</button>}
      {!!term.relatedEvidence?.length && <details><summary>Referencia curricular</summary><p>{term.relatedEvidence.join(', ')}</p></details>}
    </div></details>; })}
  </section>;
}
