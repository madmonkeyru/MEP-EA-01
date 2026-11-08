import { PROGRAMS } from "./catalog";
import type { CheckId, Enroll, Fit, Reason, Report } from "./types";

export const FIT_LABEL: Record<Fit, string> = {
  eligible: "Coincide con su perfil",
  conditional: "Requiere confirmación o trámite",
  blocked: "Requisitos pendientes",
  surpassed: "Ya superado",
};

export const REASON: Record<Reason, string> = {
  "skills-unconfirmed": "Falta confirmar la lectoescritura y las cuatro operaciones. Puedes explorar materiales mientras solicitas orientación.",
  "age-min-14": "La edad de referencia para esta oferta es 14 años cumplidos.",
  "age-min-16": "EDAD pide 16 años cumplidos al inicio de la convocatoria.",
  "age-min-18":
    "BXM pide 18 años. Antes de esa edad solo abre para una madre adolescente que lo demuestre, o para quien viene del bachillerato formal.",
  "age-ok": "Cumple la edad de referencia.",
  "literacy-gap": "Hace falta leer y escribir en español.",
  "numeracy-gap": "Hacen falta las cuatro operaciones: suma, resta, multiplicación y división.",
  "skills-ok": "La lectoescritura y las cuatro operaciones alcanzan para primaria por suficiencia.",
  "needs-primary": "Antes tiene que aprobar I y II Ciclo.",
  "needs-ninth": "Antes tiene que aprobar III Ciclo, el 9° año.",
  "primary-surpassed": "La primaria ya está aprobada. Este no es el siguiente tramo.",
  "ninth-surpassed": "El III Ciclo ya está aprobado.",
  "title-surpassed": "Ya cuenta con el Bachillerato en Educación Media.",
  "bxm-mother": "Madre adolescente: hay que demostrarlo y tener el 9° aprobado. La excepción no cubre a los padres.",
  "bxm-formal": "Quien viene del bachillerato formal puede presentarse antes de los 18, con certificación del colegio.",
  "partial-iii":
    "Puede presentar los niveles que faltan. El colegio formal se reconoce por formulario ante la DGEC, y no es automático.",
  "partial-div":
    "Lo aprobado en 10° de colegio, o en BXM, se puede pedir en reconocimiento. En EDAD hay que tenerlo antes de matricular la prueba 2.",
  "eligible-clean": "El requisito de estudios previos se cumple.",
};

export function narrate(report: Report): { title: string; lede: string } {
  const chosen = report.chosen;
  const recommended = report.recommended;
  const chosenFit = report.chosenFit;

  if (chosen && (chosenFit === "eligible" || chosenFit === "conditional")) {
    if (recommended && recommended !== chosen) {
      return {
        title: `${PROGRAMS[chosen].name} está a su alcance`,
        lede: `También queda abierto ${PROGRAMS[recommended].name}, que encaja mejor con la forma de estudio que marcó. Compare los dos en la ruta.`,
      };
    }
    return {
      title: `${PROGRAMS[chosen].name} coincide con lo que quiere presentar`,
      lede:
        chosenFit === "conditional"
          ? "Puede optar, con un trámite que no camina solo. Cierre el expediente antes de pagar pruebas."
          : "La edad y los estudios que indicó coinciden con los requisitos de referencia. Revise los pendientes y confirme su situación con la DGEC.",
    };
  }

  if (chosen && chosenFit === "surpassed") {
    return {
      title: `Ya superó ${PROGRAMS[chosen].name}`,
      lede: recommended
        ? `El tramo que sigue es ${PROGRAMS[recommended].name}.`
        : "Con estos datos no queda un tramo pendiente en Educación Abierta.",
    };
  }

  if (chosen && chosenFit === "blocked") {
    return {
      title: `${PROGRAMS[chosen].name} todavía no se abre`,
      lede: recommended
        ? `La ruta que sí se abre ahora es ${PROGRAMS[recommended].name}. Los motivos están en la ficha.`
        : "Con la edad o los estudios que marcó, ninguna oferta se abre todavía.",
    };
  }

  if (recommended) {
    return {
      title: `Su ruta de entrada es ${PROGRAMS[recommended].name}`,
      lede: "No fijó un programa de antemano. Con este perfil, este es el que corresponde. Puede cambiar la meta y volver a ver la ruta.",
    };
  }

  const allSurpassed = Object.values(report.fits).every((item) => item.fit === "surpassed");
  if (allSurpassed) {
    return {
      title: "Ya tiene el bachillerato",
      lede: "Estas ofertas sirven para llegar a ese título. Si el dato es correcto, no hay una convocatoria pendiente para graduarse.",
    };
  }

  return {
    title: "Todavía no se abre una convocatoria",
    lede: "Falta un requisito de entrada. No es una respuesta del MEP: es lo que estos datos dejan fuera, y qué puede adelantar mientras tanto.",
  };
}

