import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/src/test/renderWithProviders';

import FormTextField from './FormTextField';

describe('FormTextField', () => {
  it('renders placeholder and value', () => {
    renderWithProviders(
      <FormTextField
        value="Ada"
        onChangeText={jest.fn()}
        placeholder="First Name"
      />,
    );

    expect(screen.getByPlaceholderText('First Name')).toBeTruthy();
    expect(screen.getByDisplayValue('Ada')).toBeTruthy();
  });

  it('calls onChangeText when typing', () => {
    const onChangeText = jest.fn();
    renderWithProviders(
      <FormTextField value="" onChangeText={onChangeText} placeholder="Email" />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'a@b.com');
    expect(onChangeText).toHaveBeenCalledWith('a@b.com');
  });

  it('shows error message when provided', () => {
    renderWithProviders(
      <FormTextField
        value=""
        onChangeText={jest.fn()}
        placeholder="Email"
        errorMessage="Invalid email"
      />,
    );

    expect(screen.getByText('Invalid email')).toBeTruthy();
  });
});

