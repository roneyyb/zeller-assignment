import React from 'react';

import UpsertUserScreenBase from '@/src/screens/UpsertUserScreenBase';
import type { UpsertUserDeps } from '@/src/screens/UpsertUserScreenBase';
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from '@/src/database/sqlite/usersRepo';
import { createLocalId } from '@/src/utils/id';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';

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
  const upsertDeps: UpsertUserDeps = {
    mode: 'create',
    onCreate: async ({ name, email, role }) =>
      deps.createUser({ id: deps.createId(), name, email, role }),
    onDone: deps.onCreated,
  };
  return <UpsertUserScreenBase deps={upsertDeps} />;
}

export default function CreateUserScreen({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}) {
  const route =
    useRoute<RouteProp<RootStackParamList, 'CreateUser' | 'EditUser'>>();

  const isEdit = (route as any).name === 'EditUser';
  const userId = isEdit ? (route as RouteProp<RootStackParamList, 'EditUser'>).params.id : null;

  const deps: UpsertUserDeps = isEdit
    ? {
        mode: 'edit',
        getInitial: async () => {
          if (!userId) throw new Error('User not found');
          const u = await getUserById(userId);
          if (!u) throw new Error('User not found');
          return { id: u.id, name: u.name, email: u.email, role: u.role };
        },
        onUpdate: async ({ name, email, role }) => {
          if (!userId) throw new Error('User not found');
          await updateUser({ id: userId, name, email, role });
        },
        onDelete: async () => {
          if (!userId) throw new Error('User not found');
          await deleteUser(userId);
        },
        onDone: () => navigation.goBack(),
      }
    : {
        mode: 'create',
        onCreate: async ({ name, email, role }) =>
          createUser({ id: createLocalId(), name, email, role }),
        onDone: () => navigation.goBack(),
      };

  return (
    <UpsertUserScreenBase deps={deps} />
  );
}
