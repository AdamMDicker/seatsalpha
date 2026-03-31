/**
 * Returns the start of today (midnight) in ISO format.
 * Used for all event date filtering to ensure games on the current day
 * are always visible, regardless of what time the user loads the page.
 */
export function getTodayStartISO(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}
