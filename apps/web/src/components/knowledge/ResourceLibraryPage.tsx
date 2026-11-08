import { useState } from 'react';
import { Tabs } from '../common/Tabs';
import { SpecsTable } from './SpecsTable';
import { TermsDictionary } from './TermsDictionary';
import { FormulasSheet } from './FormulasSheet';
import { OfficialResources } from './OfficialResources';
import { dataService } from '../../services/dataService';
/** Compatibility wrapper; uses the same resource panels as the subject hub. */
export function ResourceLibraryPage({ initialTab = 'specs', onGoHome, onStartPracticeByItems }: { initialTab?: 'specs' | 'terms' | 'formulas'; onGoHome: () => void; onStartPracticeByItems?: (ids: number[], title: string) => void }) {
  const [tab, setTab] = useState<string>(initialTab);
  return <section className="page-width py-6 space-y-5"><h1 tabIndex={-1}>Biblioteca de recursos · {dataService.getCurrentProgram()?.name}</h1><button className="secondary-button" onClick={onGoHome}>Volver a la materia</button><Tabs label="Recursos de la materia" value={tab} onChange={setTab} items={[{id:'pdf',label:'PDF oficiales'},{id:'specs',label:'Temario'},{id:'terms',label:'Diccionario'},{id:'formulas',label:'Fórmulas'}]}>{tab === 'pdf' ? <OfficialResources programId={dataService.getCurrentProgramId()} /> : tab === 'specs' ? <SpecsTable onStartPracticeByItems={onStartPracticeByItems} /> : tab === 'terms' ? <TermsDictionary /> : <FormulasSheet />}</Tabs></section>;
}
