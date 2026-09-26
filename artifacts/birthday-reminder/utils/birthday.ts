import type { Birthday } from '@/types/birthday';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function parseBirthdayDate(value: string): { month: number; day: number; year?: number } {
  const [year, month, day] = value.split('-').map(Number);
  return {
    year: Number.isFinite(year) && year > 0 ? year : undefined,
    month: month || 1,
    day: day || 1,
  };
}

export function birthdayInYear(birthday: Birthday, year: number): Date {
  const { month, day } = parseBirthdayDate(birthday.dateOfBirth);
  return new Date(year, month - 1, month === 2 && day === 29 ? 1 : day);
}

export function ageOnBirthday(birthday: Birthday, year: number): number | undefined {
  if (!birthday.birthYearKnown) return undefined;
  const { year: birthYear } = parseBirthdayDate(birthday.dateOfBirth);
  return birthYear ? year - birthYear : undefined;
}

export function dateLabel(birthday: Birthday, includeYear = false): string {
  const { month, day, year } = parseBirthdayDate(birthday.dateOfBirth);
  const label = `${day} ${MONTHS[month - 1]}`;
  return includeYear && year ? `${label} ${year}` : label;
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function countdownLabel(target: Date, now = new Date()): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diff = Math.round((targetDay.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return `in ${diff} days`;
}

export function nextBirthdayDate(birthday: Birthday, now = new Date()): Date {
  const currentYearDate = birthdayInYear(birthday, now.getFullYear());
  if (currentYearDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return currentYearDate;
  }
  return birthdayInYear(birthday, now.getFullYear() + 1);
}

export function daysUntilBirthday(birthday: Birthday, now = new Date()): number {
  const target = nextBirthdayDate(birthday, now);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function makeMonthCells(year: number, month: number, weekStartsOn: string): Array<number | null> {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const start = first.getDay();
  const offset = weekStartsOn === 'monday' ? (start + 6) % 7 : weekStartsOn === 'saturday' ? (start + 1) % 7 : start;
  return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)];
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export function toCsv(birthdays: Birthday[]): string {
  const headers = ['name', 'date_of_birth', 'phone', 'email', 'relationship', 'notes', 'reminder_days_before'];
  const rows = birthdays.map((item) => [
    item.name, item.dateOfBirth, item.phone ?? '', item.email ?? '',
    item.relationship ?? '', item.notes ?? '', String(item.reminderDaysBefore),
  ]);
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n');
}