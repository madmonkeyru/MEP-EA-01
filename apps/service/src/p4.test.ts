import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe } from 'vitest';
import { createFileAttemptRepository } from './repository';
import { p4RepositoryContract } from '../test/p4-contract';

const directory = await mkdtemp(join(tmpdir(), 'mep-p4-'));
describe('P4 durable file fallback contract', () => p4RepositoryContract(async () => createFileAttemptRepository(directory)));