export function enrollmentLine(enrolled: Enroll): string {
  switch (enrolled) {
    case "enrolled":
      return "Ya está inscrito. El trabajo ahora es llegar listo a esa convocatoria, no abrir otra en paralelo.";
    case "in-process":
      return "La inscripción sigue en trámite. Conviene cerrarla antes de que venza la convocatoria.";
    case "unsure":
      return "No tiene claro si la inscripción sigue activa. Confírmelo antes de estudiar como si el puesto ya fuera suyo.";
    case "not-yet":
      return "Todavía no está inscrito. Puede preparar el terreno, pero no hay convocatoria reservada.";
  }
}

export const CHECK: Record<CheckId, { title: string; detail: string; href?: string; hrefLabel?: string }> = {
  "confirm-dates": {
    title: "Confirme la convocatoria en los canales del MEP",
    detail: "Cada convocatoria tiene inscripción y prueba propias. Esta ficha no consulta bases del MEP.",
  },
  "yo-aplico": {
    title: "Matricule en Yo Aplico y baje el comprobante",
    detail:
      "La matrícula es en el portal de la DGEC. Descargue el comprobante de matrícula aceptada; si no aparece en el padrón, debe presentarlo impreso o digital el día de la prueba.",
    href: "https://portaldgec.mep.go.cr/yo_aplico/Login",
    hrefLabel: "Abrir Yo Aplico",
  },
  payment: {
    title: "Confirme el aporte y el medio de pago antes de pagar",
    detail:
      "Los documentos de referencia indican ₡8 000 por prueba a nombre de la Asociación ICER. Verifique el monto y los datos de pago en los canales oficiales de su convocatoria. Conserve el recibo con nombre del postulante y número de convocatoria.",
  },
  "grade-record": {
    title: "Consulte el registro antes de matricular",
    detail: "Si una materia ya está aprobada, no la vuelva a inscribir. El registro puede cambiar entre una convocatoria y la siguiente.",
  },
  "photo-new": {
    title: "Prepare la fotografía requerida para la matrícula",
    detail: "Reciente, de frente y sin sellos. En I y II Ciclo es la fotografía de la persona. Se pide para la primera matrícula; en EDAD, revise este requisito en cada inscripción.",
  },
  email: {
    title: "Use un correo que sí revise",
    detail: "En III Ciclo ese correo es el canal oficial con la Dirección de Gestión y Evaluación de la Calidad.",
  },
  "bring-id": {
    title: "Reúna un documento de identidad vigente",
    detail:
      "Cédula, tarjeta del TSE si es menor, licencia, DIMEX, residencia o pasaporte, sin alteraciones. En la matrícula va por ambos lados. El día de la prueba se presenta el original.",
  },
  certificates: {
    title: "Pida la certificación con tomo, folio y asiento",
    detail:
      "III Ciclo pide el título de 6° año. EDAD, al matricular la prueba 1, y BXM piden el de 9° año. Sello del centro y firma del director. Si faltan las citas, el centro debe decirlo por escrito.",
  },
  recognition: {
    title: "Arme el reconocimiento antes de matricular lo que ya aprobó",
    detail:
      "No es automático. III Ciclo reconoce niveles o materias de colegio formal, con el formulario a plataformadgec@mep.go.cr. EDAD reconoce materias de BXM y el 10° de colegio, y al revés: el trámite va a ese correo, a la Dirección Regional, o por dgec.mep.go.cr/consultas.",
  },
  "no-recognition": {
    title: "I y II Ciclo no convalida años de escuela como materias sueltas",
    detail: "Sí conserva la prueba que ya aprobó dentro del programa. Por eso se consulta el registro, para no pagarla otra vez.",
  },
  "foreign-dgec": {
    title: "Si el título es del extranjero, lleve la resolución de la DGEC",
    detail:
      "Tiene que equiparar el ciclo que el programa pide. El trámite está en dgec.mep.go.cr/certificacion-extranjera y el correo es dgec.reconocimientos@mep.go.cr.",
  },
  "regional-signature": {
    title: "El 9° año tiene que verse en un documento original",
    detail: "Certificado o certificación del centro, con tomo, folio y asiento, sello y firma del director. Una copia ilegible anula la matrícula.",
  },
  "no-calculator": {
    title: "Matemática de primaria va sin calculadora",
    detail: "Está prohibida en esa prueba. Practique las cuatro operaciones a mano.",
  },
  "calculator-iii": {
    title: "En III Ciclo la calculadora depende de la materia y del nivel",
    detail:
      "Matemática de 8° y 9°: calculadora sencilla, solo las cuatro operaciones. Ciencias de 7°, 8° y 9°: científica, nunca programable, ni celular, ni reloj. Matemática de 7° no la permite.",
  },
  "no-swap": {
    title: "Después de matricular no se cambia la materia, el nivel ni la convocatoria",
    detail: "Retire el cuadernillo en el tiempo de la sede. Si no, el programa lo recicla.",
  },
  punctuality: {
    title: "Llegue con margen",
    detail: "Pasados 30 minutos del inicio no dejan entrar.",
  },
  "allowed-materials": {
    title: "Lleve solo lo permitido en BXM",
    detail: "Bolígrafo azul o negro, corrector blanco, calculadora no programable, lápiz de grafito, sacapuntas y borrador.",
  },
  "two-parts": {
    title: "EDAD parte cada materia en dos pruebas, y cada una pide 70",
    detail: "Desde 2024 no hay nota de presentación ni prueba comprensiva. Prueba 1 es 10° y prueba 2 es 11°.",
  },
  "prueba1-gate": {
    title: "No matricule la prueba 2 sin la prueba 1 aprobada",
    detail: "En esa misma materia. Si el 10° ya está reconocido —de colegio o de BXM— adjunte ese reconocimiento en la matrícula.",
  },
  "all-levels": {
    title: "III Ciclo se cierra nivel por nivel",
    detail: "Seis materias en 7°, en 8° y en 9°. Aprobar un año no arrastra los otros.",
  },
  "track-window": {
    title: "Anote sede, fecha y materias de la convocatoria en curso",
    detail: "Una convocatoria no se hereda a la siguiente.",
  },
  enroll: {
    title: "Inscríbase antes del cierre",
    detail: "Cuando se publique y abra el periodo de tu convocatoria, matricula las pruebas pendientes. Una fecha pasada no habilita la inscripción; puedes estudiar mientras esperas el próximo aviso.",
  },
  hours: {
    title: "Organice un horario de estudio realista",
    detail: "Distribuya su tiempo entre las materias pendientes y ajuste el plan según las dificultades que encuentre al practicar.",
  },
  materials: {
    title: "Consiga materiales del programa, no un plan genérico de colegio",
    detail: "Use las tablas de especificaciones y prácticas oficiales. EDAD divide cada materia en dos pruebas; BXM la evalúa en una.",
  },
  "diagnostic-review": {
    title: "Haga un repaso diagnóstico antes de pagar",
    detail: "Marcó que partiría de cero. Vale más un ensayo de la materia que adelantar el pago.",
  },
  "confirm-exception": {
    title: "Confirme por escrito la excepción de edad",
    detail:
      "Madre adolescente: hay que demostrar esa condición y el 9° aprobado. Quien viene del colegio formal, aunque sea menor, lleva la certificación de la materia que inscribe.",
  },
  "align-topology": {
    title: "Estudie con la forma real de la prueba",
    detail: "Una materia de EDAD no se prepara igual que la misma materia en BXM.",
  },
  "wait-age": {
    title: "La edad todavía no da",
    detail: "I y II Ciclo y III Ciclo piden 14 años. EDAD pide 16 cumplidos al inicio de la convocatoria. BXM pide 18, salvo madre adolescente o bachillerato formal.",
  },
  "build-literacy": {
    title: "Refuerce la lectoescritura en español antes de inscribirse",
    detail: "Primaria por suficiencia la pide como condición de entrada, no como materia aparte.",
  },
  "build-numeracy": {
    title: "Refuerce el cálculo básico antes de inscribirse",
    detail: "Sin nociones de matemática, la prueba de primaria no es el siguiente paso.",
  },
  "five-tests": {
    title: "Cuente las cinco pruebas de primaria",
    detail: "Ciencias, Español, Formación Ciudadana, Matemática y Estudios Sociales. Una cada una, y la que ya aprobó no se repite.",
  },
};
