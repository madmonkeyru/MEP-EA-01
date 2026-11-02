import { useState } from 'react';
import { knowledgeService } from '../../services/knowledgeService';
import { dataService } from '../../services/dataService';
import { TextRenderer } from '../common/TextRenderer';
export function SpecsTable({ onStartPracticeByItems }: { onStartPracticeByItems?: (ids: number[], title: string) => void }) {
  const blocks = knowledgeService.getSpecificationBlocks();
  const [area, setArea] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const eligible = (ids: number[]) => [...new Set(ids)].filter(id => !!dataService.getItemById(id));
  return <section className="space-y-5"><h2 className="text-xl font-semibold">Qué debo estudiar · Tabla de especificaciones {dataService.getCurrentProgram()?.name}</h2><p>El temario organiza lo que se evalúa y su peso. Abre cada objetivo para consultar sus criterios y practicar las preguntas disponibles.</p>
    <div className="action-row"><label>Área del temario<select value={area} onChange={event => setArea(event.target.value)}><option value="all">Todas las áreas</option>{blocks.map(block => <option key={block.id} value={block.id}>{block.name}</option>)}</select></label><button className="secondary-button" aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Cerrar objetivos' : 'Abrir objetivos'}</button></div>
    {blocks.filter(block => area === 'all' || block.id === area).map(block => <section key={block.id} className="ui-surface rounded-2xl p-5 sm:p-6 space-y-5"><header><h3 className="text-lg font-semibold">{block.name}</h3><p>{block.totalPoints} puntos de referencia <meter min={0} max={60} value={block.totalPoints} aria-label={'Peso de ' + block.name} /></p></header>{block.affirmations.map(affirmation => {
      const ids = eligible(affirmation.evidences.flatMap(evidence => evidence.item_ids));
      return <details key={affirmation.affirmation} open={expanded} className="curriculum-objective"><summary><TextRenderer content={affirmation.affirmation_desc} /></summary><div className="space-y-4 py-3">
        {onStartPracticeByItems && ids.length > 0 && <button className="primary-button" title="Practicar todos los ítems de este objetivo" onClick={() => onStartPracticeByItems(ids, 'Repaso de objetivo ' + affirmation.affirmation)}>Practicar objetivo · {ids.length} preguntas</button>}
        {affirmation.evidences.map(evidence => { const questionIds = eligible(evidence.item_ids); return <details key={evidence.evidence}><summary><TextRenderer content={evidence.evidence_desc} /></summary><p className="muted">Criterio {evidence.evidence} · {evidence.points} puntos de referencia · {questionIds.length} preguntas disponibles</p>{onStartPracticeByItems && questionIds.length > 0 && <button className="secondary-button" onClick={() => onStartPracticeByItems(questionIds, 'Repaso del criterio ' + evidence.evidence)}>Practicar criterio · {questionIds.length} preguntas</button>}</details>; })}
      </div></details>;
    })}</section>)}
    {!blocks.length && <p role="status">El temario interactivo aún no está disponible. Consulta la tabla de especificaciones en PDF.</p>}
  </section>;
}
