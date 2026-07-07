import type { ApproxDate } from '../types';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatApproxDate(date: ApproxDate): string {
  const prefix = date.approximate ? 'c. ' : '';
  if (date.month && date.day) {
    return `${prefix}${MONTHS[date.month - 1]} ${date.day}, ${date.year}`;
  }
  if (date.month) {
    return `${prefix}${MONTHS[date.month - 1]} ${date.year}`;
  }
  return `${prefix}${date.year}`;
}

/** Numeric sort key: YYYYMMDD with missing parts treated as 0. */
export function approxDateSortKey(date: ApproxDate): number {
  return date.year * 10000 + (date.month ?? 0) * 100 + (date.day ?? 0);
}

export function compareApproxDate(a: ApproxDate, b: ApproxDate): number {
  return approxDateSortKey(a) - approxDateSortKey(b);
}

/** Parse a native <input type="date"> value (YYYY-MM-DD) into an ApproxDate. */
export function dateInputToApprox(value: string): ApproxDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}
