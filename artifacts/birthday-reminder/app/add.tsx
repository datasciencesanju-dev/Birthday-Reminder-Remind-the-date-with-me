import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBirthdays } from '@/context/BirthdayContext';
import type { ReminderDays } from '@/types/birthday';
import { dateLabel, parseBirthdayDate } from '@/utils/birthday';
import { useColors } from '@/hooks/useColors';

const reminderOptions: Array<{ label: string; value: ReminderDays }> = [
  { label: 'On the day', value: 0 }, { label: '1 day before', value: 1 }, { label: '2 days before', value: 2 }, { label: '3 days before', value: 3 }, { label: '7 days before', value: 7 },
];

export default function AddBirthdayScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { birthdays, addBirthday, updateBirthday } = useBirthdays();
  const existing = useMemo(() => birthdays.find((item) => item.id === params.id), [birthdays, params.id]);
  const [name, setName] = useState(existing?.name ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(existing?.dateOfBirth ?? '');
  const [relationship, setRelationship] = useState(existing?.relationship ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [reminderEnabled, setReminderEnabled] = useState(existing?.reminderEnabled ?? true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState<ReminderDays>(existing?.reminderDaysBefore ?? 0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Check the details', 'Enter a name and date in YYYY-MM-DD format.');
      return;
    }
    const parsed = parseBirthdayDate(dateOfBirth);
    if (parsed.month < 1 || parsed.month > 12 || parsed.day < 1 || parsed.day > 31) {
      Alert.alert('Invalid date', 'Please enter a real birthday date.');
      return;
    }
    setSaving(true);
    const input = { name: name.trim(), dateOfBirth, birthYearKnown: parsed.year !== undefined, relationship: relationship.trim(), phone: phone.trim(), email: email.trim(), notes: notes.trim(), reminderEnabled, reminderDaysBefore, reminderTime: '09:00' as const };
    if (existing) await updateBirthday(existing.id, input);
    else await addBirthday(input);
    setSaving(false);
    router.back();
  };

  return <View style={[styles.container, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}><Pressable accessibilityLabel="Close" onPress={() => router.back()} style={styles.close}><Feather name="x" size={23} color={colors.foreground} /></Pressable><Text style={[styles.heading, { color: colors.foreground }]}>{existing ? 'Edit birthday' : 'Add birthday'}</Text><Pressable testID="save-birthday-button" onPress={save} disabled={saving} style={({ pressed }) => [styles.saveIcon, { backgroundColor: colors.primary, opacity: pressed || saving ? 0.65 : 1 }]}><Feather name="check" size={20} color={colors.primaryForeground} /></Pressable></View>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>{existing ? 'Keep their details current.' : 'Add someone important to your calendar.'}</Text>
      <Field label="Full name *" value={name} onChangeText={setName} placeholder="e.g. Rahul Sharma" colors={colors} />
      <Field label="Date of birth *" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" colors={colors} />
      <View style={styles.twoCol}><View style={styles.col}><Field label="Relationship" value={relationship} onChangeText={setRelationship} placeholder="Friend" colors={colors} /></View><View style={styles.col}><Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+91..." keyboardType="phone-pad" colors={colors} /></View></View>
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" keyboardType="email-address" colors={colors} />
      <Field label="Notes" value={notes} onChangeText={setNotes} placeholder="Gift ideas, how you know them..." multiline colors={colors} />
      <View style={[styles.reminderCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.reminderHeader}><View><Text style={[styles.reminderTitle, { color: colors.foreground }]}>Birthday reminder</Text><Text style={[styles.reminderSubtitle, { color: colors.mutedForeground }]}>A gentle nudge at 9:00 AM</Text></View><Switch testID="reminder-toggle" value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor={colors.card} /></View>{reminderEnabled && <View style={styles.options}>{reminderOptions.map((option) => <Pressable key={option.value} onPress={() => setReminderDaysBefore(option.value)} style={[styles.option, { backgroundColor: reminderDaysBefore === option.value ? colors.secondary : colors.background, borderColor: reminderDaysBefore === option.value ? colors.primary : colors.border }]}><Text style={[styles.optionText, { color: reminderDaysBefore === option.value ? colors.secondaryForeground : colors.mutedForeground }]}>{option.label}</Text></Pressable>)}</View>}</View>
      <Pressable testID="save-birthday-full-button" onPress={save} disabled={saving} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary, opacity: pressed || saving ? 0.7 : 1 }]}><Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>{saving ? 'Saving…' : existing ? 'Save changes' : 'Save birthday'}</Text></Pressable>
    </ScrollView>
  </View>;
}

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numbers-and-punctuation'; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} multiline={multiline} keyboardType={keyboardType} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }, multiline && styles.multiline]} /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  saveIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  intro: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 2, marginBottom: 24 },
  field: { marginBottom: 15 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: 7 },
  input: { borderWidth: 1, borderRadius: 13, minHeight: 48, paddingHorizontal: 14, fontSize: 14, fontFamily: 'Inter_400Regular' },
  multiline: { minHeight: 88, paddingTop: 13, textAlignVertical: 'top' },
  twoCol: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  reminderCard: { borderWidth: 1, borderRadius: 17, padding: 15, marginTop: 5 },
  reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reminderTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  reminderSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 15 },
  option: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  optionText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  saveButton: { borderRadius: 14, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  saveButtonText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
});