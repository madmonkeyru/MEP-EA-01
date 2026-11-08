import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import { readZipEntryAsBuffer, readZipEntryAsText, listZipEntries } from './zipHelper';
import type {
  ExtractedAssetDocumentResult,
  ExtractedQuestionItem,
  ExtractedOption,
  ExtractedVisualAsset,
  RawAssetManifestEntry,
} from '../../types/qbe';

interface RawParagraphData {
  index: number;
  text: string;
  blipRIds: string[];
}

export interface ExtractionOptions {
  mediaOutputDir?: string;
  extractedOutputDir?: string;
}

export function parseDocumentRelationships(relsXml: string): Map<string, string> {
  const relMap = new Map<string, string>();
  if (!relsXml) return relMap;

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const parsed = parser.parse(relsXml);
  const rels = parsed?.Relationships?.Relationship;
  if (!rels) return relMap;

  const arr = Array.isArray(rels) ? rels : [rels];
  for (const r of arr) {
    const id = r['@_Id'];
    const target = r['@_Target'];
    if (id && target) {
      relMap.set(id, target.replace(/\\/g, '/'));
    }
  }

  return relMap;
}

function extractTextAndBlipsFromP(pObj: any): { text: string; blipRIds: string[] } {
  const texts: string[] = [];
  const blipRIds: string[] = [];

  function traverse(node: any) {
    if (!node || typeof node !== 'object') return;

    // Check for text node w:t
    if (node['w:t'] !== undefined) {
      const t = node['w:t'];
      const parts = Array.isArray(t) ? t : [t];
      parts.forEach((part, index) => {
        if (index > 0) texts.push(' '); // Word tab-separated table cells in one run
        if (typeof part === 'string' || typeof part === 'number') texts.push(String(part));
        else if (part && part['#text'] !== undefined) texts.push(String(part['#text']));
      });
    }

    // Check for drawing / blip
    if (node['a:blip']) {
      const embed = node['a:blip']['@_r:embed'] || node['a:blip']['@_embed'];
      if (embed) blipRIds.push(embed);
    }

    for (const key of Object.keys(node)) {
      if (key !== 'w:t' && key !== 'a:blip') {
        const val = node[key];
        if (Array.isArray(val)) {
          val.forEach(traverse);
        } else if (typeof val === 'object') {
          traverse(val);
        }
      }
    }
  }

  traverse(pObj);
  return {
    text: texts.join('').trim(),
    blipRIds,
  };
}

