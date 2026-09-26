import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBirthdays } from '@/context/BirthdayContext';
import { dateLabel } from '@/utils/birthday';
import { useColors } from '@/hooks/useColors';

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { birthdays } = useBirthdays();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    return birthdays.filter((item) => !value || [item.name, item.nickname, item.relationship, item.phone, item.email].some((field) => field?.toLowerCase().includes(value)));
  }, [birthdays, query]);

  return <View style={[styles.container, { backgroundColor: colors.background }]}>
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 18, paddingBottom: 110, flexGrow: 1 }}
      ListHeaderComponent={<><Text style={[styles.eyebrow, { color: colors.primary }]}>FIND A PERSON</Text><Text style={[styles.title, { color: colors.foreground }]}>Search</Text><View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather name="search" size={18} color={colors.mutedForeground} /><TextInput testID="birthday-search" value={query} onChangeText={setQuery} placeholder="Search birthdays..." placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} returnKeyType="search" /></View></>}
      ListEmptyComponent={<View style={styles.empty}><Feather name="search" size={30} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>{query ? 'No birthdays found' : 'No birthdays yet'}</Text><Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{query ? 'Try a different name or detail.' : 'Add a birthday and it will be easy to find here.'}</Text></View>}
      renderItem={({ item }) => <Pressable onPress={() => router.push(`/birthday/${item.id}`)} style={({ pressed }) => [styles.result, { borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 }]}><View style={[styles.avatar, { backgroundColor: colors.accent }]}><Text style={[styles.avatarText, { color: colors.accentForeground }]}>{item.name.slice(0, 1).toUpperCase()}</Text></View><View style={styles.resultBody}><Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.meta, { color: colors.mutedForeground }]}>{dateLabel(item)}{item.relationship ? ` · ${item.relationship}` : ''}</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></Pressable>}
    />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.5, marginBottom: 5 },
  title: { fontSize: 30, fontFamily: 'Inter_700Bold', marginBottom: 17 },
  searchBox: { borderWidth: 1, borderRadius: 15, height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, marginBottom: 19 },
  input: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  result: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 13 },
  avatar: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  resultBody: { flex: 1 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  meta: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 35 },
  emptyTitle: { fontSize: 19, fontFamily: 'Inter_700Bold', marginTop: 13 },
  emptyText: { textAlign: 'center', lineHeight: 21, fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 5 },
});