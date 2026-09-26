import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBirthdays } from '@/context/BirthdayContext';
import type { AppSettings } from '@/types/birthday';
import { useColors } from '@/hooks/useColors';

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, birthdays, importBirthdays, exportData } = useBirthdays();
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const update = (patch: Partial<AppSettings>) => void updateSettings(patch);
  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importText) as Array<Record<string, unknown>>;
      const items = (Array.isArray(parsed) ? parsed : [parsed]).filter((item) => typeof item.name === 'string' && typeof item.dateOfBirth === 'string') as Array<{ name: string; dateOfBirth: string; phone?: string; email?: string; relationship?: string; notes?: string }>;
      const count = await importBirthdays(items);
      setShowImport(false);
      setImportText('');
      Alert.alert('Import complete', `${count} new ${count === 1 ? 'birthday was' : 'birthdays were'} added.`);
    } catch {
      Alert.alert('Could not import', 'Paste a JSON array exported from Birthday Reminder.');
    }
  };
  const handleExport = async () => {
    await Share.share({ title: 'Birthday Reminder backup', message: exportData() });
  };

  return <View style={[styles.container, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 18, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>MAKE IT YOURS</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Small choices that make reminders feel right.</Text>
      <Section title="Reminders" colors={colors}>
        <SettingRow icon="bell" title="Birthday notifications" description="Keep upcoming reminders enabled" colors={colors} trailing={<Switch value={settings.notificationsEnabled} onValueChange={(value) => update({ notificationsEnabled: value })} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor={colors.card} />} />
        <SettingRow icon="volume-2" title="Sound" description="Play a sound with reminders" colors={colors} trailing={<Switch value={settings.soundEnabled} onValueChange={(value) => update({ soundEnabled: value })} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor={colors.card} />} />
        <SettingRow icon="radio" title="Vibration" description="Vibrate when a reminder arrives" colors={colors} trailing={<Switch value={settings.vibrationEnabled} onValueChange={(value) => update({ vibrationEnabled: value })} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor={colors.card} />} />
      </Section>
      <Section title="Calendar" colors={colors}>
        <SettingRow icon="calendar" title="Week starts on" description={settings.weekStartsOn[0].toUpperCase() + settings.weekStartsOn.slice(1)} colors={colors} onPress={() => Alert.alert('Week starts on', 'Choose a first day', [{ text: 'Sunday', onPress: () => update({ weekStartsOn: 'sunday' }) }, { text: 'Monday', onPress: () => update({ weekStartsOn: 'monday' }) }, { text: 'Saturday', onPress: () => update({ weekStartsOn: 'saturday' }) }, { text: 'Cancel', style: 'cancel' }])} trailing={<Feather name="chevron-right" size={18} color={colors.mutedForeground} />} />
        <SettingRow icon="hash" title="Show ages" description="Show the age they are turning" colors={colors} trailing={<Switch value={settings.showAge} onValueChange={(value) => update({ showAge: value })} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor={colors.card} />} />
        <SettingRow icon="moon" title="Appearance" description={settings.theme === 'system' ? 'System default' : settings.theme === 'light' ? 'Light' : 'Dark'} colors={colors} onPress={() => Alert.alert('Appearance', 'Choose a theme', [{ text: 'System default', onPress: () => update({ theme: 'system' }) }, { text: 'Light', onPress: () => update({ theme: 'light' }) }, { text: 'Dark', onPress: () => update({ theme: 'dark' }) }, { text: 'Cancel', style: 'cancel' }])} trailing={<Feather name="chevron-right" size={18} color={colors.mutedForeground} />} />
      </Section>
      <Section title="Your data" colors={colors}>
        <SettingRow icon="download" title="Export backup" description={`${birthdays.length} birthday records as JSON`} colors={colors} onPress={handleExport} trailing={<Feather name="share-2" size={18} color={colors.primary} />} />
        <SettingRow icon="upload" title="Import backup" description="Restore from a JSON export" colors={colors} onPress={() => setShowImport(true)} trailing={<Feather name="chevron-right" size={18} color={colors.mutedForeground} />} />
      </Section>
      <Section title="About" colors={colors}>
        <SettingRow icon="shield" title="Privacy first" description="Your birthdays stay on this device." colors={colors} onPress={() => Alert.alert('Privacy', 'Birthday Reminder stores birthday data locally on your device. Export and sharing only happen when you choose them. No data is sold or sent to a server by default.')} trailing={<Feather name="info" size={18} color={colors.mutedForeground} />} />
        <SettingRow icon="heart" title="Birthday Reminder" description="remind the date with me · Version 1.0.0" colors={colors} onPress={() => router.push('/')} trailing={<Feather name="gift" size={18} color={colors.primary} />} />
      </Section>
    </ScrollView>
    <Modal visible={showImport} transparent animationType="slide" onRequestClose={() => setShowImport(false)}>
      <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(12,18,31,0.52)' }]}><View style={[styles.modal, { backgroundColor: colors.card }]}><View style={styles.modalHeader}><Text style={[styles.modalTitle, { color: colors.foreground }]}>Import JSON backup</Text><Pressable onPress={() => setShowImport(false)}><Feather name="x" size={22} color={colors.foreground} /></Pressable></View><Text style={[styles.modalHelp, { color: colors.mutedForeground }]}>Paste a JSON export here. Existing matching names and dates are skipped.</Text><TextInput multiline value={importText} onChangeText={setImportText} placeholder="[{&quot;name&quot;:&quot;Asha&quot;,&quot;dateOfBirth&quot;:&quot;1998-07-20&quot;}]" placeholderTextColor={colors.mutedForeground} style={[styles.importInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} /><Pressable onPress={handleImport} style={[styles.importButton, { backgroundColor: colors.primary }]}><Text style={[styles.importButtonText, { color: colors.primaryForeground }]}>Import birthdays</Text></Pressable></View></View>
    </Modal>
  </View>;
}

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title.toUpperCase()}</Text><View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>{children}</View></View>;
}

function SettingRow({ icon, title, description, trailing, onPress, colors }: { icon: React.ComponentProps<typeof Feather>['name']; title: string; description: string; trailing: React.ReactNode; onPress?: () => void; colors: ReturnType<typeof useColors> }) {
  return <Pressable disabled={!onPress} onPress={onPress} style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><View style={[styles.rowIcon, { backgroundColor: colors.secondary }]}><Feather name={icon} size={16} color={colors.secondaryForeground} /></View><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.rowDescription, { color: colors.mutedForeground }]}>{description}</Text></View>{trailing}</Pressable>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.5, marginBottom: 5 },
  title: { fontSize: 30, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 5, marginBottom: 23 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.4, marginBottom: 9, paddingLeft: 3 },
  sectionCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14 },
  row: { minHeight: 65, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, gap: 11 },
  rowIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  rowDescription: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 3 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 35 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 19, fontFamily: 'Inter_700Bold' },
  modalHelp: { fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 14, fontFamily: 'Inter_400Regular' },
  importInput: { minHeight: 150, borderWidth: 1, borderRadius: 13, padding: 13, fontSize: 12, fontFamily: 'Inter_400Regular', textAlignVertical: 'top' },
  importButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 14, marginTop: 14 },
  importButtonText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
});