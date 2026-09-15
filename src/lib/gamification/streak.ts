/**
 * Gamification Streak Logic & Daily Consistency Evaluator
 */

export interface StreakEvaluationResult {
  newStreak: number;
  newLongestStreak: number;
  isNewDayLog: boolean;
  streakBroken: boolean;
}

/**
 * Calculate difference in calendar days between two YYYY-MM-DD date strings.
 */
export function getCalendarDayDiff(fromDateStr: string, toDateStr: string): number {
  const [y1, m1, d1] = fromDateStr.split("-").map(Number);
  const [y2, m2, d2] = toDateStr.split("-").map(Number);

  const date1 = new Date(Date.UTC(y1, m1 - 1, d1));
  const date2 = new Date(Date.UTC(y2, m2 - 1, d2));

  const diffMs = date2.getTime() - date1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluate streak changes when a user logs a transaction on a specific date.
 */
export function calculateStreak(
  lastLoggedDate: string | null,
  currentDateStr: string,
  currentStreak: number,
  longestStreak: number
): StreakEvaluationResult {
  // If user has never logged before
  if (!lastLoggedDate) {
    return {
      newStreak: 1,
      newLongestStreak: Math.max(longestStreak, 1),
      isNewDayLog: true,
      streakBroken: false,
    };
  }

  const diffDays = getCalendarDayDiff(lastLoggedDate, currentDateStr);

  // Same day logging: streak remains the same, not a new day
  if (diffDays === 0) {
    return {
      newStreak: Math.max(1, currentStreak),
      newLongestStreak: Math.max(longestStreak, currentStreak),
      isNewDayLog: false,
      streakBroken: false,
    };
  }

  // Exactly the next calendar day: streak increments
  if (diffDays === 1) {
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      newLongestStreak: Math.max(longestStreak, newStreak),
      isNewDayLog: true,
      streakBroken: false,
    };
  }

  // More than 1 day skipped: streak resets to 1
  if (diffDays > 1) {
    return {
      newStreak: 1,
      newLongestStreak: longestStreak,
      isNewDayLog: true,
      streakBroken: currentStreak > 0,
    };
  }

  // Logging a transaction for a past date (diffDays < 0): don't advance streak
  return {
    newStreak: currentStreak,
    newLongestStreak: longestStreak,
    isNewDayLog: false,
    streakBroken: false,
  };
}
