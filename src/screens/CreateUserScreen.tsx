import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SegmentedControl from '@/src/components/segmented-control/SegmentedControl';
import FormTextField from '@/src/components/form/FormTextField';
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
import { MaterialIcons } from '@expo/vector-icons';
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

function capitalizeFirstLetter(value: string) {
  if (!value) return value;
  const trimmedStart = value.replace(/^\s+/, '');
  if (!trimmedStart) return value;
  const firstCharIndex = value.length - trimmedStart.length;
  const first = value[firstCharIndex] ?? '';
  const upper = first.toUpperCase();
  if (first === upper) return value;
  return value.slice(0, firstCharIndex) + upper + value.slice(firstCharIndex + 1);
}

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
            <MaterialIcons name="close" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>New User</Text>

        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormTextField
              value={value}
              onChangeText={(t) => onChange(capitalizeFirstLetter(t))}
              onBlur={onBlur}
              placeholder="First Name"
              errorMessage={errors.firstName?.message}
              inputProps={{ autoCapitalize: 'words' }}
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormTextField
              value={value}
              onChangeText={(t) => onChange(capitalizeFirstLetter(t))}
              onBlur={onBlur}
              placeholder="Last Name"
              errorMessage={errors.lastName?.message}
              inputProps={{ autoCapitalize: 'words' }}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormTextField
              value={value}
              onChangeText={(t) => onChange(t.trimStart())}
              onBlur={onBlur}
              placeholder="Email"
              errorMessage={errors.email?.message}
              inputProps={{
                autoCapitalize: 'none',
                keyboardType: 'email-address',
              }}
            />
          )}
        />

        <View style={{ marginTop: 22 }}>
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
  label: { fontSize: 14, marginBottom: 8 },
  button: {
    marginTop: 'auto',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
