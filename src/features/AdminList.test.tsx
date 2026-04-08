/* eslint-disable import/first */
jest.mock('./useUsers', () => {
  const actual = jest.requireActual('./useUsers');
  return {
    ...actual,
    useUsers: () => ({
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
    }),
  };
});

import { screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '@/src/test/renderWithProviders';

import AdminList from './AdminList';

describe('AdminList', () => {
  it('renders user from mocked hook without initial sync', async () => {
    renderWithProviders(
      <AdminList role="Admin" search="Ada" initialSync={false} />,
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeTruthy();
    });
  });
});
