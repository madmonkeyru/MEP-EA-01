import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStoragePersistenceAdapter } from '../../services/persistenceService';

describe('M7: Domain Contracts & Persistence Abstraction', () => {
  let adapter: LocalStoragePersistenceAdapter;
  const learnerId = 'test_learner_42';

  beforeEach(async () => {
    localStorage.clear();
    adapter = new LocalStoragePersistenceAdapter();
    await adapter.clear();
  });

  it('initializes and saves a learner profile with versioned schema', async () => {
    const profile = await adapter.getProfile(learnerId);
    expect(profile).not.toBeNull();
    expect(profile?.learner_id).toBe(learnerId);
    expect(profile?.schema_version).toBe(1);
    expect(profile?.current_program).toBe('bxm');

    profile!.display_name = 'María Estudiante';
    await adapter.saveProfile(profile!);

    const reloaded = await adapter.getProfile(learnerId);
    expect(reloaded?.display_name).toBe('María Estudiante');
  });

  it('migrates legacy user and attempts from old localStorage keys safely', async () => {
    localStorage.setItem(
      'mep_ea_user',
      JSON.stringify({ id: 'legacy_user_123', name: 'Legacy Carlos', currentProgram: 'bxm' })
    );
    localStorage.setItem(
      'mep_ea_attempts',
      JSON.stringify([
        {
          id: 'leg_att_1',
          sessionId: 'leg_sess_1',
          programId: 'bxm',
          subjectId: 'matematica',
          mode: 'simulation',
          score: 80,
          correctAnswers: 48,
          totalQuestions: 60,
          timeSpent: 3600,
        },
      ])
    );

    const migratedProfile = await adapter.getProfile('legacy_user_123');
    expect(migratedProfile?.display_name).toBe('Legacy Carlos');

    const migratedAttempts = await adapter.getAttempts('legacy_user_123');
    expect(migratedAttempts).toHaveLength(1);
    expect(migratedAttempts[0].activity_type).toBe('mock_exam');
    expect(migratedAttempts[0].score_percentage).toBe(80);
  });

  it('stores and retrieves mastery snapshots, recommendations, and activity history', async () => {
    await adapter.saveMasterySnapshot({
      learner_id: learnerId,
      program_id: 'bxm',
      evidence_id: 'A1.2',
      domain: 'geometry',
      tier: 'Dominada',
      accuracy_rate: 0.85,
      qualifying_attempts_count: 5,
      last_evaluated_at: new Date().toISOString(),
    });

    const masteryList = await adapter.getMasterySnapshots(learnerId);
    expect(masteryList).toHaveLength(1);
    expect(masteryList[0].tier).toBe('Dominada');

    await adapter.saveRecommendation({
      recommendation_id: 'rec_01',
      learner_id: learnerId,
      activity_type: 'practice',
      target_id: 'A2.1',
      reason: 'Oportunidad en Funciones',
      priority: 1,
      cta_label: 'Practicar ahora',
      created_at: new Date().toISOString(),
    });

    const activeRec = await adapter.getActiveRecommendation(learnerId);
    expect(activeRec?.target_id).toBe('A2.1');

    await adapter.recordActivity({
      entry_id: 'act_1',
      learner_id: learnerId,
      program_id: 'bxm',
      activity_type: 'lesson_read',
      title: 'Lección de Circunferencia',
      duration_seconds: 300,
      timestamp: new Date().toISOString(),
    });

    const history = await adapter.getActivityHistory(learnerId);
    expect(history).toHaveLength(1);
    expect(history[0].title).toBe('Lección de Circunferencia');
  });

  it('performs export and import round-trip accurately with validation guards', async () => {
    // Populate some data
    await adapter.saveProfile({
      learner_id: 'roundtrip_user',
      schema_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      display_name: 'Elena',
      current_program: 'bxm',
      is_anonymous: false,
    });
    await adapter.saveAttempt({
      attempt_id: 'att_rt_1',
      session_id: 'sess_rt_1',
      learner_id: 'roundtrip_user',
      program_id: 'bxm',
      subject_id: 'matematica',
      activity_type: 'diagnostic',
      score_percentage: 75,
      correct_count: 15,
      total_questions: 20,
      time_spent_seconds: 1200,
      completed_at: new Date().toISOString(),
    });

    const exported = await adapter.exportState('roundtrip_user');
    expect(exported.profile.display_name).toBe('Elena');
    expect(exported.attempts).toHaveLength(1);

    // Clear adapter and reimport
    await adapter.clear();
    const success = await adapter.importState(exported);
    expect(success).toBe(true);

    const restoredProfile = await adapter.getProfile('roundtrip_user');
    expect(restoredProfile?.display_name).toBe('Elena');
    const restoredAttempts = await adapter.getAttempts('roundtrip_user');
    expect(restoredAttempts).toHaveLength(1);
    expect(restoredAttempts[0].score_percentage).toBe(75);
  });

  it('rejects corrupted or invalid import state payloads gracefully', async () => {
    const invalidPayload: any = { schema_version: 0 };
    const success = await adapter.importState(invalidPayload);
    expect(success).toBe(false);
  });
});
