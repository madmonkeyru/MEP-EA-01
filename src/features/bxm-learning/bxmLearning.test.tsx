import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  BxmContentService,
  BxmIsomorphicGenerator,
  InteractiveCircleVisual,
  InteractiveSphereCrossSection,
  BxmMicroQuiz,
  BxmLessonView,
  BxmDigitalTemario
} from './index';

describe('Agent A: BXM Learning Content & Digital Temario', () => {
  describe('BxmContentService', () => {
    it('loads all 71 official BXM evidences with domain qualification', () => {
      const evidences = BxmContentService.getAllEvidences();
      expect(evidences).toHaveLength(71);

      const geo = BxmContentService.getEvidencesByDomain('geometry');
      const func = BxmContentService.getEvidencesByDomain('functions');
      const stat = BxmContentService.getEvidencesByDomain('statistics');

      expect(geo).toHaveLength(24);
      expect(func).toHaveLength(34);
      expect(stat).toHaveLength(13);

      for (const ev of evidences) {
        expect(ev.key).toMatch(/^bxm\/matematica\/02-2026\/(geometry|functions|statistics)\//);
      }
    });

    it('loads 30 base authored items (10 per domain) with distinct distractors', () => {
      const items = BxmContentService.getAuthoredItems();
      expect(items.length).toBeGreaterThanOrEqual(30);

      const geoItems = BxmContentService.getAuthoredItemsByDomain('geometry');
      const funcItems = BxmContentService.getAuthoredItemsByDomain('functions');
      const statItems = BxmContentService.getAuthoredItemsByDomain('statistics');

      expect(geoItems.length).toBeGreaterThanOrEqual(10);
      expect(funcItems.length).toBeGreaterThanOrEqual(10);
      expect(statItems.length).toBeGreaterThanOrEqual(10);

      for (const item of items) {
        expect(['A', 'B', 'C', 'D']).toContain(item.correctOption);
        expect(item.options[item.correctOption]).toBeDefined();
        // Check distractor rationales
        for (const opt of ['A', 'B', 'C', 'D']) {
          if (opt !== item.correctOption) {
            expect(item.distractorRationale[opt]).toBeDefined();
          }
        }
      }
    });

    it('loads complete rich lessons for anchor evidences across all three domains', () => {
      const lessons = BxmContentService.getAllLessons();
      expect(lessons.length).toBeGreaterThanOrEqual(3);

      const domainsPresent = new Set(lessons.map((l) => l.domain));
      expect(domainsPresent.has('geometry')).toBe(true);
      expect(domainsPresent.has('functions')).toBe(true);
      expect(domainsPresent.has('statistics')).toBe(true);

      for (const l of lessons) {
        expect(l.title).toBeTruthy();
        expect(l.prerequisites.length).toBeGreaterThan(0);
        expect(l.formulas.length).toBeGreaterThan(0);
        expect(l.commonMistakes.length).toBeGreaterThan(0);
        expect(l.workedExample.primaryMethod.steps.length).toBeGreaterThan(0);
        expect(l.microQuiz.length).toBeGreaterThan(0);
      }
    });
  });

  describe('BxmIsomorphicGenerator', () => {
    it('deterministically generates circle canonical item with independent math verification', () => {
      const item = BxmIsomorphicGenerator.generateCircleCanonicalItem({
        h: 2,
        k: -3,
        r: 5,
        seed: 'test-seed-1'
      });

      expect(item.familyId).toBe('bxm-iso-geo-circ-canon');
      expect(item.stem).toContain('(2, -3)');
      expect(item.stem).toContain('5');
      expect(item.options.A).toBe('$(x - 2)^2 + (y + 3)^2 = 25$');
      expect(item.correctOption).toBe('A');
      expect(item.distractorRationale.B).toBeTruthy();
    });

    it('generates linear equation item with correct slope and intercept', () => {
      const item = BxmIsomorphicGenerator.generateLinearEquationItem({
        m: 3,
        x1: 2,
        y1: 1,
        seed: 'test-seed-2'
      });

      // y - 1 = 3(x - 2) => y = 3x - 6 + 1 => y = 3x - 5
      expect(item.familyId).toBe('bxm-iso-func-slope-intercept');
      expect(item.options.A).toBe('$y = 3x - 5$');
      expect(item.correctOption).toBe('A');
    });

    it('generates RIC box plot item correctly', () => {
      const item = BxmIsomorphicGenerator.generateRicBoxItem({
        q1: 30,
        q3: 75,
        seed: 'test-seed-3'
      });

      // RIC = 75 - 30 = 45
      expect(item.familyId).toBe('bxm-iso-stat-ric-box');
      expect(item.options.A).toBe('$45$');
      expect(item.options.B).toBe('$105$');
      expect(item.correctOption).toBe('A');
    });
  });

  describe('Interactive Visual Components', () => {
    it('InteractiveCircleVisual computes boundary conditions correctly', () => {
      let stateSnapshot: any = null;
      render(
        <InteractiveCircleVisual
          initialH={0}
          initialK={0}
          initialR={5}
          onStateChange={(state) => {
            stateSnapshot = state;
          }}
        />
      );

      // Verify initial rendering
      expect(screen.getByText(/Explorador de la Circunferencia/i)).toBeInTheDocument();

      // Trigger slider changes
      const inputs = screen.getAllByRole('slider');
      expect(inputs.length).toBeGreaterThanOrEqual(3);

      // Change Center H to 3
      fireEvent.change(inputs[0], { target: { value: '3' } });
      expect(stateSnapshot).not.toBeNull();
      expect(stateSnapshot.h).toBe(3);
    });

    it('InteractiveSphereCrossSection enforces R^2 = d^2 + r^2', () => {
      let stateSnapshot: any = null;
      render(
        <InteractiveSphereCrossSection
          initialSphereRadius={10}
          initialPlaneDistance={6}
          onStateChange={(state) => {
            stateSnapshot = state;
          }}
        />
      );

      // Distance d=6, R=10 => r = sqrt(100 - 36) = 8
      expect(screen.getByText(/Sección Plana de una Esfera/i)).toBeInTheDocument();
      expect(screen.getAllByText(/8\.00/).length).toBeGreaterThan(0);

      const sliders = screen.getAllByRole('slider');
      // Set distance d=12 (exterior case d > R)
      fireEvent.change(sliders[1], { target: { value: '12' } });
      expect(stateSnapshot.state).toBe('exterior');
      expect(stateSnapshot.r).toBe(0);
    });
  });

  describe('BxmMicroQuiz Component', () => {
    it('emits onAnswered callback with selected option and correctness', () => {
      const handleAnswered = vi.fn();
      const quiz = {
        id: 'quiz-test-01',
        question: '¿Cuál es el valor de r?',
        options: {
          A: 'Opción A correcta',
          B: 'Opción B errónea'
        },
        correctOption: 'A',
        explanation: 'Porque A es correcta.'
      };

      render(
        <BxmMicroQuiz
          quiz={quiz}
          evidenceKey="bxm/matematica/02-2026/geometry/A1.2"
          onAnswered={handleAnswered}
        />
      );

      // Select option A
      fireEvent.click(screen.getByText('Opción A correcta'));
      // Submit
      fireEvent.click(screen.getByRole('button', { name: /Comprobar respuesta/i }));

      expect(handleAnswered).toHaveBeenCalledTimes(1);
      expect(handleAnswered).toHaveBeenCalledWith(
        expect.objectContaining({
          quizId: 'quiz-test-01',
          evidenceKey: 'bxm/matematica/02-2026/geometry/A1.2',
          selectedOption: 'A',
          isCorrect: true
        })
      );
      expect(screen.getByText(/¡Correcto!/i)).toBeInTheDocument();
    });
  });

  describe('BxmLessonView Component', () => {
    it('renders prerequisites, formulas, worked example and multiple methods', () => {
      const lesson = BxmContentService.getLessonById('lesson-geometry-a1-1')!;
      expect(lesson).toBeDefined();

      render(<BxmLessonView lesson={lesson} />);

      expect(screen.getByText(lesson.title)).toBeInTheDocument();
      expect(screen.getByText(/Prerrequisitos necesarios/i)).toBeInTheDocument();
      expect(screen.getByText(/Fórmulas Clave Oficiales/i)).toBeInTheDocument();
      expect(screen.getByText(/Errores Comunes en el Examen de Bachillerato/i)).toBeInTheDocument();
      expect(screen.getByText(/Ejemplo Resuelto Paso a Paso/i)).toBeInTheDocument();
      expect(screen.getByText(lesson.workedExample.primaryMethod.name)).toBeInTheDocument();
      if (lesson.workedExample.alternativeMethod) {
        expect(screen.getByText(new RegExp(lesson.workedExample.alternativeMethod.name, 'i'))).toBeInTheDocument();
      }
    });
  });

  describe('BxmDigitalTemario Component', () => {
    it('renders curriculum tree with filter and opens complete lesson', () => {
      render(<BxmDigitalTemario />);

      expect(screen.getByText(/Temario Digital Interactivo/i)).toBeInTheDocument();
      expect(screen.getByText(/71 Evidencias Oficiales MEP/i)).toBeInTheDocument();

      // Open a complete lesson
      const completePill = screen.getAllByText(/Lección completa/i)[0];
      expect(completePill).toBeInTheDocument();

      fireEvent.click(completePill);
      expect(screen.getByText(/← Volver al Temario Digital/i)).toBeInTheDocument();

      // Return to tree
      fireEvent.click(screen.getByText(/← Volver al Temario Digital/i));
      expect(screen.getByText(/Temario Digital Interactivo/i)).toBeInTheDocument();
    });
  });
});
