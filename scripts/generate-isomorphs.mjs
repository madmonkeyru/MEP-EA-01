#!/usr/bin/env node

/**
 * Isomorphic Item Generation & Prompt Assistant CLI
 *
 * Usage:
 *   node scripts/generate-isomorphs.mjs --evidence A1.2 --dry-run
 *   node scripts/generate-isomorphs.mjs --evidence A3.1 --count 2
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SPECS_FILE = path.join(ROOT_DIR, 'content/programs/bxm/matematica/specs/02-2026.json');
const LIBRARY_DIR = path.join(ROOT_DIR, 'content/library/math');

// Parse CLI args
const args = process.argv.slice(2);
let targetEvidence = 'A1.2';
let _dryRun = true;
let _count = 1;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--evidence' && args[i + 1]) targetEvidence = args[++i];
  if (args[i] === '--count' && args[i + 1]) _count = parseInt(args[++i], 10);
  if (args[i] === '--write') _dryRun = false;
  if (args[i] === '--dry-run') _dryRun = true;
}

console.log('========================================================');
console.log('   MEP-EA-01 Isomorphic Question Generator & Prompt CLI  ');
console.log('========================================================\n');

// 1. Verify Spec File
if (!fs.existsSync(SPECS_FILE)) {
  console.error(`[ERROR] Spec file not found at: ${SPECS_FILE}`);
  process.exit(1);
}

const specData = JSON.parse(fs.readFileSync(SPECS_FILE, 'utf8'));

// 2. Find target evidence
let matchedBlock = null;
let matchedAffirmation = null;
let matchedEvidence = null;

for (const b of specData.blocks) {
  for (const a of b.affirmations) {
    for (const ev of a.evidences) {
      if (ev.code === targetEvidence) {
        matchedBlock = b;
        matchedAffirmation = a;
        matchedEvidence = ev;
        break;
      }
    }
    if (matchedEvidence) break;
  }
  if (matchedEvidence) break;
}

if (!matchedEvidence) {
  console.error(`[ERROR] Evidence code '${targetEvidence}' not found in official specification table!`);
  process.exit(1);
}

console.log(`[TARGET FOUND] Bloque: ${matchedBlock.name} (${matchedBlock.blockCode})`);
console.log(`               Afirmación: ${matchedAffirmation.code} — ${matchedAffirmation.desc}`);
console.log(`               Evidencia: ${matchedEvidence.code} — ${matchedEvidence.desc}\n`);

// 3. Find Concept Linkage scoped to domain
let linkedConceptId = 'mep-geo-circunferencia-01';
const domainFile =
  matchedBlock.areaId === 'geometry'
    ? 'geometry_concepts.json'
    : matchedBlock.areaId === 'functions'
    ? 'algebra_concepts.json'
    : 'statistics_concepts.json';

const filePath = path.join(LIBRARY_DIR, domainFile);
if (fs.existsSync(filePath)) {
  const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const found = list.find((c) => (c.relatedEvidence || []).includes(targetEvidence));
  if (found) linkedConceptId = found.id;
}

console.log(`[CONCEPT LINK] ${linkedConceptId}`);

// 4. Generate Structured Prompt Payload
const promptPayload = {
  system_instructions:
    'You are an expert psychometrician for Costa Rican MEP Educación Abierta (BXM). Generate an isomorphic multiple-choice question in JSON conforming to content/item.schema.json.',
  parameters: {
    program: 'bxm',
    area: matchedBlock.name,
    area_id: matchedBlock.areaId,
    concept_id: linkedConceptId,
    spec: {
      block: matchedBlock.blockCode,
      affirmation: matchedAffirmation.code,
      affirmation_desc: matchedAffirmation.desc,
      evidence: matchedEvidence.code,
      evidence_desc: matchedEvidence.desc,
    },
    cognitive_level: matchedEvidence.cognitiveLevel || 'reproduccion',
    calculator_allowed: true,
    required_format: 'JSON item with stem, options (A, B, C, D), correct_answer, and solution_steps in KaTeX ($...$).',
  },
};

console.log('\n[STRUCTURED PROMPT TEMPLATE]:');
console.log(JSON.stringify(promptPayload, null, 2));

console.log('\n[STATUS] Ready to generate isomorphs for AI pipeline or authoring workflow.');
