import assets, { sizes } from 'virtual:official-resources';
export const normalizeSearch = (value: string) => value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const programFolders: Record<string, string> = { 'I&II CICLO': 'cico', 'III CICLO': 'iii_ciclo', EDAD: 'edad', BXM: 'bxm' };
const subjects: [string, string, RegExp][] = [
  ['matematicas', 'Matemáticas', /matematic/], ['estudios-sociales', 'Estudios Sociales', /est.*soc|estudios.social/], ['formacion-ciudadana', 'Formación Ciudadana', /formacion|ciudadana/], ['educacion-civica', 'Educación Cívica', /civica/], ['biologia', 'Biología', /biologia/], ['fisica', 'Física', /fisica/], ['quimica', 'Química', /quimica/], ['ciencias', 'Ciencias', /ciencias/], ['espanol', 'Español', /espanol/], ['ingles', 'Inglés', /ingles/], ['frances', 'Francés', /frances/],
];
export const officialDocuments = Object.entries(assets).map(([path, url]) => {
  const parts = path.split('/'), folder = parts.find(part => programFolders[part]) || 'BXM';
  const filename = parts.at(-1)!;
  const match = subjects.find(([, , pattern]) => pattern.test(normalizeSearch(filename)));
  const rawLevel = parts[parts.indexOf(folder) + 1];
  const moduleId = ({ '7TH': 'III_CICLO_7', '8TH': 'III_CICLO_8', '9TH': 'III_CICLO_9', 'PARTE 1': 'EDAD_1', 'PARTE 2': 'EDAD_2' } as Record<string, string>)[rawLevel];
  const level = ({ III_CICLO_7: 'Séptimo año', III_CICLO_8: 'Octavo año', III_CICLO_9: 'Noveno año', EDAD_1: 'Parte 1 · Décimo', EDAD_2: 'Parte 2 · Undécimo' } as Record<string, string>)[moduleId || ''] || '';
  const type = path.startsWith('Practices ') ? 'Práctica oficial' : 'Tabla de especificaciones';
  return { id: path, url, filename, programId: programFolders[folder], subjectId: match?.[0] || '', subject: match?.[1] || filename.replace(/[-_]/g, ' ').replace(/\.pdf$/i, ''), moduleId, level, type, size: sizes[path] || 0, title: (match?.[1] || 'Material de estudio') + ' · ' + type + (level ? ' · ' + level : '') };
}).sort((a, b) => a.subject.localeCompare(b.subject, 'es') || a.title.localeCompare(b.title, 'es'));
