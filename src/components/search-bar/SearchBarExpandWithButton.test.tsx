import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@/src/test/renderWithProviders';

import SearchBarExpandWithButton from './SearchBarExpandWithButton';

describe('SearchBarExpandWithButton', () => {
  it('opens and closes via onOpenChange', async () => {
    const onOpenChange = jest.fn();
    renderWithProviders(
      <SearchBarExpandWithButton onChangeText={jest.fn()} onOpenChange={onOpenChange} />,
    );

    fireEvent.press(screen.getByLabelText('Open search'));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    // Close button appears only when open; wait for it.
    await waitFor(() => expect(screen.getByLabelText('Close search')).toBeTruthy());
    fireEvent.press(screen.getByLabelText('Close search'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('can be opened again after closing', async () => {
    renderWithProviders(<SearchBarExpandWithButton onChangeText={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Open search'));
    await waitFor(() => expect(screen.getByLabelText('Close search')).toBeTruthy());
    fireEvent.press(screen.getByLabelText('Close search'));

    // Open again
    fireEvent.press(screen.getByLabelText('Open search'));
    await waitFor(() => expect(screen.getByLabelText('Close search')).toBeTruthy());
  });
});

