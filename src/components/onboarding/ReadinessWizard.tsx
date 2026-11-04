import { useEffect, useRef, useState, useId } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  RotateCcw,
  Route,
  School,
  Check,
  type LucideIcon,
} from "lucide-react";
import { colones, LEVEL_LABEL, PROGRAM_LEVELS, PROGRAM_SUBJECTS, PROGRAMS, SCIENCE_LABEL, subjectLabel } from "../../services/onboarding/catalog";
import { CHECK, enrollmentLine, FIT_LABEL, narrate, REASON } from "../../services/onboarding/copy";
import { buildReport, examPlan, programNeedsScope, scopeIsComplete } from "../../services/onboarding/evaluate";
import {
  evaluateEquiparacion,
  type EquiparacionPathway,
  type OriginSystem,
} from "../../services/onboarding/equiparacion";
import { profileFrom, scopeFrom, stepsFor, useWizard, type WizardData } from "./wizardStore";
import type { AgeBand, Certs, CheckId, Confidence, Enroll, Fit, Hours, LevelId, ProgramId, Schooling, ScienceId, Skill, StepId, StudyStyle, SubjectId } from "../../services/onboarding/types";
import { PROGRAM_ORDER } from "../../services/onboarding/types";
import { Dialog } from '../common/Dialog';
import { cn } from "./cn";
import { helperProgramRoute } from './HelperPage';
import type { AppRoute } from '../../services/navigation';

const STEP_LABEL: Record<StepId, string> = {
  meta: "Meta",
  alcance: "Materias",
  perfil: "Requisitos",
  equiparacion: "Equiparación",
  situacion: "Expediente",
  ruta: "Ruta",
};

const PROGRAM_CHOICE: { id: ProgramId | "unsure"; title: string; detail: string; icon: LucideIcon }[] = [
  { id: "i-ii", title: "I y II Ciclo", detail: "Primaria por suficiencia. Cinco pruebas, desde los 14 años.", icon: BookOpen },
  { id: "iii", title: "III Ciclo", detail: "7°, 8° y 9°. Seis materias, Inglés incluido, en cada nivel.", icon: School },
  { id: "edad", title: "EDAD", detail: "Bachillerato a distancia. 16 años cumplidos al inicio. Dos pruebas por materia.", icon: GraduationCap },
  { id: "bxm", title: "BXM", detail: "Bachillerato por madurez. Desde los 18, con excepciones puntuales.", icon: Route },
  { id: "unsure", title: "No estoy seguro", detail: "Quiero ver para cuáles programas cumplo requisitos.", icon: Compass },
];

const AGES: { value: AgeBand; title: string }[] = [
  { value: "under-14", title: "Menos de 14" },
  { value: "14-15", title: "14 o 15" },
  { value: "16-17", title: "16 o 17" },
  { value: "18-plus", title: "18 o más" },
];

const SCHOOLING: { value: Schooling; title: string; detail: string }[] = [
  { value: "no-primary", title: "No he completado la primaria", detail: "Sin 6° año aprobado." },
  { value: "primary", title: "Primaria completa", detail: "6° año. I y II Ciclo listos." },
  { value: "partial-iii", title: "III Ciclo a medias", detail: "Hay 7° u 8°, pero no el 9°." },
  { value: "ninth", title: "9° año aprobado", detail: "III Ciclo completo, sin diversificada." },
  { value: "partial-div", title: "Hay materias de 10° o 11°", detail: "El 9° ya está. El bachillerato, no." },
  { value: "bachiller", title: "Ya tengo el bachillerato", detail: "Bachiller en Educación Media." },
];

const SKILLS: { value: Skill; title: string }[] = [
  { value: "solid", title: "Con soltura" },
  { value: "basic", title: "Básica" },
  { value: "not-yet", title: "Todavía no" },
];

const STYLES: { value: StudyStyle; title: string; detail: string }[] = [
  { value: "supported", title: "Con acompañamiento", detail: "Con tutorías, apoyo docente o proyectos oficiales de preparación." },
  { value: "self", title: "Por mi cuenta", detail: "A mi ritmo, al modo de BXM." },
  { value: "unsure", title: "Todavía no lo sé", detail: "Que la ruta lo sugiera." },
];

const ENROLLS: { value: Enroll; title: string; detail: string }[] = [
  { value: "enrolled", title: "Ya estoy inscrito", detail: "Tengo una convocatoria activa." },
  { value: "in-process", title: "Trámite en curso", detail: "Entregué papeles y espero confirmación." },
  { value: "not-yet", title: "Todavía no", detail: "No he abierto la inscripción." },
  { value: "unsure", title: "No sé si sigue activa", detail: "Me inscribí antes y no lo he confirmado." },
];

const CERTS: { value: Certs; title: string; detail: string }[] = [
  { value: "ready", title: "Las tengo listas", detail: "Firmadas y completas." },
  { value: "partial", title: "Están incompletas", detail: "Falta una firma, un año o una copia." },
  { value: "missing", title: "No las tengo", detail: "Todavía no las pido." },
];

const HOURS: { value: Hours; title: string }[] = [
  { value: "0-2", title: "Menos de 3 horas" },
  { value: "3-5", title: "3 a 5 horas" },
  { value: "6-10", title: "6 a 10 horas" },
  { value: "10-plus", title: "Más de 10 horas" },
];

const CONFIDENCE: { value: Confidence; title: string; detail: string }[] = [
  { value: "low", title: "Parto de cero", detail: "Necesito ver el temario desde el inicio." },
  { value: "mid", title: "Puedo repasar con guía", detail: "Hay base, faltan huecos." },
  { value: "high", title: "Me siento listo para la prueba", detail: "Quiero ensayar el formato, no aprenderlo." },
];

const AGE_LABEL: Record<AgeBand, string> = {
  "under-14": "Menos de 14",
  "14-15": "14 o 15",
  "16-17": "16 o 17",
  "18-plus": "18 o más",
};

const SKILL_LABEL: Record<Skill, string> = {
  solid: "Con soltura",
  basic: "Básica",
  "not-yet": "Todavía no",
};

