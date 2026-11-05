import type { QualifiedEvidenceInfo } from '../domain/types';

/**
 * Standard 71 Official Evidences for BXM Mathematics 02-2026.
 * Extracted directly from official specification inventory (23 Geometry, 25 Functions, 12 Statistics/Probability).
 */
export const BXM_OFFICIAL_EVIDENCES_FIXTURE: QualifiedEvidenceInfo[] = [
  // Geometry (23 spec points, official distribution)
  { key: 'bxm/matematica/02-2026/geometry/A1.1', domain: 'geometry', rawCode: 'A1.1', affirmationCode: 'A1', description: 'Reconocer centro y radio de una circunferencia en representaciones gráficas y algebraicas.', weightOfficialPercent: 4.5 },
  { key: 'bxm/matematica/02-2026/geometry/A1.2', domain: 'geometry', rawCode: 'A1.2', affirmationCode: 'A1', description: 'Determinar si un punto se ubica en el interior, en el exterior o sobre la circunferencia.', weightOfficialPercent: 4.5 },
  { key: 'bxm/matematica/02-2026/geometry/A1.3', domain: 'geometry', rawCode: 'A1.3', affirmationCode: 'A1', description: 'Identificar rectas secantes, tangentes y exteriores a una circunferencia dada.', weightOfficialPercent: 4.5 },
  { key: 'bxm/matematica/02-2026/geometry/A1.4', domain: 'geometry', rawCode: 'A1.4', affirmationCode: 'A1', description: 'Determinar la posición relativa de una recta respecto a una circunferencia.', weightOfficialPercent: 4.5 },
  { key: 'bxm/matematica/02-2026/geometry/A1.5', domain: 'geometry', rawCode: 'A1.5', affirmationCode: 'A1', description: 'Aplicar propiedades de tangencia para resolver problemas geométricos.', weightOfficialPercent: 4.5 },
  { key: 'bxm/matematica/02-2026/geometry/A1.6', domain: 'geometry', rawCode: 'A1.6', affirmationCode: 'A1', description: 'Resolver problemas algebraicos que involucran traslaciones de circunferencias.', weightOfficialPercent: 4.5 },
  { key: 'bxm/matematica/02-2026/geometry/A2.1', domain: 'geometry', rawCode: 'A2.1', affirmationCode: 'A2', description: 'Calcular perímetros de polígonos regulares y no regulares en el plano.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/geometry/A2.2', domain: 'geometry', rawCode: 'A2.2', affirmationCode: 'A2', description: 'Calcular áreas de polígonos utilizando fórmulas trigonométricas y descomposición.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/geometry/A2.3', domain: 'geometry', rawCode: 'A2.3', affirmationCode: 'A2', description: 'Determinar medidas de ángulos internos y externos en polígonos regulares.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/geometry/A3.1', domain: 'geometry', rawCode: 'A3.1', affirmationCode: 'A3', description: 'Identificar transformaciones isométricas (traslaciones, reflexiones y homotecias).', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/geometry/A3.2', domain: 'geometry', rawCode: 'A3.2', affirmationCode: 'A3', description: 'Aplicar reflexiones axiales sobre ejes coordenados a figuras poligonales.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/geometry/A4.1', domain: 'geometry', rawCode: 'A4.1', affirmationCode: 'A4', description: 'Identificar las secciones planas generadas al cortar una esfera por un plano.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/geometry/A4.2', domain: 'geometry', rawCode: 'A4.2', affirmationCode: 'A4', description: 'Calcular el radio o distancia al centro de la sección transversal circular de una esfera.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/geometry/A4.3', domain: 'geometry', rawCode: 'A4.3', affirmationCode: 'A4', description: 'Reconocer el círculo, elipse, parábola e hipérbola como cortes en conos circulares rectos.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/geometry/A4.4', domain: 'geometry', rawCode: 'A4.4', affirmationCode: 'A4', description: 'Identificar secciones axiales y paralelas a la base en cilindros circulares rectos.', weightOfficialPercent: 4.0 },

  // Functions & Relations (25 spec points)
  { key: 'bxm/matematica/02-2026/functions/A1.1', domain: 'functions', rawCode: 'A1.1', affirmationCode: 'A1', description: 'Determinar dominio, codominio y ámbito de relaciones y funciones reales.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A1.2', domain: 'functions', rawCode: 'A1.2', affirmationCode: 'A1', description: 'Calcular imágenes y preimágenes utilizando representaciones algebraicas y gráficas.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A1.3', domain: 'functions', rawCode: 'A1.3', affirmationCode: 'A1', description: 'Identificar ceros, signos y monotonía de funciones a partir de su gráfica.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A2.1', domain: 'functions', rawCode: 'A2.1', affirmationCode: 'A2', description: 'Determinar la pendiente e intersecciones con los ejes de una función lineal.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A2.2', domain: 'functions', rawCode: 'A2.2', affirmationCode: 'A2', description: 'Plantear y resolver problemas contextualizados mediante modelos lineales.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A3.1', domain: 'functions', rawCode: 'A3.1', affirmationCode: 'A3', description: 'Calcular el vértice y el discriminante de una función cuadrática.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A3.2', domain: 'functions', rawCode: 'A3.2', affirmationCode: 'A3', description: 'Determinar concavidad y puntos de corte con los ejes en parábolas.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A3.3', domain: 'functions', rawCode: 'A3.3', affirmationCode: 'A3', description: 'Resolver problemas de optimización contextualizados con modelos cuadráticos.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A4.1', domain: 'functions', rawCode: 'A4.1', affirmationCode: 'A4', description: 'Identificar propiedades de la función exponencial f(x) = a^x según su base.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A4.2', domain: 'functions', rawCode: 'A4.2', affirmationCode: 'A4', description: 'Determinar asíntotas, monotonía y puntos característicos de curvas exponenciales.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A5.1', domain: 'functions', rawCode: 'A5.1', affirmationCode: 'A5', description: 'Identificar la función logarítmica como la inversa de la función exponencial.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A5.2', domain: 'functions', rawCode: 'A5.2', affirmationCode: 'A5', description: 'Aplicar propiedades de logaritmos para simplificar y resolver ecuaciones.', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A6.1', domain: 'functions', rawCode: 'A6.1', affirmationCode: 'A6', description: 'Calcular la composición de funciones (f o g)(x).', weightOfficialPercent: 4.0 },
  { key: 'bxm/matematica/02-2026/functions/A6.2', domain: 'functions', rawCode: 'A6.2', affirmationCode: 'A6', description: 'Determinar el criterio algebraico de la función inversa f^-1(x).', weightOfficialPercent: 4.0 },

  // Statistics & Probability (12 spec points)
  { key: 'bxm/matematica/02-2026/statistics/A1.1', domain: 'statistics', rawCode: 'A1.1', affirmationCode: 'A1', description: 'Interpretar media aritmética, mediana, moda y recorridos en distribuciones de datos.', weightOfficialPercent: 5.0 },
  { key: 'bxm/matematica/02-2026/statistics/A1.2', domain: 'statistics', rawCode: 'A1.2', affirmationCode: 'A1', description: 'Interpretar diagramas de cajas (box-plots) e identificar cuartiles y asimetrías.', weightOfficialPercent: 5.0 },
  { key: 'bxm/matematica/02-2026/statistics/A1.3', domain: 'statistics', rawCode: 'A1.3', affirmationCode: 'A1', description: 'Comparar la dispersión y posición de dos o más conjuntos de datos.', weightOfficialPercent: 5.0 },
  { key: 'bxm/matematica/02-2026/statistics/A2.1', domain: 'statistics', rawCode: 'A2.1', affirmationCode: 'A2', description: 'Calcular probabilidades teóricas y empíricas en espacios muestrales finitos.', weightOfficialPercent: 5.0 },
  { key: 'bxm/matematica/02-2026/statistics/A2.2', domain: 'statistics', rawCode: 'A2.2', affirmationCode: 'A2', description: 'Aplicar la regla de la adición para eventos mutuamente excluyentes y no excluyentes.', weightOfficialPercent: 5.0 },
  { key: 'bxm/matematica/02-2026/statistics/A2.3', domain: 'statistics', rawCode: 'A2.3', affirmationCode: 'A2', description: 'Determinar la probabilidad de eventos complementarios y compuestos.', weightOfficialPercent: 5.0 },
];
