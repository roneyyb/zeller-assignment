/* eslint-disable import/first */
jest.mock('./useUsers', () => ({
  useUsers: jest.fn(),
}));

import { screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { renderWithProviders } from '@/src/test/renderWithProviders';

import { useUsers } from './useUsers';
import UsersList from './UsersList';

const mockedUseUsers = useUsers as jest.MockedFunction<typeof useUsers>;

describe('UsersList', () => {
  beforeEach(() => {
    mockedUseUsers.mockReset();
  });

  it('shows loading when loading and no rows', () => {
    mockedUseUsers.mockReturnValue({
      rows: [],
      loading: true,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      reloadFromDb: jest.fn(),
    });

    const { UNSAFE_getByType } = renderWithProviders(
      <UsersList initialSync={false} />,
    );

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('shows empty message when no users', () => {
    mockedUseUsers.mockReturnValue({
      rows: [],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      reloadFromDb: jest.fn(),
    });

    renderWithProviders(<UsersList initialSync={false} />);

    expect(screen.getByText('No users found.')).toBeTruthy();
  });

  it('shows sync error in header', () => {
    mockedUseUsers.mockReturnValue({
      rows: [],
      loading: false,
      refreshing: false,
      error: 'Network error',
      refresh: jest.fn(),
      reloadFromDb: jest.fn(),
    });

    renderWithProviders(<UsersList initialSync={false} />);

    expect(screen.getByText('Network error')).toBeTruthy();
  });

  it('renders users grouped by initial letter', async () => {
    mockedUseUsers.mockReturnValue({
      rows: [
        {
          id: '1',
          name: 'Ada',
          email: null,
          role: 'ADMIN',
          updated_at: 1,
        },
        {
          id: '2',
          name: 'Bob',
          email: null,
          role: 'MANAGER',
          updated_at: 2,
        },
      ],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      reloadFromDb: jest.fn(),
    });

    renderWithProviders(<UsersList initialSync={false} showRole />);

    await waitFor(() => {
      expect(screen.getByText('Ada')).toBeTruthy();
      expect(screen.getByText('Bob')).toBeTruthy();
    });

    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('Manager')).toBeTruthy();
  });

  it('passes role and search to useUsers', () => {
    mockedUseUsers.mockReturnValue({
      rows: [],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      reloadFromDb: jest.fn(),
    });

    renderWithProviders(
      <UsersList role="Admin" search="lee" initialSync={false} />,
    );

    expect(mockedUseUsers).toHaveBeenCalledWith({
      role: 'Admin',
      search: 'lee',
    });
  });
});
