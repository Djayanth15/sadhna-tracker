export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getCurrentDateInTimezone(timezone?: string): string {
  const tz = timezone || getUserTimezone();
  const date = new Date();

  // Format: YYYY-MM-DD in user's timezone
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatDateTimeForAPI(
  dateStr: string,
  timeStr: string,
  timezone?: string
): string {
  const tz = timezone || getUserTimezone();

  // Create a date object in the user's timezone
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  const date = new Date(dateTimeStr);

  // Return ISO string which will be stored in DB
  return date.toISOString();
}

export function getDateOnlyInTimezone(
  isoString: string,
  timezone?: string
): string {
  const tz = timezone || getUserTimezone();
  const date = new Date(isoString);

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
