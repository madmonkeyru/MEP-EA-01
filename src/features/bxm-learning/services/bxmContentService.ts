import evidenceCatalogRaw from '../../../../content/bxm-mvp-learning/evidence-catalog.json';
import lessonsPackRaw from '../../../../content/bxm-mvp-learning/lessons-pack.json';
import authoredItemsPackRaw from '../../../../content/bxm-mvp-learning/authored-items-pack.json';
import isomorphicTemplatesRaw from '../../../../content/bxm-mvp-learning/isomorphic-templates.json';

import {
  BxmEvidenceNode,
  BxmLesson,
  BxmAuthoredItem,
  BxmIsomorphicTemplate,
  BxmDomain
} from '../types';

export class BxmContentService {
  private static evidenceCatalog: BxmEvidenceNode[] = (evidenceCatalogRaw as unknown as { evidences: BxmEvidenceNode[] }).evidences;
  private static lessons: BxmLesson[] = (lessonsPackRaw as unknown as { lessons: BxmLesson[] }).lessons;
  private static authoredItems: BxmAuthoredItem[] = (authoredItemsPackRaw as unknown as { items: BxmAuthoredItem[] }).items;
  private static templates: BxmIsomorphicTemplate[] = (isomorphicTemplatesRaw as unknown as { templates: BxmIsomorphicTemplate[] }).templates;

  static getAllEvidences(): BxmEvidenceNode[] {
    return this.evidenceCatalog;
  }

  static getEvidencesByDomain(domain: BxmDomain): BxmEvidenceNode[] {
    return this.evidenceCatalog.filter((e) => e.domain === domain);
  }

  static getEvidenceByKey(key: string): BxmEvidenceNode | undefined {
    return this.evidenceCatalog.find((e) => e.key === key);
  }

  static getAllLessons(): BxmLesson[] {
    return this.lessons;
  }

  static getLessonById(lessonId: string): BxmLesson | undefined {
    return this.lessons.find((l) => l.id === lessonId);
  }

  static getLessonByEvidenceKey(evidenceKey: string): BxmLesson | undefined {
    return this.lessons.find((l) => l.evidenceKey === evidenceKey);
  }

  static getAuthoredItems(): BxmAuthoredItem[] {
    return this.authoredItems;
  }

  static getAuthoredItemsByEvidenceKey(evidenceKey: string): BxmAuthoredItem[] {
    return this.authoredItems.filter((i) => i.evidenceKey === evidenceKey);
  }

  static getAuthoredItemsByDomain(domain: BxmDomain): BxmAuthoredItem[] {
    return this.authoredItems.filter((i) => i.domain === domain);
  }

  static getIsomorphicTemplates(): BxmIsomorphicTemplate[] {
    return this.templates;
  }

  static getIsomorphicTemplateByFamilyId(familyId: string): BxmIsomorphicTemplate | undefined {
    return this.templates.find((t) => t.familyId === familyId);
  }
}
