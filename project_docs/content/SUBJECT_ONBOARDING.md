# Guía Operativa: Incorporación de una Nueva Materia (Subject Onboarding)

**Meta P12:** Respondemos formalmente a la pregunta:
> *«¿Qué tendría que hacer un desarrollador para incorporar la siguiente materia?»*

Gracias a la generalización arquitectónica consolidada en P12, la respuesta ya **no** es "modificar múltiples pantallas, rutas, estados o componentes del frontend".

La respuesta es exclusivamente seguir el flujo reproducible:
$$\text{Definir Contenido} \longrightarrow \text{Validar} \longrightarrow \text{Ingerir} \longrightarrow \text{Registrar} \longrightarrow \text{Verificar}$$

---

## Flujo Paso a Paso

### Paso 1: Crear la estructura del paquete de la materia
Crea el directorio correspondiente bajo `content/authored/<program>/<subject>-<convocatoria>/`:
```bash
mkdir -p content/authored/bxm/biologia-02-2026
```

### Paso 2: Declarar el paquete de contenido conforme al contrato
Crea `content/authored/<program>/<subject>-<convocatoria>/package.json` respetando el esquema `SubjectAuthoringPackage`:
```json
{
  "schemaVersion": "1.0.0",
  "program": { "id": "bxm", "name": "Bachillerato por Madurez Suficiente" },
  "subject": { "id": "biologia", "name": "Biología" },
  "curriculumVersion": {
    "id": "bxm-biologia-02-2026",
    "programId": "bxm",
    "subjectId": "biologia",
    "version": "02-2026",
    "effectiveFrom": "2026-01-01",
    "sourceReference": "project_docs/program_official_pdfs/Specification tables 2026 #2/BXM/BIOLOGIA-TABLA-ESPECIFICACIONES-BXM-02-2026.pdf",
    "status": "active"
  },
  "domains": [...],
  "concepts": [...],
  "evidences": [...],
  "lessons": [...],
  "questions": [...],
  "blueprints": [...]
}
```

### Paso 3: Validar antes del runtime
Ejecuta el validador determinista:
```bash
npm run content:validate
```
El validador comprobará automáticamente:
- Estructura y opciones no vacías (Gate A).
- Diagramas y visualizaciones completos (Gate B).
- Mapeo pedagógico a dominios, conceptos y evidencias existentes (Gate C).
- Proveniencia y signoff de revisión para ítems marcados como publicados (Gate D).
- Integridad de las cuotas de blueprints de evaluación.

### Paso 4: Ingerir y registrar
Ejecuta la ingestión:
```bash
npm run content:ingest
```

Para registrar la materia en el catálogo canónico consumido por Web y Mobile:
1. Copia o enlaza el paquete validado a `packages/content/src/data/<subject>-package.json`.
2. Agrégalo al array `registeredSubjectPackages` en `packages/content/src/multiSubjectCatalog.ts`.

### Paso 5: Verificar en Web y Mobile
Ejecuta la suite de pruebas automatizadas y compilación:
```bash
npm run test:foundation
npm run typecheck
npm run build
npm run build:mobile
```

**Resultado:**
La nueva materia aparece automáticamente en el selector de materias de Web (`FoundationApp`) y Mobile (`App.tsx`), permitiendo navegación por temas, lecciones interactivas, diagnóstico breve, prácticas por evidencia y simulaciones cronometradas, **sin haber modificado ningún componente de presentación ni lógica de rutas**.