export async function extractDocxContentAndVisuals(
  manifestEntry: RawAssetManifestEntry,
  rawFilePath: string,
  options: ExtractionOptions = {}
): Promise<ExtractedAssetDocumentResult> {
  const repoRoot = process.cwd();
  const mediaOutputDir = options.mediaOutputDir || path.join(repoRoot, 'content', 'qbe', 'assets', 'media');
  fs.mkdirSync(mediaOutputDir, { recursive: true });

  const warnings: string[] = [];
  const errors: string[] = [];

  // Read relationships
  const relsXml = await readZipEntryAsText(rawFilePath, 'word/_rels/document.xml.rels');
  const relMap = relsXml ? parseDocumentRelationships(relsXml) : new Map<string, string>();

  // Cache media files buffer by path inside zip
  const mediaCache = new Map<string, { buffer: Buffer; sha256: string; storedFilename: string }>();
  const zipEntries = await listZipEntries(rawFilePath);

  for (const ze of zipEntries) {
    const norm = ze.fileName.replace(/\\/g, '/');
    if (norm.startsWith('word/media/')) {
      const buf = await readZipEntryAsBuffer(rawFilePath, norm);
      if (buf) {
        const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
        const ext = path.extname(norm) || '.png';
        const storedFilename = `${manifestEntry.asset_id}-${path.basename(norm, ext)}-${sha256.slice(0, 8)}${ext}`;
        const storedPath = path.join(mediaOutputDir, storedFilename);

        fs.writeFileSync(storedPath, buf);

        mediaCache.set(norm, { buffer: buf, sha256, storedFilename });
      }
    }
  }

  // Parse document.xml
  const docXml = await readZipEntryAsText(rawFilePath, 'word/document.xml');
  if (!docXml) {
    errors.push('Unable to read word/document.xml from DOCX');
    return {
      asset_id: manifestEntry.asset_id,
      filename: manifestEntry.filename,
      extracted_at: new Date().toISOString(),
      total_questions_detected: 0,
      questions: [],
      media_count: mediaCache.size,
      diagnostics: { warnings, errors },
    };
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const parsedDoc = parser.parse(docXml);
  const body = parsedDoc?.['w:document']?.['w:body'];
  const rawParagraphs: RawParagraphData[] = [];

  if (body) {
    const pList = body['w:p'];
    const pArr = Array.isArray(pList) ? pList : [pList];
    pArr.forEach((p, idx) => {
      const { text, blipRIds } = extractTextAndBlipsFromP(p);
      // Some Forms exports put all alternatives in a single Word paragraph.
      // Do not split expressions such as P(A U B): B) is not an option there.
      const containsAlternatives = /^\s*[A-D][).]\s/.test(text) || /\sA[).]\s/.test(text);
      const lines = containsAlternatives ? text.split(/\n|\s+(?=[A-D][).]\s)/) : text.split(/\n/);
      lines.forEach((line, lineIndex) => rawParagraphs.push({
        index: idx,
        text: line,
        blipRIds: lineIndex === 0 ? blipRIds : [],
      }));
    });
  }

  // Group into Questions
  // Question start pattern: e.g. "1-", "2-", "10-", "1. ", "2) "
  const questionStartRegex = /^\s*(\d{1,3})\s*[-.)]\s*(.*)$/;
  const optionRegex = /^\s*([A-D])\s*[-.)]\s*(.*)$/i;
  // Shared context banner pattern (e.g. "Para responder las preguntas 2 y 3...", "Con base en la siguiente figura responda los ítems 4, 5 y 6...")
  const sharedContextRegex = /^(?:para|responda|con base|considere|analice|conteste).*?(?:preguntas?|ítems?)\s*\d/i;
  let lastQuestionNumber = 0;

  const questions: ExtractedQuestionItem[] = [];
  let currentQ: {
    qNum: number;
    stemLines: string[];
    options: Map<string, { text: string; visuals: ExtractedVisualAsset[] }>;
    visuals: ExtractedVisualAsset[];
  } | null = null;

  let activeSharedContextText: string[] = [];
  let activeSharedVisuals: ExtractedVisualAsset[] = [];
  let sharedContextRemainingQuestions = 0; // Number of items this shared context applies to
  let sharedContextFirstQuestion = 0;

  function resolveVisualAsset(rId: string): ExtractedVisualAsset | null {
    const target = relMap.get(rId);
    if (!target) return null;

    const zipMediaPath = target.startsWith('media/') ? `word/${target}` : target;
    const media = mediaCache.get(zipMediaPath);
    if (!media) return null;

    const relPath = path.join('content', 'qbe', 'assets', 'media', media.storedFilename);
    return {
      id: `vis-${media.sha256.slice(0, 10)}`,
      original_filename: path.basename(target),
      stored_filename: media.storedFilename,
      rel_path: relPath,
      content_type: target.endsWith('.png') ? 'image/png' : 'image/jpeg',
      sha256: media.sha256,
      byte_size: media.buffer.length,
      relationship_id: rId,
      role: 'question_diagram',
      required_for_answer: true,
    };
  }

  function finalizeQuestion(q: typeof currentQ) {
    if (!q) return;

    const opts: ExtractedOption[] = [];
    ['A', 'B', 'C', 'D'].forEach(letter => {
      if (q.options.has(letter)) {
        opts.push({
          id: letter,
          text: q.options.get(letter)!.text,
          visuals: q.options.get(letter)!.visuals,
        });
      }
    });

    const stem = q.stemLines.join('\n').trim();
    const hasStem = stem.length > 0;
    const optionCount = opts.length;
    const issues: string[] = [];

    if (!hasStem) issues.push('Missing question stem');
    if (optionCount < 3) issues.push(`Insufficient options detected: found ${optionCount}`);

    const item: ExtractedQuestionItem = {
      id: `${manifestEntry.asset_id}-q${String(q.qNum).padStart(2, '0')}`,
      asset_id: manifestEntry.asset_id,
      source_question_number: q.qNum,
      stem_text: stem,
      options: opts,
      visuals: q.visuals,
      extraction_confidence: issues.length === 0 ? 0.95 : 0.65,
      diagnostics: {
        has_stem: hasStem,
        option_count: optionCount,
        has_answer: false,
        issues,
      },
      provenance: {
        source_asset_id: manifestEntry.asset_id,
        source_filename: manifestEntry.filename,
        convocatoria: manifestEntry.convocatoria,
        area: manifestEntry.area,
        provenance_status: manifestEntry.provenance_status,
        source_confidence: 0.5,
      },
      quality_gate_a_passed: issues.length === 0,
    };

    questions.push(item);
  }

  for (let i = 0; i < rawParagraphs.length; i++) {
    const p = rawParagraphs[i];
    const text = p.text;

    // Convert blip IDs to visuals
    const paragraphVisuals: ExtractedVisualAsset[] = [];
    for (const rId of p.blipRIds) {
      const v = resolveVisualAsset(rId);
      if (v) paragraphVisuals.push(v);
    }

    // Ignore noise like "1 punto", "0 puntos", Google Forms boilerplate
    if (/^\s*\d+\s+puntos?\s*$/i.test(text)) {
      continue;
    }
    if (/acceder a googlepara guardar|indica que la pregunta es obligatoria/i.test(text)) {
      continue;
    }

    // Check shared context header
    if (sharedContextRegex.test(text) && !questionStartRegex.test(text)) {
      if (currentQ) {
        finalizeQuestion(currentQ);
        currentQ = null;
      }
      // Parse how many questions this banner applies to, e.g. "preguntas 2 y 3" -> 2 items, "ítems 4, 5 y 6" -> 3 items
      const numberList = text.match(/(?:preguntas?|ítems?)\s*(\d+(?:(?:\s*,\s*(?:y\s*)?|\s+(?:y|a|al|hasta)\s+|\s*-\s*)\d+)*)/i)?.[1] || '';
      const targetNumbers = Array.from(numberList.matchAll(/\d+/g)).map(m => parseInt(m[0], 10));
      sharedContextFirstQuestion = targetNumbers[0] || 0;
      const range = text.match(/(?:preguntas?|ítems?)\s*(\d+)\s*(?:a|al|hasta|-)\s*(\d+)/i);
      sharedContextRemainingQuestions = range
        ? Number(range[2]) - Number(range[1]) + 1
        : targetNumbers.length > 0 ? targetNumbers.length : 2;

      activeSharedContextText = [text];
      activeSharedVisuals = [...paragraphVisuals];
      continue;
    }

    // Check if new question starts
    const qMatch = text.match(questionStartRegex);
    if (qMatch && Number(qMatch[1]) > lastQuestionNumber && Number(qMatch[1]) <= 60) {
      if (currentQ) {
        finalizeQuestion(currentQ);
      }

      const qNum = parseInt(qMatch[1], 10);
      lastQuestionNumber = qNum;
      const restOfStem = qMatch[2];

      const initialStem: string[] = [];
      const initialVisuals: ExtractedVisualAsset[] = [...paragraphVisuals];

      if (sharedContextRemainingQuestions > 0 && activeSharedContextText.length > 0) {
        initialStem.push(...activeSharedContextText);
        initialVisuals.push(...activeSharedVisuals);
        sharedContextRemainingQuestions--;
        if (sharedContextRemainingQuestions <= 0) {
          activeSharedContextText = [];
          activeSharedVisuals = [];
        }
      }

      if (restOfStem) {
        initialStem.push(restOfStem);
      }

      currentQ = {
        qNum,
        stemLines: initialStem,
        options: new Map(),
        visuals: initialVisuals,
      };
      continue;
    }

    // Check option line (A, B, C, D)
    const optMatch = text.match(optionRegex);
    // An unnumbered first question may follow an explicit shared range (e.g. 13 y 14).
    if (optMatch && !currentQ && sharedContextFirstQuestion > lastQuestionNumber && activeSharedContextText.some(line => line.includes('¿'))) {
      currentQ = { qNum: sharedContextFirstQuestion, stemLines: [...activeSharedContextText],
        options: new Map(), visuals: [...activeSharedVisuals] };
      lastQuestionNumber = sharedContextFirstQuestion;
      sharedContextRemainingQuestions--;
      activeSharedContextText = activeSharedContextText.filter(line => !line.includes('¿'));
    }
    if (optMatch && currentQ) {
      const letter = optMatch[1].toUpperCase();
      const optText = optMatch[2].trim();
      currentQ.options.set(letter, {
        text: optText,
        visuals: paragraphVisuals,
      });
      continue;
    }

    // Otherwise, either belongs to current question stem or is an unassociated visual
    if (currentQ) {
      if (text.length > 0) {
        // If options haven't started yet, append to stem
        if (currentQ.options.size === 0) {
          currentQ.stemLines.push(text);
        }
      }
      if (paragraphVisuals.length > 0) {
        currentQ.visuals.push(...paragraphVisuals);
      }
    } else {
      // If no question is active yet, but we have an active shared context banner, append context
      if (activeSharedContextText.length > 0) {
        if (text.length > 0) activeSharedContextText.push(text);
        if (paragraphVisuals.length > 0) activeSharedVisuals.push(...paragraphVisuals);
      }
    }
  }

  // Finalize last question
  if (currentQ) {
    finalizeQuestion(currentQ);
  }

  return {
    asset_id: manifestEntry.asset_id,
    filename: manifestEntry.filename,
    extracted_at: new Date().toISOString(),
    total_questions_detected: questions.length,
    questions,
    media_count: mediaCache.size,
    diagnostics: { warnings, errors },
  };
}

export function saveExtractedResult(
  outputDir: string,
  result: ExtractedAssetDocumentResult
): string {
  fs.mkdirSync(outputDir, { recursive: true });
  const filename = `${result.asset_id}-extracted.json`;
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
  return filePath;
}
