import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBirthdays } from '@/context/BirthdayContext';
import { ageOnBirthday, countdownLabel, dateLabel, nextBirthdayDate } from '@/utils/birthday';
import { useColors } from '@/hooks/useColors';

export default function NextScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { birthdays, settings } = useBirthdays();
  const upcoming = useMemo(() => birthdays
    .map((birthday) => ({ birthday, date: nextBirthdayDate(birthday) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()), [birthdays]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={upcoming}
        keyExtractor={({ birthday }) => birthday.id}
        contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 18, paddingBottom: 110, flexGrow: 1 }}
        ListHeaderComponent={<View style={styles.header}><Text style={[styles.eyebrow, { color: colors.primary }]}>THE YEAR AHEAD</Text><Text style={[styles.title, { color: colors.foreground }]}>Next birthdays</Text><Text style={[styles.subtitle, { color: colors.mutedForeground }]}>A simple list of the people coming up.</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}><Feather name="calendar" size={25} color={colors.accentForeground} /></View><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No upcoming birthdays</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Your next thoughtful moment will show up here.</Text><Pressable onPress={() => router.push('/add')} style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Feather name="plus" size={18} color={colors.primaryForeground} /><Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>Add birthday</Text></Pressable></View>}
        renderItem={({ item }) => {
          const age = settings.showAge ? ageOnBirthday(item.birthday, item.date.getFullYear()) : undefined;
          return <Pressable onPress={() => router.push(`/birthday/${item.birthday.id}`)} style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}>
            <View style={[styles.dateBlock, { backgroundColor: colors.secondary }]}><Text style={[styles.dateMonth, { color: colors.secondaryForeground }]}>{item.date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</Text><Text style={[styles.dateDay, { color: colors.secondaryForeground }]}>{item.date.getDate()}</Text></View>
            <View style={styles.cardBody}><Text style={[styles.name, { color: colors.foreground }]}>{item.birthday.name}</Text><Text style={[styles.date, { color: colors.mutedForeground }]}>{dateLabel(item.birthday)}{age !== undefined ? ` · Turning ${age}` : ''}</Text><View style={styles.countdown}><View style={[styles.dot, { backgroundColor: colors.primary }]} /><Text style={[styles.countdownText, { color: colors.primary }]}>{countdownLabel(item.date)}</Text></View></View>
            <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
          </Pressable>;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 24 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.5, marginBottom: 5 },
  title: { fontSize: 30, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 5 },
  card: { borderWidth: 1, borderRadius: 19, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  dateBlock: { width: 55, height: 60, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  dateMonth: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  dateDay: { fontSize: 24, lineHeight: 27, fontFamily: 'Inter_700Bold' },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  date: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  countdown: { flexDirection: 'row', alignItems: 'center', marginTop: 7, gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  countdownText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  empty: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: 35 },
  emptyIcon: { width: 62, height: 62, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  emptyText: { textAlign: 'center', fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 7, lineHeight: 21 },
  primaryButton: { marginTop: 20, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});