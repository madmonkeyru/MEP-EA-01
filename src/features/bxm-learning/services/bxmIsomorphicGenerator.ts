import { BxmAuthoredItem } from '../types';

export class BxmIsomorphicGenerator {
  /**
   * Generates a deterministic circle canonical equation item from parameters (h, k, r).
   * E.g. (x - h)^2 + (y - k)^2 = r^2
   */
  static generateCircleCanonicalItem(params: { h: number; k: number; r: number; seed?: string }): BxmAuthoredItem {
    const { h, k, r, seed = 'seed-01' } = params;
    const rSq = r * r;
    const hTerm = h === 0 ? 'x^2' : h > 0 ? `(x - ${h})^2` : `(x + ${Math.abs(h)})^2`;
    const kTerm = k === 0 ? 'y^2' : k > 0 ? `(y - ${k})^2` : `(y + ${Math.abs(k)})^2`;

    const oppHTerm = h === 0 ? 'x^2' : h > 0 ? `(x + ${h})^2` : `(x - ${Math.abs(h)})^2`;
    const oppKTerm = k === 0 ? 'y^2' : k > 0 ? `(y + ${k})^2` : `(y - ${Math.abs(k)})^2`;

    const correctEq = `$${hTerm} + ${kTerm} = ${rSq}$`;
    const distractorB = `$${oppHTerm} + ${oppKTerm} = ${rSq}$`;
    const distractorC = `$${hTerm} + ${kTerm} = ${r}$`;
    const distractorD = `$${oppHTerm} + ${oppKTerm} = ${r}$`;

    return {
      id: `bxm-authored-gen-circle-${seed}`,
      code: `bxm-authored-gen-circle-${seed}`,
      familyId: 'bxm-iso-geo-circ-canon',
      domain: 'geometry',
      evidenceKey: 'bxm/matematica/02-2026/geometry/A1.2',
      evidenceCode: 'A1.2',
      conceptId: 'mep-geo-circunferencia-01',
      cognitiveLevel: 'reproduccion',
      difficulty: 1,
      calculatorAllowed: true,
      provenance: 'authored_isomorphic_variant',
      reviewStatus: 'authored_computationally_checked',
      generatedParams: { h, k, r, seed },
      stem: `Considere una circunferencia con centro en el punto $(${h}, ${k})$ y cuya medida del radio es $${r}$. ¿Cuál es su ecuación canónica?`,
      options: {
        A: correctEq,
        B: distractorB,
        C: distractorC,
        D: distractorD
      },
      correctOption: 'A',
      distractorRationale: {
        B: 'Invirtió los signos de las coordenadas del centro.',
        C: 'No elevó el radio al cuadrado.',
        D: 'Invirtió los signos y omitió elevar el radio al cuadrado.'
      },
      solutionSteps: [
        'La ecuación canónica es $(x - h)^2 + (y - k)^2 = r^2$.',
        `Sustituyendo $h = ${h}$, $k = ${k}$ y $r = ${r}$ obtenemos $r^2 = ${rSq}$.`,
        `Ecuación final: ${correctEq}.`
      ]
    };
  }

  /**
   * Generates a deterministic linear slope and equation item.
   * Given m, x1, y1, finds y = mx + b.
   */
  static generateLinearEquationItem(params: { m: number; x1: number; y1: number; seed?: string }): BxmAuthoredItem {
    const { m, x1, y1, seed = 'seed-01' } = params;
    const b = y1 - m * x1;
    const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const correctEq = `$y = ${m}x ${bSign}$`;

    const wrongB = y1 + m * x1;
    const wrongBSign = wrongB >= 0 ? `+ ${wrongB}` : `- ${Math.abs(wrongB)}`;
    const distractorB = `$y = ${m}x ${wrongBSign}$`;
    const distractorC = `$y = ${-m}x ${bSign}$`;
    const distractorD = `$y = ${m}x + ${y1}$`;

    return {
      id: `bxm-authored-gen-linear-${seed}`,
      code: `bxm-authored-gen-linear-${seed}`,
      familyId: 'bxm-iso-func-slope-intercept',
      domain: 'functions',
      evidenceKey: 'bxm/matematica/02-2026/functions/A2.4',
      evidenceCode: 'A2.4',
      conceptId: 'mep-alg-funcion-lineal-03',
      cognitiveLevel: 'conexion',
      difficulty: 2,
      calculatorAllowed: true,
      provenance: 'authored_isomorphic_variant',
      reviewStatus: 'authored_computationally_checked',
      generatedParams: { m, x1, y1, seed },
      stem: `¿Cuál es la ecuación de la recta que tiene pendiente $m = ${m}$ y pasa por el punto $(${x1}, ${y1})$?`,
      options: {
        A: correctEq,
        B: distractorB,
        C: distractorC,
        D: distractorD
      },
      correctOption: 'A',
      distractorRationale: {
        B: 'Error de signos al despejar el intercepto $b = y_1 - mx_1$.',
        C: 'Invirtió el signo de la pendiente $m$.',
        D: 'Tomó directamente la ordenada del punto como intercepto.'
      },
      solutionSteps: [
        'Utilizando la forma punto-pendiente: $y - y_1 = m(x - x_1)$.',
        `$y - (${y1}) = ${m}(x - (${x1})) \\implies y = ${m}x - (${m * x1}) + (${y1})$.`,
        `$b = ${y1} - (${m * x1}) = ${b}$.`,
        `Por ende, ${correctEq}.`
      ]
    };
  }

  /**
   * Generates a deterministic RIC box plot item.
   */
  static generateRicBoxItem(params: { q1: number; q3: number; seed?: string }): BxmAuthoredItem {
    const { q1, q3, seed = 'seed-01' } = params;
    const ric = q3 - q1;
    const sum = q3 + q1;
    const half = (ric / 2).toFixed(1);

    return {
      id: `bxm-authored-gen-ric-${seed}`,
      code: `bxm-authored-gen-ric-${seed}`,
      familyId: 'bxm-iso-stat-ric-box',
      domain: 'statistics',
      evidenceKey: 'bxm/matematica/02-2026/statistics/A3.2',
      evidenceCode: 'A3.2',
      conceptId: 'mep-est-diagrama-cajas-ric-03',
      cognitiveLevel: 'reproduccion',
      difficulty: 1,
      calculatorAllowed: true,
      provenance: 'authored_isomorphic_variant',
      reviewStatus: 'authored_computationally_checked',
      generatedParams: { q1, q3, seed },
      stem: `En un diagrama de cajas, el primer cuartil es $Q_1 = ${q1}$ y el tercer cuartil es $Q_3 = ${q3}$. ¿Cuál es el valor del recorrido intercuartílico (RIC)?`,
      options: {
        A: `$${ric}$`,
        B: `$${sum}$`,
        C: `$${half}$`,
        D: `$${q3}$`
      },
      correctOption: 'A',
      distractorRationale: {
        B: 'Sumó los cuartiles en vez de restarlos.',
        C: 'Dividió el resultado entre dos.',
        D: 'Tomó el tercer cuartil directamente.'
      },
      solutionSteps: [
        'Por definición, $\\text{RIC} = Q_3 - Q_1$.',
        `$\\text{RIC} = ${q3} - ${q1} = ${ric}$.`
      ]
    };
  }
}