function missingHint(data: WizardData): string | null {
  if (data.step === "meta" && !data.program) return "Elija una meta para continuar.";
  if (data.step === "alcance" && programNeedsScope(data.program)) {
    if ((data.program === "iii" || data.program === "edad") && data.levels.length === 0) {
      return "Elija al menos un nivel.";
    }
    if ((data.program === "edad" || data.program === "bxm") && data.includeScience && !data.science) {
      return "Elija Biología, Física o Química.";
    }
    if ((data.program === 'edad' || data.program === 'bxm') && data.subjects.includes('idioma') && !data.language) return 'Elija Inglés o Francés.';
    if (!scopeIsComplete(data.program, scopeFrom(data))) return "Elija al menos una materia.";
  }
  if (data.step === "perfil") {
    if (!data.schooling) return "Indica tu último tramo aprobado.";
    if (!data.age) return "Indica la edad de referencia para tu convocatoria.";
  }
  if (data.step === "equiparacion") {
    if (!data.equiparacionPathway) return "Seleccione la vía de equiparación o reconocimiento.";
  }

  return null;
}

function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" ? "bg-primary text-primary-fg hover:bg-primary-strong" : "text-ink hover:bg-paper",
        className,
      )}
    />
  );
}

function Mark({ type, checked }: { type: "radio" | "checkbox"; checked: boolean }) {
  if (type === "checkbox") {
    return (
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
          checked ? "border-primary bg-primary text-primary-fg" : "border-line bg-surface",
        )}
        aria-hidden
      >
        {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
        checked ? "border-primary bg-primary" : "border-line bg-surface",
      )}
      aria-hidden
    >
      {checked ? <span className="size-2 rounded-full bg-paper" /> : null}
    </span>
  );
}

function Choice({
  type,
  name,
  value,
  checked,
  onSelect,
  title,
  detail,
  icon: Icon,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  detail?: string;
  icon?: LucideIcon;
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border px-3.5 py-3 transition-colors duration-200",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        checked ? "border-primary bg-primary-soft" : "border-line bg-paper hover:border-primary",
      )}
    >
      <input aria-required={name === "age" || name === "schooling" ? true : undefined} className="sr-only" type={type} name={name} value={value} checked={checked} onChange={onSelect} />
      {Icon ? (
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            checked ? "bg-primary text-primary-fg" : "bg-surface text-primary",
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </span>
      ) : (
        <Mark type={type} checked={checked} />
      )}
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-snug sm:text-base">{title}</span>
        {detail ? <span className="mt-0.5 block text-sm leading-snug text-muted">{detail}</span> : null}
      </span>
    </label>
  );
}

