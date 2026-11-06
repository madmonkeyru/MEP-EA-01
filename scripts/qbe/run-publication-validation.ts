#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { PublicationEligibilityValidator } from '../../src/services/qbe/publicationValidator.ts';

function main() {
  const cleanedDir = path.resolve(process.cwd(), 'content/qbe/cleaned');
  if (!fs.existsSync(cleanedDir)) {
    console.log(`Directory ${cleanedDir} does not exist. Nothing to validate.`);
    process.exit(0);
  }

  const files = fs.readdirSync(cleanedDir).filter((f) => f.endsWith('.json'));
  console.log(`Found ${files.length} cleaned QBE files to validate.`);

  let allQuestions = [];
  for (const f of files) {
    const filePath = path.join(cleanedDir, f);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data)) {
        allQuestions = allQuestions.concat(data);
      } else if (data.questions && Array.isArray(data.questions)) {
        allQuestions = allQuestions.concat(data.questions);
      }
    } catch (err) {
      console.error(`Failed parsing ${f}:`, err);
    }
  }

  console.log(`Loaded ${allQuestions.length} total questions.`);
  const summary = PublicationEligibilityValidator.validateBatch(allQuestions);

  console.log('\n--- QBE Publication Eligibility Summary ---');
  console.log(`Total items evaluated: ${summary.total_items}`);
  console.log(`PASS:    ${summary.verdict_counts.pass}`);
  console.log(`WARNING: ${summary.verdict_counts.warning}`);
  console.log(`BLOCKER: ${summary.verdict_counts.blocker}`);
  console.log(`Eligible for release:   ${summary.eligible_count}`);
  console.log(`Ineligible (Blockers):  ${summary.ineligible_count}`);
  console.log(`Total blockers: ${summary.total_blockers}`);
  console.log(`Total warnings: ${summary.total_warnings}`);
}

main();
