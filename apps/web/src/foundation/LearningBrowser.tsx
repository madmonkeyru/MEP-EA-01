import { useState } from 'react';
import type { LearningCatalog } from '@mep-ea/content/expansion';
import { TextRenderer as MathText } from '../components/common/TextRenderer';

export function LearningBrowser({
  catalog,
  busy,
  start,
  initialKey = '',
  selectedSubject,
}: {
  catalog: LearningCatalog;
  busy: boolean;
  start: (id: string) => void;
  initialKey?: string;
  selectedSubject?: string;
}) {
  const [domain, setDomain] = useState('');
  const [key, setKey] = useState(initialKey);

  const eligibleDomains = selectedSubject
    ? catalog.registry.taxonomy.domains.filter(d => d.subjectId === selectedSubject)
    : catalog.registry.taxonomy.domains;

  const eligibleDomainIds = new Set(eligibleDomains.map(d => d.id));

  const eligibleNodes = catalog.nodes.filter(n => eligibleDomainIds.has(n.domainId));

  const node = eligibleNodes.find(n => n.key === key);
  const lesson = node?.lesson;

  return <section aria-label="Catálogo de evidencias" className="space-y-4">
    <h2>Aprender por evidencia</h2>
    <p>{eligibleNodes.length} evidencias · {eligibleNodes.filter(n => n.lesson).length} lecciones en borrador · {catalog.registry.questions.filter(q => !selectedSubject || q.subjectId === selectedSubject).length} preguntas propias</p>
    <label className="block">Área <select aria-label="Área" value={domain} onChange={e => { setDomain(e.target.value); setKey(''); }}>
      <option value="">Todas las áreas</option>{eligibleDomains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
    </select></label>
    <label className="block">Evidencia <select aria-label="Evidencia" className="max-w-full" value={key} onChange={e => setKey(e.target.value)}>
      <option value="">Seleccionar evidencia</option>{eligibleNodes.filter(n => !domain || n.domainId === domain).map(n =>
        <option key={n.key} value={n.key}>{n.domainId} · {n.code} · {n.lesson ? 'Lección en borrador' : 'Lección no disponible'}</option>)}
    </select></label>
    {node && <div className="space-y-4" data-evidence-key={node.key}>
      <h3>{node.code}: {node.description}</h3>
      <p>{node.status === 'complete' ? 'Lección completa en borrador; pendiente de revisión editorial.' : 'Evidencia scaffolded: lección no disponible todavía.'}</p>
      <p>Conceptos: {node.conceptIds.map(id => catalog.registry.taxonomy.concepts.find(c => c.id === id)?.name).join(', ') || 'Sin contenido conceptual disponible'}</p>
      {lesson && <article className="space-y-4">
        <h3>{lesson.title}</h3><MathText content={lesson.subtitle} />
        <h4>Antes de empezar</h4><ul>{lesson.prerequisites.map((p, i) => <li key={i}><MathText content={p} /></li>)}</ul>
        <MathText content={lesson.coreExplanation} />
        {lesson.formulas.map(f => <div key={f.name}><MathText content={f.name} /><MathText content={`$$${f.latex}$$`} /><MathText content={f.notes} /></div>)}
        <h4>Errores frecuentes</h4>{lesson.commonMistakes.map(m => <div key={m.mistake}><MathText content={m.mistake} /><MathText content={m.description} /><MathText content={m.correction} /></div>)}
        <h4>Ejemplo resuelto</h4><MathText content={lesson.workedExample.statement} />
        {[lesson.workedExample.primaryMethod, ...(lesson.workedExample.alternativeMethod ? [lesson.workedExample.alternativeMethod] : [])].map(m => <div key={m.name}><h4>{m.name}</h4>{m.steps.map((s, i) => <MathText key={i} content={s} />)}</div>)}
        <h4>Comprueba lo aprendido</h4>{lesson.microQuiz.map(q => <details key={q.id}><summary><MathText content={q.question} /></summary>
          {Object.entries(q.options).map(([id, text]) => <p key={id}>{id}. <MathText content={text} /></p>)}<MathText content={`${q.correctOption}: ${q.explanation}`} /></details>)}
      </article>}
      <p>Práctica en borrador: {node.practiceItemIds.length} preguntas propias</p>
      <button disabled={busy || !node.practiceBlueprintId} onClick={() => node.practiceBlueprintId && start(node.practiceBlueprintId)}>Practicar esta evidencia</button>
      {!node.practiceBlueprintId && <p>Práctica no disponible para esta evidencia.</p>}
    </div>}
  </section>;
}
