import {
  Item,
  Group,
  GroupBankData,
  DomainArea,
  SetInfo,
  ContentManifest,
  QuestionSetData,
  ProgramInfo,
  ConvocatoriaManifest,
  PracticeConfig,
} from '../types';

import manifestJson from '../../content/manifest.json';
import set1Json from '../../content/bxm/matematicas/set_1.json';
import set2Json from '../../content/bxm/matematicas/set_2.json';
import set3Json from '../../content/bxm/matematicas/set_3.json';
import set4Json from '../../content/bxm/matematicas/set_4.json';
import set5Json from '../../content/bxm/matematicas/set_5.json';
import groupsJson from '../../content/bxm/matematicas/groups.json';
import { TestEngine } from './testEngine';

// Glob import all json files in content directory for dynamic resolution
const contentModules = import.meta.glob('../../content/**/*.json');

// Eagerly glob all atomic items and convocatoria blueprints
const atomicItemModules = import.meta.glob('../../content/items/math/**/*.json', { eager: true });
const blueprintModules = import.meta.glob('../../content/programs/**/convocatorias/*.json', { eager: true });

class DataService {
  private manifest: ContentManifest;
  private currentProgramId: string;
  private currentSubprogramId: string | undefined;
  private currentSubjectId: string;
  private currentConvocatoriaId: string | undefined;
  private activeSets: SetInfo[];
  private itemsMap: Map<string, Item[]>; // key: setId
  private decoupledItemsMap: Map<string, Item>; // key: item code or id string
  private atomicItemsList: Item[]; // all atomic items
  private blueprintsMap: Map<string, ConvocatoriaManifest>; // key: convocatoriaId or path-based id
  private groupsMap: Map<string, Group>;
  private isInitialized: boolean = false;
  private loadVersion = 0;
  private listeners: Array<() => void> = [];

  constructor() {
    this.manifest = manifestJson as unknown as ContentManifest;
    this.currentProgramId = this.manifest.default_program || 'bxm';
    this.currentSubjectId = this.manifest.default_subject || 'matematicas';
    this.currentConvocatoriaId = '2026-c2';
    this.activeSets = [];
    this.itemsMap = new Map();
    this.decoupledItemsMap = new Map();
    this.atomicItemsList = [];
    this.blueprintsMap = new Map();
    this.groupsMap = new Map();

    // Default synchronous load of bxm/matematicas bundle so synchronous getters work immediately
    this.loadDefaultSubjectSync();

    // Ingest atomic items and blueprints
    this.loadAtomicItemsAndBlueprints();
  }

  private loadAtomicItemsAndBlueprints(): void {
    // 1. Ingest all atomic items from content/items/math/
    this.atomicItemsList = [];
    for (const path in atomicItemModules) {
      const mod: any = atomicItemModules[path];
      const item: Item = mod.default || mod;
      if (item && item.id) {
        this.atomicItemsList.push(item);
        if (item.code) {
          this.decoupledItemsMap.set(item.code, item);
        }
        this.decoupledItemsMap.set(String(item.id), item);
        const prefix =
          item.area_id === 'functions' ? 'item-alg' : item.area_id === 'statistics' ? 'item-est' : 'item-geo';
        this.decoupledItemsMap.set(`${prefix}-${String(item.id).padStart(3, '0')}`, item);
      }
    }

    // 2. Ingest all convocatoria blueprints
    for (const path in blueprintModules) {
      const mod: any = blueprintModules[path];
      const bp: ConvocatoriaManifest = mod.default || mod;
      if (bp && bp.convocatoriaId) {
        this.blueprintsMap.set(bp.convocatoriaId, bp);
        if (bp.programId) {
          this.blueprintsMap.set(`${bp.programId}-${bp.convocatoriaId}`, bp);
          if (bp.subprogramId) {
            this.blueprintsMap.set(`${bp.programId}-${bp.subprogramId}-${bp.convocatoriaId}`, bp);
          }
        }
      }
    }
  }

