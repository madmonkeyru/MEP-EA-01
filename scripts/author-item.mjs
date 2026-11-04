#!/usr/bin/env node

/**
 * Reusable Content Authoring Helper CLI
 *
 * Usage:
 *   node scripts/author-item.mjs --program <i_ii_ciclo|iii_ciclo|edad|bxm> --domain <numbers|geometry|measurement|algebra|statistics> --topic "Topic name" ...
 * Or run interactively with template output:
 *   node scripts/author-item.mjs --template
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const ITEMS_DIR = path.join(ROOT_DIR, 'content/items/math');

function getNextId() {
  let maxId = 0;
  for (const d of ['numbers', 'geometry', 'measurement', 'algebra', 'statistics']) {
    const dir = path.join(ITEMS_DIR, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      try {
        const item = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (typeof item.id === 'number' && item.id > maxId) {
          maxId = item.id;
        }
      } catch {
        // ignore malformed test files
      }
    }
  }
  return maxId + 1;
}

const args = process.argv.slice(2);

if (args.includes('--next-id')) {
  console.log(`Next available item ID: ${getNextId()}`);
  process.exit(0);
}

if (args.includes('--template') || args.length === 0) {
  const nextId = getNextId();
  const template = {
    id: nextId,
    code: `item-math-custom-${String(nextId).padStart(3, '0')}`,
    area: "Geometría",
    area_id: "geometry",
    topic: "Tema del ítem",
    spec: {
      block: "1. Geometría",
      affirmation: "A1",
      affirmation_desc: "Descripción de la afirmación oficial",
      evidence: "A1.1",
      evidence_desc: "Descripción de la evidencia evaluada"
    },
    concept_id: "mep-geo-circunferencia-01",
    linked_concepts: ["mep-geo-circunferencia-01"],
    program_applicability: ["BXM", "EDAD_PARTE_1"],
    calculator_allowed: true,
    cognitive_level: "conexion",
    difficulty_tier: 2,
    historical_convocatoria: ["2026-c2"],
    stem: "Enunciado del problema en formato LaTeX ($...$).",
    options: {
      A: "Opción A ($...$)",
      B: "Opción B ($...$)",
      C: "Opción C ($...$)",
      D: "Opción D ($...$)"
    },
    correct_answer: "A",
    solution_steps: [
      "Paso 1: Identificar los datos iniciales.",
      "Paso 2: Aplicar la propiedad o fórmula matemática.",
      "Paso 3: Concluir que la respuesta correcta es A."
    ],
    group_id: null,
    visual_spec: null
  };

  console.log(JSON.stringify(template, null, 2));
  console.log(`\nTo save this template, pipe or write to content/items/math/{numbers|geometry|measurement|algebra|statistics}/${template.code}.json`);
  process.exit(0);
}
