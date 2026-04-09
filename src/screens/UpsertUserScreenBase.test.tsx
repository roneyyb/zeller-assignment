import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/src/test/renderWithProviders';

import UpsertUserScreenBase from './UpsertUserScreenBase';

describe('UpsertUserScreenBase (edit)', () => {
  it('loads initial user and saves changes', async () => {
    const onUpdate = jest.fn().mockResolvedValue(undefined);
    const onDone = jest.fn();

    renderWithProviders(
      <UpsertUserScreenBase
        deps={{
          mode: 'edit',
          getInitial: async () => ({
            id: '1',
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            role: 'ADMIN',
          }),
          onUpdate,
          onDelete: jest.fn(),
          onDone,
        }}
      />,
    );

    // Wait for initial load to populate.
    await waitFor(() => expect(screen.getByDisplayValue('Ada')).toBeTruthy());

    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'Ada');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Lovelace');
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'ada@example.com');

    await act(async () => {});
    fireEvent.press(screen.getByTestId('edit-user-submit'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'ADMIN',
      });
    });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('deletes user when delete pressed', async () => {
    const onDelete = jest.fn().mockResolvedValue(undefined);
    const onDone = jest.fn();

    renderWithProviders(
      <UpsertUserScreenBase
        deps={{
          mode: 'edit',
          getInitial: async () => ({
            id: '1',
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            role: 'ADMIN',
          }),
          onUpdate: jest.fn(),
          onDelete,
          onDone,
        }}
      />,
    );

    await waitFor(() => expect(screen.getByDisplayValue('Ada')).toBeTruthy());

    fireEvent.press(screen.getByTestId('edit-user-delete'));

    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