  private loadDefaultSubjectSync(): void {
    const defaultProgram = this.manifest.programs.find((p) => p.id === this.currentProgramId);
    const defaultSubject = defaultProgram?.subjects.find((s) => s.id === this.currentSubjectId);

    if (defaultSubject) {
      this.activeSets = defaultSubject.sets || [];
    }

    // Populate default sets (set_1, set_2, set_3, set_4 & set_5)
    const set1Data = set1Json as unknown as QuestionSetData;
    const set2Data = set2Json as unknown as QuestionSetData;
    const set3Data = set3Json as unknown as QuestionSetData;
    const set4Data = set4Json as unknown as QuestionSetData;
    const set5Data = set5Json as unknown as QuestionSetData;

    this.itemsMap.set('set_1', set1Data.items || []);
    this.itemsMap.set('set_2', set2Data.items || []);
    this.itemsMap.set('set_3', set3Data.items || []);
    this.itemsMap.set('set_4', set4Data.items || []);
    this.itemsMap.set('set_5', set5Data.items || []);

    // Register all legacy set items into decoupled index map
    [set1Data, set2Data, set3Data, set4Data, set5Data].forEach((s) => {
      (s.items || []).forEach((item) => {
        if (item.code) this.decoupledItemsMap.set(item.code, item);
        this.decoupledItemsMap.set(String(item.id), item);
        const prefix =
          item.area_id === 'functions' ? 'item-alg' : item.area_id === 'statistics' ? 'item-est' : 'item-geo';
        this.decoupledItemsMap.set(`${prefix}-${String(item.id).padStart(3, '0')}`, item);
      });
    });

    const groupData = groupsJson as unknown as GroupBankData;
    if (groupData && Array.isArray(groupData.groups)) {
      groupData.groups.forEach((g) => {
        this.groupsMap.set(g.group_id, g);
      });
    }

    this.isInitialized = true;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in DataService listener:', e);
      }
    });
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    await this.loadSubject(this.currentProgramId, this.currentSubjectId);
  }

  public getManifest(): ContentManifest {
    return this.manifest;
  }

  public getPrograms(): ProgramInfo[] {
    return this.manifest.programs;
  }

  public getCurrentProgramId(): string {
    return this.currentProgramId;
  }

  public getCurrentProgram(): ProgramInfo | undefined {
    return this.manifest.programs.find((p) => p.id === this.currentProgramId);
  }

  public getCurrentSubprogramId(): string | undefined {
    return this.currentSubprogramId;
  }

  public getCurrentSubjectId(): string {
    return this.currentSubjectId;
  }

  public getCurrentConvocatoriaId(): string | undefined {
    return this.currentConvocatoriaId;
  }

  public setConvocatoriaId(convocatoriaId: string): void {
    this.currentConvocatoriaId = convocatoriaId;
    this.notify();
  }

  public getConvocatoriaBlueprint(convocatoriaId?: string): ConvocatoriaManifest | undefined {
    const targetId = convocatoriaId || this.currentConvocatoriaId;
    if (!targetId) return undefined;

    const compoundKey = this.currentSubprogramId
      ? `${this.currentProgramId}-${this.currentSubprogramId}-${targetId}`
      : `${this.currentProgramId}-${targetId}`;

    return this.blueprintsMap.get(compoundKey) || this.blueprintsMap.get(targetId);
  }

  public getDecoupledItemsMap(): Map<string, Item> {
    return this.decoupledItemsMap;
  }

  public getAtomicItems(): Item[] {
    return this.atomicItemsList;
  }

  public isCalculatorAllowed(): boolean {
    const program = this.getCurrentProgram();
    if (program?.calculatorAllowed !== undefined) {
      return program.calculatorAllowed;
    }
    // I & II Ciclo strictly prohibits calculators
    if (this.currentProgramId === 'cico' || this.currentProgramId === 'i_ii_ciclo') {
      return false;
    }
    return true;
  }

  public getPassingScore(): number {
    const program = this.getCurrentProgram();
    return program?.passingScore || 70;
  }

  public async setProgram(
    programId: string,
    subprogramId?: string,
    convocatoriaId?: string
  ): Promise<void> {
    const program = this.manifest.programs.find((p) => p.id === programId);
    if (!program) {
      console.warn(`Program ${programId} not found`);
      return;
    }

    this.currentProgramId = programId;
    this.currentSubprogramId = subprogramId;
    this.currentConvocatoriaId = convocatoriaId || '2026-c1';

    const subject = program.subjects[0];
    if (subject) await this.loadSubject(programId, subject.id);
    else this.notify();
  }

  public async loadSubject(programId: string, subjectId: string): Promise<void> {
    const program = this.manifest.programs.find((p) => p.id === programId);
    if (!program) throw new Error(`Program ${programId} not found`);

    const subject = program.subjects.find((s) => s.id === subjectId);
    if (!subject) throw new Error(`Subject ${subjectId} not found in program ${programId}`);

    const version = ++this.loadVersion;
    this.currentProgramId = programId;
    this.currentSubjectId = subjectId;
    this.activeSets = subject.sets || [];
    this.itemsMap.clear();
    this.decoupledItemsMap.clear();
    this.groupsMap.clear();



    // Load groups if path exists
    if (subject.groups) {
      const groupKey = `../../content/${subject.groups}`;
      const groupModuleLoader = contentModules[groupKey];
      if (groupModuleLoader) {
        try {
          const groupModule: any = await groupModuleLoader();
          if (version !== this.loadVersion) return;
          const groupData: GroupBankData = groupModule.default || groupModule;
          if (groupData && Array.isArray(groupData.groups)) {
            groupData.groups.forEach((g) => {
              this.groupsMap.set(g.group_id, g);
            });
          }
        } catch (err) {
          console.warn(`Failed to dynamically load groups for ${subject.groups}:`, err);
        }
      }
    }

    // Load each set
    for (const setInfo of subject.sets || []) {
      if (setInfo.file) {
        const setKey = `../../content/${setInfo.file}`;
        const setModuleLoader = contentModules[setKey];
        if (setModuleLoader) {
          try {
            const setModule: any = await setModuleLoader();
            if (version !== this.loadVersion) return;
            const setData: QuestionSetData = setModule.default || setModule;
            const items = setData.items || [];
            this.itemsMap.set(setInfo.id, items);
            items.forEach((item) => {
              if (item.code) this.decoupledItemsMap.set(item.code, item);
              this.decoupledItemsMap.set(String(item.id), item);
              const prefix =
                item.area_id === 'functions' ? 'item-alg' : item.area_id === 'statistics' ? 'item-est' : 'item-geo';
              this.decoupledItemsMap.set(`${prefix}-${String(item.id).padStart(3, '0')}`, item);
            });
          } catch (err) {
            console.warn(`Failed to dynamically load set file ${setInfo.file}:`, err);
          }
        }
      }
    }

    // Re-index atomic items if subject is math
    if (subjectId === 'matematicas' || subjectId === 'matematica') {
      this.loadAtomicItemsAndBlueprints();
    }

    if (version !== this.loadVersion) return;
    this.isInitialized = true;
    this.notify();
  }

  public getAllItems(): Item[] {
    if (
      (this.currentProgramId === 'bxm' || !this.currentProgramId) &&
      (this.currentSubjectId === 'matematicas' || !this.currentSubjectId) &&
      this.atomicItemsList.length > 0
    ) {
      return this.atomicItemsList;
    }
    const allItems: Item[] = [];
    this.itemsMap.forEach((items) => {
      allItems.push(...items);
    });
    return allItems;
  }

  public getLegacySetItems(): Item[] {
    const allItems: Item[] = [];
    this.itemsMap.forEach((items) => {
      allItems.push(...items);
    });
    return allItems;
  }

  public getSets(): SetInfo[] {
    return this.activeSets;
  }

  public getSetById(setId: string): SetInfo | undefined {
    return this.getSets().find((s) => s.id === setId);
  }

  public getItemsBySet(setId: string): Item[] {
    if (!setId || setId === 'all') return this.getAllItems();
    const items = this.itemsMap.get(setId);
    return items || [];
  }

  public getSimulationItems(setIdOrConvocatoriaId: string = '2026-c2'): Item[] {
    const blueprint = this.getConvocatoriaBlueprint(setIdOrConvocatoriaId);
    if (blueprint) {
      const assembled = TestEngine.assembleSimulationSession(blueprint, this.decoupledItemsMap);
      if (assembled.length > 0) {
        return assembled;
      }
    }
    return this.getItemsBySet(setIdOrConvocatoriaId);
  }

  public getItemById(id: number | string): Item | undefined {
    if (typeof id === 'string') {
      return this.decoupledItemsMap.get(id);
    }
    return this.decoupledItemsMap.get(String(id)) || this.getAllItems().find((item) => item.id === id);
  }

  public getGroupById(groupId: string): Group | undefined {
    return this.groupsMap.get(groupId);
  }

  public getItemsByArea(area: DomainArea, setId?: string): Item[] {
    const baseItems = setId && setId !== 'all' ? this.getItemsBySet(setId) : this.getAllItems();
    return baseItems.filter(
      (item) => item.area_id === area || item.area?.toLowerCase().includes(String(area).toLowerCase())
    );
  }

  public getItemsByTopic(topic: string, setId?: string): Item[] {
    const baseItems = setId && setId !== 'all' ? this.getItemsBySet(setId) : this.getAllItems();
    return baseItems.filter((item) => item.topic === topic);
  }

  public getTopicsByArea(area?: DomainArea, setId?: string): string[] {
    const items = area
      ? this.getItemsByArea(area, setId)
      : setId && setId !== 'all'
      ? this.getItemsBySet(setId)
      : this.getAllItems();
    const topicsSet = new Set<string>();
    items.forEach((item) => {
      if (item.topic) {
        topicsSet.add(item.topic);
      }
    });
    return Array.from(topicsSet);
  }

  /**
   * Dynamic session assembly powered by TestEngine
   */
  public assembleSession(config: PracticeConfig): Item[] {
    return TestEngine.assemblePracticeSession(config, this.getAllItems());
  }

  public getQuestionBankInfo() {
    const set1Data = set1Json as unknown as QuestionSetData;
    return {
      exam: set1Data.exam,
      convocatoria: set1Data.convocatoria,
      totalItems: this.getAllItems().length,
      sets: this.getSets(),
      sections: set1Data.sections || [],
      calculatorAllowed: this.isCalculatorAllowed(),
      passingScore: this.getPassingScore(),
    };
  }
}

export const dataService = new DataService();
