import { useState } from 'react';
import type { DomainArea } from '../../types';
import { knowledgeService } from '../../services/knowledgeService';
import { dataService } from '../../services/dataService';
import { normalizeSearch } from '../../services/resourceCatalog';
import { TextRenderer } from '../common/TextRenderer';
export function FormulasSheet() {
  const [area, setArea] = useState<DomainArea | 'all'>('all');
  const [query, setQuery] = useState('');
  const categories = knowledgeService.getFormulas(area).map(category => ({ ...category, formulas: category.formulas.filter(formula => normalizeSearch(formula.name + ' ' + formula.description + ' ' + formula.latex + ' ' + formula.variables?.map(v => v.symbol + ' ' + v.meaning).join(' ')).includes(normalizeSearch(query))) })).filter(category => category.formulas.length);
  return <section className="space-y-5"><h2 className="text-xl font-semibold">Fórmulas y simbología de apoyo</h2><p className="muted">{dataService.getCurrentProgram()?.name} · Esta biblioteca amplía el repaso. Consulta el PDF oficial de tu convocatoria para comprobar cuáles fórmulas se proporcionan durante el examen.</p>
    <label>Buscar una fórmula o símbolo<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nombre, símbolo o variable" /></label>
    <fieldset><legend className="field-legend">Área de estudio</legend><div className="action-row">{([['all', 'Todas las áreas'], ['geometry', 'Geometría'], ['functions', 'Relaciones y álgebra'], ['statistics', 'Estadística y probabilidad']] as const).map(([id, name]) => <button key={id} className={area === id ? 'primary-button' : 'secondary-button'} aria-pressed={area === id} onClick={() => setArea(id)}>{name}</button>)}</div></fieldset>
    <p role="status">{categories.reduce((sum, category) => sum + category.formulas.length, 0)} fórmulas encontradas</p>{!categories.length && <p>No hay fórmulas con esta selección. <button className="text-link" onClick={() => { setQuery(''); setArea('all'); }}>Limpiar filtros</button></p>}
    {categories.map(category => <section key={category.id} className="ui-surface rounded-2xl p-5 space-y-4"><h3 className="text-lg font-semibold">{category.title}</h3><div className="grid md:grid-cols-2 gap-5">{category.formulas.map(formula => <article key={formula.name} className="feedback-panel"><h4 className="font-semibold">{formula.name}</h4><p className="formula-equation"><TextRenderer inline content={'$' + formula.latex + '$'} /></p><p>{formula.description}</p>{formula.variables?.length ? <dl>{formula.variables.map(variable => <div key={variable.symbol} className="flex gap-3"><dt className="font-semibold">{variable.symbol}</dt><dd>{variable.meaning}</dd></div>)}</dl> : null}{formula.notes && <p className="muted">{formula.notes}</p>}</article>)}</div></section>)}
  </section>;
}
