import type { AttemptEvent, BxmDomain, LearningCompletion } from '../domain/types';

export interface DailyActivityBucket {
  dateIso: string; // YYYY-MM-DD in specified timezone
  responseEventsCount: number;
  uniqueQuestionsCount: number;
  distinctTemplateFamiliesCount: number;
  completedSessionsCount: number;
  correctResponsesCount: number;
  accuracyExactRatio: number;
  accuracyPercentage: number;
}

export interface SevenDayLearningReport {
  windowStartDateIso: string;
  windowEndDateIso: string;
  days: DailyActivityBucket[];
  totalResponseEvents: number;
  totalUniqueQuestions: number;
  totalDistinctFamilies: number;
  totalCompletedSessions: number;
  overallAccuracyExactRatio: number;
  overallAccuracyPercentage: number;
  firstResponseAccuracyPercentage: number;
  firstResponseCount: number;
  comparisonWithPriorWeek?: {
    priorTotalResponses: number;
    priorAccuracyPercentage: number;
    accuracyDeltaPercentagePoints: number; // e.g. +5 or -3
    responsesDelta: number;
  };
  domainActivityBreakdown: Record<BxmDomain, { totalResponses: number; correctResponses: number; accuracyPercentage: number }>;
}

export interface StreakSummary {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDateIso?: string;
  isActiveToday: boolean;
  timeZone: string;
}

/**
 * Returns date formatted as YYYY-MM-DD in the given IANA timezone (default: America/Costa_Rica).
 */
export function formatDateInTimeZone(date: Date, timeZone = 'America/Costa_Rica'): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // en-CA produces YYYY-MM-DD
}

/**
 * Adds an offset in days in local date calculation.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Builds the 7-day rolling report covering the reference date plus 6 prior calendar dates
 * in the specified timezone (default America/Costa_Rica).
 */
