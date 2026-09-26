import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useBirthdays } from '@/context/BirthdayContext';
import { ageOnBirthday, birthdayInYear, countdownLabel, makeMonthCells, MONTHS } from '@/utils/birthday';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { birthdays, settings } = useBirthdays();
  const year = new Date().getFullYear();
  const today = new Date();
  const upcoming = birthdays
    .map((birthday) => ({ birthday, date: birthdayInYear(birthday, year) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .filter(({ date }) => date >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .slice(0, 1)[0];

  const birthdayDates = useMemo(() => new Set(birthdays.map((item) => {
    const date = birthdayInYear(item, year);
    return `${date.getMonth()}-${date.getDate()}`;
  })), [birthdays, year]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR PEOPLE</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>{year}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Every date worth remembering.</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable testID="settings-button" accessibilityLabel="Open settings" onPress={() => router.push('/settings')} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, opacity: pressed ? 0.65 : 1 }]}>
              <Feather name="sliders" size={20} color={colors.foreground} />
            </Pressable>
            <Pressable testID="add-birthday-button" accessibilityLabel="Add birthday" onPress={() => router.push('/add')} style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}>
              <Feather name="plus" size={22} color={colors.primaryForeground} />
            </Pressable>
          </View>
        </View>

        {upcoming ? (
          <Pressable onPress={() => router.push(`/birthday/${upcoming.birthday.id}`)} style={({ pressed }) => [styles.heroCard, { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }]}>
            <View style={styles.heroIcon}><Feather name="gift" size={24} color={colors.primary} /></View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroLabel}>NEXT UP</Text>
              <Text style={styles.heroName}>{upcoming.birthday.name}</Text>
              <Text style={styles.heroMeta}>{countdownLabel(upcoming.date)} · {upcoming.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</Text>
            </View>
            <Feather name="chevron-right" size={22} color="rgba(255,255,255,0.76)" />
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push('/add')} style={[styles.emptyHero, { backgroundColor: colors.accent }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}><Feather name="gift" size={22} color={colors.accentForeground} /></View>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroName, { color: colors.accentForeground }]}>Start your birthday list</Text>
              <Text style={[styles.heroMeta, { color: colors.accentForeground }]}>Add someone you never want to forget.</Text>
            </View>
            <Feather name="arrow-up-right" size={20} color={colors.accentForeground} />
          </Pressable>
        )}

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Year at a glance</Text>
          <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{birthdays.length} {birthdays.length === 1 ? 'birthday' : 'birthdays'}</Text>
        </View>

        <View style={styles.monthGrid}>
          {MONTHS.map((monthName, monthIndex) => {
            const cells = makeMonthCells(year, monthIndex, settings.weekStartsOn);
            const weekdayLabels = settings.weekStartsOn === 'monday' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : settings.weekStartsOn === 'saturday' ? ['S', 'S', 'M', 'T', 'W', 'T', 'F'] : WEEKDAYS;
            return (
              <View key={monthName} style={[styles.monthCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.monthName, { color: colors.foreground }]}>{monthName}</Text>
                <View style={styles.weekRow}>{weekdayLabels.map((day, index) => <Text key={`${day}-${index}`} style={[styles.weekLabel, { color: colors.mutedForeground }]}>{day}</Text>)}</View>
                <View style={styles.daysGrid}>
                  {cells.map((day, index) => {
                    const hasBirthday = day ? birthdayDates.has(`${monthIndex}-${day}`) : false;
                    const isToday = day === today.getDate() && monthIndex === today.getMonth();
                    const dayBirthday = hasBirthday ? birthdays.find((item) => {
                      const date = birthdayInYear(item, year);
                      return date.getMonth() === monthIndex && date.getDate() === day;
                    }) : undefined;
                    return (
                      <Pressable key={`${monthName}-${index}`} disabled={!dayBirthday} onPress={() => dayBirthday && router.push(`/birthday/${dayBirthday.id}`)} style={[styles.dayCell, isToday && { backgroundColor: colors.primary }, hasBirthday && !isToday && { backgroundColor: colors.accent }]}>
                        <Text style={[styles.dayText, { color: isToday ? colors.primaryForeground : hasBirthday ? colors.accentForeground : colors.foreground }]}>{day ?? ''}</Text>
                        {hasBirthday && <View style={[styles.dayDot, { backgroundColor: isToday ? colors.primaryForeground : colors.accentForeground }]} />}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 34, lineHeight: 38, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 3 },
  headerActions: { flexDirection: 'row', gap: 10, paddingTop: 3 },
  iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroCard: { borderRadius: 22, padding: 17, flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  emptyHero: { borderRadius: 22, padding: 17, flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  heroIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  emptyIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  heroCopy: { flex: 1 },
  heroLabel: { color: 'rgba(255,255,255,0.72)', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  heroName: { color: '#ffffff', fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 3 },
  heroMeta: { color: 'rgba(255,255,255,0.82)', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
  sectionHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  sectionCount: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  monthCard: { width: '48.6%', borderRadius: 17, borderWidth: 1, padding: 12 },
  monthName: { fontSize: 14, fontFamily: 'Inter_700Bold', marginBottom: 10 },
  weekRow: { flexDirection: 'row', marginBottom: 5 },
  weekLabel: { flex: 1, fontSize: 9, textAlign: 'center', fontFamily: 'Inter_600SemiBold' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 7, position: 'relative' },
  dayText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  dayDot: { width: 3, height: 3, borderRadius: 2, position: 'absolute', bottom: 3 },
});