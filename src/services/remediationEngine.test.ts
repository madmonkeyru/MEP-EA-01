import { describe, expect, it, beforeEach } from 'vitest';
import { generateRemediationPlan, saveActiveRemediationPlan, getActiveRemediationPlan, clearActiveRemediationPlan } from './remediationEngine';
import type { TestSession, Item } from '../types';
import { storageService } from './storageService';

describe('remediationEngine', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.clearTelemetryEvents();
  });

  const mockItems: Item[] = [
    {
      id: 1,
      code: 'geo-001',
      area: 'Geometría',
      area_id: 'geometry',
      topic: 'Circunferencia',
      concept_id: 'geo-circ',
      title: 'Circunferencia',
      stem: '¿Cuál es el radio?',
      options: [
        { letter: 'A', text: '2' },
        { letter: 'B', text: '4' },
        { letter: 'C', text: '6' },
        { letter: 'D', text: '8' },
      ],
      correct_answer: 'B',
      explanation: 'Explicación radio',
      solution_steps: ['Paso 1'],
      calculator_allowed: true,
      cognitive_level: 'reproduccion',
      difficulty_tier: 2,
      program_applicability: ['bxm'],
    },
    {
      id: 2,
      code: 'geo-002',
      area: 'Geometría',
      area_id: 'geometry',
      topic: 'Circunferencia',
      concept_id: 'geo-circ',
      title: 'Centro de Circunferencia',
      stem: '¿Cuál es el centro?',
      options: [
        { letter: 'A', text: '(0,0)' },
        { letter: 'B', text: '(1,2)' },
        { letter: 'C', text: '(2,3)' },
        { letter: 'D', text: '(4,5)' },
      ],
      correct_answer: 'A',
      explanation: 'Explicación centro',
      solution_steps: ['Paso 1'],
      calculator_allowed: true,
      cognitive_level: 'conexion',
      difficulty_tier: 2,
      program_applicability: ['bxm'],
    },
    {
      id: 3,
      code: 'alg-001',
      area: 'Relaciones y Álgebra',
      area_id: 'functions',
      topic: 'Función Lineal',
      concept_id: 'alg-fun-lin',
      title: 'Función Lineal',
      stem: '¿Cuál es la pendiente?',
      options: [
        { letter: 'A', text: '1' },
        { letter: 'B', text: '2' },
        { letter: 'C', text: '3' },
        { letter: 'D', text: '4' },
      ],
      correct_answer: 'C',
      explanation: 'Explicación pendiente',
      solution_steps: ['Paso 1'],
      calculator_allowed: true,
      cognitive_level: 'reproduccion',
      difficulty_tier: 1,
      program_applicability: ['bxm'],
    },
    {
      id: 4,
      code: 'est-001',
      area: 'Estadística y Probabilidad',
      area_id: 'statistics',
      topic: 'Medidas de Posición',
      concept_id: 'est-pos',
      title: 'Media Aritmética',
      stem: '¿Cuál es el promedio?',
      options: [
        { letter: 'A', text: '10' },
        { letter: 'B', text: '20' },
        { letter: 'C', text: '30' },
        { letter: 'D', text: '40' },
      ],
      correct_answer: 'B',
      explanation: 'Explicación promedio',
      solution_steps: ['Paso 1'],
      calculator_allowed: true,
      cognitive_level: 'reproduccion',
      difficulty_tier: 1,
      program_applicability: ['bxm'],
    },
  ];

  it('generates a prioritized RemediationPlan from session results', () => {
    const session: TestSession = {
      sessionId: 'diag-session-12345678',
      userId: 'learner-1',
      startTime: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      isCompleted: true,
      currentResponseIndex: 0,
      flaggedItems: {},
      elapsedSeconds: 240,
      itemIds: mockItems.map(i => i.id),
      items: mockItems,
      responses: {
        1: { itemId: 1, selectedOption: 'A', timeSpentSeconds: 40 }, // Incorrect
        2: { itemId: 2, selectedOption: 'A', timeSpentSeconds: 50 }, // Correct
        3: { itemId: 3, selectedOption: 'A', timeSpentSeconds: 60 }, // Incorrect
        4: { itemId: 4, selectedOption: 'B', timeSpentSeconds: 45 }, // Correct
      },
      config: {
        mode: 'diagnostic',
        programId: 'bxm',
        subjectId: 'matematicas',
        convocatoriaId: '2026-c2',
        itemCount: 4,
        enableTimer: false,
        timerDurationMinutes: 0,
        title: 'Diagnóstico Rápido',
      },
    };

    const plan = generateRemediationPlan(session);

    expect(plan.sessionId).toBe('diag-session-12345678');
    expect(plan.targetProgram).toBe('bxm');
    expect(plan.targetSubject).toBe('matematicas');
    expect(plan.overallScore).toBe(50); // 2 out of 4 correct = 50%

    // alg-fun-lin has 0/1 correct = 0% accuracy -> high priority
    // geo-circ has 1/2 correct = 50% accuracy -> medium priority
    expect(plan.topPriorityDrilldowns.length).toBeGreaterThanOrEqual(1);
    expect(plan.topPriorityDrilldowns.some(c => c.conceptId === 'alg-fun-lin')).toBe(true);

    // Formula sheets are provided
    const circConcept = plan.weakConcepts.find(c => c.conceptId === 'geo-circ');
    expect(circConcept?.suggestedFormulaSheets.length).toBeGreaterThan(0);

    // Domain summaries check
    expect(plan.domainSummaries.length).toBe(3);
    const algSummary = plan.domainSummaries.find(d => d.domain === 'algebra');
    expect(algSummary?.status).toBe('critical'); // 0%
  });

  it('saves and retrieves active remediation plan and records telemetry', () => {
    const session: TestSession = {
      sessionId: 'sess-abc',
      userId: 'u1',
      startTime: new Date().toISOString(),
      isCompleted: true,
      currentResponseIndex: 0,
      flaggedItems: {},
      elapsedSeconds: 100,
      itemIds: mockItems.map(i => i.id),
      items: mockItems,
      responses: {
        1: { itemId: 1, selectedOption: 'A', timeSpentSeconds: 40 }, // Incorrect
      },
      config: {
        mode: 'diagnostic',
        programId: 'bxm',
        subjectId: 'matematicas',
        itemCount: 1,
        enableTimer: false,
        timerDurationMinutes: 0,
      },
    };

    const plan = generateRemediationPlan(session);
    saveActiveRemediationPlan(plan);

    const retrieved = getActiveRemediationPlan(plan.userId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(plan.id);

    // Telemetry event should be recorded
    const stats = storageService.getTelemetryFunnelStats();
    expect(stats.remediationStarted).toBe(1);

    clearActiveRemediationPlan(plan.userId);
    expect(getActiveRemediationPlan(plan.userId)).toBeNull();
  });
});