export function generateSevenDayReport(
  events: AttemptEvent[],
  referenceDateUtc: Date,
  timeZone = 'America/Costa_Rica',
  completions: LearningCompletion[] = []
): SevenDayLearningReport {
  // Compute the 7 calendar dates: [ref - 6, ..., ref]
  const targetDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = addDays(referenceDateUtc, -i);
    targetDates.push(formatDateInTimeZone(day, timeZone));
  }

  // Also compute prior 7 dates for comparison: [ref - 13, ..., ref - 7]
  const priorDates: string[] = [];
  for (let i = 13; i >= 7; i--) {
    const day = addDays(referenceDateUtc, -i);
    priorDates.push(formatDateInTimeZone(day, timeZone));
  }

  const currentWindowSet = new Set(targetDates);
  const priorWindowSet = new Set(priorDates);
  const completionsByDate = new Map<string, Set<string>>();
  for (const completion of completions) {
    const time = Date.parse(completion.completedAt);
    if (!['completed','timed_out'].includes(completion.status) || !Number.isFinite(time) || time > referenceDateUtc.getTime()) continue;
    const date = formatDateInTimeZone(new Date(time), timeZone);
    const ids = completionsByDate.get(date) || new Set<string>();
    ids.add(completion.sessionId); completionsByDate.set(date, ids);
  }
  for (const event of events) {
    const completed = Date.parse(event.sessionCompletedAt || '');
    if (!['completed', 'timed_out'].includes(event.sessionStatus || '') || !Number.isFinite(completed) || completed > referenceDateUtc.getTime()) continue;
    const date = formatDateInTimeZone(new Date(completed), timeZone);
    const ids = completionsByDate.get(date) || new Set<string>();
    ids.add(event.sessionId); completionsByDate.set(date, ids);
  }

  // Group events by local date
  const eventsByDate = new Map<string, AttemptEvent[]>();
  for (const ev of events) {
    const evDate = new Date(ev.timestamp);
    if (!Number.isNaN(evDate.getTime())) {
      const localDate = formatDateInTimeZone(evDate, timeZone);
      if (!eventsByDate.has(localDate)) {
        eventsByDate.set(localDate, []);
      }
      eventsByDate.get(localDate)!.push(ev);
    }
  }

  const days: DailyActivityBucket[] = targetDates.map((dateIso) => {
    const dayEvents = eventsByDate.get(dateIso) || [];
    const questionIds = new Set<string>();
    const familyIds = new Set<string>();
    const sessionIds = new Set<string>();
    let correct = 0;

    for (const ev of dayEvents) {
      questionIds.add(ev.itemId);
      const famKey = ev.familyId && ev.familyId.trim().length > 0 ? ev.familyId : `item:${ev.itemId}`;
      familyIds.add(famKey);
      if (['completed', 'timed_out'].includes(ev.sessionStatus || '') && ev.sessionCompletedAt &&
        formatDateInTimeZone(new Date(ev.sessionCompletedAt), timeZone) === dateIso) sessionIds.add(ev.sessionId);
      if (ev.isCorrect) correct++;
    }

    const total = dayEvents.length;
    const ratio = total > 0 ? correct / total : 0;

    return {
      dateIso,
      responseEventsCount: total,
      uniqueQuestionsCount: questionIds.size,
      distinctTemplateFamiliesCount: familyIds.size,
      completedSessionsCount: completionsByDate.get(dateIso)?.size || 0,
      correctResponsesCount: correct,
      accuracyExactRatio: ratio,
      accuracyPercentage: Math.round(ratio * 100),
    };
  });

  // Aggregate current 7-day window totals
  const allCurrentWindowEvents: AttemptEvent[] = [];
  for (const d of currentWindowSet) {
    const evs = eventsByDate.get(d);
    if (evs) allCurrentWindowEvents.push(...evs);
  }

  const currentQuestions = new Set<string>();
  const currentFamilies = new Set<string>();
  const currentSessions = new Set<string>();
  let currentCorrect = 0;

  const domainBreakdown: Record<BxmDomain, { totalResponses: number; correctResponses: number; accuracyPercentage: number }> = {
    geometry: { totalResponses: 0, correctResponses: 0, accuracyPercentage: 0 },
    functions: { totalResponses: 0, correctResponses: 0, accuracyPercentage: 0 },
    statistics: { totalResponses: 0, correctResponses: 0, accuracyPercentage: 0 },
  };

  for (const ev of allCurrentWindowEvents) {
    currentQuestions.add(ev.itemId);
    const famKey = ev.familyId && ev.familyId.trim().length > 0 ? ev.familyId : `item:${ev.itemId}`;
    currentFamilies.add(famKey);
    if (['completed', 'timed_out'].includes(ev.sessionStatus || '') && ev.sessionCompletedAt &&
      currentWindowSet.has(formatDateInTimeZone(new Date(ev.sessionCompletedAt), timeZone))) currentSessions.add(ev.sessionId);
    if (ev.isCorrect) currentCorrect++;

    const dom = ev.domain || 'geometry';
    if (domainBreakdown[dom]) {
      domainBreakdown[dom].totalResponses++;
      if (ev.isCorrect) domainBreakdown[dom].correctResponses++;
    }
  }

  for (const dom of ['geometry', 'functions', 'statistics'] as BxmDomain[]) {
    const d = domainBreakdown[dom];
    d.accuracyPercentage = d.totalResponses > 0 ? Math.round((d.correctResponses / d.totalResponses) * 100) : 0;
  }

  const currentTotal = allCurrentWindowEvents.length;
  const currentOverallRatio = currentTotal > 0 ? currentCorrect / currentTotal : 0;
  const currentAccuracyPercentage = Math.round(currentOverallRatio * 100);

  // Aggregate prior 7-day window
  const allPriorEvents: AttemptEvent[] = [];
  for (const d of priorWindowSet) {
    const evs = eventsByDate.get(d);
    if (evs) allPriorEvents.push(...evs);
  }

  let comparison: SevenDayLearningReport['comparisonWithPriorWeek'];

  if (allPriorEvents.length > 0 && currentTotal > 0) {
    let priorCorrect = 0;
    for (const ev of allPriorEvents) {
      if (ev.isCorrect) priorCorrect++;
    }
    const priorRatio = priorCorrect / allPriorEvents.length;
    const priorAccPct = Math.round(priorRatio * 100);

    comparison = {
      priorTotalResponses: allPriorEvents.length,
      priorAccuracyPercentage: priorAccPct,
      accuracyDeltaPercentagePoints: currentAccuracyPercentage - priorAccPct,
      responsesDelta: currentTotal - allPriorEvents.length,
    };
  }

  return {
    windowStartDateIso: targetDates[0],
    windowEndDateIso: targetDates[targetDates.length - 1],
    days,
    totalResponseEvents: currentTotal,
    totalUniqueQuestions: currentQuestions.size,
    totalDistinctFamilies: currentFamilies.size,
    totalCompletedSessions: new Set(targetDates.flatMap(date => [...(completionsByDate.get(date) || [])])).size,
    overallAccuracyExactRatio: currentOverallRatio,
    overallAccuracyPercentage: currentAccuracyPercentage,
    firstResponseCount: allCurrentWindowEvents.filter(e => e.responseIndex === 0).length,
    firstResponseAccuracyPercentage: (() => { const first = allCurrentWindowEvents.filter(e => e.responseIndex === 0); return first.length ? Math.round(100 * first.filter(e => e.isCorrect).length / first.length) : 0; })(),
    comparisonWithPriorWeek: comparison,
    domainActivityBreakdown: domainBreakdown,
  };
}

