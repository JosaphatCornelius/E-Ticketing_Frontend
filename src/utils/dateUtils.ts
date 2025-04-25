// utils/dateUtils.ts
export function formatDateUTCOffset(dateStr: Date, offset = 7, locale = 'id-ID') {
  const utcDate = new Date(dateStr);
  const offsetDate = new Date(utcDate.getTime() + offset * 60 * 60 * 1000);
  return offsetDate.toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
