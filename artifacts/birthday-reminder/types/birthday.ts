export type ReminderDays = 0 | 1 | 2 | 3 | 7;

export type Birthday = {
  id: string;
  name: string;
  nickname?: string;
  dateOfBirth: string;
  birthYearKnown: boolean;
  phone?: string;
  email?: string;
  relationship?: string;
  notes?: string;
  reminderEnabled: boolean;
  reminderDaysBefore: ReminderDays;
  reminderTime: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type AppSettings = {
  theme: 'system' | 'light' | 'dark';
  weekStartsOn: 'sunday' | 'monday' | 'saturday';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showAge: boolean;
  showPastBirthdays: boolean;
  leapDayBehavior: 'feb28' | 'mar1';
};