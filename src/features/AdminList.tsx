import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { useAppTheme } from '@/src/utils/theme';
import { useUsers } from './useUsers';

type AdminListProps = {
  role?: string;
  search?: string;
  /** When true, syncs from the network on mount. Disable in tests. @default true */
  initialSync?: boolean;
};

const AdminList = ({
  role = 'Admin',
  search = '',
  initialSync = true,
}: AdminListProps) => {
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

  if (loading && rows.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      ListEmptyComponent={
        <Text style={{ color: colors.textMuted }}>
          No users match this filter. Pull to refresh to sync from the API.
        </Text>
      }
      ListHeaderComponent={
        error ? (
          <Text style={{ color: colors.error, marginBottom: 8 }}>{error}</Text>
        ) : null
      }
      renderItem={({ item }) => (
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: '600' }}>
            {item.name ?? 'Unnamed'}
          </Text>
          {item.email ? (
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
              {item.email}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
};

export default AdminList;
