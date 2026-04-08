import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/src/test/renderWithProviders';

import { CreateUserScreenBase } from './CreateUserScreen';

describe('CreateUserScreenBase', () => {
  it('validates and submits', async () => {
    const createUser = jest.fn().mockResolvedValue(undefined);
    const onCreated = jest.fn();

    renderWithProviders(
      <CreateUserScreenBase
        deps={{
          createId: () => 'local_1',
          createUser,
          onCreated,
        }}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'Ada');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Lovelace');
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'ada@example.com');

    // RHF updates `isValid` asynchronously; wait a tick before submitting.
    await act(async () => {});
    fireEvent.press(screen.getByTestId('create-user-submit'));

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({
        id: 'local_1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'ADMIN',
      });
    });

    expect(onCreated).toHaveBeenCalledTimes(1);
  }, 15000);
});

