import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBirthdays } from '@/context/BirthdayContext';
import { ageOnBirthday, countdownLabel, dateLabel, nextBirthdayDate } from '@/utils/birthday';
import { useColors } from '@/hooks/useColors';

export default function BirthdayDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { birthdays, deleteBirthday } = useBirthdays();
  const birthday = birthdays.find((item) => item.id === id);
  if (!birthday) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={[styles.notFound, { color: colors.foreground }]}>Birthday not found</Text><Pressable onPress={() => router.back()}><Text style={{ color: colors.primary }}>Go back</Text></Pressable></View>;
  const next = nextBirthdayDate(birthday);
  const age = ageOnBirthday(birthday, next.getFullYear());
  const confirmDelete = () => Alert.alert('Delete birthday?', `Are you sure you want to delete ${birthday.name}'s birthday?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await deleteBirthday(birthday.id); router.back(); } }]);
  return <View style={[styles.container, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 18, paddingBottom: 40 }}>
      <View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.icon}><Feather name="arrow-left" size={22} color={colors.foreground} /></Pressable><View style={styles.topActions}><Pressable onPress={() => router.push(`/add?id=${birthday.id}`)} style={styles.icon}><Feather name="edit-2" size={19} color={colors.foreground} /></Pressable><Pressable onPress={confirmDelete} style={styles.icon}><Feather name="trash-2" size={19} color={colors.destructive} /></Pressable></View></View>
      <View style={styles.profile}><View style={[styles.avatar, { backgroundColor: colors.accent }]}><Text style={[styles.avatarText, { color: colors.accentForeground }]}>{birthday.name.slice(0, 1).toUpperCase()}</Text></View><Text style={[styles.name, { color: colors.foreground }]}>{birthday.name}</Text>{birthday.relationship && <Text style={[styles.relationship, { color: colors.mutedForeground }]}>{birthday.relationship}</Text>}</View>
      <View style={[styles.countdownCard, { backgroundColor: colors.primary }]}><Text style={styles.countdownLabel}>{countdownLabel(next).toUpperCase()}</Text><Text style={styles.countdownDate}>{next.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text><Text style={styles.countdownMeta}>{age !== undefined ? `Turning ${age}` : 'Birthday reminder'}</Text></View>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}><InfoRow icon="calendar" label="Birthday" value={dateLabel(birthday, true)} colors={colors} />{birthday.phone && <InfoRow icon="phone" label="Phone" value={birthday.phone} colors={colors} />}{birthday.email && <InfoRow icon="mail" label="Email" value={birthday.email} colors={colors} />}{birthday.notes && <InfoRow icon="file-text" label="Notes" value={birthday.notes} colors={colors} />}</View>
      <Pressable onPress={() => Share.share({ message: `${birthday.name}'s birthday is ${dateLabel(birthday)}.` })} style={[styles.shareButton, { borderColor: colors.border }]}><Feather name="share-2" size={18} color={colors.primary} /><Text style={[styles.shareText, { color: colors.primary }]}>Share birthday</Text></Pressable>
    </ScrollView>
  </View>;
}

function InfoRow({ icon, label, value, colors }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.infoRow}><View style={[styles.infoIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={16} color={colors.secondaryForeground} /></View><View style={styles.infoCopy}><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text></View></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFound: { fontSize: 19, fontFamily: 'Inter_700Bold' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 52 },
  topActions: { flexDirection: 'row', gap: 8 },
  icon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  profile: { alignItems: 'center', marginTop: 18, marginBottom: 24 },
  avatar: { width: 88, height: 88, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  avatarText: { fontSize: 33, fontFamily: 'Inter_700Bold' },
  name: { fontSize: 27, fontFamily: 'Inter_700Bold' },
  relationship: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 4 },
  countdownCard: { borderRadius: 21, padding: 19, marginBottom: 14 },
  countdownLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.3 },
  countdownDate: { color: '#ffffff', fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 7 },
  countdownMeta: { color: 'rgba(255,255,255,0.82)', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4 },
  infoCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0 },
  infoIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  infoCopy: { flex: 1 },
  infoLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  infoValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  shareButton: { minHeight: 50, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 14 },
  shareText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});