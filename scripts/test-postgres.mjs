import { spawnSync } from 'node:child_process';
if (!process.env.MEP_TEST_DATABASE_URL) throw new Error('Set MEP_TEST_DATABASE_URL to a disposable PostgreSQL database; tests create and drop an isolated schema.');
const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'vitest.foundation.config.ts', 'apps/service/src/postgres.test.ts'], { stdio: 'inherit', env: process.env });
process.exit(result.status ?? 1);
