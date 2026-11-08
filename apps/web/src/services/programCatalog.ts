import manifestJson from '../../../../content/manifest.json';
import type { ContentManifest } from '../types';

export const programManifest = manifestJson as unknown as ContentManifest;
