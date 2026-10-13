export function shanghaiDate(now = new Date()) {
  return new Date(now.getTime() + 8 * 3600000).toISOString().slice(0, 10);
}
export function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function validDate(date: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date)) &&
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date
  );
}
export function weekDates(date = shanghaiDate()) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay() || 7;
  const monday = shiftDate(date, 1 - day);
  return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i));
}
export function weekday(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay() || 7;
}