function Question({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  const helpId = useId();
  return (
    <fieldset aria-describedby={hint ? helpId : undefined} className="space-y-3">
      <legend className="text-base font-semibold">{legend}</legend>
      {hint ? <p id={helpId} className="text-sm leading-relaxed text-muted">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

function StepHeading({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <header className="max-w-2xl">
      <p className="text-sm font-semibold tracking-wide text-primary">{kicker}</p>
      <h1 className="mt-2 text-3xl text-ink sm:text-4xl">{title}</h1>
      <p className="mt-3 leading-relaxed text-muted">{lede}</p>
    </header>
  );
}

function SelectionStrip() {
  const data = useWizard();
  if (!data.program) return null;
  if (data.program === "unsure") {
    return <p className="text-sm text-muted">Sin programa fijo. La ruta se propone al final.</p>;
  }
  const program = data.program;
  const names = data.subjects.map((subject) => subjectLabel(program, subject));
  if (data.includeScience) names.push(data.science ? SCIENCE_LABEL[data.science] : "Ciencias");
  const bits = [PROGRAMS[data.program].name];
  if (data.levels.length > 0) bits.push(data.levels.map((level) => LEVEL_LABEL[level]).join(" · "));
  if (names.length > 0) bits.push(names.join(", "));
  return <p className="text-sm leading-relaxed text-muted">{bits.join(" — ")}</p>;
}

function Aside() {
  const step = useWizard((state) => state.step);
  const program = useWizard((state) => state.program);
  const recognition = useWizard((state) => state.recognition);
  const patch = useWizard((state) => state.patch);
  const steps = stepsFor(program, recognition);
  const index = Math.max(0, steps.indexOf(step));

  return (
    <aside className="lg:sticky lg:top-[calc(var(--app-header-height)+1rem)] lg:self-start">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-fg">
          <Compass className="size-6" aria-hidden />
        </span>
        <div>
          <p className="font-display text-xl font-semibold leading-none">Brújula Abierta</p>
          <p className="mt-1 text-sm text-muted">Educación Abierta</p>
        </div>
      </div>
      <p className="mt-4 hidden text-sm leading-relaxed text-muted lg:block">
        Ubique el programa, las materias y si el expediente ya da para una convocatoria.
      </p>
      <ol className="mt-5 hidden gap-1 lg:grid">
        {steps.map((id, itemIndex) => {
          const active = id === step;
          const locked = itemIndex > index;
          return (
            <li key={id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => patch({ step: id })}
                className={cn(
                  "flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-sm",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  active ? "bg-primary-soft font-semibold text-ink" : "text-muted",
                  locked ? "opacity-40" : "hover:bg-surface",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                    active || itemIndex < index ? "bg-primary text-primary-fg" : "bg-line text-ink",
                  )}
                >
                  {itemIndex + 1}
                </span>
                {STEP_LABEL[id]}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 lg:hidden">
        <p className="text-sm font-semibold">
          <span className="tabular-nums">
            Paso {index + 1} de {steps.length}
          </span>
          <span className="font-normal text-muted"> · {STEP_LABEL[steps[index] ?? "meta"]}</span>
        </p>
        <div className="mt-2 flex gap-1.5" aria-hidden>
          {steps.map((id, itemIndex) => (
            <span key={id} className={cn("h-1.5 flex-1 rounded-full", itemIndex <= index ? "bg-primary" : "bg-line")} />
          ))}
        </div>
      </div>
      <p className="mt-6 hidden text-xs leading-relaxed text-muted lg:block">
        Independiente del MEP. Usted anota su situación; aquí no se consultan bases oficiales.
      </p>
    </aside>
  );
}

function MetaStep() {
  const program = useWizard((state) => state.program);
  const selectProgram = useWizard((state) => state.selectProgram);
  return (
    <div className="space-y-6">
      <StepHeading
        kicker="Meta"
        title="¿Para qué se está preparando?"
        lede="Elija un programa o reciba una sugerencia según su edad y estudios. No necesita completar esta guía para usar la plataforma."
      />
      <div className="grid gap-2">
        {PROGRAM_CHOICE.map((item) => (
          <Choice
            key={item.id}
            type="radio"
            name="program"
            value={item.id}
            checked={program === item.id}
            onSelect={() => selectProgram(item.id)}
            title={item.title}
            detail={item.detail}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}

function toggleListed<T extends string>(order: readonly T[], current: readonly T[], value: T): T[] {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return order.filter((item) => next.has(item));
}

function AlcanceStep() {
  const data = useWizard();
  const patch = data.patch;
  const program = data.program;
  if (!programNeedsScope(program)) return null;
  const copy = PROGRAMS[program];
  const scope = scopeFrom(data);
  const ready = scopeIsComplete(program, scope);
  const plan = ready ? examPlan(program, scope, false) : null;
  const scienceProgram = program === "edad" || program === "bxm";

  return (
    <div className="space-y-6">
      <StepHeading
        kicker={copy.offer}
        title="¿Qué pruebas va a presentar?"
        lede={`${copy.topology} Marque las materias y niveles pendientes. El total es un plan de estudio, no una matrícula simultánea: en EDAD debe aprobar prueba 1 antes de inscribir prueba 2 de esa materia.`}
      />
      <dl className="grid gap-4 rounded-2xl bg-paper p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">Modalidad</dt>
          <dd className="mt-1 font-semibold">{copy.mode}</dd>
        </div>
        <div>
          <dt className="text-muted">Nota mínima</dt>
          <dd className="mt-1 font-semibold tabular-nums">{copy.pass}</dd>
        </div>
        <div>
          <dt className="text-muted">Costo de referencia</dt>
          <dd className="mt-1 font-semibold tabular-nums">{colones(8000)} por prueba</dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg">Alcance</h2>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            patch({
              subjects: [...PROGRAM_SUBJECTS[program]],
              levels: [...PROGRAM_LEVELS[program]],
              includeScience: scienceProgram,
            })
          }
        >
          Programa completo
        </Button>
      </div>
      {PROGRAM_LEVELS[program].length > 0 ? (
        <Question legend={program === "edad" ? "Partes" : "Niveles"}>
          <div className="grid gap-2 sm:grid-cols-3">
            {PROGRAM_LEVELS[program].map((level) => (
              <Choice
                key={level}
                type="checkbox"
                name="levels"
                value={level}
                checked={data.levels.includes(level)}
                onSelect={() => patch({ levels: toggleListed(PROGRAM_LEVELS[program], data.levels, level) })}
                title={LEVEL_LABEL[level]}
              />
            ))}
          </div>
        </Question>
      ) : null}
      <Question legend="Materias">
        <div className="grid gap-2 sm:grid-cols-2">
          {PROGRAM_SUBJECTS[program].map((subject) => (
            <Choice
              key={subject}
              type="checkbox"
              name="subjects"
              value={subject}
              checked={data.subjects.includes(subject)}
              onSelect={() =>
                patch({ subjects: toggleListed(PROGRAM_SUBJECTS[program], data.subjects, subject as SubjectId) })
              }
              title={subjectLabel(program, subject)}
            />
          ))}
          {scienceProgram ? (
            <Choice
              type="checkbox"
              name="subjects"
              value="ciencias"
              checked={data.includeScience}
              onSelect={() => patch({ includeScience: !data.includeScience })}
              title="Ciencias"
              detail="Se presenta una: Biología, Física o Química."
            />
          ) : null}
        </div>
      </Question>
      {scienceProgram && data.includeScience ? (
        <Question legend="¿Cuál ciencia?" hint="En EDAD y BXM no se presentan las tres.">
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(SCIENCE_LABEL) as ScienceId[]).map((science) => (
              <Choice
                key={science}
                type="radio"
                name="science"
                value={science}
                checked={data.science === science}
                onSelect={() => patch({ science })}
                title={SCIENCE_LABEL[science]}
              />
            ))}
          </div>
        </Question>
      ) : null}
      {scienceProgram && data.subjects.includes('idioma') && <Question legend="¿Cuál idioma?">
        <div className="grid gap-2 sm:grid-cols-2">
          <Choice type="radio" name="language" value="ingles" checked={data.language === 'ingles'} onSelect={() => patch({ language: 'ingles' })} title="Inglés" />
          <Choice type="radio" name="language" value="frances" checked={data.language === 'frances'} onSelect={() => patch({ language: 'frances' })} title="Francés" />
        </div>
      </Question>}
      <ul className="space-y-2 text-sm leading-relaxed text-muted">
        {copy.rules.map((rule) => (
          <li key={rule} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            <span>{rule}</span>
          </li>
        ))}
      </ul>
      {plan ? (
        <p className="text-sm font-semibold tabular-nums">
          {plan.totalTests} {plan.totalTests === 1 ? "prueba" : "pruebas"} · {colones(plan.fee)} · nota {plan.pass}
        </p>
      ) : null}
    </div>
  );
}

function PerfilStep() {
  const data = useWizard();
  const patch = data.patch;
  return (
    <div className="space-y-8">
      <StepHeading
        kicker="Requisitos"
        title="¿A cuáles programas puede optar?"
        lede="Con edad y estudios puedes recibir una sugerencia provisional. Las demás preguntas son opcionales. Lo que omitas quedará por confirmar."
      />
      <SelectionStrip />
      <Question legend="Último tramo ya aprobado">
        <div className="grid gap-2">
          {SCHOOLING.map((item) => (
            <Choice
              key={item.value}
              type="radio"
              name="schooling"
              value={item.value}
              checked={data.schooling === item.value}
              onSelect={() => patch({ schooling: item.value })}
              title={item.title}
              detail={item.detail}
            />
          ))}
        </div>
      </Question>

      <Question legend="Edad" hint="EDAD cuenta los 16 cumplidos al inicio de la convocatoria, no el día de esta ficha.">
        <div className="grid gap-2 sm:grid-cols-2">
          {AGES.map((item) => (
            <Choice
              key={item.value}
              type="radio"
              name="age"
              value={item.value}
              checked={data.age === item.value}
              onSelect={() => patch({ age: item.value })}
              title={item.title}
            />
          ))}
        </div>
      </Question>
      {data.age && data.age !== "18-plus" && (data.schooling === "ninth" || data.schooling === "partial-div") ? (
        <Question
          legend="¿Es madre adolescente y puede demostrarlo?"
          hint="Esta es una de las excepciones de edad de BXM. Debe confirmarla con la DGEC."
        >
          <YesNo name="mother" value={data.adolescentMother} onChange={(adolescentMother) => patch({ adolescentMother })} />
        </Question>
      ) : null}
      {data.age && data.age !== "18-plus" && (data.schooling === "ninth" || data.schooling === "partial-div") ? (
        <Question
          legend="¿Viene del bachillerato formal, aunque sea menor de edad?"
          hint="Esta excepción requiere proceder del bachillerato formal y una certificación del colegio sobre la asignatura que inscribe. Haber cursado cualquier año de colegio no basta."
        >
          <YesNo
            name="formal"
            value={data.formalBachillerato}
            onChange={(formalBachillerato) => patch({ formalBachillerato })}
          />
        </Question>
      ) : null}
      {data.program && data.program !== "i-ii" && data.program !== "unsure" && (
        <Question
          legend="¿Tiene asignaturas aprobadas que desee someter a equiparación o convalidación?"
          hint="Si activa esta opción, se abrirá el paso interactivo de Equiparación para calcular su carga académica restante."
        >
          <YesNo name="recognition" value={data.recognition} onChange={(recognition) => patch({ recognition })} />
        </Question>
      )}
      {data.schooling === "no-primary" && <details><summary>Habilidades básicas · Opcional, por confirmar si no respondes</summary><Question legend="Lectoescritura en español" hint="Hay que poder leer y escribir. No es una materia aparte.">
        <div className="grid gap-2 sm:grid-cols-3">
          {SKILLS.map((item) => (
            <Choice
              key={item.value}
              type="radio"
              name="literacy"
              value={item.value}
              checked={data.literacy === item.value}
              onSelect={() => patch({ literacy: item.value })}
              title={item.title}
            />
          ))}
        </div>
      </Question>
      <Question legend="Las cuatro operaciones" hint="Suma, resta, multiplicación y división.">
        <div className="grid gap-2 sm:grid-cols-3">
          {SKILLS.map((item) => (
            <Choice
              key={item.value}
              type="radio"
              name="numeracy"
              value={item.value}
              checked={data.numeracy === item.value}
              onSelect={() => patch({ numeracy: item.value })}
              title={item.title}
            />
          ))}
        </div>
      </Question>
      </details>}
      <Question legend="¿Tiene estudios en el extranjero que quiera hacer valer?">
        <YesNo name="foreign" value={data.foreignStudies} onChange={(foreignStudies) => patch({ foreignStudies })} />
      </Question>
      <Question legend="Si llega al bachillerato, ¿cómo prefiere prepararse?">
        <div className="grid gap-2">
          {STYLES.map((item) => (
            <Choice
              key={item.value}
              type="radio"
              name="style"
              value={item.value}
              checked={data.studyStyle === item.value}
              onSelect={() => patch({ studyStyle: item.value })}
              title={item.title}
              detail={item.detail}
            />
          ))}
        </div>
      </Question>
    </div>
  );
}

function YesNo({ name, value, onChange }: { name: string; value: boolean | null; onChange: (value: boolean | null) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Choice type="radio" name={name} value="si" checked={value === true} onSelect={() => onChange(true)} title="Sí" />
      <Choice type="radio" name={name} value="no" checked={value === false} onSelect={() => onChange(false)} title="No" />
      <Choice type="radio" name={name} value="unknown" checked={value === null} onSelect={() => onChange(null)} title="No sé / Prefiero no responder" />
    </div>
  );
}

const EQUIPARACION_PATHWAYS: { value: EquiparacionPathway; title: string; detail: string }[] = [
  {
    value: "formal_to_abierta",
    title: "Colegio formal a Educación Abierta",
    detail: "Materias o años aprobados en Colegio Académico, Técnico, CINDEA o IPEC.",
  },
  {
    value: "abierta_to_abierta",
    title: "Entre programas de Educación Abierta",
    detail: "Traslado de asignaturas aprobadas entre EDAD y BXM.",
  },
  {
    value: "foreign_homologation",
    title: "Estudios cursados en el extranjero",
    detail: "Homologación de títulos o notas cursadas fuera de Costa Rica.",
  },
];

const ORIGIN_SYSTEMS: { value: OriginSystem; title: string }[] = [
  { value: "colegio_academico", title: "Colegio Académico" },
  { value: "colegio_tecnico", title: "Colegio Técnico Profesional" },
  { value: "cindea_ipec", title: "CINDEA o IPEC" },
  { value: "edad", title: "EDAD (Educación Diversificada a Distancia)" },
  { value: "bxm", title: "BXM (Bachillerato por Madurez)" },
  { value: "extranjero", title: "Institución extranjera" },
];

function EquiparacionStep() {
  const data = useWizard();
  const patch = data.patch;
  const program = data.program;

  if (!program || program === "unsure" || program === "i-ii") {
    return (
      <div className="space-y-4">
        <StepHeading
          kicker="Equiparación"
          title="No aplica convalidación formal"
          lede="I y II Ciclo o metas no definidas no realizan convalidaciones de asignaturas previas."
        />
        <Button type="button" onClick={() => patch({ step: "situacion" })}>
          Continuar al expediente
        </Button>
      </div>
    );
  }

  const analysis = data.equiparacionPathway
    ? evaluateEquiparacion({
        pathway: data.equiparacionPathway,
        targetProgram: program,
        originSystem: data.equiparacionOrigin || "colegio_academico",
        recognizedRecords: data.equiparacionRecords,
        chosenLanguage: data.language || "ingles",
        chosenScience: data.science || "biologia",
        hasForeignResolution: data.hasForeignResolution ?? false,
      })
    : null;

  function toggleRecord(subject: SubjectId, level?: LevelId, science?: ScienceId) {
    const records = [...data.equiparacionRecords];
    const index = records.findIndex(
      (r) => r.subject === subject && r.level === level && (science ? r.science === science : true),
    );
    if (index >= 0) {
      records.splice(index, 1);
    } else {
      records.push({ subject, level, science, recognized: true });
    }
    patch({ equiparacionRecords: records });
  }

  function isRecordRecognized(subject: SubjectId, level?: LevelId, science?: ScienceId): boolean {
    return data.equiparacionRecords.some(
      (r) => r.subject === subject && r.level === level && (science ? r.science === science : true) && r.recognized,
    );
  }

  return (
    <div className="space-y-8">
      <StepHeading
        kicker="Reconocimiento y Equiparación"
        title="Evaluador de materias previas"
        lede="Calcule qué materias se le reconocen formalmente según la normativa MEP DGEC, cuántas pruebas le restan y qué documentos debe consignar."
      />

      <Question legend="1. Vía oficial de equiparación">
        <div className="grid gap-2">
          {EQUIPARACION_PATHWAYS.map((p) => (
            <Choice
              key={p.value}
              type="radio"
              name="equiparacionPathway"
              value={p.value}
              checked={data.equiparacionPathway === p.value}
              onSelect={() => patch({ equiparacionPathway: p.value })}
              title={p.title}
              detail={p.detail}
            />
          ))}
        </div>
      </Question>

      {data.equiparacionPathway && (
        <Question legend="2. Sistema educativo de origen">
          <div className="grid gap-2 sm:grid-cols-2">
            {ORIGIN_SYSTEMS.map((s) => (
              <Choice
                key={s.value}
                type="radio"
                name="equiparacionOrigin"
                value={s.value}
                checked={data.equiparacionOrigin === s.value}
                onSelect={() => patch({ equiparacionOrigin: s.value })}
                title={s.title}
              />
            ))}
          </div>
        </Question>
      )}

      {data.equiparacionPathway === "foreign_homologation" && (
        <Question
          legend="¿Cuenta ya con resolución oficial emitida por el Depto. de Estudios Extranjeros de la DGEC?"
          hint="Sin esta resolución, Yo Aplico no habilitará la matrícula de pruebas finales de bachillerato o tercer ciclo."
        >
          <YesNo
            name="foreignResolution"
            value={data.hasForeignResolution}
            onChange={(hasForeignResolution) => patch({ hasForeignResolution })}
          />
        </Question>
      )}

      {data.equiparacionPathway && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">3. Marque las asignaturas que ya tiene aprobadas</h2>
          <p className="text-sm text-muted">
            Seleccione las materias aprobadas con nota igual o superior a la mínima requerida (65 en III Ciclo, 70 en EDAD/BXM).
          </p>

          {program === "iii" && (
            <div className="space-y-4">
              {PROGRAM_LEVELS.iii.map((lvl) => (
                <fieldset key={lvl} className="rounded-2xl border border-line bg-paper p-4">
                  <legend className="px-2 font-semibold text-primary">{LEVEL_LABEL[lvl]}</legend>
                  <div className="grid gap-2 sm:grid-cols-2 mt-2">
                    {PROGRAM_SUBJECTS.iii.map((subj) => (
                      <Choice
                        key={`${lvl}-${subj}`}
                        type="checkbox"
                        name={`rec-${lvl}-${subj}`}
                        value={`${lvl}-${subj}`}
                        checked={isRecordRecognized(subj, lvl)}
                        onSelect={() => toggleRecord(subj, lvl)}
                        title={subjectLabel("iii", subj)}
                      />
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          {program === "edad" && (
            <div className="space-y-4">
              {PROGRAM_LEVELS.edad.map((lvl) => (
                <fieldset key={lvl} className="rounded-2xl border border-line bg-paper p-4">
                  <legend className="px-2 font-semibold text-primary">{LEVEL_LABEL[lvl]}</legend>
                  <div className="grid gap-2 sm:grid-cols-2 mt-2">
                    {PROGRAM_SUBJECTS.edad.map((subj) => (
                      <Choice
                        key={`${lvl}-${subj}`}
                        type="checkbox"
                        name={`rec-${lvl}-${subj}`}
                        value={`${lvl}-${subj}`}
                        checked={isRecordRecognized(subj, lvl)}
                        onSelect={() => toggleRecord(subj, lvl)}
                        title={subj === "idioma" ? (data.language === "frances" ? "Francés" : "Inglés") : subjectLabel("edad", subj)}
                      />
                    ))}
                    <Choice
                      type="checkbox"
                      name={`rec-${lvl}-ciencias`}
                      value={`${lvl}-ciencias`}
                      checked={isRecordRecognized("ciencias", lvl, data.science || "biologia")}
                      onSelect={() => toggleRecord("ciencias", lvl, data.science || "biologia")}
                      title={`Ciencias (${SCIENCE_LABEL[data.science || "biologia"]})`}
                    />
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          {program === "bxm" && (
            <fieldset className="rounded-2xl border border-line bg-paper p-4">
              <legend className="px-2 font-semibold text-primary">Bachillerato por Madurez</legend>
              <div className="grid gap-2 sm:grid-cols-2 mt-2">
                {PROGRAM_SUBJECTS.bxm.map((subj) => (
                  <Choice
                    key={`bxm-${subj}`}
                    type="checkbox"
                    name={`rec-bxm-${subj}`}
                    value={`bxm-${subj}`}
                    checked={isRecordRecognized(subj)}
                    onSelect={() => toggleRecord(subj)}
                    title={subj === "idioma" ? (data.language === "frances" ? "Francés" : "Inglés") : subjectLabel("bxm", subj)}
                  />
                ))}
                <Choice
                  type="checkbox"
                  name="rec-bxm-ciencias"
                  value="bxm-ciencias"
                  checked={isRecordRecognized("ciencias", undefined, data.science || "biologia")}
                  onSelect={() => toggleRecord("ciencias", undefined, data.science || "biologia")}
                  title={`Ciencias (${SCIENCE_LABEL[data.science || "biologia"]})`}
                />
              </div>
            </fieldset>
          )}
        </div>
      )}

      {analysis && (
        <section className="rounded-3xl border border-line bg-surface p-5 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <h3 className="text-xl font-bold">Balance de Equiparación Calculado</h3>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              DGEC Normativa Vigente
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div className="rounded-xl bg-paper p-3 border border-line">
              <span className="text-muted block text-xs">Materias Reconocidas</span>
              <span className="text-2xl font-bold text-ink tabular-nums">{analysis.recognizedItems.length}</span>
            </div>
            <div className="rounded-xl bg-paper p-3 border border-line">
              <span className="text-muted block text-xs">Pruebas Restantes</span>
              <span className="text-2xl font-bold text-accent tabular-nums">{analysis.totalRemainingTests}</span>
            </div>
            <div className="rounded-xl bg-paper p-3 border border-line">
              <span className="text-muted block text-xs">Costo Estimado de Matrícula</span>
              <span className="text-2xl font-bold text-ink tabular-nums">{colones(analysis.estimatedFee)}</span>
            </div>
          </div>

          {analysis.warnings.length > 0 && (
            <div className="rounded-xl bg-accent-soft p-4 border border-line text-sm text-ink space-y-2">
              <p className="font-semibold text-accent">Avisos importantes de admisibilidad:</p>
              <ul className="list-disc list-inside space-y-1">
                {analysis.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-base">Requisitos documentales obligatorios</h4>
            <p className="text-xs text-muted">
              {analysis.guidelines.criticalNotice} (Tiempo estimado: {analysis.guidelines.leadTimeWeeks} semanas).
            </p>
            <div className="space-y-2">
              {analysis.guidelines.requiredDocuments.map((doc) => (
                <div key={doc.code} className="rounded-xl border border-line bg-paper p-3 text-sm flex gap-3 items-start">
                  <span className="rounded-md bg-surface px-2 py-1 text-xs font-mono font-semibold text-muted shrink-0">
                    {doc.code}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{doc.title}</p>
                    <p className="text-xs text-muted mt-0.5">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {analysis.guidelines.emailTarget && (
              <p className="text-xs text-muted">
                Canal oficial de recepción: <span className="font-mono font-semibold text-primary">{analysis.guidelines.emailTarget}</span>
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function SituacionStep() {
  const data = useWizard();
  const patch = data.patch;
  return (
    <div className="space-y-8">
      <StepHeading
        kicker="Expediente"
        title="¿Qué tan listo está el trámite?"
        lede="Este paso es opcional. Puedes dejar datos sin responder: se mostrarán como pendientes de confirmar. No verifica matrícula ni predice una nota."
      />
      <SelectionStrip />
      <Question legend="Inscripción en una convocatoria">
        <div className="grid gap-2">
          {ENROLLS.map((item) => (
            <Choice
              key={item.value}
              type="radio"
              name="enrolled"
              value={item.value}
              checked={data.enrolled === item.value}
              onSelect={() => patch({ enrolled: item.value })}
              title={item.title}
              detail={item.detail}
            />
          ))}
        </div>
      </Question>
      <Question
        legend="¿Es la primera vez que se matricula en este programa?"
        hint="Los documentos dependen del programa y de la prueba. EDAD pide acreditar III Ciclo para prueba 1 y las materias aprobadas de prueba 1 para prueba 2."
      >
        <YesNo name="first" value={data.firstEnrollment} onChange={(firstEnrollment) => patch({ firstEnrollment })} />
      </Question>
      <Question
        legend="¿Conoce las fechas de la convocatoria en la que quiere presentarse?"
        hint="Cada convocatoria abre y cierra por su lado."
      >
        <YesNo name="window" value={data.knowsWindow} onChange={(knowsWindow) => patch({ knowsWindow })} />
      </Question>
      <Question legend="¿Tiene documento de identidad vigente?">
        <YesNo name="id" value={data.hasId} onChange={(hasId) => patch({ hasId })} />
      </Question>
      <Question
        legend="Certificaciones de estudio"
        hint="En primaria por suficiencia no se usan para convalidar. En III Ciclo, EDAD y BXM, sí."
      >
        <div className="grid gap-2">
          {CERTS.map((item) => (
            <Choice
              key={item.value}
              type="radio"
              name="certs"
              value={item.value}
              checked={data.certificates === item.value}
              onSelect={() => patch({ certificates: item.value })}
              title={item.title}
              detail={item.detail}
            />
          ))}
        </div>
      </Question>
      <Question
        legend="¿Necesita reconocer materias ya aprobadas?"
        hint="Colegio, IPEC, CINDEA u otro. El reconocimiento no es automático."
      >
        <YesNo name="recognition" value={data.recognition} onChange={(recognition) => patch({ recognition })} />
      </Question>
      <Question legend="Horas de estudio por semana">
        <div className="grid gap-2 sm:grid-cols-2">
          {HOURS.map((item) => (
            <Choice
              key={item.value}
              type="radio"
              name="hours"
              value={item.value}
              checked={data.hours === item.value}
              onSelect={() => patch({ hours: item.value })}
              title={item.title}
            />
          ))}
        </div>
      </Question>
      <Question legend="¿Tiene materiales alineados a este programa?">
        <YesNo name="materials" value={data.materials} onChange={(materials) => patch({ materials })} />
      </Question>
      <Question legend="¿Qué tan preparado se siente en esas materias?">
        <div className="grid gap-2">
          {CONFIDENCE.map((item) => (
            <Choice
              key={item.value}
              type="radio"
              name="confidence"
              value={item.value}
              checked={data.confidence === item.value}
              onSelect={() => patch({ confidence: item.value })}
              title={item.title}
              detail={item.detail}
            />
          ))}
        </div>
      </Question>
    </div>
  );
}

function CheckCopy({ id }: { id: CheckId }) {
  const item = CHECK[id];
  return (
    <div>
      <p className="font-semibold">{item.title}</p>
      <p className="text-sm leading-relaxed text-muted">{item.detail}</p>
      {item.href ? (
        <a
          className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline"
          href={item.href}
          target="_blank"
          rel="noreferrer"
        >
          {item.hrefLabel}
        </a>
      ) : null}
    </div>
  );
}

function fitDot(fit: Fit): string {
  if (fit === "eligible") return "bg-primary";
  if (fit === "conditional") return "bg-accent";
  if (fit === "surpassed") return "border border-line bg-surface";
  return "bg-line";
}

function RutaStep({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const data = useWizard();
  const patch = data.patch;
  const [confirmReset, setConfirmReset] = useState(false);
  const profile = profileFrom(data);
  if (!data.program || !profile) {
    return (
      <div className="space-y-4">
        <StepHeading
          kicker="Ruta"
          title="Faltan respuestas"
          lede="Sin el perfil completo no se puede decir qué programas se abren."
        />
        <Button type="button" onClick={() => patch({ step: "perfil" })}>
          Volver al perfil
        </Button>
      </div>
    );
  }

  const report = buildReport({
    profile,
    chosen: data.program,
    scope: data.program === "unsure" || !scopeIsComplete(data.program, scopeFrom(data)) ? null : scopeFrom(data),
  });
  const story = narrate(report);
  const chosenOpen = report.chosenFit === "eligible" || report.chosenFit === "conditional";
  const schooling = SCHOOLING.find((item) => item.value === profile.schooling);

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold text-primary">Su ruta</p>
        <h1 className="mt-2 text-3xl text-ink sm:text-4xl">{report.focus ? "Ruta sugerida: " + PROGRAMS[report.focus].name : "Confirma tu siguiente paso con la DGEC"}</h1>
        <p className="mt-3 leading-relaxed text-muted">{story.lede} Esta sugerencia es provisional; los datos omitidos requieren confirmación.</p>
        {report.focus && <div className="action-row mt-4"><Button onClick={() => onNavigate(helperProgramRoute(report.focus!))}>Explorar mi programa</Button><Button variant="ghost" onClick={() => onNavigate({ view: "helper", programId: helperProgramRoute(report.focus!).programId })}>Recursos de mi ruta</Button><Button variant="ghost" onClick={() => onNavigate({ ...helperProgramRoute(report.focus!), view: "calendar" })}>Consultar fechas</Button></div>}
      </header>

      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          profile.enrolled === "enrolled" ? "bg-primary-soft" : "bg-accent-soft",
        )}
      >
        <p className="font-semibold">
          {profile.enrolled === "enrolled"
            ? "Inscripción activa"
            : profile.enrolled === "in-process"
              ? "Inscripción en trámite"
              : profile.enrolled === "unsure"
                ? "Inscripción por confirmar"
                : "Sin inscripción"}
        </p>
        <p className="mt-1">{enrollmentLine(profile.enrolled)}</p>
        {report.chosen && !chosenOpen && (profile.enrolled === "enrolled" || profile.enrolled === "in-process") ? (
          <p className="mt-2">
            Si esa inscripción es del programa que ahora no se abre, puede no servir para la ruta que sí corresponde.
          </p>
        ) : null}
      </div>

      <section className="rounded-2xl border border-line bg-paper p-5">
        <h2 className="text-xl">Sus pendientes, según sus respuestas</h2>
        <p className="mt-2 text-sm text-muted">Esta orientación no verifica documentos ni confirma admisión. Puede explorar y practicar aunque aún falten trámites.</p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
          <div><dt className="text-muted">Identificación</dt><dd>{profile.hasId ? "Indica que la tiene" : "Por reunir"}</dd></div>
          <div><dt className="text-muted">Fechas de matrícula</dt><dd>{profile.knowsWindow ? "Indica que las conoce" : "Por consultar"}</dd></div>
          <div><dt className="text-muted">Materiales de estudio</dt><dd>{profile.materials ? "Indica que los tiene" : "Por explorar"}</dd></div>
        </dl>
      </section>

      <details>
        <summary>Comparar las cuatro ofertas</summary>
        <ol className="mt-4">
          {PROGRAM_ORDER.map((id, index) => {
            const assessment = report.fits[id];
            const active = id === report.focus;
            return (
              <li key={id} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-4">
                <span className="flex flex-col items-center">
                  <span className={cn("mt-4 size-3 shrink-0 rounded-full", fitDot(assessment.fit))} />
                  {index < PROGRAM_ORDER.length - 1 ? <span className="mt-1 w-px flex-1 bg-line" /> : null}
                </span>
                <article
                  className={cn(
                    "mb-3 rounded-2xl border px-4 py-3",
                    active ? "border-primary bg-primary-soft" : "border-line bg-paper",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-lg">{PROGRAMS[id].name}</h3>
                      <p className="text-sm text-muted">{PROGRAMS[id].offer}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        assessment.fit === "eligible" && "bg-primary text-primary-fg",
                        assessment.fit === "conditional" && "bg-accent-soft text-accent",
                        (assessment.fit === "blocked" || assessment.fit === "surpassed") && "bg-surface text-muted",
                      )}
                    >
                      {FIT_LABEL[assessment.fit]}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    {id === report.chosen ? <span className="text-primary">Su meta</span> : null}
                    {id === report.focus && id !== report.chosen ? <span className="text-accent">Ruta sugerida</span> : null}
                  </div>
                  <div className="mt-2 space-y-1">
                    {assessment.reasons.map((reason) => (
                      <p key={reason} className="text-sm leading-relaxed text-muted">
                        {REASON[reason]}
                      </p>
                    ))}
                  </div>
                  <Button variant="ghost" onClick={() => onNavigate(helperProgramRoute(id, id === data.program ? data.levels[0] : undefined))}>Explorar {PROGRAMS[id].name}<ArrowRight className="size-4" aria-hidden /></Button>
                </article>
              </li>
            );
          })}
        </ol>
      </details>

      {report.plan ? (
        <section className="rounded-2xl border border-line p-4 sm:p-5">
          <h2 className="text-xl">Plan de pruebas</h2>
          <p className="mt-1 text-sm text-muted">
            {report.chosen && chosenOpen && data.program !== "unsure" && data.program && scopeIsComplete(data.program, scopeFrom(data)) ? "Según tu selección completa." : `Programa completo de ${PROGRAMS[report.plan.program].name}.`}
          </p>
          <ul className="mt-4 divide-y divide-line text-sm">
            {report.plan.items.map((item) => (
              <li key={item.label} className="flex items-baseline justify-between gap-3 py-2">
                <span>{item.label}</span>
                <span className="shrink-0 tabular-nums text-muted">
                  {item.tests} {item.tests === 1 ? "prueba" : "pruebas"}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">Total</dt>
              <dd className="mt-1 font-semibold tabular-nums">{report.plan.totalTests}</dd>
            </div>
            <div>
              <dt className="text-muted">Costo de referencia</dt>
              <dd className="mt-1 font-semibold tabular-nums">{colones(report.plan.fee)}</dd>
            </div>
            <div>
              <dt className="text-muted">Nota mínima</dt>
              <dd className="mt-1 font-semibold tabular-nums">{report.plan.pass}</dd>
            </div>
          </dl>
          {report.plan.sciencePending ? (
            <p className="mt-3 text-sm text-muted">Falta elegir Biología, Física o Química. El costo ya cuenta esa prueba.</p>
          ) : null}
        </section>
      ) : null}

      {report.actions.length > 0 ? (
        <section>
          <h2 className="text-xl">Qué hacer ahora</h2>
          <ol className="mt-4 space-y-3">
            {report.actions.slice(0, 3).map((id, index) => (
              <li key={id} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-fg tabular-nums">
                  {index + 1}
                </span>
                <CheckCopy id={id} />
              </li>
            ))}
          </ol>
          {report.actions.length > 3 && <details className="mt-4"><summary>Ver otros pendientes ({report.actions.length - 3})</summary><ul className="space-y-4">{report.actions.slice(3).map(id => <li key={id}><CheckCopy id={id} /></li>)}</ul></details>}
        </section>
      ) : null}

      {report.rules.length > 0 ? (
        <details>
          <summary>Reglas de la prueba</summary>
          <ul className="mt-4 space-y-3">
            {report.rules.map((id) => (
              <li key={id}>
                <CheckCopy id={id} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <details className="rounded-2xl bg-paper p-4 text-sm"><summary>Revisar los datos de mi ficha</summary>
        <h2 className="text-lg">Así quedó la ficha</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-muted">Edad</dt>
            <dd className="font-semibold">{AGE_LABEL[profile.age]}</dd>
          </div>
          <div>
            <dt className="text-muted">Estudios</dt>
            <dd className="font-semibold">{schooling?.title}</dd>
          </div>
          <div>
            <dt className="text-muted">Lectoescritura</dt>
            <dd className="font-semibold">{data.literacy ? SKILL_LABEL[data.literacy] : "Por confirmar"}</dd>
          </div>
          <div>
            <dt className="text-muted">Operaciones</dt>
            <dd className="font-semibold">{data.numeracy ? SKILL_LABEL[data.numeracy] : "Por confirmar"}</dd>
          </div>
        </dl>
      </details>

      {confirmReset && <Dialog title="¿Borrar las respuestas de la guía?" onClose={() => setConfirmReset(false)}><p>Se reinicia la orientación de esta sesión.</p><button className="primary-button" onClick={() => { data.reset(); setConfirmReset(false); }}>Sí, empezar de nuevo</button></Dialog>}
      <div className="action-row"><button className="secondary-button" onClick={() => window.print()}>Imprimir o guardar mi orientación en PDF</button><button className="secondary-button" onClick={() => { const summary = ['Orientación provisional de Educación Abierta', story.title, 'Confirma requisitos, fechas y costos con la DGEC.', ...report.actions.map(id => CHECK[id].title + ': ' + CHECK[id].detail), ...report.rules.map(id => CHECK[id].title + ': ' + CHECK[id].detail)].join('\n\n'); const url = URL.createObjectURL(new Blob([summary], {type: 'text/plain;charset=utf-8'})); const link = document.createElement('a'); link.href = url; link.download = 'mi-orientacion.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Descargar pendientes completos</button></div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="ghost" onClick={() => patch({ step: "meta" })}>
          Cambiar meta
        </Button>
        <Button type="button" variant="ghost" onClick={() => patch({ step: "perfil" })}>
          Cambiar requisitos
        </Button>
        <Button type="button" variant="ghost" onClick={() => patch({ step: "situacion" })}>
          Cambiar expediente
        </Button>
        <Button type="button" variant="ghost" onClick={() => setConfirmReset(true)}>
          <RotateCcw className="size-4" aria-hidden />
          Empezar de nuevo
        </Button>
      </div>
    </div>
  );
}

function StepBody({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const step = useWizard((state) => state.step);
  if (step === "meta") return <MetaStep />;
  if (step === "alcance") return <AlcanceStep />;
  if (step === "perfil") return <PerfilStep />;
  if (step === "equiparacion") return <EquiparacionStep />;
  if (step === "situacion") return <SituacionStep />;
  return <RutaStep onNavigate={onNavigate} />;
}

export function ReadinessWizard({ onSkip, onExplore, onNavigate }: { onSkip: () => void; onExplore: () => void; onNavigate: (route: AppRoute) => void }) {
  const data = useWizard();
  const hint = missingHint(data);
  const steps = stepsFor(data.program, data.recognition);
  const index = steps.indexOf(data.step);

  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.focus();
  }, [data.step]);

  function go(delta: number) {
    const next = steps[index + delta];
    if (next) data.patch({ step: next });
  }

  return (
    <div className="helper-guide text-ink">
      <div className="max-w-6xl mx-auto px-4 pt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Guía opcional · Edad y estudios bastan para una sugerencia. Planificación y trámites son opcionales.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onExplore}>Ver recursos sin responder</Button>
          <Button variant="ghost" onClick={onSkip}>Omitir guía</Button>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12 lg:py-10">
        <Aside />
        <div ref={bodyRef} tabIndex={-1} aria-label={STEP_LABEL[data.step]} className="min-w-0 outline-none rounded-3xl border border-line bg-surface px-5 py-6 sm:px-8 sm:py-8">
          <StepBody onNavigate={onNavigate} />
          {data.step === "alcance" && <button className="secondary-button mt-5" onClick={() => data.patch({ step: "perfil" })}>Omitir plan y continuar</button>}
          {data.step === "perfil" && profileFrom(data) && <button className="secondary-button mt-6" onClick={() => data.patch({ step: "ruta" })}>Ver orientación ahora, sin trámites</button>}
          {data.step === "situacion" && <p className="muted mt-4">Puedes continuar sin completar este paso.</p>}
          {data.step === "ruta" ? (
            <div className="mt-8 border-t border-line pt-4">
              <Button type="button" variant="ghost" onClick={() => go(-1)}>
                <ArrowLeft className="size-4" aria-hidden />
                Atrás
              </Button>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              {index > 0 ? (
                <Button type="button" variant="ghost" onClick={() => go(-1)}>
                  <ArrowLeft className="size-4" aria-hidden />
                  Atrás
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              <div className="flex flex-col gap-2 sm:items-end">
                {hint ? <p role="status" className="text-sm text-muted">{hint}</p> : null}
                {hint && data.step === "perfil" && <button className="text-link" onClick={() => { const target = bodyRef.current?.querySelector<HTMLInputElement>(data.schooling ? "input[name=age]" : "input[name=schooling]"); target?.focus(); target?.scrollIntoView?.({ block: "center" }); }}>Ir al dato pendiente</button>}
                <Button type="button" disabled={hint !== null} onClick={() => go(1)} className="w-full sm:w-auto">
                  {steps[index + 1] === "ruta" ? "Ver mi ruta" : "Continuar"}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          )}
          <p className="mt-6 text-xs leading-relaxed text-muted lg:hidden">
            Independiente del MEP. Los datos y costos son de referencia. Confirme su convocatoria con la DGEC.
          </p>
        </div>
      </div>
    </div>
  );
}
