/* eslint-disable import/first */
jest.mock('./useUsers', () => ({
  useUsers: jest.fn(),
}));

import { screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import { renderWithProviders } from '@/src/test/renderWithProviders';

import { useUsers } from './useUsers';
import AdminList from './AdminList';

const mockedUseUsers = useUsers as jest.MockedFunction<typeof useUsers>;

describe('AdminList', () => {
  beforeEach(() => {
    mockedUseUsers.mockReset();
  });

  it('renders user from mocked hook without initial sync', async () => {
    mockedUseUsers.mockReturnValue({
      rows: [
        {
          id: '1',
          name: 'Test User',
          email: 't@t.com',
          role: 'ADMIN',
          updated_at: 1,
        },
      ],
      loading: false,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      reloadFromDb: jest.fn(),
    });

    renderWithProviders(
      <AdminList role="Admin" search="Ada" initialSync={false} />,
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
    });
  });

  it('shows loading indicator when loading with no rows', () => {
    mockedUseUsers.mockReturnValue({
      rows: [],
      loading: true,
      refreshing: false,
      error: null,
      refresh: jest.fn(),
      reloadFromDb: jest.fn(),
    });

    const { UNSAFE_getByType } = renderWithProviders(
      <AdminList initialSync={false} />,
    );

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('shows error in list header when refresh failed', () => {
    mockedUseUsers.mockReturnValue({
      rows: [],
      loading: false,
      refreshing: false,
      error: 'Sync failed',
      refresh: jest.fn(),
      reloadFromDb: jest.fn(),
    });

    renderWithProviders(<AdminList initialSync={false} />);

    expect(screen.getByText('Sync failed')).toBeTruthy();
  });
});
