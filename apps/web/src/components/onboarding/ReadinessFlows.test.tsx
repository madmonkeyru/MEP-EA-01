import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ReadinessWizard } from './ReadinessWizard';
import { FormHelper } from './FormHelper';
import { WizardProvider, useWizard, type WizardData } from './wizardStore';

afterEach(cleanup);
function open(data: Partial<WizardData>) {
  function Host() {
    const wizard = useWizard();
    return <><button onClick={() => wizard.patch(data)}>Load scenario</button><button onClick={() => wizard.patch({ language: 'frances', science: 'fisica' })}>Change language and science</button><button onClick={() => wizard.selectProgram('iii')}>Change program</button><output aria-label="Current approvals">{wizard.equiparacionRecords.length}</output><ReadinessWizard onNavigate={vi.fn()} onSkip={vi.fn()} onExplore={vi.fn()} /></>;
  }
  render(<WizardProvider><Host /></WizardProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Load scenario' }));
}
const returning: Partial<WizardData> = { program: 'bxm', step: 'ruta', age: '18-plus', schooling: 'ninth', subjects: ['matematica'], levels: [], includeScience: false, recognition: true, equiparacionPathway: 'same_program', equiparacionRecords: [{ subject: 'matematica', recognized: true }], firstEnrollment: false, recordOnFile: true, enrolled: 'not-yet' };

describe('readiness flow regressions', () => {
  it('deducts same-program approvals from the final plan and provides a completion form', () => {
    open(returning);
    const plan = screen.getByRole('heading', { name: 'Plan de pruebas' }).closest('section')!;
    expect(within(plan).getByText('0')).toBeInTheDocument();
    expect(within(plan).getByText('₡0')).toBeInTheDocument();
    expect(screen.getByText(/No quedan pruebas en esta selección/)).toBeInTheDocument();
    expect(screen.queryByText('Pida la certificación con tomo, folio y asiento')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /solicitud de título de bachiller.*PDF/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Inscríbase antes del cierre/)).not.toBeInTheDocument();
  });
  it('hides entry certificates for an accepted expediente and does not ask recognition again', () => {
    open({ ...returning, step: 'situacion' });
    expect(screen.queryByText('Certificaciones de estudio')).not.toBeInTheDocument();
    expect(screen.queryByText('¿Necesita reconocer materias ya aprobadas?')).not.toBeInTheDocument();
    expect(screen.queryByText('¿Es la primera vez que se matricula en este programa?')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Fechas para mi ruta' })).toHaveTextContent('No hay fechas de próximas pruebas');
  });
  it('supports primary approvals without offering external primary convalidation', () => {
    open({ program: 'i-ii', step: 'equiparacion', recognition: true, subjects: ['matematica'] });
    fireEvent.click(screen.getByRole('radio', { name: /Ya aprobadas en este mismo programa/ }));
    expect(screen.queryByRole('radio', { name: /Colegio formal a Educación Abierta/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Matemática' }));
    expect(screen.getByText(/no requieren una nueva equiparación/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });
  it('clears old approval records when changing recognition pathways', () => {
    open({ ...returning, step: 'equiparacion' });
    expect(screen.getByLabelText('Current approvals')).toHaveTextContent('1');
    fireEvent.click(screen.getByRole('radio', { name: /Colegio formal a Educación Abierta/ }));
    expect(screen.getByLabelText('Current approvals')).toHaveTextContent('0');
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });
  it('removes approvals for changed language/science choices and clears the old program expediente', () => {
    open({ ...returning, step: 'situacion', language: 'ingles', science: 'biologia', equiparacionRecords: [{ subject: 'matematica', recognized: true }, { subject: 'idioma', recognized: true }, { subject: 'ciencias', science: 'biologia', recognized: true }] });
    fireEvent.click(screen.getByRole('button', { name: 'Change language and science' }));
    expect(screen.getByLabelText('Current approvals')).toHaveTextContent('1');
    fireEvent.click(screen.getByRole('button', { name: 'Change program' }));
    expect(screen.getByLabelText('Current approvals')).toHaveTextContent('0');
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Certificaciones de estudio')).toBeInTheDocument();
  });
  it('keeps reported checklist progress when revisiting the route in this session', () => {
    open({ ...returning, equiparacionRecords: [] });
    const checkbox = screen.getByRole('checkbox', { name: /Confirme la convocatoria/ });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar expediente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver mi ruta' }));
    expect(screen.getByRole('checkbox', { name: /Confirme la convocatoria/ })).toBeChecked();
  });
  it('deducts external equivalences only after their recognition is reported as approved', () => {
    open({ ...returning, equiparacionPathway: 'formal_to_abierta', equiparacionOrigin: 'colegio_academico', recognitionResolved: false });
    let plan = screen.getByRole('heading', { name: 'Plan de pruebas' }).closest('section')!;
    expect(within(plan).getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/El reconocimiento está pendiente de confirmación/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Atrás' }));
    fireEvent.click(screen.getByRole('button', { name: 'Atrás' }));
    const question = screen.getByText('¿La DGEC ya aprobó el reconocimiento de estas equivalencias?').closest('fieldset')!;
    fireEvent.click(within(question).getByRole('radio', { name: 'Sí' }));
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver mi ruta' }));
    plan = screen.getByRole('heading', { name: 'Plan de pruebas' }).closest('section')!;
    expect(within(plan).getByText('0')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /Arme el reconocimiento/ })).not.toBeInTheDocument();
  });
  it('finds actual recognition forms and reports unmatched searches', () => {
    render(<FormHelper program="edad" initialProcess="recognition" />);
    expect(screen.getByRole('link', { name: /décimo año.*PDF/i }).getAttribute('href')).toMatch(/\.pdf/);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar formulario' }), { target: { value: 'does not exist' } });
    expect(screen.getByText('0 formularios disponibles')).toBeInTheDocument();
    expect(screen.getByText(/No hay un formulario incorporado/)).toBeInTheDocument();
  });
});
