import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import type { AppSettings, Birthday } from '@/types/birthday';

const BIRTHDAYS_KEY = '@birthday-reminder/birthdays';
const SETTINGS_KEY = '@birthday-reminder/settings';
const PERMISSION_ASKED_KEY = '@birthday-reminder/notification-permission-asked';

const defaultSettings: AppSettings = {
  theme: 'system',
  weekStartsOn: 'sunday',
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  showAge: true,
  showPastBirthdays: false,
  leapDayBehavior: 'feb28',
};

type BirthdayContextValue = {
  birthdays: Birthday[];
  settings: AppSettings;
  loading: boolean;
  addBirthday: (input: Omit<Birthday, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Birthday>;
  updateBirthday: (id: string, input: Partial<Birthday>) => Promise<void>;
  deleteBirthday: (id: string) => Promise<void>;
  restoreBirthday: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  importBirthdays: (items: Array<Partial<Birthday> & Pick<Birthday, 'name' | 'dateOfBirth'>>) => Promise<number>;
  exportData: () => string;
};

const BirthdayContext = createContext<BirthdayContextValue | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function scheduleReminder(birthday: Birthday, settings: AppSettings) {
  if (Platform.OS === 'web' || !settings.notificationsEnabled || !birthday.reminderEnabled) return;
  try {
    const existing = await AsyncStorage.getItem(PERMISSION_ASKED_KEY);
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && !existing) {
      await Notifications.requestPermissionsAsync();
      await AsyncStorage.setItem(PERMISSION_ASKED_KEY, 'true');
    }
    const refreshed = await Notifications.getPermissionsAsync();
    if (!refreshed.granted) return;
    const today = new Date();
    const parsed = birthday.dateOfBirth.split('-').map(Number);
    const reminderDate = new Date(today.getFullYear(), parsed[1] - 1, parsed[2]);
    if (reminderDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) reminderDate.setFullYear(today.getFullYear() + 1);
    reminderDate.setDate(reminderDate.getDate() - birthday.reminderDaysBefore);
    const [hours, minutes] = birthday.reminderTime.split(':').map(Number);
    reminderDate.setHours(hours || 9, minutes || 0, 0, 0);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: birthday.reminderDaysBefore === 0 ? 'Birthday today' : 'Upcoming birthday',
        body: birthday.reminderDaysBefore === 0 ? `Today is ${birthday.name}'s birthday.` : `${birthday.name}'s birthday is coming up.`,
        data: { birthdayId: birthday.id },
        sound: settings.soundEnabled ? 'default' : undefined,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate },
    });
  } catch {
    // The birthday is still saved locally when device notification restrictions apply.
  }
}

export function BirthdayProvider({ children }: { children: React.ReactNode }) {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(BIRTHDAYS_KEY), AsyncStorage.getItem(SETTINGS_KEY)])
      .then(([savedBirthdays, savedSettings]) => {
        if (savedBirthdays) setBirthdays(JSON.parse(savedBirthdays));
        if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) void AsyncStorage.setItem(BIRTHDAYS_KEY, JSON.stringify(birthdays));
  }, [birthdays, loading]);

  useEffect(() => {
    if (!loading) void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, loading]);

  const value = useMemo<BirthdayContextValue>(() => ({
    birthdays: birthdays.filter((item) => !item.deletedAt),
    settings,
    loading,
    addBirthday: async (input) => {
      const now = new Date().toISOString();
      const item: Birthday = { ...input, id: makeId(), createdAt: now, updatedAt: now };
      setBirthdays((current) => [...current, item]);
      void scheduleReminder(item, settings);
      return item;
    },
    updateBirthday: async (id, patch) => {
      setBirthdays((current) => current.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...patch, updatedAt: new Date().toISOString() };
        void scheduleReminder(updated, settings);
        return updated;
      }));
    },
    deleteBirthday: async (id) => {
      setBirthdays((current) => current.map((item) => item.id === id
        ? { ...item, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : item));
    },
    restoreBirthday: async (id) => {
      setBirthdays((current) => current.map((item) => item.id === id
        ? { ...item, deletedAt: undefined, updatedAt: new Date().toISOString() }
        : item));
    },
    updateSettings: async (patch) => setSettings((current) => ({ ...current, ...patch })),
    importBirthdays: async (items) => {
      const now = new Date().toISOString();
      const existing = new Set(birthdays.map((item) => `${item.name.toLowerCase()}|${item.dateOfBirth}`));
      const additions = items
        .filter((item) => item.name && item.dateOfBirth)
        .filter((item) => !existing.has(`${item.name.toLowerCase()}|${item.dateOfBirth}`))
        .map((item) => ({
          id: makeId(),
          name: item.name,
          dateOfBirth: item.dateOfBirth,
          birthYearKnown: item.birthYearKnown ?? item.dateOfBirth.split('-')[0] !== '0000',
          phone: item.phone ?? '',
          email: item.email ?? '',
          relationship: item.relationship ?? '',
          notes: item.notes ?? '',
          reminderEnabled: item.reminderEnabled ?? true,
          reminderDaysBefore: item.reminderDaysBefore ?? 0,
          reminderTime: item.reminderTime ?? '09:00',
          createdAt: now,
          updatedAt: now,
        } satisfies Birthday));
      setBirthdays((current) => [...current, ...additions]);
      return additions.length;
    },
    exportData: () => JSON.stringify(birthdays, null, 2),
  }), [birthdays, loading, settings]);

  return <BirthdayContext.Provider value={value}>{children}</BirthdayContext.Provider>;
}

export function useBirthdays() {
  const value = useContext(BirthdayContext);
  if (!value) throw new Error('useBirthdays must be used inside BirthdayProvider');
  return value;
}