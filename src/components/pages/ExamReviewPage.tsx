import { routeHash, type AppRoute } from '../../services/navigation';
import { reviewConfig, reviewScheduleUrl } from '../../services/reviewDraft';
import { storageService } from '../../services/storageService';
import type { PracticeConfig } from '../../types';

export function ExamReviewPage({ route, userId, onStart }: {
  route: AppRoute;
  userId: string;
  onStart: (config: PracticeConfig) => void;
}) {
  const attempts = storageService.getAttempts().filter(attempt =>
    attempt.userId === userId && attempt.session?.config.reviewDraft === reviewConfig.reviewDraft);

  return <div className="page-width py-8 space-y-6">
    <header className="page-intro rounded-3xl p-6 space-y-4">
      <p className="eyebrow">Archivo de revisión pedagógica</p>
      <h1 className="text-3xl font-semibold">Revisión de Matemáticas · I y II Ciclo</h1>
      <p>{reviewConfig.itemCount} preguntas originales · 02-2026 · Calculadora prohibida</p>
      <p>El cronómetro de revisión es de {reviewConfig.timerDurationMinutes} minutos. Al terminar, puedes comprobar cada respuesta, su explicación y su código de evidencia.</p>
      <div className="action-row">
        <button className="primary-button" onClick={() => onStart(reviewConfig)}>Iniciar examen de revisión</button>
        <a className="text-link" href={reviewScheduleUrl} target="_blank" rel="noreferrer">Horario oficial DGEC</a>
        <a className="text-link" href={routeHash({ ...route, tab: 'practice' })}>Ir a la simulación del catálogo</a>
      </div>
    </header>
    <section className="ui-surface rounded-2xl p-6 space-y-3">
      <h2 className="text-xl font-semibold">Intentos de revisión de este perfil</h2>
      {!attempts.length && <p>Aún no hay intentos guardados.</p>}
      {attempts.map(attempt => <article key={attempt.id} className="history-row">
        <div><h3 className="font-semibold">{attempt.scopeText}</h3><p>{attempt.correctCount}/{attempt.totalItems} correctas</p></div>
        <a className="text-link" href={routeHash({ ...route, view: 'results', sessionId: attempt.id })}>Revisar resultado</a>
      </article>)}
    </section>
  </div>;
}
