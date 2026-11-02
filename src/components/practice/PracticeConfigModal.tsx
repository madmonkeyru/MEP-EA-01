import { Dialog } from '../common/Dialog';
import { EvaluationModulesWidget } from './EvaluationModulesWidget';
import type { PracticeConfig } from '../../types';
/** Compatibility wrapper; configuration is maintained in one component. */
export function PracticeConfigModal({ isOpen, onClose, onStartSession, initialMode }: { isOpen: boolean; initialMode: 'area' | 'topic'; onClose: () => void; onStartSession: (config: PracticeConfig) => void }) {
  return isOpen ? <Dialog title="Preparar práctica" onClose={onClose}><EvaluationModulesWidget initialMode={initialMode} onStartSimulation={() => onStartSession({ mode:'simulation', itemCount:60, enableTimer:true, timerDurationMinutes:150 })} onStartPractice={config => { onStartSession(config); onClose(); }} /></Dialog> : null;
}
