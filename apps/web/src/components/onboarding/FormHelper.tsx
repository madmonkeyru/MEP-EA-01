import { useState } from 'react';
import type { ProgramId } from '../../services/onboarding/types';

const assets = import.meta.glob<string>('../../../../../project_docs/program_official_process_pdfs/**/*.pdf', { eager: true, query: '?url', import: 'default' });
const forms = Object.entries(assets).map(([path, url]) => ({ path, url, title: path.split('/').at(-2)! }))
  // The III Ciclo recognition form also appears in the conclusion folder.
  .filter(form => !(form.title.includes('conclusión de III') && form.path.includes('RECONOCIMIENTO')));
const normalize = (value: string) => value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
type Process = 'recognition' | 'foreign' | 'grades' | 'conclusion' | 'replacement' | 'all';

export function FormHelper({ program, initialProcess = 'all' }: { program: ProgramId; initialProcess?: Process }) {
  const [process, setProcess] = useState<Process>(initialProcess);
  const [query, setQuery] = useState('');
  const matches = forms.filter(form => {
    const title = normalize(form.title);
    const relevant = process === 'foreign' ? false : process === 'recognition' ? title.includes('reconocimiento') && (program === 'iii' ? title.includes('iii ciclo') : program === 'edad' ? /decimo|bachillerato/.test(title) : program === 'bxm' ? title.includes('bachillerato') : false)
      : process === 'grades' ? title.includes('calificaciones')
      : process === 'replacement' ? title.includes('reposicion')
      : process === 'conclusion' ? (program === 'i-ii' ? title.includes('conclusion de i y ii') : program === 'iii' ? title.includes('conclusion de iii') : title.includes('titulo de bachiller')) : true;
    return relevant && normalize(form.title + ' ' + form.path.split('/').at(-1)).includes(normalize(query));
  });
  return <section className="rounded-2xl border border-line p-5 space-y-4" aria-label="Buscador de formularios">
    <h2 className="text-xl">Encuentra el formulario para tu trámite</h2>
    <p className="text-sm text-muted">Si la asignatura ya consta aprobada en este mismo programa, consulta tu registro: no necesitas solicitar una nueva equiparación por esa aprobación. Los documentos de matrícula dependen de tu expediente y del aviso vigente.</p>
    <label className="grid gap-1">¿Qué necesitas hacer?<select value={process} onChange={event => setProcess(event.target.value as Process)}>
      <option value="all">Explorar todos los formularios</option><option value="recognition">Reconocer estudios de otro sistema</option><option value="foreign">Equiparar estudios del extranjero</option><option value="grades">Solicitar certificación de calificaciones</option><option value="conclusion">Solicitar certificado o título al completar el programa</option><option value="replacement">Reponer un título</option>
    </select></label>
    <label className="grid gap-1">Buscar formulario<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <p aria-live="polite">{matches.length} formularios disponibles</p>
    <ul className="space-y-3">{matches.map(form => <li key={form.path}><a className="text-link" href={form.url} target="_blank" rel="noreferrer">{form.title} · PDF</a></li>)}</ul>
    {!matches.length && <p>No hay un formulario incorporado para esta selección. Consulta a la DGEC; no completes un formulario de otro trámite.</p>}
    {process === 'foreign' && <a className="text-link" href="https://dgec.mep.go.cr/certificacion-extranjera/" target="_blank" rel="noreferrer">Consultar requisitos de equiparación de estudios extranjeros</a>}
    <p className="text-sm text-muted">Copias de referencia. Revisa los requisitos y el canal de entrega indicados en cada PDF. Este asistente no envía solicitudes.</p>
    <a className="text-link" href="https://dgec.mep.go.cr/tramites/" target="_blank" rel="noreferrer">Ver formularios vigentes y canales oficiales DGEC</a>
  </section>;
}
