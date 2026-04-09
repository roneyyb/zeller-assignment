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

  it('does not submit when email is invalid', async () => {
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
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'a@b');

    await act(async () => {});
    fireEvent.press(screen.getByTestId('create-user-submit'));

    expect(createUser).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.getByText('Invalid email')).toBeTruthy();
  });

  it('does not submit when first name has invalid characters', async () => {
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

    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'Ada1');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Lovelace');
    fireEvent.changeText(
      screen.getByPlaceholderText('Email'),
      'ada@example.com',
    );

    await act(async () => {});
    fireEvent.press(screen.getByTestId('create-user-submit'));

    expect(createUser).not.toHaveBeenCalled();
    expect(
      screen.getByText('Only alphabets and spaces allowed'),
    ).toBeTruthy();
  });

  it('submit stays disabled until required fields valid', async () => {
    const createUser = jest.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <CreateUserScreenBase
        deps={{
          createId: () => 'local_1',
          createUser,
          onCreated: jest.fn(),
        }}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'Ada');
    await act(async () => {});

    const btn = screen.getByTestId('create-user-submit');
    expect(btn.props.accessibilityState?.disabled).toBe(true);

    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Lovelace');
    await act(async () => {});

    expect(screen.getByTestId('create-user-submit').props.accessibilityState?.disabled).toBe(
      false,
    );
  });
});

