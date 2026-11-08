import type { BxmAuthoredItem } from '../types';
import templates from '../../../../../../content/bxm-mvp-learning/isomorphic-templates.json';

export class BxmIsomorphicGenerator {
  private static validate(family: string, values: Record<string, number>): void {
    const template = templates.templates.find(t => t.familyId === family)!;
    const ranges = template.parameterRanges as unknown as Record<string, { min: number; max: number; step?: number; exclude?: number[] }>;
    for (const [key, value] of Object.entries(values)) {
      const range = ranges[key];
      if (!range || !Number.isFinite(value) || value < range.min || value > range.max ||
        !Number.isInteger(value) || range.exclude?.includes(value) || (value - range.min) % (range.step || 1) !== 0) {
        throw new RangeError(`Invalid ${family} parameter: ${key}`);
      }
    }
  }
  private static finish(item: BxmAuthoredItem): BxmAuthoredItem {
    if (new Set(Object.values(item.options)).size !== 4) throw new Error('Non-unique generated options');
    const identity = Object.entries(item.generatedParams || {}).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join('&');
    item.id = `${item.familyId}:1.1.0:${identity}`;
    item.code = item.id;
    item.templateVersion = '1.1.0';
    return item;
  }

  /**
   * Generates a deterministic circle canonical equation item from parameters (h, k, r).
   * E.g. (x - h)^2 + (y - k)^2 = r^2
   */
  static generateCircleCanonicalItem(params: { h: number; k: number; r: number; seed?: string }): BxmAuthoredItem {
    const { h, k, r, seed = 'seed-01' } = params;
    this.validate('bxm-iso-geo-circ-canon', { h, k, r });
    const rSq = r * r;
    const hTerm = h === 0 ? 'x^2' : h > 0 ? `(x - ${h})^2` : `(x + ${Math.abs(h)})^2`;
    const kTerm = k === 0 ? 'y^2' : k > 0 ? `(y - ${k})^2` : `(y + ${Math.abs(k)})^2`;

    const oppHTerm = h === 0 ? 'x^2' : h > 0 ? `(x + ${h})^2` : `(x - ${Math.abs(h)})^2`;
    const oppKTerm = k === 0 ? 'y^2' : k > 0 ? `(y + ${k})^2` : `(y - ${Math.abs(k)})^2`;

    const correctEq = `$${hTerm} + ${kTerm} = ${rSq}$`;
    const distractorB = `$${oppHTerm} + ${oppKTerm} = ${rSq}$`;
    const distractorC = `$${hTerm} + ${kTerm} = ${r}$`;
    const distractorD = `$${oppHTerm} + ${oppKTerm} = ${r}$`;

    return this.finish({
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
    });
  }

  /**
   * Generates a deterministic linear slope and equation item.
   * Given m, x1, y1, finds y = mx + b.
   */
  static generateLinearEquationItem(params: { m: number; x1: number; y1: number; seed?: string }): BxmAuthoredItem {
    const { m, x1, y1, seed = 'seed-01' } = params;
    this.validate('bxm-iso-func-slope-intercept', { m, x1, y1 });
    const b = y1 - m * x1;
    const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    const correctEq = `$y = ${m}x ${bSign}$`;

    const wrongB = b + 1;
    const wrongBSign = wrongB >= 0 ? `+ ${wrongB}` : `- ${Math.abs(wrongB)}`;
    const distractorB = `$y = ${m}x ${wrongBSign}$`;
    const distractorC = `$y = ${-m}x ${bSign}$`;
    const distractorD = `$y = ${m}x ${b - 1 >= 0 ? '+' : '-'} ${Math.abs(b - 1)}$`;

    return this.finish({
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
        B: 'Error al calcular el intercepto $b = y_1 - mx_1$.',
        C: 'Invirtió el signo de la pendiente $m$.',
        D: 'Restó una unidad adicional al intercepto.'
      },
      solutionSteps: [
        'Utilizando la forma punto-pendiente: $y - y_1 = m(x - x_1)$.',
        `$y - (${y1}) = ${m}(x - (${x1})) \\implies y = ${m}x - (${m * x1}) + (${y1})$.`,
        `$b = ${y1} - (${m * x1}) = ${b}$.`,
        `Por ende, ${correctEq}.`
      ]
    });
  }

  /**
   * Generates a deterministic RIC box plot item.
   */
  static generateRicBoxItem(params: { q1: number; q3: number; seed?: string }): BxmAuthoredItem {
    const { q1, q3, seed = 'seed-01' } = params;
    const ric = q3 - q1;
    this.validate('bxm-iso-stat-ric-box', { q1, ric });
    const sum = q3 + q1;
    const half = (ric / 2).toFixed(1);

    return this.finish({
      id: `bxm-authored-gen-ric-${seed}`,
      code: `bxm-authored-gen-ric-${seed}`,
      familyId: 'bxm-iso-stat-ric-box',
      domain: 'statistics',
      evidenceKey: 'bxm/matematica/02-2026/statistics/A3.1',
      evidenceCode: 'A3.1',
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
    });
  }
  static generateSphereCrossSectionItem(params: { tripletIndex: number; seed?: string }): BxmAuthoredItem {
    const { tripletIndex, seed = 'seed-01' } = params;
    this.validate('bxm-iso-geo-sphere-cut', { tripletIndex });
    const [R, d, r] = [[10,6,8], [13,5,12], [15,9,12], [17,8,15], [25,7,24]][tripletIndex];
    if (r * r !== R * R - d * d) throw new Error('Invalid section geometry');
    return this.finish({
      id: '', code: '', familyId: 'bxm-iso-geo-sphere-cut', domain: 'geometry',
      evidenceKey: 'bxm/matematica/02-2026/geometry/A5.3', evidenceCode: 'A5.3',
      conceptId: 'mep-geo-cuerpos-3d-09', cognitiveLevel: 'conexion', difficulty: 2,
      calculatorAllowed: true, provenance: 'authored_isomorphic_variant', reviewStatus: 'authored_computationally_checked',
      generatedParams: { tripletIndex, R, d, r, seed },
      stem: `Una esfera de radio $${R}$ se corta con un plano a distancia $${d}$ del centro. ¿Cuál es el radio de la sección?`,
      options: { A: `$${r}$`, B: `$${R-d}$`, C: `$${R+d}$`, D: `$${R}$` }, correctOption: 'A',
      distractorRationale: { B: 'Restó longitudes en lugar de sus cuadrados.', C: 'Sumó radio y distancia.', D: 'Usó el radio de la esfera.' },
      solutionSteps: [`Por Pitágoras: $r^2=${R}^2-${d}^2=${r*r}$; por tanto $r=${r}$.`],
    });
  }
}