/**
 * Calculates current and longest active day streaks in Costa Rica timezone.
 */
export function calculateActivityStreak(
  events: AttemptEvent[],
  referenceDateUtc: Date,
  timeZone = 'America/Costa_Rica',
  completions: LearningCompletion[] = []
): StreakSummary {
  if (events.length === 0 && completions.length === 0) {
    return {
      currentStreakDays: 0,
      longestStreakDays: 0,
      isActiveToday: false,
      timeZone,
    };
  }

  // Extract unique active days
  const activeDaysSet = new Set<string>();
  for (const completion of completions) {
    const time = Date.parse(completion.completedAt);
    if (completion.answeredCount > 0 && ['completed','timed_out'].includes(completion.status) && Number.isFinite(time) && time <= referenceDateUtc.getTime()) activeDaysSet.add(formatDateInTimeZone(new Date(time), timeZone));
  }
  for (const ev of events) {
    if (!['completed', 'timed_out'].includes(ev.sessionStatus || '') || !ev.sessionCompletedAt) continue;
    const d = new Date(ev.sessionCompletedAt);
    if (!Number.isNaN(d.getTime()) && d.getTime() <= referenceDateUtc.getTime()) {
      activeDaysSet.add(formatDateInTimeZone(d, timeZone));
    }
  }

  const sortedDays = Array.from(activeDaysSet).sort(); // YYYY-MM-DD sorts chronologically
  const todayIso = formatDateInTimeZone(referenceDateUtc, timeZone);
  const yesterdayIso = formatDateInTimeZone(addDays(referenceDateUtc, -1), timeZone);

  const isActiveToday = activeDaysSet.has(todayIso);

  // Compute current streak backward from today (or yesterday if inactive today)
  let currentStreak = 0;
  let checkDay = isActiveToday ? referenceDateUtc : addDays(referenceDateUtc, -1);

  while (true) {
    const dayIso = formatDateInTimeZone(checkDay, timeZone);
    if (activeDaysSet.has(dayIso)) {
      currentStreak++;
      checkDay = addDays(checkDay, -1);
    } else {
      break;
    }
  }

  // If inactive today and inactive yesterday, current streak is 0
  if (!isActiveToday && !activeDaysSet.has(yesterdayIso)) {
    currentStreak = 0;
  }

  // Compute longest historical streak
  let longestStreak = 0;
  let tempStreak = 0;
  let previousDate: Date | null = null;

  for (const dayStr of sortedDays) {
    // Parse year, month, day components
    const [y, m, d] = dayStr.split('-').map(Number);
    const currentDate = new Date(Date.UTC(y, m - 1, d));

    if (previousDate === null) {
      tempStreak = 1;
    } else {
      const diffMs = currentDate.getTime() - previousDate.getTime();
      const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    previousDate = currentDate;
  }

  return {
    currentStreakDays: currentStreak,
    longestStreakDays: longestStreak,
    lastActiveDateIso: sortedDays[sortedDays.length - 1],
    isActiveToday,
    timeZone,
  };
}
