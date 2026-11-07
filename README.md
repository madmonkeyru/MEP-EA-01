# MEP Educación Abierta Digital

A React and TypeScript application for independent preparation for Costa Rica’s Educación Abierta programs. It includes official reference materials, local assessment history, guided BXM Mathematics lessons and practice, and DGEC calendar information.

The app is an independent study tool. Refer to the DGEC notices linked in the app for official requirements and dates.

## Run locally

Use Node.js 22 and npm.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

The production output is in `dist/`. Hash routing supports static hosting without server rewrite rules. Fonts are bundled locally.

## Checks

```sh
npm run lint
npm test
npm run build
npm run test:flows
```

`test:flows` starts a production preview on port 4189 and runs the reference-exam/resource journeys, guided learning recovery/access journeys, and axe checks at 320px and 1280px in light and dark themes. Build first. Set `FLOW_BASE_URL` to use an already running server. Pass `--start-server` to the browser runner if a custom URL needs its own preview server.

On Windows, the runner uses an installed Chrome from `%ProgramFiles%` when available. Else install Chromium with `npx playwright install chromium`. `FLOW_CHROME_PATH` selects another browser executable.

```sh
npm run test:learning
npm run audit:performance
npm run audit:bundle
```

Reports and screenshots are written under `artifacts/`. The bundle check enforces the Phase 0 entry-chunk byte/gzip budget; aggregate route/data JavaScript is reported separately. CI runs the production journeys and uploads reports. Lighthouse scores depend on machine load; compare repeated measurements under matching conditions. The full Vitest suite currently uses one worker and can take several minutes.

## Product access

Free access includes official reference exams, diagnostics and basic results, official resources, and sample lessons. Guided and legacy practice require Pro. Production plan buttons do not grant access: simulated upgrades are available only in development. Billing and server authorization are not implemented by this local prototype.

The capability matrix is in `src/services/capabilityModel.ts`; older entitlement and subscription APIs delegate to it and share the tier service. Browser storage remains local to the device. Existing key formats and histories are preserved; this change does not migrate learner records.

## Source and architecture

- `content/manifest.json`: program and subject catalog.
- `content/programs/`: exam manifests and published content configuration.
- `content/bxm-mvp-learning/`: guided curriculum, lesson, practice and template data.
- `content/calendar/`: published calendar records with source links and verification dates.
- `src/services/storageRegistry.ts`: shared storage key registry and migration policy.
- `src/types/learningDomain.ts`: shared learning types.
- [Architecture documentation](project_docs/INDEX.md).
- [Consolidation execution status](project_docs/consolidation/EXECUTION.md).
- [Requested consolidation plan](Plan_Exe.md).

The consolidation is staged. The reference player and guided player still coexist; replacing the legacy engine and migrating storage require the later phases tracked in the execution status.
