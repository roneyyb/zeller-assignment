import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppTheme } from '@/src/utils/theme';

import { useUsers } from './useUsers';

type UsersListProps = {
  role?: string;
  search?: string;
  initialSync?: boolean;
  /** Show role label on the right (useful for All tab). */
  showRole?: boolean;
};

type Row = {
  id: string;
  name: string | null;
  role: string | null;
};

type Section = { title: string; data: Row[] };

function initialLetter(name: string | null) {
  const n = (name ?? '').trim();
  return n ? n[0]!.toUpperCase() : '#';
}

function displayRole(role: string | null) {
  const r = (role ?? '').trim().toUpperCase();
  if (r === 'ADMIN') return 'Admin';
  if (r === 'MANAGER') return 'Manager';
  return role ?? '';
}

export default function UsersList({
  role = '',
  search = '',
  initialSync = true,
  showRole = false,
}: UsersListProps) {
  const { colors } = useAppTheme();
  const { rows, loading, refreshing, error, refresh } = useUsers({
    role: role || null,
    search,
  });

  useEffect(() => {
    if (!initialSync) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSync]);

  const sections = useMemo<Section[]>(() => {
    const map = new Map<string, Row[]>();
    for (const r of rows) {
      const key = initialLetter(r.name);
      const arr = map.get(key) ?? [];
      arr.push({ id: r.id, name: r.name, role: r.role });
      map.set(key, arr);
    }
    const sortedKeys = Array.from(map.keys()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );
    return sortedKeys.map((k) => ({ title: k, data: map.get(k)! }));
  }, [rows]);

  if (loading && rows.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
      ListHeaderComponent={
        error ? (
          <Text
            style={{ color: colors.error, marginHorizontal: 20, marginTop: 8 }}
          >
            {error}
          </Text>
        ) : null
      }
      ListEmptyComponent={
        <Text
          style={{
            color: colors.textMuted,
            marginHorizontal: 20,
            marginTop: 16,
          }}
        >
          No users found.
        </Text>
      }
      renderSectionHeader={({ section }) => (
        <Text
          style={[
            styles.sectionHeader,
            { color: colors.textMuted, fontWeight: '800', marginLeft: 22 },
          ]}
        >
          {section.title}
        </Text>
      )}
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
            marginLeft: 76,
          }}
        />
      )}
      renderItem={({ item }) => (
        <View
          style={[
            styles.row,
            { borderBottomWidth: 1, borderColor: colors.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: '#E8F2FB' }]}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>
              {initialLetter(item.name)}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.name ?? 'Unnamed'}
          </Text>
          {showRole ? (
            <Text style={[styles.role, { color: colors.textMuted }]}>
              {displayRole(item.role)}
            </Text>
          ) : null}
        </View>
      )}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 18,
    marginBottom: 6,
    marginHorizontal: 20,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    height: 64,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  role: {
    fontSize: 14,
    marginLeft: 12,
  },
});
