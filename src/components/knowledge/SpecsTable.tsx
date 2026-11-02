import { useState } from 'react';
import { knowledgeService } from '../../services/knowledgeService';
import { dataService } from '../../services/dataService';
import { TextRenderer } from '../common/TextRenderer';
import { CustomSelect } from '../common/CustomSelect';

export function SpecsTable({ onStartPracticeByItems }: { onStartPracticeByItems?: (ids: number[], title: string) => void }) {
  const blocks = knowledgeService.getSpecificationBlocks();
  const [area, setArea] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const eligible = (ids: number[]) => [...new Set(ids)].filter(id => !!dataService.getItemById(id));

  const areaOptions = [
    { value: 'all', label: 'Todas las áreas' },
    ...blocks.map(b => ({ value: b.id, label: b.name })),
  ];

  return <section className="space-y-5"><h2 className="text-xl font-semibold">Qué debo estudiar · Tabla de especificaciones {dataService.getCurrentProgram()?.name}</h2><p>El temario organiza lo que se evalúa y su peso. Abre cada objetivo para consultar sus criterios y practicar las preguntas disponibles.</p>
    <div className="action-row items-end">
      <label className="min-w-[220px]">Área del temario
        <div className="mt-1">
          <CustomSelect label="Área del temario" value={area} options={areaOptions} onChange={setArea} />
        </div>
      </label>
      <button className="secondary-button" aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Contraer todo' : 'Expandir todo'}</button>
    </div>
    <p className="font-semibold">Total del examen: {blocks.reduce((sum, block) => sum + block.totalPoints, 0)} puntos · {blocks.length} áreas</p>
    {blocks.filter(block => area === 'all' || block.id === area).map(block => <section key={block.id} className="ui-surface rounded-2xl p-5 sm:p-6 space-y-5"><header><h3 className="text-lg font-semibold">{block.name}</h3><p>{block.totalPoints} puntos de referencia · {block.affirmations.length} afirmaciones <meter min={0} max={60} value={block.totalPoints} aria-label={'Peso de ' + block.name} /></p></header>{block.affirmations.map(affirmation => {
      const ids = eligible(affirmation.evidences.flatMap(evidence => evidence.item_ids));
      return <details key={affirmation.affirmation} open={expanded} className="curriculum-objective"><summary><span className="eyebrow block">Afirmación {affirmation.affirmation} · {affirmation.evidences.reduce((sum, evidence) => sum + evidence.points, 0)} puntos · {affirmation.evidences.length} criterios</span><TextRenderer content={affirmation.affirmation_desc} /></summary><div className="space-y-4 py-3">
        {onStartPracticeByItems && ids.length > 0 && <button className="primary-button" title="Practicar todos los ítems de este objetivo" onClick={() => onStartPracticeByItems(ids, 'Repaso de objetivo ' + affirmation.affirmation)}>Practicar objetivo · {ids.length} preguntas</button>}
        {affirmation.evidences.map(evidence => {
          const questionIds = eligible(evidence.item_ids);
          return <article key={evidence.evidence} className="feedback-panel">
            <header className="flex flex-wrap justify-between gap-3"><h4 className="font-semibold">Evidencia {evidence.evidence}</h4><span>{evidence.points} puntos de referencia</span></header>
            <p><TextRenderer content={evidence.evidence_desc} /></p>
            <p className="muted">{questionIds.length} preguntas disponibles · Ítems vinculados: {evidence.item_ids.length ? evidence.item_ids.join(', ') : 'Sin ítems vinculados'}</p>
            {onStartPracticeByItems && questionIds.length > 0 && <button className="secondary-button" onClick={() => onStartPracticeByItems(questionIds, 'Repaso del criterio ' + evidence.evidence)}>Practicar criterio · {questionIds.length} preguntas</button>}
            <details open={expanded}><summary>Ver el detalle de las preguntas vinculadas</summary>
              <ol className="space-y-4 py-3">{evidence.item_ids.map(id => {
                const item = dataService.getItemById(id);
                return <li key={id} className="temario-question"><h5 className="font-semibold">Ítem {id}{item?.topic ? ' · ' + item.topic : ''}</h5>
                  {item ? <><p><TextRenderer content={item.stem} /></p>{onStartPracticeByItems && <button className="text-link" onClick={() => onStartPracticeByItems([id], 'Práctica del ítem ' + id)}>Practicar este ítem</button>}</> : <p className="muted">Referencia curricular; pregunta interactiva aún no disponible.</p>}
                </li>;
              })}</ol>
            </details>
          </article>;
        })}
      </div></details>;
    })}</section>)}
    {!blocks.length && <p role="status">El temario interactivo aún no está disponible. Consulta la tabla de especificaciones en PDF.</p>}
  </section>;
}
