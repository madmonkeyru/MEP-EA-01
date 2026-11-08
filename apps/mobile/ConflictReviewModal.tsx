import { useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, ScrollView, TouchableOpacity } from 'react-native';
import type { Attempt, Answer } from '@mep-ea/domain';
import type { DraftState } from '@mep-ea/api';

export interface ConflictResolutionChoice {
  type: 'accept_server' | 'keep_local' | 'combine';
  reconciledAttempt: Attempt;
  baseRevision: number;
}

export function ConflictReviewModal({
  conflictState,
  localAttempt,
  isOpen,
  onResolve,
  onCancel,
}: {
  conflictState: DraftState;
  localAttempt: Attempt;
  isOpen: boolean;
  onResolve: (choice: ConflictResolutionChoice) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<'choose' | 'combine'>('choose');
  const serverDraft = conflictState.draft?.attempt;
  const currentRevision = conflictState.draft?.revision ?? 1;

  const [combinedAnswers, setCombinedAnswers] = useState<Record<string, Answer>>(() => {
    return { ...localAttempt.answers };
  });

  if (!isOpen || !serverDraft) return null;

  const handleAcceptServer = () => {
    onResolve({
      type: 'accept_server',
      reconciledAttempt: serverDraft,
      baseRevision: currentRevision,
    });
  };

  const handleKeepLocal = () => {
    const preservedFirstAnswers = {
      ...serverDraft.firstAnswers,
      ...localAttempt.firstAnswers,
    };
    const reconciledAttempt: Attempt = {
      ...localAttempt,
      firstAnswers: preservedFirstAnswers,
      updatedAt: new Date().toISOString(),
    };
    onResolve({
      type: 'keep_local',
      reconciledAttempt,
      baseRevision: currentRevision,
    });
  };

  const handleConfirmCombine = () => {
    const preservedFirstAnswers = {
      ...serverDraft.firstAnswers,
      ...localAttempt.firstAnswers,
    };
    const reconciledAttempt: Attempt = {
      ...localAttempt,
      answers: combinedAnswers,
      firstAnswers: preservedFirstAnswers,
      updatedAt: new Date().toISOString(),
    };
    onResolve({
      type: 'combine',
      reconciledAttempt,
      baseRevision: currentRevision,
    });
  };

  const questionIds = Array.from(new Set([
    ...localAttempt.questionIds,
    ...serverDraft.questionIds,
  ]));

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.badge}>Conflicto 409 Multi-Dispositivo</Text>
          <Text style={styles.title}>Revisión y Reconciliación</Text>
          <Text style={styles.subtitle}>
            Se detectó un cambio simultáneo (Revisión {currentRevision}). Sin sobreescrituras automáticas.
          </Text>

          {mode === 'choose' ? (
            <View style={styles.section}>
              <View style={styles.choiceCard}>
                <Text style={styles.cardHeader}>Versión del Servidor</Text>
                <Text style={styles.meta}>Respuestas: {Object.keys(serverDraft.answers || {}).length} preguntas</Text>
                <Button title="Aceptar versión del servidor" onPress={handleAcceptServer} color="#334155" />
              </View>

              <View style={[styles.choiceCard, styles.localHighlight]}>
                <Text style={styles.cardHeader}>Versión Local</Text>
                <Text style={styles.meta}>Respuestas: {Object.keys(localAttempt.answers || {}).length} preguntas</Text>
                <Button title="Conservar versión local" onPress={handleKeepLocal} color="#2563eb" />
              </View>

              <Button title="Combinar pregunta por pregunta →" onPress={() => setMode('combine')} color="#4f46e5" />
              <Button title="Cerrar sin resolver" onPress={onCancel} color="#94a3b8" />
            </View>
          ) : (
            <View style={styles.section}>
              <ScrollView style={styles.scrollList}>
                {questionIds.map((qId, i) => {
                  const localAns = localAttempt.answers?.[qId]?.optionId;
                  const serverAns = serverDraft.answers?.[qId]?.optionId;
                  const selected = combinedAnswers[qId]?.optionId;
                  return (
                    <View key={qId} style={styles.itemRow}>
                      <Text style={styles.itemTitle}>P{i + 1} (Local: {localAns ?? '—'} | Servidor: {serverAns ?? '—'})</Text>
                      <View style={styles.btnRow}>
                        {localAns ? (
                          <TouchableOpacity
                            style={[styles.smallBtn, selected === localAns && styles.activeBtn]}
                            onPress={() => setCombinedAnswers(prev => ({ ...prev, [qId]: localAttempt.answers[qId] }))}
                          >
                            <Text style={selected === localAns ? styles.activeText : styles.inactiveText}>Local ({localAns})</Text>
                          </TouchableOpacity>
                        ) : null}
                        {serverAns ? (
                          <TouchableOpacity
                            style={[styles.smallBtn, selected === serverAns && styles.activeBtn]}
                            onPress={() => setCombinedAnswers(prev => ({ ...prev, [qId]: serverDraft.answers[qId] }))}
                          >
                            <Text style={selected === serverAns ? styles.activeText : styles.inactiveText}>Servidor ({serverAns})</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
              <Button title="Guardar selección combinada" onPress={handleConfirmCombine} color="#0f172a" />
              <Button title="← Volver" onPress={() => setMode('choose')} color="#64748b" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  dialog: { backgroundColor: '#fff', borderRadius: 12, padding: 20, gap: 12, maxHeight: '85%' },
  badge: { fontSize: 11, fontWeight: '700', color: '#b45309', backgroundColor: '#fef3c7', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b' },
  section: { gap: 12 },
  choiceCard: { padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, gap: 8, backgroundColor: '#f8fafc' },
  localHighlight: { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  cardHeader: { fontWeight: '600', color: '#0f172a' },
  meta: { fontSize: 12, color: '#475569' },
  scrollList: { maxHeight: 220 },
  itemRow: { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f1f5f9', gap: 6 },
  itemTitle: { fontSize: 12, color: '#334155' },
  btnRow: { flexDirection: 'row', gap: 8 },
  smallBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#e2e8f0' },
  activeBtn: { backgroundColor: '#2563eb' },
  activeText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  inactiveText: { color: '#334155', fontSize: 12 },
});
