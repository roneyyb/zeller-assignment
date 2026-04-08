import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SegmentedControl from '@/src/components/segmented-control/SegmentedControl';
import { createUser } from '@/src/database/sqlite/usersRepo';
import {
  buildFullName,
  createUserFormSchema,
  CreateUserFormValues,
  toApiRole,
  USER_ROLES,
  type UserRoleLabel,
} from '@/src/domain/createUserForm';
import { createLocalId } from '@/src/utils/id';
import { useAppTheme } from '@/src/utils/theme';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { RootStackParamList } from '../navigation/AppNavigator';

export type CreateUserDeps = {
  createId: () => string;
  createUser: (args: {
    id: string;
    name: string;
    email: string | null;
    role: string;
  }) => Promise<void>;
  onCreated: () => void;
};

export function CreateUserScreenBase({ deps }: { deps: CreateUserDeps }) {
  const { colors } = useAppTheme();

  const [saving, setSaving] = useState(false);

  const {
    control,
    watch,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm<CreateUserFormValues>({
    mode: 'onChange',
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { firstName: '', lastName: '', email: '', role: 'Admin' },
  });

  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const role = watch('role') as UserRoleLabel;

  const fullName = useMemo(
    () => buildFullName(firstName ?? '', lastName ?? ''),
    [firstName, lastName],
  );

  const canSave = isValid && !saving;

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await deps.createUser({
        id: deps.createId(),
        name: fullName,
        email: values.email?.trim() ? values.email.trim() : null,
        role: toApiRole(role),
      });
      deps.onCreated();
    } catch {
      // TODO: add a dedicated error banner/toast
    } finally {
      setSaving(false);
    }
  });

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={deps.onCreated}
            hitSlop={12}
            style={styles.closeButton}
          >
            <Text style={[styles.closeX, { color: colors.primary }]}>×</Text>
          </Pressable>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>New User</Text>

        <View style={styles.field}>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="First Name"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
              />
            )}
          />
          {errors.firstName?.message ? (
            <Text style={{ color: colors.error, marginTop: 6 }}>
              {errors.firstName.message}
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Last Name"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
              />
            )}
          />
          {errors.lastName?.message ? (
            <Text style={{ color: colors.error, marginTop: 6 }}>
              {errors.lastName.message}
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
              />
            )}
          />
          {errors.email?.message ? (
            <Text style={{ color: colors.error, marginTop: 6 }}>
              {errors.email.message}
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text
            style={[
              styles.label,
              {
                marginBottom: 16,
                marginTop: 20,
                fontSize: 20,
              },
            ]}
          >
            User Role
          </Text>
          <Controller
            control={control}
            name="role"
            render={({ field: { value, onChange } }) => (
              <SegmentedControl
                options={[...USER_ROLES]}
                selectedOption={value}
                onOptionPress={(opt) => onChange(opt as UserRoleLabel)}
                backgroundColor={colors.surface}
                showIndicator
                indicatorColor={colors.surfaceElevated}
                indicatorBorderColor={colors.primary}
                indicatorBorderWidth={2}
                indicatorBorderRadius={100}
                activeTextColor={colors.primary}
                inactiveTextColor={colors.textSecondary}
                height={50}
                borderRadius={100}
                optionStyle={{ paddingHorizontal: '10%' }}
                internalPadding={12}
              />
            )}
          />
        </View>

        <Pressable
          testID="create-user-submit"
          accessibilityRole="button"
          accessibilityLabel="Create user"
          disabled={!canSave}
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: canSave ? colors.primary : colors.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {saving ? 'Creating…' : 'Create User'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function CreateUserScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) {
  return (
    <CreateUserScreenBase
      deps={{
        createId: createLocalId,
        createUser: async (args) => createUser(args),
        onCreated: () => navigation.goBack(),
      }}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  topRow: {
    height: 44,
    justifyContent: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  closeX: {
    fontSize: 34,
    lineHeight: 34,
    fontWeight: '400',
  },
  title: { fontSize: 28, fontWeight: '700', marginTop: 8 },
  field: { marginTop: 22 },
  label: { fontSize: 14, marginBottom: 8 },
  input: {
    height: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontSize: 18,
    paddingVertical: 6,
  },
  button: {
    marginTop: 'auto',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
