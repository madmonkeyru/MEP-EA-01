import { useEffect, useState } from 'react';
import { officialDocuments, normalizeSearch } from '../../services/resourceCatalog';
import { CustomSelect } from '../common/CustomSelect';

export function OfficialResources({ programId = 'bxm', subjectId, moduleId }: { programId?: string; subjectId?: string; moduleId?: string }) {
  const params = new URLSearchParams(window.location.hash.split('?')[1]);
  const [search, setSearch] = useState(params.get('buscar') || '');
  const [subject, setSubject] = useState(subjectId || params.get('materiaFiltro') || 'all');
  const [level, setLevel] = useState(moduleId || params.get('nivelFiltro') || 'all');
  const [kind, setKind] = useState(params.get('tipo') || 'all');
  const [saved, setSaved] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('mep_reading_list') || '[]'); } catch { return []; } });
  const [shortlist, setShortlist] = useState(false);
  const [error, setError] = useState('');
  const pool = officialDocuments.filter(doc => doc.programId === programId);
  const docs = pool.filter(doc => (subject === 'all' || doc.subjectId === subject) && (level === 'all' || doc.moduleId === level) && (kind === 'all' || doc.type === kind) && (!shortlist || saved.includes(doc.id)) && normalizeSearch(doc.title).includes(normalizeSearch(search)));
  useEffect(() => {
    const query = new URLSearchParams(window.location.hash.split('?')[1]);
    for (const [key, value] of [['buscar', search], ['materiaFiltro', subject], ['nivelFiltro', level], ['tipo', kind]]) { if (value && value !== 'all') query.set(key, value); else query.delete(key); }
    const path = window.location.hash.split('?')[0];
    if (path) window.history.replaceState(null, '', path + (query.size ? '?' + query : ''));
  }, [search, subject, level, kind]);
  const clear = () => { setSearch(''); setSubject('all'); setLevel('all'); setKind('all'); setShortlist(false); };

  const subjectOptions = [
    { value: 'all', label: 'Todas las materias' },
    ...[...new Map(pool.map(doc => [doc.subjectId, doc.subject])).entries()].map(([id, name]) => ({ value: id, label: name })),
  ];

  const levelOptions = [
    { value: 'all', label: 'Todos los niveles' },
    ...[...new Map(pool.filter(doc => doc.moduleId).map(doc => [doc.moduleId!, doc.level])).entries()].map(([id, name]) => ({ value: id, label: name })),
  ];

  const kindOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'Práctica oficial', label: 'Práctica oficial' },
    { value: 'Tabla de especificaciones', label: 'Tabla de especificaciones' },
  ];

  return <section className="official-resources space-y-5" aria-labelledby="official-pdf-title">
    <h2 id="official-pdf-title" className="text-xl font-semibold">Materiales oficiales en PDF</h2><p className="muted">Referencia 02-2026. Comprueba el temario y las fechas de tu convocatoria en la DGEC. Abrir un PDF no realiza una matrícula.</p>
    <div className="resource-filters">
      <label>Buscar materiales
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Materia, nivel o documento" />
      </label>
      <label>Materia
        <CustomSelect label="Materia" value={subject} options={subjectOptions} onChange={setSubject} />
      </label>
      {pool.some(doc => doc.moduleId) && (
        <label>Nivel o parte
          <CustomSelect label="Nivel o parte" value={level} options={levelOptions} onChange={setLevel} />
        </label>
      )}
      <label>Tipo de documento
        <CustomSelect label="Tipo de documento" value={kind} options={kindOptions} onChange={setKind} />
      </label>
    </div>
    <div className="action-row"><button className="secondary-button" onClick={clear}>Limpiar filtros</button><button className="secondary-button" aria-pressed={shortlist} onClick={() => setShortlist(!shortlist)}>Mi lista de lectura</button><span className="muted">Lista local de este navegador, compartida entre sus perfiles.</span><a className="text-link" href="https://dgec.mep.go.cr/" target="_blank" rel="noreferrer">Consultar la DGEC (otra pestaña)</a></div>
    <p role="status">{docs.length} materiales encontrados</p>{error && <p role="alert">{error}</p>}
    <ul className="grid sm:grid-cols-2 gap-4">{docs.map(doc => <li key={doc.id} className="resource-pdf-card ui-surface rounded-2xl space-y-3">
      <div className="resource-pdf-card__preview" aria-hidden="true">
        <iframe src={`${doc.url}#page=1&toolbar=0&navpanes=0&view=FitH`} title="" tabIndex={-1} loading="lazy" />
      </div>
      <div className="resource-pdf-card__content p-5 space-y-3">
        <h3 className="font-semibold">{doc.subject}</h3><p>{doc.type}{doc.level ? ' · ' + doc.level : ''}</p><p className="muted">PDF · {Math.ceil(doc.size / 1024)} KB · Referencia 02-2026</p><div className="action-row"><a className="text-link" href={doc.url} target="_blank" rel="noreferrer">Abrir PDF (otra pestaña)</a><a className="text-link" href={doc.url} download={doc.filename}>Descargar</a><button className="secondary-button" aria-pressed={saved.includes(doc.id)} aria-label={(saved.includes(doc.id) ? 'Quitar de mi lista: ' : 'Guardar en mi lista: ') + doc.title} onClick={() => { const next = saved.includes(doc.id) ? saved.filter(id => id !== doc.id) : [...saved, doc.id]; setSaved(next); try { localStorage.setItem('mep_reading_list', JSON.stringify(next)); } catch { setError('No fue posible guardar la lista en este navegador.'); } }}>{saved.includes(doc.id) ? '✓ Guardado' : 'Guardar'}</button></div>
      </div>
    </li>)}</ul>
    {!docs.length && <p>No hay materiales con estos filtros. <button className="text-link" onClick={clear}>Ver todos los materiales del programa</button></p>}
  </section>;
}
