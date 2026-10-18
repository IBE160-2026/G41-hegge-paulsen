const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Minutes-rule weighting: vigorous (`high`) counts 2:1, moderate (`medium`) counts 1:1.
// `low` intensity and unclassified (`null`/`undefined`/missing) intensity are deliberately
// absent from this map so they contribute 0 weighted minutes (see spec Boundaries).
const INTENSITY_WEIGHTS = {
  high: 2,
  medium: 1
};

function parseISODate(dateValue) {
  if (typeof dateValue !== 'string') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  const isValidCalendarDate =
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;

  return isValidCalendarDate ? parsedDate : null;
}

function getISOWeekStart(referenceDate) {
  // Anchor on the calendar day only (local y/m/d), then do all week-boundary math in UTC
  // so DST/timezone offsets can't shift which calendar day something lands on.
  const dayStart = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()));
  const isoDayOfWeek = dayStart.getUTCDay() === 0 ? 7 : dayStart.getUTCDay(); // Mon=1 .. Sun=7
  dayStart.setUTCDate(dayStart.getUTCDate() - (isoDayOfWeek - 1));
  return dayStart;
}

export function getWeeklyGuidelineStatus(history = [], referenceDate = new Date()) {
  const safeHistory = Array.isArray(history) ? history : [];
  const weekStart = getISOWeekStart(referenceDate);

  if (Number.isNaN(weekStart.getTime())) {
    return {
      weekStart: null,
      weightedMinutes: 0,
      strengthDayCount: 0,
      minutesRuleMet: false,
      strengthDaysRuleMet: false,
      isFullScore: false
    };
  }

  const weekEndExclusive = new Date(weekStart.getTime() + 7 * MS_PER_DAY);

  let weightedMinutes = 0;
  const strengthDays = new Set();

  for (const entry of safeHistory) {
    if (!entry || entry.completed === false) continue;

    const entryDate = parseISODate(entry.date);
    if (!entryDate) continue;
    if (entryDate.getTime() < weekStart.getTime() || entryDate.getTime() >= weekEndExclusive.getTime()) continue;

    const duration = Number(entry.duration);
    const weight = INTENSITY_WEIGHTS[entry.intensity];
    if (weight && Number.isFinite(duration) && duration > 0) {
      weightedMinutes += duration * weight;
    }

    if (entry.focus === 'styrke') {
      strengthDays.add(entryDate.toISOString().slice(0, 10));
    }
  }

  const minutesRuleMet = weightedMinutes >= 150;
  const strengthDaysRuleMet = strengthDays.size >= 2;

  return {
    weekStart: weekStart.toISOString().slice(0, 10),
    weightedMinutes,
    strengthDayCount: strengthDays.size,
    minutesRuleMet,
    strengthDaysRuleMet,
    isFullScore: minutesRuleMet && strengthDaysRuleMet
  };
}
