import type { TransformationRecord, CorrectionCategory } from '../../../types/qbe';

export interface NormalizationResult {
  text: string;
  transformations: TransformationRecord[];
  ambiguousMathDetected: boolean;
  ambiguousDetails: string[];
}

function createRecord(
  ruleId: string,
  orig: string,
  norm: string,
  type: CorrectionCategory,
  reason: string,
  semanticChange: boolean = false,
  confidence: number = 0.98
): TransformationRecord {
  return {
    stage: 'stage_1_mechanical',
    rule_id: ruleId,
    original_text: orig,
    normalized_text: norm,
    correction_type: type,
    semantic_change: semanticChange,
    reason,
    confidence,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Stage 1: Mechanical Normalization
 * Conservative text cleaning + mathematical normalization compatible with KaTeX TextRenderer.
 */
export function normalizeMechanicalText(rawText: string): NormalizationResult {
  const transformations: TransformationRecord[] = [];
  const ambiguousDetails: string[] = [];
  let ambiguousMathDetected = false;

  let current = rawText;

  // 1. Strip Google Forms boilerplate & zero-width artifacts
  const hasBoilerplateOrZero =
    /Acceder a Googlepara guardar|Indica que la pregunta es obligatoria|[\u200B-\u200D\uFEFF]/i.test(current);

  if (hasBoilerplateOrZero) {
    const origBefore = current;
    const noBoilerplate = current
      .replace(/Acceder a Googlepara guardar el progreso\.Más información/gi, '')
      .replace(/\*?\s*Indica que la pregunta es obligatoria/gi, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '');

    transformations.push(
      createRecord(
        'MECH-01-BOILERPLATE-ZERO-WIDTH',
        origBefore,
        noBoilerplate,
        'formatting',
        'Stripped Google Forms progress boilerplate and invisible characters'
      )
    );
    current = noBoilerplate;
  }

  // Normalize multi-spaces & trim
  const cleanSpaces = current
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter(line => !/^\s*\d+\s+puntos?\s*$/i.test(line)) // strip standalone "0 puntos" / "1 punto" lines
    .join('\n')
    .trim();

  if (cleanSpaces !== current) {
    transformations.push(
      createRecord(
        'MECH-02-WHITESPACE',
        current,
        cleanSpaces,
        'whitespace',
        'Normalized internal spaces and line trims'
      )
    );
    current = cleanSpaces;
  }

  // 2. Trailing Examination Artifacts (e.g. trailing "*" from Google Forms / DOCX)
  const noTrailingStar = current.replace(/\*+\s*$/g, '').trim();
  if (noTrailingStar !== current) {
    transformations.push(
      createRecord(
        'MECH-03-ARTIFACT-STAR',
        current,
        noTrailingStar,
        'formatting',
        'Removed trailing asterisk exam artifact'
      )
    );
    current = noTrailingStar;
  }

  // 3. Ambiguous bar notation check (e.g. Q̅P̅ or segment notation)
  // Unicode combining overline U+0305 / U+0304
  if (/[\u0304\u0305]/.test(current)) {
    ambiguousMathDetected = true;
    ambiguousDetails.push('Detected unicode combining overline segment notation (e.g. Q̅P̅)');
  }

  // 4. Mathematical Unicode Superscripts & Standard Radicals
  // Conservative normalization: convert superscript digits into standard LaTeX ^n
  // e.g. x² -> x^2, (x-1)² -> (x-1)^2
  const superscriptMap: Record<string, string> = {
    '⁰': '^0',
    '¹': '^1',
    '²': '^2',
    '³': '^3',
    '⁴': '^4',
    '⁵': '^5',
    '⁶': '^6',
    '⁷': '^7',
    '⁸': '^8',
    '⁹': '^9',
  };

  const hasSuperscript = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(current);
  if (hasSuperscript) {
    const origBefore = current;
    // Replace superscript digits
    let replaced = current;
    for (const [sup, exp] of Object.entries(superscriptMap)) {
      replaced = replaced.split(sup).join(exp);
    }
    transformations.push(
      createRecord(
        'MECH-04-UNICODE-SUPERSCRIPT',
        origBefore,
        replaced,
        'unicode_normalization',
        'Normalized Unicode superscript exponents to standard exponential notation'
      )
    );
    current = replaced;
  }

  // 5. Radical normalization: √5 -> \sqrt{5}, √18 -> \sqrt{18}, handling combining overlines cleanly
  const hasSqrt = /√\s*([\d\w\u0304\u0305]+)/.test(current);
  if (hasSqrt) {
    const origBefore = current;
    const replaced = current.replace(/√\s*([\d\w\u0304\u0305]+)/g, (_m, inner) => {
      // Remove combining overline from inside radical (e.g. 1̅8̅ -> 18)
      const cleanInner = inner.replace(/[\u0304\u0305]/g, '');
      return `\\sqrt{${cleanInner}}`;
    });
    transformations.push(
      createRecord(
        'MECH-05-UNICODE-RADICAL',
        origBefore,
        replaced,
        'mathematical_notation',
        'Normalized radical symbol and stripped combining overline within radical'
      )
    );
    current = replaced;
  }

  // 6. Delimited LaTeX Wrapping for clear isolated algebraic expressions
  // e.g., if option is "(x-1)^2 + y^2 = 16" or "x^2 + (y+1)^2 = 5", wrap in $...$ if not already delimited
  // We check if the entire text is a mathematical equation/formula:
  const isPureFormula =
    !current.startsWith('$') &&
    /^[-+()^/=0-9a-zA-Z\\{}\s]+$/.test(current) &&
    /[=^]/.test(current) &&
    !/\b(de|la|el|en|un|una|es|por|si|con|son|las|los)\b/i.test(current);

  if (isPureFormula) {
    const origBefore = current;
    // Standardize spacing around = and binary +/-, but do not break (x-1) into (x - 1)
    const formatted = current
      .replace(/\s*=\s*/g, ' = ')
      .replace(/(\w|\))\s*\+\s*(\w|\()/g, '$1 + $2')
      .trim();

    const wrapped = `$${formatted}$`;
    transformations.push(
      createRecord(
        'MECH-06-LATEX-DELIMITER-WRAP',
        origBefore,
        wrapped,
        'mathematical_notation',
        'Wrapped isolated algebraic equation in LaTeX dollar delimiters for KaTeX rendering'
      )
    );
    current = wrapped;
  }

  return {
    text: current,
    transformations,
    ambiguousMathDetected,
    ambiguousDetails,
  };
}
