import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import type { LearningCatalog } from '@mep-ea/content/expansion';

export function LearningBrowser({
  catalog,
  busy,
  start,
  initialKey = '',
  selectedSubject,
}: {
  catalog: LearningCatalog;
  busy: boolean;
  start: (id: string) => void;
  initialKey?: string;
  selectedSubject?: string;
}) {
  const [domain, setDomain] = useState('');
  const [key, setKey] = useState(initialKey);

  const eligibleDomains = selectedSubject
    ? catalog.registry.taxonomy.domains.filter(d => d.subjectId === selectedSubject)
    : catalog.registry.taxonomy.domains;

  const eligibleDomainIds = new Set(eligibleDomains.map(d => d.id));
  const eligibleNodes = catalog.nodes.filter(n => eligibleDomainIds.has(n.domainId));

  const node = eligibleNodes.find(n => n.key === key);
  const lesson = node?.lesson;

  return <View style={{ gap: 16 }}>
    <Text accessibilityRole="header">Aprender por evidencia</Text>
    <Text>{eligibleNodes.length} evidencias · {eligibleNodes.filter(n => n.lesson).length} lecciones en borrador · {catalog.registry.questions.filter(q => !selectedSubject || q.subjectId === selectedSubject).length} preguntas propias</Text>
    <Button title="Todas las áreas" onPress={() => { setDomain(''); setKey(''); }} />
    {eligibleDomains.map(d => <Button key={d.id} title={`${domain === d.id ? '✓ ' : ''}${d.name}`} onPress={() => { setDomain(d.id); setKey(''); }} />)}
    {!node && eligibleNodes.filter(n => !domain || n.domainId === domain).map(n => <Button key={n.key}
      title={`${key === n.key ? '✓ ' : ''}${n.domainId} · ${n.code} · ${n.lesson ? 'Lección en borrador' : 'Lección no disponible'}`} onPress={() => setKey(n.key)} />)}
    {node && <View style={{ gap: 16 }}>
      <Button title="Cambiar evidencia" onPress={() => setKey('')} />
      <Text accessibilityRole="header">{node.code}: {node.description}</Text>
      <Text>{node.status === 'complete' ? 'Lección completa en borrador; pendiente de revisión editorial.' : 'Evidencia scaffolded: lección no disponible todavía.'}</Text>
      <Text>Conceptos: {node.conceptIds.map(id => catalog.registry.taxonomy.concepts.find(c => c.id === id)?.name).join(', ') || 'Sin contenido conceptual disponible'}</Text>
      {lesson && <View style={{ gap: 12 }}>
        <Text accessibilityRole="header">{lesson.title}</Text><Text>{lesson.subtitle}</Text>
        <Text accessibilityRole="header">Antes de empezar</Text>{lesson.prerequisites.map((p, i) => <Text key={i}>{p}</Text>)}
        <Text>{lesson.coreExplanation}</Text>
        {lesson.formulas.map(f => <Text key={f.name}>{f.name}{'\n'}{f.latex}{'\n'}{f.notes}</Text>)}
        <Text accessibilityRole="header">Errores frecuentes</Text>{lesson.commonMistakes.map(m => <Text key={m.mistake}>{m.mistake}{'\n'}{m.description}{'\n'}{m.correction}</Text>)}
        <Text accessibilityRole="header">Ejemplo resuelto</Text><Text>{lesson.workedExample.statement}</Text>
        {[lesson.workedExample.primaryMethod, ...(lesson.workedExample.alternativeMethod ? [lesson.workedExample.alternativeMethod] : [])].map(m => <View key={m.name}><Text>{m.name}</Text>{m.steps.map((s, i) => <Text key={i}>{s}</Text>)}</View>)}
        <Text accessibilityRole="header">Comprueba lo aprendido</Text>{lesson.microQuiz.map(q => <View key={q.id}><Text>{q.question}</Text>{Object.entries(q.options).map(([id, text]) => <Text key={id}>{id}. {text}</Text>)}<Text>{q.correctOption}: {q.explanation}</Text></View>)}
      </View>}
      <Text>Práctica en borrador: {node.practiceItemIds.length} preguntas propias</Text>
      <Button title="Practicar esta evidencia" disabled={busy || !node.practiceBlueprintId} onPress={() => node.practiceBlueprintId && start(node.practiceBlueprintId)} />
      {!node.practiceBlueprintId && <Text>Práctica no disponible para esta evidencia.</Text>}
    </View>}
  </View>;
}
