# MEP-EA Content Ingestion Pipeline

**Standard:** P12 Ingestion Engine (`packages/content/src/authoring/ingestion.ts`)

---

## 1. Pipeline Stages

The ingestion pipeline executes the following deterministic stages:

1. **Scan:** Discovers all authoring packages under `content/authored/`.
2. **Parse & Validate:** Invokes `validateSubjectPackage(pkg)`. Any failure immediately halts execution.
3. **Normalize & Link:**
   - Maps lessons to corresponding evidence nodes.
   - Pairs practice questions with automatic evidence practice blueprints (`p2-practice:<evidenceKey>`).
   - Normalizes micro-quizzes into learner runtime representations.
4. **Registry Compilation:** Emits runtime-ready `LearningNode[]`, `LearningLesson[]`, `Question[]`, and `AssessmentBlueprint[]`.
5. **Catalog Publication:** Registers the subject in `SubjectRegistry` for dynamic discovery by Web and Mobile applications.

---

## 2. CLI Execution

To run validation independently:
```bash
npm run content:validate
```

To run ingestion independently:
```bash
npm run content:ingest
```
