import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FormTextField from '@/src/components/form/FormTextField';
import SegmentedControl from '@/src/components/segmented-control/SegmentedControl';
import {
  buildFullName,
  createUserFormSchema,
  type CreateUserFormValues,
  toApiRole,
  USER_ROLES,
  type UserRoleLabel,
} from '@/src/domain/createUserForm';
import { useAppTheme } from '@/src/utils/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

export type UpsertMode = 'create' | 'edit';

export type UpsertUserInitial = {
  id?: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

export type UpsertUserDeps = {
  mode: UpsertMode;
  /** For edit mode, fetch current user values. Not used in create mode. */
  getInitial?: () => Promise<UpsertUserInitial>;
  /** Create: should create a new user. */
  onCreate?: (args: { name: string; email: string | null; role: string }) => Promise<void>;
  /** Edit: should update existing user. */
  onUpdate?: (args: { name: string; email: string | null; role: string }) => Promise<void>;
  /** Optional delete handler (edit mode). */
  onDelete?: () => Promise<void>;
  /** Close / done (navigate back). */
  onDone: () => void;
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

function splitName(fullName: string | null): { firstName: string; lastName: string } {
  const n = (fullName ?? '').trim().replace(/\s+/g, ' ');
  if (!n) return { firstName: '', lastName: '' };
  const parts = n.split(' ');
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
}

function normalizeRoleLabel(role: string | null): UserRoleLabel {
  const r = (role ?? '').trim().toUpperCase();
  if (r === 'MANAGER') return 'Manager';
  return 'Admin';
}

export default function UpsertUserScreenBase({ deps }: { deps: UpsertUserDeps }) {
  const { colors } = useAppTheme();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(deps.mode === 'edit');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (deps.mode === 'edit') {
    if (!deps.getInitial) {
      throw new Error('UpsertUserScreenBase: getInitial is required in edit mode');
    }
    if (!deps.onUpdate) {
      throw new Error('UpsertUserScreenBase: onUpdate is required in edit mode');
    }
  } else {
    if (!deps.onCreate) {
      throw new Error('UpsertUserScreenBase: onCreate is required in create mode');
    }
  }

  const getInitial = deps.mode === 'edit' ? deps.getInitial! : undefined;
  const onCreate = deps.mode === 'create' ? deps.onCreate! : undefined;
  const onUpdate = deps.mode === 'edit' ? deps.onUpdate! : undefined;

  const {
    control,
    watch,
    reset,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm<CreateUserFormValues>({
    mode: 'onChange',
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { firstName: '', lastName: '', email: '', role: 'Admin' },
  });

  useEffect(() => {
    if (deps.mode !== 'edit') return;
    let cancelled = false;
    (async () => {
      setLoadingInitial(true);
      setLoadError(null);
      setSubmitError(null);
      try {
        const initial = await getInitial?.();
        if (!initial) throw new Error('User not found');
        const { firstName, lastName } = splitName(initial.name);
        reset({
          firstName,
          lastName,
          email: initial.email ?? '',
          role: normalizeRoleLabel(initial.role),
        });
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load user');
        }
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [deps, getInitial, reset]);

  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const role = watch('role') as UserRoleLabel;

  const fullName = useMemo(
    () => buildFullName(firstName ?? '', lastName ?? ''),
    [firstName, lastName],
  );

  const canSubmit = isValid && !saving && !deleting && !loadingInitial;

  const title = deps.mode === 'edit' ? 'Edit User' : 'New User';
  const submitLabel = deps.mode === 'edit' ? 'Save Changes' : 'Create User';
  const savingLabel = deps.mode === 'edit' ? 'Saving…' : 'Creating…';

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    setSubmitError(null);
    try {
      const payload = {
        name: fullName,
        email: values.email?.trim() ? values.email.trim() : null,
        role: toApiRole(role),
      };
      if (deps.mode === 'edit') {
        await onUpdate?.(payload);
      } else {
        await onCreate?.(payload);
      }
      deps.onDone();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to save user');
    } finally {
      setSaving(false);
    }
  });

  const handleDelete = async () => {
    if (!deps.onDelete) return;
    if (deleting) return;
    setDeleting(true);
    setSubmitError(null);
    try {
      await deps.onDelete();
      deps.onDone();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

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
            onPress={deps.onDone}
            hitSlop={12}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color={colors.primary} />
          </Pressable>

          {deps.mode === 'edit' && deps.onDelete ? (
            <Pressable
              testID="edit-user-delete"
              accessibilityRole="button"
              accessibilityLabel="Delete user"
              onPress={() => void handleDelete()}
              hitSlop={12}
              style={styles.deleteButton}
            >
              <MaterialIcons name="delete-outline" size={24} color={colors.error} />
            </Pressable>
          ) : (
            <View style={{ width: 44, height: 44 }} />
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        {submitError ? (
          <Text style={{ color: colors.error, marginTop: 12 }}>
            {submitError}
          </Text>
        ) : null}

        {loadingInitial ? (
          <View style={{ paddingTop: 24 }}>
            <ActivityIndicator />
          </View>
        ) : loadError ? (
          <Text style={{ color: colors.error, marginTop: 16 }}>{loadError}</Text>
        ) : (
          <>
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
                  value={value ?? ''}
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
                    color: colors.text,
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
          </>
        )}

        <Pressable
          testID={deps.mode === 'edit' ? 'edit-user-submit' : 'create-user-submit'}
          accessibilityRole="button"
          accessibilityLabel={deps.mode === 'edit' ? 'Save user' : 'Create user'}
          disabled={!canSubmit}
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: canSubmit ? colors.primary : colors.border,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
            {saving ? savingLabel : submitLabel}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
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

